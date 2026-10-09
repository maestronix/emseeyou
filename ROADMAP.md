# emseeyou roadmap

This file is the source of truth for project progress. Update checkboxes in the same pull request that completes work. A checkbox means the work is implemented and verified, not merely discussed.

## Status key

- [ ] Not started / open, or awaiting verification
- [x] Done and verified

## Phase 0 — Project foundation

- [x] Agree project direction: cinematic, continuous horizontal timeline; Multiverse-inspired visual language.
- [x] Agree watch state: movies as watched/unwatched; series tracked per episode.
- [x] Agree static hosting and browser-local progress.
- [x] Define repository layout and initial data conventions.
- [x] Create public contribution and disclaimer documentation.
- [x] Confirm initial repository default branch and GitHub Pages deployment settings.
- [x] Add issue forms and pull request template.
- [ ] Verify initial labels cover data, design, bug, documentation and good-first-issue.

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
- [x] Add horizontal keyboard navigation and responsive desktop/mobile layouts.
- [ ] Run automated browser checks at desktop and mobile widths, including keyboard navigation and reduced-motion behavior.
- [ ] Review the live prototype against the intended visual direction and refine spacing, artwork scale, typography and timeline hierarchy.

## Phase 3 — Watch progress

- [x] Add movie watched/unwatched controls to the prototype.
- [x] Add episode-level watch controls and a series progress indicator to the prototype.
- [x] Persist movie and episode progress in localStorage using stable IDs.
- [ ] Derive and display season and series completion states from episode progress.
- [ ] Add progress export/import with schema validation and conflict handling.
- [ ] Add a clear-progress action with confirmation.
- [ ] Add browser-level regression tests for interactions, reload persistence and catalog updates.
- [ ] Handle browser storage being unavailable or failing without breaking the app.

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

- [x] Add issue forms for incorrect data/broken assets and missing movies/series/seasons/episodes.
- [x] Add pull request checklist and initial contribution guide.
- [x] Add visible repository and “Report an issue” links to the site.
- [x] Add CI checks for catalog JSON schemas, references and asset paths.
- [ ] Add CI checks for asset file sizes and source-provenance records.
- [x] Document asset provenance and a correction/removal process.
- [ ] Add a “good first issue” guide for community contributors.
- [x] Verify the unified GitHub Actions CI on a pull request and configure the ruleset to require both actual CI job checks before merging into `main`.
- [x] Add production smoke checks and a downloadable build artifact to the unified CI workflow.

## Phase 6 — Release and maintenance

- [ ] Complete a rights/attribution review of all bundled third-party assets before adding any new third-party artwork.
- [x] Add the unofficial-project disclaimer; verify any TMDB attribution requirements before publishing imported content.
- [x] Configure GitHub Pages deployment via GitHub Actions.
- [x] Validate the generated production HTML and base-prefixed JS/CSS asset paths in CI.
- [x] Verify the project-site base path on the live GitHub Pages site.
- [ ] Add a live deployment smoke test that requests the published HTML and referenced assets.
- [ ] Test accessibility, reduced motion and browser storage failure states.
- [ ] Publish a first usable release with a reviewed, useful portion of the MCU catalog.
- [x] Document how contributors and maintainers update data and assets; keep dependency maintenance instructions current.

## Out of scope for the initial release

- User accounts, backend storage or cross-device sync.
- Community-submitted assets being published automatically without review.
- Live TMDB/API calls from the visitor-facing website.
- Episode-level artwork for every episode unless a clear UX benefit justifies the size and maintenance cost.

## Current milestone

**Milestone 2: Turn the deployed visual prototype into a usable, visually reviewed MVP.**

The app is deployed, but the catalog remains sample data (Iron Man and one WandaVision episode). The intended visual reference is tracked in [issue #12](https://github.com/maestronix/emseeyou/issues/12#issuecomment-6078580032); implementation and screenshot comparison are tracked in [issue #18](https://github.com/maestronix/emseeyou/issues/18).

PR #17's refinement is present on main, but it did not establish visual fidelity to the reference. The issue #18 implementation must remain open for review until desktop/mobile screenshots have been compared with the mockup and CI plus deployment checks pass.

### Next actions

1. Review the issue #18 implementation against the original mockup at desktop and mobile sizes; capture before/after screenshots and iterate on any remaining differences.
2. Verify CI and the deployed GitHub Pages build after the visual changes merge.
3. Finish the progress UX (season/series completion, export/import and clear-progress).
4. Once the UI and data flow are stable, implement the TMDB maintainer importer with dry-run diffs and explicit asset provenance/rights review.
5. Expand the curated MCU timeline in reviewed batches rather than importing an unverified full catalog at once.
