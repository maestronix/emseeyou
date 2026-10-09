# emseeyou

**A cinematic, horizontal MCU watch-order tracker.**

emseeyou is an unofficial, community-maintained fan project for exploring Marvel Cinematic Universe films and series in chronological in-universe order. Media logos sit on a continuous horizontal timeline; watched titles are shown in color, while unwatched titles are muted. Series progress is derived from episode-level watch state.

## Project principles

- Static hosting on GitHub Pages; no application backend or account required.
- Each title has its own maintainable data file.
- The chronological timeline is curated separately from title metadata.
- All runtime media assets are stored locally in the repository.
- TMDB is used by maintainer tooling to import metadata and candidate images; the published website does not call TMDB.
- Watch progress stays in the visitor's browser and can be exported/imported.
- Contributions are welcome through issues and pull requests.

## Status

The repository is in its foundation/planning stage. See [ROADMAP.md](ROADMAP.md) for the tracked plan. Features are not considered complete until implemented and validated.

## Repository layout

```text
.github/
  ISSUE_TEMPLATE/
  workflows/
  PULL_REQUEST_TEMPLATE.md
data/
  movies/
  series/
  timeline.json
  schema/
public/
  assets/
    movies/<media-id>/
    series/<media-id>/
    fallbacks/
scripts/
  tmdb-import/
src/
  components/
  features/
  lib/
  styles/
tests/
CONTRIBUTING.md
DISCLAIMER.md
ASSET_SOURCES.md
ROADMAP.md
```

The structure will be introduced incrementally; folders may not all exist yet.

## Contributing

Start with [CONTRIBUTING.md](CONTRIBUTING.md). You can report incorrect data or suggest missing titles through GitHub Issues, or submit a pull request with a fix.

## TMDB

TMDB is a planned maintainer-side import source, not a runtime dependency. Imported content and image assets must be reviewed for accuracy, attribution and applicable usage terms before publication. See [ASSET_SOURCES.md](ASSET_SOURCES.md).

## Disclaimer

emseeyou is an unofficial fan project and is not affiliated with or endorsed by Marvel Entertainment, LLC, The Walt Disney Company, or their subsidiaries. See [DISCLAIMER.md](DISCLAIMER.md) for the full notice.
