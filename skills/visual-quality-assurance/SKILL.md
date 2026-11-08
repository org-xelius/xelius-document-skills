---
name: visual-quality-assurance
description: Review rendered reports, slides, diagrams, and visual packs; record defects and verify
  repairs. Use for complete visual inspection or a requested review, with schema-validated QA and
  evidence for every reviewed surface.
license: MIT
metadata:
  author: org-xelius
  version: 0.2.0
  source: https://github.com/org-xelius/xelius-document-skills
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

`qa-report.json`, one review record per rendered surface, annotated issue locations, repair instructions, verification status, and coverage limitations.

## Required workflow

1. Read [VISUAL-QA.md](references/VISUAL-QA.md).
2. Render every page or slide at a consistent inspection size.
3. Confirm rendered count equals source count.
4. Review the contact sheet for pacing, repetition, missing pages, colour drift, and weak openings or closings.
5. Inspect every render individually at full size and record a `surfaceReviews` entry even when it is clear.
6. Use `scripts/qa-report.mjs` to record renders, reviews, issues, and required technical, editorial, or accessibility checks using `assets/schemas/qa-report.schema.json` version 2.0.
7. Prioritize critical and high issues, assign concrete repairs, and return them to the owning skill.
8. Re-render repaired artifacts and verify the exact locations.
9. Run `node scripts/validate-qa-report.mjs qa-report.json --verify-files`, then generate summaries with `qa-report.mjs report`. Deliver the derived status and name unresolved checks.

## Canonical QA records

Run `node scripts/qa-report.mjs --help` for complete commands. Initialize with the intended artifact and positive surface count, register each render, then record the review after inspecting it:

```sh
node scripts/qa-report.mjs init --artifact report.pdf --type pdf --total 2 --out qa/qa-report.json
node scripts/qa-report.mjs record-render --report qa/qa-report.json --location page-001 --render renders/page-001.png
node scripts/qa-report.mjs record-review --report qa/qa-report.json --location page-001 --method full-size-render --result clear --reviewer Hermes --observation "Title, table labels, source, and trim edges are legible."
node scripts/qa-report.mjs report --report qa/qa-report.json --out qa/summary.md --manifest qa/manifest.json
```

Record defects with `record-issue --issue issue.json` and link their IDs using review `--issues`. After re-export, use `record-artifact --artifact revised.pdf` to invalidate old renders and reviews, then register and inspect fresh renders. Registering a changed render invalidates its old review. Never copy a clear result across pages or revisions. Legacy schema 1.0 reports need fresh records using current renders; changing field names alone does not establish inspection.

Re-registering an artifact also resets performed domain checks to limited; rerun them for the new export. Pass `--total` when the intended page or slide count changes.

## Hard rules

- Never infer visual quality from a successful export.
- Never use a contact sheet instead of full-size inspection.
- Inspect all pages or slides, not a sample.
- Never claim manual inspection when only blank-page, resolution, file-existence, or other automated checks ran.
- A `pass` requires one unique full-size review record per surface and no open or unverifiable issue.
- Record render paths and SHA-256 hashes, reviewer identity, review time, observation, and linked issue IDs. Records document coverage; they cannot prove that a person or agent actually viewed an image.
- Record tool gaps as limitations; do not mark unavailable checks passed.
- Keep accepted deviations explicit and attributable.

## Checkpoints

Run on representative samples before full production and again at final QA. Report coverage, open warnings, external dependencies, and editable and final locations.

## Files to read by phase

- Inspection protocol: `references/VISUAL-QA.md`
- Record structure and migration: `assets/schemas/qa-report.schema.json` (schema 2.0), `scripts/qa-report.mjs --help`
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
