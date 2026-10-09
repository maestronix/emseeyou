# Catalog data

The catalog is authored as small, reviewable files. The published website must use only local, version-controlled data and local assets; no runtime TMDB requests.

## Layout

```text
data/
  timeline.json
  movies/<stable-id>.json
  series/<stable-id>.json
  schema/
    movie.schema.json
    series.schema.json
    timeline.schema.json
scripts/validate_catalog.py
tests/test_validate_catalog.py
```

- One JSON file per movie and one per series.
- Series records embed season and episode metadata. Every movie, series, season and episode has its own stable internal ID.
- `timeline.json` contains curated entries that reference an item by type and ID; season/episode entries also specify their parent IDs. Metadata is never duplicated in timeline entries.
- Internal IDs use lowercase kebab-case (for example `iron-man`, `wandavision-s01e01`). Never recycle IDs or derive watch-state keys from mutable titles.
- External TMDB identifiers and URLs live in `tmdb` fields. They are not internal IDs.

## Chronology

`order` is the explicit curated display order and must be unique. Do not derive it from release dates, filenames or array sorting. Each entry's `chronology.status` can be `confirmed`, `approximate`, `overlapping` or `disputed`; optional start/end values and notes record uncertainty, flashbacks or overlap. Sources can be recorded as URLs. Episode-level entries allow a series to be split around other titles. Fixture chronology is illustrative and must be reviewed before production use.

## Assets

Asset records use `status`: `available`, `missing` or `optional`. Available assets require a local path under `public/assets/` and the file must exist. Missing/optional assets use `path: null` while the asset pipeline is pending. Do not add runtime remote image URLs. Record asset provenance in [ASSET_SOURCES.md](../ASSET_SOURCES.md) and review usage terms before publishing.

## Validate changes

Run locally:

```sh
python -m pip install -r requirements-dev.txt
python scripts/validate_catalog.py
python -m unittest discover -s tests -v
```

CI runs the same validator and tests. Errors include the file and field/reference that needs fixing.

## Add or correct a title

1. Copy the closest JSON fixture into `data/movies/<id>.json` or `data/series/<id>.json`.
2. Choose a permanent kebab-case ID; add TMDB IDs as external metadata only.
3. For series, give the series, each season and each episode a unique ID.
4. Add a timeline entry only when the curator has chosen its placement; reference the existing IDs instead of copying metadata.
5. Mark assets as missing/optional until local files exist, then set status to available and verify the path.
6. Run the validation commands above and include source/provenance updates with the change.

## TMDB importer

The importer is maintainer-side tooling. It must produce a dry-run diff, be repeatable, and never silently overwrite curator-maintained chronology or fields listed in `manualOverrides`. Credentials stay local and out of commits and browser bundles.
