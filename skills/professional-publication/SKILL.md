---
name: professional-publication
description: Create or revise reports, briefs, annual reports, and manuals for close reading. Use
  for publication architecture, page composition, representative spreads, and editable report
  sources; use PDF production for export-only tasks.
license: MIT
metadata:
  author: org-xelius
  version: 0.2.0
  source: https://github.com/org-xelius/xelius-document-skills
---

# Professional Publication

Compose a reading experience, not a stack of decorated pages.

## Scope the work

Use create mode for a new publication, revise mode for changes to existing editable sources, and review mode for findings only. Preserve the supplied design and approved content in revise mode unless redesign is requested. Route export-only work to PDF production. Reuse current evidence and plans; do not restart them for a narrow edit.

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
6. Stress-test the spread with the longest heading, densest table, longest label, most complex figure, and shortest realistic page.
7. At Checkpoint B, approve the spread unless uninterrupted mode is recorded.
8. Compose the full document with semantic HTML, CSS paged media, and SVG assets by default. Use a PPTX-to-PDF path only for justified fixed-layout work.
9. Invoke editorial, data, table, image, SVG, and citation specialists where required.
10. Invoke `pdf-production`, render every page, and invoke `visual-quality-assurance`.
11. Repair, re-render, and deliver only when high-severity issues are closed.

## Hard rules

- Do not reduce body text below the approved minimum to avoid a page break.
- Prevent orphaned headings; avoid widows where practical.
- Keep figures with captions and tables with titles, headers, notes, and sources.
- Repeat table headers; avoid splitting rows where practical.
- Review repeated compositions for pacing; allow repetition when the reference format or reader task benefits from it.
- Balance dense and open pages; use full bleed selectively.
- Consolidate unintentionally underfilled pages; do not stretch thin content to satisfy a planned page count.
- Keep evidence IDs, production labels, implementation notes, and validation disclaimers out of reader-facing copy unless traceability is an explicit publication requirement.
- Preserve meaningful whitespace, caveats, citations, and data.
- Never fabricate missing content or evidence.
- Define an output contract for type sizes, placed figure size, contrast, safe margins, language, and PDF properties; assess the actual output against it.

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
