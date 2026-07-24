---
name: visual-quality-assurance
description: "Render, inspect, record, and verify visual defects across every report page, presentation slide, PDF, PPTX, SVG, and preview set. Use when production outputs require evidence-based QA for clipping, overflow, typography, contrast, margins, crops, missing assets, charts, tables, density, repetition, furniture, sources, pagination, accessibility, or narrative pacing."
---

# Visual Quality Assurance

Review rendered output, not source code alone.

## When to use

Use after every meaningful representative or final composition update.

## When not to use

Do not use as a substitute for factual, editorial, citation, or data validation.

## Inputs

Source artifact, all page or slide renders, contact sheet, expected count, design tokens, approved plans, and available technical inspection reports.

## Outputs

`qa-report.json`, annotated issue locations, repair instructions, verification status, and coverage limitations.

## Required workflow

1. Read [VISUAL-QA.md](references/VISUAL-QA.md).
2. Render every page or slide at a consistent inspection size.
3. Confirm rendered count equals source count.
4. Review the contact sheet for pacing, repetition, missing pages, colour drift, and weak openings or closings.
5. Inspect every render individually at full size.
6. Record each defect against `assets/schemas/qa-report.schema.json`.
7. Prioritize critical and high issues, assign concrete repairs, and return them to the owning skill.
8. Re-render repaired artifacts and verify the exact locations.
9. Finish only when no open critical or high issue remains.

## Hard rules

- Never infer visual quality from a successful export.
- Never use a contact sheet instead of full-size inspection.
- Inspect all pages or slides, not a sample.
- Record tool gaps as limitations; do not mark unavailable checks passed.
- Keep accepted deviations explicit and attributable.

## Checkpoints

Run on representative samples before full production and again at final QA. Report coverage, open warnings, external dependencies, and editable and final locations.

## Files to read by phase

- Inspection protocol: `references/VISUAL-QA.md`
- Issue structure: shared QA schema
- Medium-specific checks: PDF, PPTX, SVG, data, table, or image references as applicable

## Quality checks

Check clipping, overflow, tiny text, contrast, margins, crops, missing assets, SVGs, charts, tables, blank areas, density, layout repetition, furniture, source lines, orphans, page numbers, reading order, narrative pacing, and opening or closing quality.

## Failure and fallback behaviour

If rendering is impossible, report `limited`, complete source-level checks that are genuinely possible, and provide exact manual rendering steps. Do not issue a pass.

## Example invocations

- "Run complete visual QA on this 58-page PDF."
- "Inspect every slide render and produce a repair-ready report."
- "Verify these SVGs inside both PDF and PPTX targets."

## Adjacent skills

Return each issue to the specialist that owns it: publication, presentation, data, table, SVG, image, PPTX, or PDF production.
