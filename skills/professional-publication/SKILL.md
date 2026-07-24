---
name: professional-publication
description: "Plan, compose, export, and repair professionally designed reports for close reading, including A4 or US Letter portrait or landscape, custom sizes, short briefs, long research reports, annual reports, case studies, toolkits, manuals, and annex-heavy publications. Use when the final artifact requires staged architecture, representative spreads, semantic HTML and paged CSS or a justified fixed-layout path, PDF export, page rendering, and visual QA."
---

# Professional Publication

Compose a reading experience, not a stack of decorated pages.

## When to use

Use for net-new or substantially redesigned reports and briefs.

## When not to use

Do not use to make presentation slides, edit a single chart, or perform PDF-only preflight on an existing final file.

## Inputs

Approved publication plan, evidence register, design tokens, edited copy, assets and rights, target size, print or digital mode, accessibility target, and checkpoint preference.

## Outputs

Editable semantic source, print and screen styles, final PDF, page renders, contact sheet, source list, and QA report.

## Required workflow

1. Inspect sources and read [REPORT-COMPOSITION.md](references/REPORT-COMPOSITION.md).
2. Confirm the publication architecture.
3. At Checkpoint A, approve structure and visual direction.
4. Generate or import the design system.
5. Build a representative spread containing a section opener, narrative page, data or table page, and image-led page when relevant.
6. At Checkpoint B, approve the spread unless uninterrupted mode is recorded.
7. Compose the full document with semantic HTML, CSS paged media, and SVG assets by default. Use a PPTX-to-PDF path only for justified fixed-layout work.
8. Invoke editorial, data, table, image, SVG, and citation specialists where required.
9. Invoke `pdf-production`, render every page, and invoke `visual-quality-assurance`.
10. Repair, re-render, and deliver only when high-severity issues are closed.

## Hard rules

- Do not reduce body text below the approved minimum to avoid a page break.
- Prevent orphaned headings; avoid widows where practical.
- Keep figures with captions and tables with titles, headers, notes, and sources.
- Repeat table headers; avoid splitting rows where practical.
- Avoid more than two consecutive pages with the same dominant composition.
- Balance dense and open pages; use full bleed selectively.
- Preserve meaningful whitespace, caveats, citations, and data.
- Never fabricate missing content or evidence.

## Checkpoints

Use Checkpoint A for architecture and direction, Checkpoint B for the representative spread, and final QA for production coverage and limitations.

## Files to read by phase

- Architecture: adjacent content architecture plan
- Composition: `references/REPORT-COMPOSITION.md`
- Starter: `templates/report-starter/`
- Export and QA: adjacent PDF production and visual QA skills

## Quality checks

Inspect every page at full size and in sequence. Check hierarchy, line length, baseline rhythm, pagination, figures, tables, references, bookmarks, links, page numbers, furniture, print safety, and repetitive pacing.

## Failure and fallback behaviour

If the primary browser renderer is absent, use another detected Chromium engine or documented manual export. If paged-media features fail, simplify the layout without hiding the limitation. Never mark unperformed preflight checks passed.

## Example invocations

- "Produce a 10-page development case study from these sources."
- "Build an annex-heavy A4 research report with charts and tables."
- "Create a premium annual report that remains accessible and printable."

## Adjacent skills

Use content architecture, design system, copy fitting, data, table, SVG, image, citation, PDF production, and visual QA. Do not invoke PPTX production unless the approved report path requires it.
