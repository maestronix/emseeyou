#!/usr/bin/env python3
"""Validate emseeyou catalog schemas, identifiers, timeline references and local assets."""
from __future__ import annotations

import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]
FORMAT_CHECKER = FormatChecker()


def load_json(path: Path, root: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"{path.relative_to(root)}: cannot read valid JSON: {exc}") from exc


def validate_schema(path: Path, schema_path: Path, root: Path, errors: list[str]) -> dict:
    schema = load_json(schema_path, root)
    payload = load_json(path, root)
    validator = Draft202012Validator(schema, format_checker=FORMAT_CHECKER)
    for error in sorted(validator.iter_errors(payload), key=lambda e: list(map(str, e.absolute_path))):
        location = ".".join(map(str, error.absolute_path)) or "$"
        errors.append(f"{path.relative_to(root)}:{location}: {error.message}")
    return payload


def validate_catalog(root: Path = ROOT) -> tuple[list[str], dict[str, int]]:
    """Validate a catalog rooted at *root*, returning actionable errors and counts."""
    root = root.resolve()
    data = root / "data"
    schema_dir = data / "schema"
    errors: list[str] = []
    movies: dict[str, dict] = {}
    series: dict[str, dict] = {}
    seasons: dict[str, tuple[str, dict]] = {}
    episodes: dict[str, tuple[str, str, dict]] = {}
    timeline_ids: set[str] = set()

    for path in sorted((data / "movies").glob("*.json")):
        record = validate_schema(path, schema_dir / "movie.schema.json", root, errors)
        stable_id = record.get("id")
        if stable_id in movies:
            errors.append(f"{path.relative_to(root)}: duplicate movie ID {stable_id!r}")
        movies[stable_id] = record
        if path.stem != stable_id:
            errors.append(f"{path.relative_to(root)}: filename must match stable ID {stable_id!r}")

    for path in sorted((data / "series").glob("*.json")):
        record = validate_schema(path, schema_dir / "series.schema.json", root, errors)
        stable_id = record.get("id")
        if stable_id in series:
            errors.append(f"{path.relative_to(root)}: duplicate series ID {stable_id!r}")
        series[stable_id] = record
        if path.stem != stable_id:
            errors.append(f"{path.relative_to(root)}: filename must match stable ID {stable_id!r}")
        for season in record.get("seasons", []):
            season_id = season.get("id")
            if season_id in seasons:
                errors.append(f"{path.relative_to(root)}: duplicate season ID {season_id!r}")
            seasons[season_id] = (stable_id, season)
            for episode in season.get("episodes", []):
                episode_id = episode.get("id")
                if episode_id in episodes:
                    errors.append(f"{path.relative_to(root)}: duplicate episode ID {episode_id!r}")
                episodes[episode_id] = (stable_id, season_id, episode)

    id_owners: dict[str, str] = {}
    for category, records in (("movie", movies), ("series", series)):
        for stable_id in records:
            if stable_id in id_owners:
                errors.append(f"duplicate ID {stable_id!r}: used by {id_owners[stable_id]} and {category}")
            else:
                id_owners[stable_id] = category
    for stable_id in seasons:
        if stable_id in id_owners:
            errors.append(f"duplicate ID {stable_id!r}: used by {id_owners[stable_id]} and season")
        else:
            id_owners[stable_id] = "season"
    for stable_id in episodes:
        if stable_id in id_owners:
            errors.append(f"duplicate ID {stable_id!r}: used by {id_owners[stable_id]} and episode")
        else:
            id_owners[stable_id] = "episode"

    def validate_assets(owner_id: str, assets: dict, location: str) -> None:
        for name, asset in assets.items():
            status, asset_path = asset.get("status"), asset.get("path")
            label = f"{location}.{name}"
            if status == "available":
                if not asset_path:
                    errors.append(f"{label}: status 'available' requires path")
                    continue
                candidate = (root / asset_path).resolve()
                assets_root = (root / "public" / "assets").resolve()
                if not candidate.is_relative_to(assets_root):
                    errors.append(f"{label}: asset path must stay under public/assets")
                elif not candidate.is_file():
                    errors.append(f"{label}: asset file does not exist: {asset_path}")
            elif status in ("missing", "optional") and asset_path is not None:
                errors.append(f"{label}: {status} asset must have path=null")

    for record in movies.values():
        validate_assets(record.get("id", "<unknown>"), record.get("assets", {}), record.get("id", "<unknown>"))
    for record in series.values():
        series_id = record.get("id", "<unknown>")
        validate_assets(series_id, record.get("assets", {}), series_id)
        for season in record.get("seasons", []):
            for episode in season.get("episodes", []):
                validate_assets(
                    episode.get("id", "<unknown>"),
                    episode.get("assets", {}),
                    episode.get("id", "<unknown>"),
                )

    timeline_path = data / "timeline.json"
    timeline = validate_schema(timeline_path, schema_dir / "timeline.schema.json", root, errors)
    orders: set[int] = set()
    for entry in timeline.get("entries", []):
        entry_id = entry.get("id")
        if entry_id in timeline_ids:
            errors.append(f"data/timeline.json: duplicate timeline entry ID {entry_id!r}")
        timeline_ids.add(entry_id)
        order = entry.get("order")
        if order in orders:
            errors.append(f"data/timeline.json: duplicate timeline order {order!r}")
        orders.add(order)
        target = entry.get("target", {})
        kind, target_id = target.get("type"), target.get("id")
        if kind == "movie" and target_id not in movies:
            errors.append(f"timeline {entry_id}: unknown movie ID {target_id!r}")
        elif kind == "series" and target_id not in series:
            errors.append(f"timeline {entry_id}: unknown series ID {target_id!r}")
        elif kind == "season":
            pair = seasons.get(target_id)
            if not pair:
                errors.append(f"timeline {entry_id}: unknown season ID {target_id!r}")
            elif pair[0] != target.get("seriesId"):
                errors.append(f"timeline {entry_id}: season {target_id!r} does not belong to series {target.get('seriesId')!r}")
        elif kind == "episode":
            triple = episodes.get(target_id)
            if not triple:
                errors.append(f"timeline {entry_id}: unknown episode ID {target_id!r}")
            else:
                if triple[0] != target.get("seriesId"):
                    errors.append(f"timeline {entry_id}: episode {target_id!r} does not belong to series {target.get('seriesId')!r}")
                if triple[1] != target.get("seasonId"):
                    errors.append(f"timeline {entry_id}: episode {target_id!r} does not belong to season {target.get('seasonId')!r}")

    counts = {
        "movies": len(movies),
        "series": len(series),
        "seasons": len(seasons),
        "episodes": len(episodes),
        "timeline_entries": len(timeline_ids),
    }
    return errors, counts


def main() -> int:
    errors, counts = validate_catalog()
    if errors:
        print("Catalog validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1
    print(
        "Catalog valid: "
        f"{counts['movies']} movies, {counts['series']} series, "
        f"{counts['seasons']} seasons, {counts['episodes']} episodes, "
        f"{counts['timeline_entries']} timeline entries."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
