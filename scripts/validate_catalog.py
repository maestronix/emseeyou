#!/usr/bin/env python3
"""Validate emseeyou catalog schemas, identifiers, timeline references and local assets."""
from __future__ import annotations

import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
SCHEMA_DIR = DATA / "schema"
FORMAT_CHECKER = FormatChecker()


def load_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"{path.relative_to(ROOT)}: cannot read valid JSON: {exc}") from exc


def validate_schema(path: Path, schema_name: str, errors: list[str]):
    schema = load_json(SCHEMA_DIR / schema_name)
    payload = load_json(path)
    validator = Draft202012Validator(schema, format_checker=FORMAT_CHECKER)
    for error in sorted(validator.iter_errors(payload), key=lambda e: list(map(str, e.absolute_path))):
        location = ".".join(map(str, error.absolute_path)) or "$"
        errors.append(f"{path.relative_to(ROOT)}:{location}: {error.message}")
    return payload


def main() -> int:
    errors: list[str] = []
    movies: dict[str, dict] = {}
    series: dict[str, dict] = {}
    seasons: dict[str, tuple[str, dict]] = {}
    episodes: dict[str, tuple[str, str, dict]] = {}
    timeline_ids: set[str] = set()

    for path in sorted((DATA / "movies").glob("*.json")):
        record = validate_schema(path, "movie.schema.json", errors)
        if record.get("id") in movies:
            errors.append(f"{path.relative_to(ROOT)}: duplicate movie ID {record.get('id')!r}")
        movies[record.get("id")] = record
        if path.stem != record.get("id"):
            errors.append(f"{path.relative_to(ROOT)}: filename must match stable ID {record.get('id')!r}")

    for path in sorted((DATA / "series").glob("*.json")):
        record = validate_schema(path, "series.schema.json", errors)
        if record.get("id") in series:
            errors.append(f"{path.relative_to(ROOT)}: duplicate series ID {record.get('id')!r}")
        series[record.get("id")] = record
        if path.stem != record.get("id"):
            errors.append(f"{path.relative_to(ROOT)}: filename must match stable ID {record.get('id')!r}")
        for season in record.get("seasons", []):
            sid = season.get("id")
            if sid in seasons:
                errors.append(f"{path.relative_to(ROOT)}: duplicate season ID {sid!r}")
            seasons[sid] = (record.get("id"), season)
            for episode in season.get("episodes", []):
                eid = episode.get("id")
                if eid in episodes:
                    errors.append(f"{path.relative_to(ROOT)}: duplicate episode ID {eid!r}")
                episodes[eid] = (record.get("id"), sid, episode)

    id_owners: dict[str, str] = {}
    for category, mapping in (("movie", movies), ("series", series)):
        for stable_id in mapping:
            if stable_id in id_owners:
                errors.append(f"duplicate ID {stable_id!r}: used by {id_owners[stable_id]} and {category}")
            else:
                id_owners[stable_id] = category
    for stable_id, (series_id, _) in seasons.items():
        if stable_id in id_owners:
            errors.append(f"duplicate ID {stable_id!r}: used by {id_owners[stable_id]} and season")
        else:
            id_owners[stable_id] = "season"
    for stable_id, (series_id, season_id, _) in episodes.items():
        if stable_id in id_owners:
            errors.append(f"duplicate ID {stable_id!r}: used by {id_owners[stable_id]} and episode")
        else:
            id_owners[stable_id] = "episode"
    for kind, records in (("movie", movies), ("series", series)):
        for record in records.values():
            assets = record.get("assets", {})
            if kind == "series":
                for season in record.get("seasons", []):
                    for episode in season.get("episodes", []):
                        assets.update(episode.get("assets", {}))
            for name, asset in assets.items():
                status, asset_path = asset.get("status"), asset.get("path")
                if status == "available":
                    if not asset_path:
                        errors.append(f"{record.get('id')}.{name}: status 'available' requires path")
                    else:
                        candidate = (ROOT / asset_path).resolve()
                        if not candidate.is_relative_to(ROOT / "public" / "assets"):
                            errors.append(f"{record.get('id')}.{name}: asset path must stay under public/assets")
                        elif not candidate.is_file():
                            errors.append(f"{record.get('id')}.{name}: asset file does not exist: {asset_path}")
                elif status in ("missing", "optional") and asset_path is not None:
                    errors.append(f"{record.get('id')}.{name}: {status} asset must have path=null")

    timeline_path = DATA / "timeline.json"
    timeline = validate_schema(timeline_path, "timeline.schema.json", errors)
    orders: set[int] = set()
    for entry in timeline.get("entries", []):
        eid = entry.get("id")
        if eid in timeline_ids:
            errors.append(f"data/timeline.json: duplicate timeline entry ID {eid!r}")
        timeline_ids.add(eid)
        order = entry.get("order")
        if order in orders:
            errors.append(f"data/timeline.json: duplicate timeline order {order!r}")
        orders.add(order)
        target = entry.get("target", {})
        kind, target_id = target.get("type"), target.get("id")
        if kind == "movie" and target_id not in movies:
            errors.append(f"timeline {eid}: unknown movie ID {target_id!r}")
        elif kind == "series" and target_id not in series:
            errors.append(f"timeline {eid}: unknown series ID {target_id!r}")
        elif kind == "season":
            pair = seasons.get(target_id)
            if not pair:
                errors.append(f"timeline {eid}: unknown season ID {target_id!r}")
            elif pair[0] != target.get("seriesId"):
                errors.append(f"timeline {eid}: season {target_id!r} does not belong to series {target.get('seriesId')!r}")
        elif kind == "episode":
            triple = episodes.get(target_id)
            if not triple:
                errors.append(f"timeline {eid}: unknown episode ID {target_id!r}")
            else:
                if triple[0] != target.get("seriesId"):
                    errors.append(f"timeline {eid}: episode {target_id!r} does not belong to series {target.get('seriesId')!r}")
                if triple[1] != target.get("seasonId"):
                    errors.append(f"timeline {eid}: episode {target_id!r} does not belong to season {target.get('seasonId')!r}")

    if errors:
        print("Catalog validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1
    print(f"Catalog valid: {len(movies)} movies, {len(series)} series, {len(seasons)} seasons, {len(episodes)} episodes, {len(timeline_ids)} timeline entries.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
