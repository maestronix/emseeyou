# Catalog data

The catalog is authored as small, reviewable files. The published website reads only local, versioned catalog data and local assets.

## Planned layout

```text
data/
  timeline.json
  movies/
    iron-man.json
  series/
    loki.json
  schema/
    movie.schema.json
    series.schema.json
    timeline.schema.json
```

- One file per film under `movies/`.
- One file per series under `series/`.
- Series files contain season and episode metadata initially; if these become too large, they can be split by season without changing stable IDs.
- `timeline.json` defines the manually curated in-universe order. Do not infer the chronology by sorting filenames or release dates.
- JSON Schema and validation tooling are planned in Phase 1 of [ROADMAP.md](../ROADMAP.md).

## ID conventions

- Internal IDs are lowercase kebab-case and stable, for example `iron-man` or `loki-s01e01`.
- Keep external identifiers (such as TMDB IDs) in dedicated fields.
- Never recycle an ID or derive watch-state keys from a mutable title.
- A media title can appear as a timeline item without duplicating its metadata.

## Chronology

Release date and in-universe placement are different concepts. Preserve both where available. Timeline order should be curated and sourced. For series whose episodes span or overlap other titles, the timeline format must support explicit entries and ordering rather than assuming one series equals one point in time.

Chronology rules and the final schema are still being developed; see the roadmap. Avoid bulk-importing the full catalog until those rules are agreed.

## Assets

Catalog files reference local paths below `public/assets/`. Do not use remote image URLs in the runtime catalog. New assets need a record in [ASSET_SOURCES.md](../ASSET_SOURCES.md) and rights/attribution review.

## TMDB importer

The importer is maintainer-side tooling. It may retrieve metadata and candidate images, but it must produce a dry-run diff and must not overwrite curator-edited chronology or other manual overrides without explicit approval. API credentials must stay local and out of committed files and browser bundles.
