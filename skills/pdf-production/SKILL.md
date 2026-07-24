---
name: pdf-production
description: "Export, inspect, preflight, render, and validate final PDFs from semantic HTML, paged media, PPTX, or other approved sources. Use when a report, handout, or presentation PDF requires font, page-size, image-resolution, selectable-text, bookmark, link, metadata, SVG, transparency, glyph, colour, bleed, file-size, accessibility, page-render, and contact-sheet checks."
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
3. Export through the approved source path.
4. Inspect metadata, encryption, page count and dimensions, fonts, text selection, images, bookmarks, links, annotations, SVGs, transparency, glyphs, colour, bleed, and file size where tools permit.
5. Render every page to PNG at an inspection resolution.
6. Create a contact sheet, invoke visual QA, repair the source, and repeat.

## Hard rules

- Do not declare completion because export succeeded.
- Do not claim a check passed when its required tool was unavailable.
- Preserve readable source lines, live links, selectable text, page numbers, and accurate dimensions.
- Repair at the editable source when possible.

## Checkpoints

Run preflight on representative output and final output. Report remaining warnings, print dependencies, and accessibility coverage.

## Files to read by phase

Read PDF preflight before export and the visual QA reference before inspection.

## Quality checks

Check every requested technical property plus render parity, missing glyphs, clipping, black boxes, soft images, broken links, incorrect page numbers, and output size.

## Failure and fallback behaviour

Use available inspection subsets and mark the report `limited`. Provide exact manual checks for unavailable tools; never issue a false pass.

## Example invocations

- "Export and preflight this paged HTML report."
- "Check whether this presentation PDF matches the PPTX."
- "Render all pages and repair any PDF defects."

## Adjacent skills

Receive editable sources from publication or PPTX production and return source-level repairs before final visual QA.
