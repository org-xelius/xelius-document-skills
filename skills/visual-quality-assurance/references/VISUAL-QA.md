# Visual QA

## Inspection order

1. Verify artifact opens and expected page or slide count.
2. Render every surface at a consistent scale.
3. Compare source count and render count.
4. Review contact sheet for sequence, pacing, repetition, colour drift, blanks, and section transitions.
5. Inspect every render at full size.
6. Record a review result for every surface, including clear surfaces, then record issues with evidence and an actionable repair.
7. Repair at source, re-render, and verify.

## Severity

- Critical: corrupt, missing, materially wrong, unsafe, or unusable.
- High: clipping, unreadable evidence, broken chart or table, missing source, major contrast or narrative failure.
- Medium: visible inconsistency, weak crop, density, alignment, or pacing problem.
- Low: polish issue that does not obstruct understanding.

## Evidence of inspection

For every page, slide, artboard, or image, record:

- Stable location such as `page-003` or `slide-12`
- Review method: `full-size-render`, `source-only`, or `unverifiable`
- Result: `clear`, `issue-found`, or `unverifiable`
- A concise observation specific to that surface
- Reviewer identity, timestamp, render path and SHA-256, and linked issue IDs

Automated blank-page, edge-density, OCR, bounds, resolution, or file checks are triage signals. They do not prove visual inspection and cannot support `pass` without full-size review records.

## Checks

Inspect typography, overflow, clipping, contrast, margins, alignment, crops, missing images, SVG integrity, chart and table legibility, accidental blank regions, density, repetitive layouts, furniture, source lines, headings, page numbers, reading order, opening, closing, and transition logic.

Treat clipped or unreadable content, lost evidence, and accessibility regressions as high severity. Treat repeated composition, unintentional underfill, tiny supporting text, and exposed production metadata according to their effect on use. A `pass` has no open or unverifiable issue. An accepted deviation must name the decision-maker and reason.

## Derived status and summaries

Use schema 2.0 and the bundled helper to avoid handwritten near-compatible JSON. A complete canonical record is required even for `limited` status.

- `repair-required`: an issue remains open or a required check reports a repair.
- `limited`: no actionable repair remains, but review coverage, a required check, or verification is incomplete.
- `pass`: all declared surfaces have clear full-size reviews, required checks pass, and no limitation or unverifiable issue remains.

Preserve domain checks under `checks`: `technical`, `visual`, `editorial`, or `accessibility`. Use `not-requested` only for checks outside the agreed scope; do not turn an unperformed required check into an optional one.

Accepted deviations require `acceptedBy` and `acceptanceReason`. After repair or acceptance, record the current page review again; do not relabel the old issue-found review as clear without inspection. Generate Markdown summaries and manifests from the canonical report with `qa-report.mjs report`. Before delivery, use `validate-qa-report.mjs --verify-files` to detect stale renders and artifact hashes.

## Canonical record commands

Run `node scripts/qa-report.mjs --help` for full options. A two-page example begins:

```sh
node scripts/qa-report.mjs init --artifact report.pdf --type pdf --total 2 --out qa/qa-report.json
node scripts/qa-report.mjs record-render --report qa/qa-report.json --location page-001 --render renders/page-001.png
node scripts/qa-report.mjs record-review --report qa/qa-report.json --location page-001 --method full-size-render --result clear --reviewer Agent --observation "Title, table labels, source, and trim edges are legible."
node scripts/qa-report.mjs report --report qa/qa-report.json --out qa/summary.md --manifest qa/manifest.json
```

Register and inspect all other surfaces. Use `record-issue --issue issue.json` and link IDs with review `--issues`. Re-export requires `record-artifact --artifact revised.pdf`; use `--total` if count changes. Artifact changes invalidate renders/reviews and reset performed domain checks to limited; changed renders invalidate reviews. Rerun checks and inspect current renders. Never copy clear results across surfaces/revisions.
