# emseeyou roadmap

This file is the source of truth for project progress. Update it in the same PR that completes work. A checkbox means the work is implemented **and verified**, not merely discussed. Every substantial open item links to its canonical GitHub issue; completed work links to the merged PR that delivered it.

## Status key

- [ ] Open, in progress, or awaiting verification
- [x] Done and verified (implementation evidence does not automatically mean visual/production acceptance)

## Phase 0 — Project foundation

- [x] Agree project direction: cinematic, continuous horizontal timeline; Multiverse-inspired visual language.
- [x] Agree watch state: movies as watched/unwatched; series tracked per episode.
- [x] Agree static hosting and browser-local progress.
- [x] Define repository layout and initial data conventions.
- [x] Create public contribution and disclaimer documentation.
- [x] Confirm repository default branch and GitHub Pages deployment settings.
- [x] Add issue forms and pull request template.
- [ ] Verify initial labels cover data, design, bug, documentation and good-first-issue.

## Phase 1 — Data model and validation

- [x] Define JSON Schema for movie, series, season/episode and timeline records. ([PR #2](https://github.com/maestronix/emseeyou/pull/2))
- [x] Define stable internal IDs and TMDB ID mapping rules. ([PR #2](https://github.com/maestronix/emseeyou/pull/2))
- [x] Define chronology fields for confirmed, approximate, overlapping and disputed placements; detailed placements remain curator work. ([PR #2](https://github.com/maestronix/emseeyou/pull/2))
- [x] Add representative fixture data for one movie and one series. ([PR #2](https://github.com/maestronix/emseeyou/pull/2))
- [x] Add schema, ID, timeline-reference and local-asset validation plus CI tests. ([PR #2](https://github.com/maestronix/emseeyou/pull/2), [PR #6](https://github.com/maestronix/emseeyou/pull/6))
- [x] Add validator regression tests for duplicate IDs, broken timeline references and invalid/missing assets. ([PR #6](https://github.com/maestronix/emseeyou/pull/6))
- [x] Document how to add or correct a title without running the importer. ([PR #2](https://github.com/maestronix/emseeyou/pull/2))
- [ ] Expand the curated catalog in reviewed batches, with chronology and assets checked. ([Issue #48](https://github.com/maestronix/emseeyou/issues/48))
- [ ] Build a local-only TMDB maintainer importer with dry-run diffs, curator overrides and asset provenance. ([Issue #46](https://github.com/maestronix/emseeyou/issues/46))

## Phase 2 — Visual prototype and browsing UX

- [x] Set up React, TypeScript and Vite with a GitHub Actions production-build check. ([PR #7](https://github.com/maestronix/emseeyou/pull/7))
- [x] Create the responsive application shell and minimal header/footer. ([PR #7](https://github.com/maestronix/emseeyou/pull/7))
- [x] Implement a continuous horizontal timeline with phase labels and selectable story entries. ([PR #7](https://github.com/maestronix/emseeyou/pull/7))
- [x] Render title artwork in grayscale by default and color for selected/watched entries. ([PR #20](https://github.com/maestronix/emseeyou/pull/20))
- [ ] Finish timeline logo artwork and proportional series-progress reveal; remove placeholder/remote demo wordmarks. ([Issue #43](https://github.com/maestronix/emseeyou/issues/43))
- [x] Implement locally authored cinematic backdrop artwork and blended/darkened timeline surfaces. ([PR #30](https://github.com/maestronix/emseeyou/pull/30), [PR #31](https://github.com/maestronix/emseeyou/pull/31))
- [x] Add local missing-artwork fallback and reduced-motion support. ([PR #7](https://github.com/maestronix/emseeyou/pull/7))
- [x] Add horizontal keyboard navigation and responsive baseline layouts. ([PR #7](https://github.com/maestronix/emseeyou/pull/7))
- [ ] Replace the detail modal with an in-page horizontal reveal. **In progress:** [PR #41](https://github.com/maestronix/emseeyou/pull/41) implements [Issue #36](https://github.com/maestronix/emseeyou/issues/36); keep open until merged and verified.
- [ ] Load the selected title's artwork/logo in details. ([Issue #37](https://github.com/maestronix/emseeyou/issues/37))
- [ ] Use the selected film/series backdrop in the details view. ([Issue #38](https://github.com/maestronix/emseeyou/issues/38))
- [ ] Replace the static timeline backdrop with rotating MCU imagery and reviewed assets. **In progress:** [PR #52](https://github.com/maestronix/emseeyou/pull/52) implements [Issue #39](https://github.com/maestronix/emseeyou/issues/39); keep open until merged and verified.
- [ ] Design a mobile-specific browsing experience; horizontal scrolling alone is not acceptable as the primary phone interaction. ([Issue #40](https://github.com/maestronix/emseeyou/issues/40))
- [ ] Complete visual acceptance against the original mockup with desktop/mobile screenshots and deployed-site review. ([Issue #42](https://github.com/maestronix/emseeyou/issues/42))
- [ ] Add live deployment smoke checks and accessibility regression coverage. ([Issue #49](https://github.com/maestronix/emseeyou/issues/49))

## Phase 3 — Watch progress

- [x] Add movie watched/unwatched controls. ([PR #7](https://github.com/maestronix/emseeyou/pull/7))
- [x] Add episode-level watch controls and a series progress indicator. ([PR #7](https://github.com/maestronix/emseeyou/pull/7))
- [x] Persist movie and episode progress in localStorage using stable IDs. ([PR #7](https://github.com/maestronix/emseeyou/pull/7))
- [x] Fix watched-state isolation between separate timeline entries. ([PR #32](https://github.com/maestronix/emseeyou/pull/32))
- [x] Fix demo entries inheriting unrelated title details/episode data. ([PR #35](https://github.com/maestronix/emseeyou/pull/35))
- [ ] Finish season/series completion, clear-progress confirmation, storage-failure handling and browser regression tests. ([Issue #44](https://github.com/maestronix/emseeyou/issues/44))
- [ ] Add validated progress export/import with conflict handling. ([Issue #45](https://github.com/maestronix/emseeyou/issues/45))

## Phase 4 — Asset provenance and release readiness

- [x] Add the unofficial-project disclaimer and document asset provenance/removal workflow. ([PR #2](https://github.com/maestronix/emseeyou/pull/2))
- [ ] Enforce asset provenance records, rights-review status and file-size limits in CI; audit bundled artwork before release. ([Issue #47](https://github.com/maestronix/emseeyou/issues/47))
- [ ] Complete rights/attribution review of third-party assets before adding or publishing more artwork. ([Issue #47](https://github.com/maestronix/emseeyou/issues/47))
- [ ] Publish a first usable release with a reviewed, useful portion of the MCU catalog. ([Issue #48](https://github.com/maestronix/emseeyou/issues/48))

## Phase 5 — Community workflow and CI

- [x] Add issue forms for incorrect data/broken assets and missing catalog entries.
- [x] Add pull request checklist and initial contribution guide.
- [x] Add visible repository and “Report an issue” links to the site.
- [x] Add CI checks for catalog schemas, references and asset paths. ([PR #13](https://github.com/maestronix/emseeyou/pull/13))
- [ ] Add CI checks for asset file sizes and required source/provenance records. ([Issue #47](https://github.com/maestronix/emseeyou/issues/47))
- [ ] Add a “good first issue” guide for community contributors.
- [x] Configure the main ruleset to require both actual CI job checks before merge. ([PR #16](https://github.com/maestronix/emseeyou/pull/16))
- [x] Add production smoke checks and a downloadable build artifact to unified CI. ([PR #13](https://github.com/maestronix/emseeyou/pull/13))
- [ ] Add a live deployment smoke test for published HTML and referenced assets. ([Issue #49](https://github.com/maestronix/emseeyou/issues/49))

## Phase 6 — Release and maintenance

- [x] Configure GitHub Pages deployment via GitHub Actions. ([PR #7](https://github.com/maestronix/emseeyou/pull/7))
- [x] Validate generated production HTML and base-prefixed JS/CSS asset paths in CI. ([PR #9](https://github.com/maestronix/emseeyou/pull/9), [PR #10](https://github.com/maestronix/emseeyou/pull/10))
- [x] Document how contributors and maintainers update data and assets. ([PR #2](https://github.com/maestronix/emseeyou/pull/2))
- [ ] Test accessibility, reduced motion and browser storage failure states. ([Issue #49](https://github.com/maestronix/emseeyou/issues/49), [Issue #44](https://github.com/maestronix/emseeyou/issues/44))

## Out of scope for the initial release

- User accounts, backend storage or cross-device sync.
- Community-submitted assets being published automatically without review.
- Live TMDB/API calls from the visitor-facing website.
- Episode-level artwork for every episode unless a clear UX benefit justifies the size and maintenance cost.

## Current milestone

**Milestone 2: Turn the deployed visual prototype into a usable, visually reviewed MVP.**

The app is deployed, but the catalog remains sample data. The original mockup is referenced in [issue #12](https://github.com/maestronix/emseeyou/issues/12#issuecomment-6078580032). The old implementation tracker [issue #18](https://github.com/maestronix/emseeyou/issues/18) is closed, but that did **not** complete visual acceptance. The remaining review is now explicitly tracked in [issue #42](https://github.com/maestronix/emseeyou/issues/42).

### Current work

1. **In progress:** [PR #41](https://github.com/maestronix/emseeyou/pull/41) replaces the modal with an in-page horizontal reveal; [issue #36](https://github.com/maestronix/emseeyou/issues/36) remains open until the PR is merged.
2. **Details artwork:** [#37](https://github.com/maestronix/emseeyou/issues/37) title logo/artwork, [#38](https://github.com/maestronix/emseeyou/issues/38) selected-title backdrop.
3. **Timeline and mobile:** [#39](https://github.com/maestronix/emseeyou/issues/39) rotating MCU imagery, [#40](https://github.com/maestronix/emseeyou/issues/40) purpose-built mobile UX, [#42](https://github.com/maestronix/emseeyou/issues/42) screenshot/mockup acceptance, [#43](https://github.com/maestronix/emseeyou/issues/43) timeline artwork and series-progress reveal.
4. **Progress:** [#44](https://github.com/maestronix/emseeyou/issues/44) completion states and storage safeguards; [#45](https://github.com/maestronix/emseeyou/issues/45) export/import.
5. **Catalog/release:** [#46](https://github.com/maestronix/emseeyou/issues/46) TMDB importer, [#47](https://github.com/maestronix/emseeyou/issues/47) asset provenance/rights/size checks, [#48](https://github.com/maestronix/emseeyou/issues/48) curated catalog, [#49](https://github.com/maestronix/emseeyou/issues/49) live deployment and accessibility checks.

### Recently merged implementation

- [PR #35](https://github.com/maestronix/emseeyou/pull/35): demo entries show their own details and episode data.
- [PR #34](https://github.com/maestronix/emseeyou/pull/34): animated detail modal (superseded by the in-page interaction in #41).
- [PR #32](https://github.com/maestronix/emseeyou/pull/32): watched state isolated per timeline entry.
- [PR #33](https://github.com/maestronix/emseeyou/pull/33): roadmap reconciled with earlier visual work; mockup acceptance intentionally remained open.
- [PRs #29–#31](https://github.com/maestronix/emseeyou/pull/31): cinematic styling, locally authored backdrops and timeline spacing/blending.
- [PRs #20–#22](https://github.com/maestronix/emseeyou/pull/22): timeline/card composition, logo-first timeline and expanded visual fixtures.
- [PR #17](https://github.com/maestronix/emseeyou/pull/17): cinematic refinement and progress-related styling.
- [PR #16](https://github.com/maestronix/emseeyou/pull/16) and [PR #13](https://github.com/maestronix/emseeyou/pull/13): required CI checks, catalog validation and production build workflow.

**Important:** merged implementation is not equivalent to acceptance. Keep visual comparison, real artwork/provenance review, mobile UX and live deployment checks open until their acceptance criteria are verified.
