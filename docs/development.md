# Development and releases

## Checks

```sh
npm ci
npm run sync:portable
npm run validate
npm test
npm run measure:footprint
npm run test:install
npx playwright install chromium
npm run test:artifacts
```

Node.js 22.20+ is required. CI validates Node 22/24. Full artifact checks also need Poppler, LibreOffice, Inkscape, and Python with pypdf. Set `PYTHON`/`XELIUS_PYTHON`, `CHROME_PATH`, or `XELIUS_INKSCAPE` when tools live outside usual paths.

Installation tests use the pinned Skills CLI in temporary projects: exactly ten discovered skills, all three agents, retired-selector rejection, and complete individual installations. Migration tests exercise a real immutable v0.2.0 snapshot, repeated runs, missing installs, foreign-name collisions, and symlinks. Artifact checks build a nine-page report and eleven-slide editable deck from independently copied skills and a separate dependency project.

Automation writes technical results, not invented visual-review passes. Inspect each rendered surface separately. See [evaluation procedures](../evals/README.md) for paired tasks and limitations.

## Contracts

Canonical source/evidence/plan schemas live in `shared/schemas/`; installed copies live in content architecture. QA remains schema **2.0**, with per-surface review evidence, artifact/render SHA-256 hashes, and stale-record invalidation. Use the QA helper to derive summaries; do not handwrite compatible-looking claims of pass.

PDF expectations remain separate from raw/final integrity. SVG XML, measured geometry, and visual inspection remain separate checks. Run all existing regression tests after helper changes.

The [footprint script](../scripts/measure-footprint.mjs) measures UTF-8 bytes of every installed file, whitespace-delimited words in SKILL.md bodies (frontmatter excluded), and YAML description characters. The immutable v0.2.0 baseline is 208,048 bytes, 6,581 words, and 2,971 description characters. Release gates require ten skills, at least 30% fewer body words, at least 20% fewer description characters, and no installed-byte growth. These are file measurements, not token-use estimates.

## Relocated helpers

| Old folder | Current folder | Preserved resources |
| --- | --- | --- |
| editorial-copy-fitting | content-information-architecture | EDITORIAL-COPY-FITTING.md |
| citation-and-references | content-information-architecture | CITATIONS.md; scripts/validate-references.mjs |
| table-design | data-visualisation | TABLE-DESIGN.md |
| pptx-production | professional-presentation | PPTX-PRODUCTION.md; deck-spec.template.json; build-pptx.mjs; check-slide-bounds.mjs; render-pptx.mjs; create-contact-sheet.mjs |

Reference files remain under `references/`, templates under `assets/`, and helpers under `scripts/`. Helper filenames, arguments, outputs, and project dependency resolution are unchanged.

The presentation folder also adds `check-pptx-fonts.mjs`: compare declared source fonts with rendered PDF families, then repair renderer font discovery when installed fonts were substituted. Normalization is heuristic and unusual names need review. This check supplements PDF embedding and visual checks; it does not change source fonts or install fonts.

## Release

`npm run release` validates, tests, packages exactly ten standalone archives, removes only known stale retired archives from dist, and writes `release-manifest.json` with version, source commit, bytes, and SHA-256 checksums. Unknown stale archives block packaging. The manifest and ten archives are the eleven release assets.

Package/tag versions must match. Keep `v0.2.0` immutable for rollback. Before tagging, complete installation/migration checks, real rendering and visual inspection, all four paired evaluations, and the footprint gate. A measured quality regression blocks release. Record limitations without benchmark claims.

Packaging rejects missing/incomplete/regressed paired results and changed consolidated entrypoints relative to the recorded evaluation hashes. Preserve failed attempts and correction evidence in the results; a later passing run must not erase the original finding.

Push main, verify validation workflows, then tag/push `v0.2.1`. The tag workflow repeats installation/artifact checks and publishes assets. Verify workflow status and downloaded archive checksums, then migrate local agents with backups. Check current skills.sh links but do not promise removal of historical listings.

`npm run render:examples` stages synthetic projects; add `-- --render` for binary outputs. Public fixtures must remain synthetic and license-safe.
