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

Automated blank-page, edge-density, OCR, bounds, resolution, or file checks are triage signals. They do not prove visual inspection and cannot support `pass` without full-size review records.

## Checks

Inspect typography, overflow, clipping, contrast, margins, alignment, crops, missing images, SVG integrity, chart and table legibility, accidental blank regions, density, repetitive layouts, furniture, source lines, headings, page numbers, reading order, opening, closing, and transition logic.

Treat clipped or unreadable content, lost evidence, and accessibility regressions as high severity. Treat repeated composition, unintentional underfill, tiny supporting text, and exposed production metadata according to their effect on use. A `pass` has no open or unverifiable issue. An accepted deviation must name the decision-maker and reason.
