---
name: pptx-production
description: Build, edit, and export editable PowerPoint files with native text, shapes, charts, and
  speaker notes. Use for an approved deck specification, bounds checks, rendering, or focused PPTX
  repair.
license: MIT
metadata:
  author: org-xelius
  version: 0.2.0
  source: https://github.com/org-xelius/xelius-document-skills
---

# PPTX Production

Implement the approved deck without flattening editable content.

## When to use

Use for local editable PowerPoint output and its PDF or preview exports.

## When not to use

Do not determine the narrative or visual direction when those decisions are still open.

## Inputs

Approved storyline, slide specifications, design tokens, assets, notes, sources, target aspect ratio, template or preservation rules, and renderer availability.

## Outputs

Editable PPTX, build source, asset manifest, speaker notes, bounds report, PDF export when requested, and rendered slides.

## Required workflow

Run the builder from the document workspace or pass its dependency root explicitly: `node scripts/build-pptx.mjs deck-spec.json deck.pptx --project-root <workspace>`. Install `pptxgenjs` in that workspace; a global skill directory does not contain the user's dependencies.

1. Read [PPTX-PRODUCTION.md](references/PPTX-PRODUCTION.md).
2. Detect the supported implementation library; prefer the repository-supported mature library and record the version.
3. Define theme fonts, theme colours, masters or reusable layout helpers, safe area, footer, and source zones.
4. Build reusable title, body, metric, callout, chart, diagram, source, footer, image, and section-marker components.
5. Preserve native editable text and shapes; use editable charts where their reliability is verified.
6. Insert SVGs only after target-render testing; keep verified PNG fallbacks.
7. Run bounds and placeholder checks, export, render every slide, and invoke visual QA.

## Hard rules

- No clipped text, off-slide elements, broken z-order, temporary assets, unresolved placeholders, or silent font substitution.
- Keep source lines readable and notes attached to the correct slide.
- Shorten or split content before shrinking type.
- Preserve an existing template's masters, geometry, and brand furniture unless restyling is approved.

## Checkpoints

Build the representative sequence before the full deck. Escalate any template deviation or library limitation that changes editability.

## Files to read by phase

Read PPTX production before implementation, then the visual QA and PDF preflight references for export.

## Quality checks

Check slide count, aspect ratio, theme, fonts, notes, sources, bounds, wrapping, image crops, chart values, z-order, placeholder removal, PDF parity, and full-size renders.

## Failure and fallback behaviour

If no renderer is available, deliver the PPTX with bounds checks and exact manual render instructions, mark visual validation limited, and do not claim final render QA passed.

## Example invocations

- "Build this approved storyline as an editable 16:9 PPTX."
- "Repair clipping and source lines in this deck."
- "Preserve this template while replacing the content and notes."

## Adjacent skills

Receive strategy from professional presentation, assets from specialist skills, and hand exports to PDF production and visual QA.
