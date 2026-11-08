---
name: pdf-production
description: Export and preflight PDFs, inspect fonts and document structure, and compare
  transformed files. Use for PDF rendering, metadata, tagging, links, selectable text, or export
  repair after the source composition is defined.
license: MIT
metadata:
  author: org-xelius
  version: 0.2.0
  source: https://github.com/org-xelius/xelius-document-skills
---

# PDF Production

Treat export as the start of preflight, not completion.

## When to use

Use for final report and presentation PDF outputs or for preflighting existing PDFs.

## When not to use

Do not redesign content or pages unless a detected defect requires returning to the owning skill.

## Inputs

Source artifact, target page dimensions, print or digital profile, bleed, accessibility requirements, metadata, expected page count, and available PDF tools.

## Outputs

Final PDF, preflight report, page renders, contact sheet, link report, and explicit validation limitations.

## Required workflow

1. Read [PDF-PREFLIGHT.md](references/PDF-PREFLIGHT.md).
2. Detect browser, office, Poppler, Ghostscript, and PDF inspection tools.
3. Export through the approved source path. For HTML, run `node scripts/render-html-to-pdf.mjs input.html output.pdf --project-root <workspace>`; use `--browser-executable <path>` or `CHROME_PATH` for an existing Chromium installation.
4. Derive required properties from the publication contract and run `node scripts/preflight-pdf.mjs output.pdf --expect expectations.json --json`. Adapt `assets/pdf-expectations.template.json`; do not invent mandatory bookmarks, language, page count, or font policy.
5. When any optimizer, splitter, merger, sanitizer, print driver, or converter changes the exported PDF, run `node scripts/compare-pdf-properties.mjs raw.pdf final.pdf --expect expectations.json --json`. Use `--strict` to block unresolved warnings; record a reason for intended page or text changes.
6. Render every page to PNG at an inspection resolution.
7. Create a contact sheet, invoke visual QA, repair the source, and repeat.

## Hard rules

- Do not declare completion because export succeeded.
- Do not claim a check passed when its required tool was unavailable.
- Preserve readable source lines, live links, selectable text, page numbers, and accurate dimensions.
- Fix accidental blank pages, overflow, or pagination at the editable source; do not hide them with a PDF transformation that removes tags, metadata, outlines, links, or text.
- Reject unexplained regressions between raw and final PDF properties.
- Distinguish transformation integrity from publication requirements: identical raw and final files can both lack required metadata or navigation.
- Treat Type 3 fonts as a review condition unless the output contract rejects them; never switch fonts solely to satisfy an uncalibrated blanket rule.
- Repair at the editable source when possible.

## Checkpoints

Run preflight on representative output and final output. Report remaining warnings, print dependencies, and accessibility coverage.

## Files to read by phase

Read PDF preflight before export and the visual QA reference before inspection.

## Script dependencies and results

Install Playwright in the production project for HTML export. The renderer resolves it from `--project-root` (default: the current directory), waits for fonts and images, and requests tagged PDF and outlines. Confirm the exported properties rather than assuming the browser created them.

Preflight uses Poppler plus Python `pypdf` for tags, language, links, bookmarks, and every page's dimensions. Select Python with `--python <executable>` or `XELIUS_PYTHON`. Missing required inspection tools produce `limited` with exit code 3; detected failures use exit code 1; invalid arguments use 2. JSON output includes stable check IDs and captured tool warnings. Technical success does not establish visual quality or full accessibility conformance.

## Quality checks

Check every requested technical property plus raw-to-final parity, render parity, missing glyphs, font warnings, clipping, black boxes, soft images, broken links, incorrect page numbers, and output size.

## Failure and fallback behaviour

Use available inspection subsets and mark the report `limited`. Provide exact manual checks for unavailable tools; never issue a false pass.

## Example invocations

- "Export and preflight this paged HTML report."
- "Check whether this presentation PDF matches the PPTX."
- "Render all pages and repair any PDF defects."

## Adjacent skills

Receive editable sources from publication or PPTX production and return source-level repairs before final visual QA.
