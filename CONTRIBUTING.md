# Contributing to emseeyou

Thanks for helping improve emseeyou! Contributions can correct the timeline, improve metadata, add missing titles, improve accessibility or fix bugs.

## Choose how to contribute

- **Report a bug or incorrect entry:** open a GitHub Issue and include the title, what is wrong, and a reliable source where possible.
- **Suggest a missing title:** open an Issue with the title, format (film/series), release details and sources.
- **Make the change yourself:** open a pull request with a focused change and follow the data/asset rules below.

Please search existing issues before opening a duplicate.

## Data rules

- Use the existing stable internal ID. Do not change an ID merely to rename a title.
- Keep one JSON file per movie and one per series. The canonical chronological ordering belongs in `data/timeline.json`, not in filename sorting.
- Use TMDB IDs as external references where available, not as the only internal identifier.
- Distinguish release dates from in-universe chronology. Explain uncertain placements in the PR.
- Do not invent episode titles, dates, runtimes or source links. Mark uncertain details for review.
- Preserve manually curated fields when refreshing imported metadata.

The schema and examples will be documented under `data/README.md` and `data/schema/` as Phase 1 is implemented.

## Asset rules

- Put runtime images under `public/assets/` using the folder and filename convention already used by the title.
- Prefer appropriately sized, transparent logos for timeline display and optimized poster/backdrop images for backgrounds.
- Do not hotlink assets in catalog data.
- Include the source URL, creator/rightsholder when known, retrieval date and license/permission review status in `ASSET_SOURCES.md`.
- A publicly accessible image is not automatically licensed for redistribution. Do not assume that a TMDB image can be bundled just because the API returns a path.
- Do not add an asset if its origin or permitted use is unclear; ask in an Issue first.

## Pull request checklist

- [ ] The change has a clear purpose and is limited in scope.
- [ ] JSON is valid and all IDs/references are stable and unique.
- [ ] Chronology changes include a source or explanation.
- [ ] Every referenced local asset exists.
- [ ] New assets have source/provenance information and have been reviewed for permitted use.
- [ ] No API key, token or other secret is included.
- [ ] Validation/build checks pass, when available.
- [ ] Documentation and `ROADMAP.md` are updated if work was completed.

## Respectful collaboration

Be kind and constructive. Discuss disagreements about chronology or canon with sources and explain uncertainty. Maintainers may request changes or decline contributions that lack reliable sourcing or have unresolved asset-rights concerns.

## GitHub Actions: validation, build and preview artifact

No local checkout or commands are required to validate a pull request. Every pull request targeting `main` and every push to `main` runs the **CI** workflow:

- Catalog JSON Schema, ID/reference and local-asset validation.
- Python unit tests.
- Frontend production build; `npm run build` includes the TypeScript compiler check.
- Static bundle smoke checks for generated HTML/JS/CSS and the sample Iron Man and WandaVision catalog entries.
- An `emseeyou-build` artifact containing `dist/`, retained for 14 days.

To inspect a run, open **Actions → CI → select the run**. Expand a failed step to read its logs. For a successful run, open **Artifacts** at the bottom of the run summary and download `emseeyou-build` to inspect the generated site. Use **Re-run jobs** on the run page to retry checks.

Pull requests do not deploy to production. The separate GitHub Pages workflow deploys only after a push to `main`. Configure branch protection/rulesets to require the **Catalog validation and unit tests** and **TypeScript and production build** checks before merging. Formatting/lint checks are not configured yet because the repository has no formatter or linter dependency/configuration.

