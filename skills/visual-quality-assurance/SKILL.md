---
name: visual-quality-assurance
description: Inspect every rendered page, slide, or visual; record defects and verify repairs with
  current render evidence and schema-validated QA.
license: MIT
metadata:
  author: org-xelius
  version: 0.2.1
  source: https://github.com/org-xelius/xelius-document-skills
---

# Visual Quality Assurance

Inspect renders, not source alone. Review-only requests authorize findings, not edits.

Read [VISUAL-QA.md](references/VISUAL-QA.md) for protocol and commands. Use bundled helpers and `assets/schemas/qa-report.schema.json` **version 2.0**. Schema 1.0 records need fresh current-render evidence, not renamed fields.

Confirm source/expected/rendered counts agree. Review contact sheets for pacing, repetition, drift, blanks, and opening/closing quality. Then inspect **every surface individually at full size**, including clear pages/slides. Contact sheets, bounds tests, and export success are not visual inspection.

Record one unique `surfaceReviews` entry per surface: location, method/result, specific observation, reviewer/time, render path/SHA-256, and linked issues. Records establish traceable coverage, not proof an observer viewed an image. Keep factual, editorial, citation, data, technical, and accessibility checks distinct.

Prioritize corrupt, missing, misleading, clipped, unreadable, unsourced, or accessibility-regressed content. Give exact locations and actionable source-level repairs. Inspect typography, alignment, crops, visuals, tables, density, margins, furniture, sequence, and source readability.

Re-register changed artifacts with `record-artifact` and `--total` when count changes. This invalidates old renders/reviews and resets performed domain checks to limited. A changed render invalidates its review. Re-render, re-inspect, and rerun required checks; never copy clear results between revisions.

Run `node scripts/validate-qa-report.mjs qa-report.json --verify-files`; derive summaries/manifests with `qa-report.mjs report`. A `pass` needs complete current full-size reviews, no open/unverifiable issues, and passed required checks. Known defects mean `repair-required`; missing checks/coverage mean `limited`. Accepted deviations need attribution/rationale. Name limitations and manual next checks honestly.
