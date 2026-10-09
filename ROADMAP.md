# emseeyou roadmap

This file is the source of truth for project progress. Update checkboxes in the same pull request that completes work. A checkbox means the work is implemented and verified, not merely discussed.

## Status key

- [ ] Not started / open
- [x] Done and verified

## Phase 0 — Project foundation

- [x] Agree project direction: cinematic, continuous horizontal timeline; Multiverse-inspired visual language.
- [x] Agree watch state: movies as watched/unwatched; series tracked per episode.
- [x] Agree static hosting and browser-local progress.
- [x] Define repository layout and initial data conventions.
- [x] Create public contribution and disclaimer documentation.
- [ ] Confirm initial repository default branch and GitHub Pages settings.
- [x] Add issue forms and pull request template.
- [ ] Add initial labels for data, design, bug, documentation and good-first-issue.

## Phase 1 — Data model and validation

- [x] Define and commit JSON Schema for movie, series, season/episode and timeline records.
- [x] Define stable internal IDs and TMDB ID mapping rules.
- [x] Define chronology fields and representation for confirmed, approximate, overlapping and disputed placements; detailed MCU placements remain curator work.
- [x] Add representative fixture data for one movie and one series.
- [x] Add schema, ID, timeline-reference and local-asset validation plus CI tests.
- [x] Add regression tests that exercise duplicate IDs, broken timeline references and invalid/missing assets through the validator using isolated fixture trees.
- [x] Document how to add or correct a title without running the importer.

## Phase 2 — Visual prototype

- [x] Set up React, TypeScript and Vite with a GitHub Actions production-build check.
- [x] Create the responsive application shell and minimal header/footer.
- [x] Implement a continuous horizontal timeline with phase labels and selectable story entries.
- [x] Render title artwork in grayscale by default and color for selected/watched entries.
- [ ] Implement proportional logo color reveal for partially watched series.
- [ ] Implement blended, darkened local poster/backdrop backgrounds.
- [x] Add a local missing-artwork fallback and reduced-motion support.
- [x] Add horizontal keyboard navigation and responsive desktop/mobile layouts; automated visual browser checks remain open.

## Phase 3 — Watch progress

- [ ] Implement movie watched/unwatched controls.
- [ ] Implement episode-level series progress.
- [ ] Derive season and series completion from episode states.
- [ ] Persist progress in localStorage using stable IDs.
- [ ] Add progress export/import with validation and conflict handling.
- [ ] Add a clear-progress action with confirmation.
- [ ] Test progress persistence across reloads and catalog updates.

## Phase 4 — TMDB maintainer importer

- [ ] Add a local-only CLI for initial import and later updates.
- [ ] Read TMDB credentials from local environment variables; never expose keys in frontend bundles or commit them.
- [ ] Import movie/series metadata, seasons and episodes.
- [ ] Download available poster and backdrop candidates into local assets.
- [ ] Download logos only where a suitable image is available; record missing logos for manual follow-up.
- [ ] Optimize images and enforce configurable file-size/dimension limits.
- [ ] Produce a dry-run diff before writing changes.
- [ ] Preserve curator-edited chronology and fields explicitly marked as manual overrides.
- [ ] Make imports repeatable and avoid duplicate IDs or unnecessary diffs.
- [ ] Record source URLs, TMDB IDs, retrieval dates and attribution/licensing review status.
- [ ] Document image usage terms and review requirements before publishing imported assets.

## Phase 5 — Community workflow

- [x] Add issue form for incorrect data or broken assets.
- [x] Add issue form for missing movies/series/seasons/episodes.
- [x] Add pull request checklist and initial contribution guide.
- [ ] Add visible “Report an issue” and “Contribute on GitHub” links to the site.
- [x] Add CI checks for catalog JSON schemas, references and asset paths. File-size and source-provenance checks remain open.
- [ ] Document asset provenance and removal/correction process.
- [ ] Add a “good first issue” guide for community contributors.

## Phase 6 — Release and maintenance

- [ ] Complete a rights/attribution review of all bundled third-party assets.
- [ ] Complete the unofficial-project disclaimer and TMDB attribution as applicable.
- [ ] Configure GitHub Pages deployment via GitHub Actions.
- [ ] Add a production build and deployment smoke test.
- [ ] Test base paths on GitHub Pages project-site URLs.
- [ ] Test accessibility, reduced motion and browser storage failure states.
- [ ] Publish a first usable release.
- [ ] Document how maintainers update data, assets and dependencies.

## Out of scope for the initial release

- User accounts, backend storage or cross-device sync.
- Community-submitted assets being published automatically without review.
- Live TMDB/API calls from the visitor-facing website.
- Episode-level artwork for every episode unless a clear UX benefit justifies the size and maintenance cost.

## Current milestone

**Milestone 1: Data model + first visual prototype.**

Next actions: commit the schema files and fixture examples, add validation, then build the horizontal timeline against that sample data before importing the entire MCU catalog.
