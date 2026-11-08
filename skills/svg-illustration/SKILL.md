---
name: svg-illustration
description: Create or repair editable SVG diagrams, icons, timelines, and conceptual illustrations.
  Use for XML validity, label fit, rendered bounds, and integration into PDF or PPTX; use data
  visualisation for quantitative charts.
license: MIT
metadata:
  author: org-xelius
  version: 0.2.0
  source: https://github.com/org-xelius/xelius-document-skills
---

# SVG Illustration

Create semantic vector assets that survive the target production pipeline.

## When to use

Use for scalable diagrams and illustrations that benefit from editable vector geometry.

## When not to use

Do not redraw documentary photography, complex artwork better generated as raster, or a chart that belongs to data visualisation.

## Inputs

Communication purpose, content model, target dimensions, design tokens, target PDF or PPTX workflow, accessibility text, and background variants.

## Outputs

Validated SVG, PNG render, optional transparent and solid-background variants, integration test, and validation report.

## Required workflow

1. Read [SVG-CONSTRUCTION.md](references/SVG-CONSTRUCTION.md).
2. Define the artboard, hierarchy, labels, geometry, and target size.
3. Create valid XML with explicit `viewBox`, `<title>`, and `<desc>`.
4. Use consistent strokes, closed paths, safe masks, and available fonts or outlined display lettering where licensing permits.
5. Run `node scripts/validate-svg.mjs asset.svg --geometry --strict --json`; store the measured-check report. Python 3 parses XML; Inkscape supplies rendered bounds. Set `XELIUS_PYTHON` or `--inkscape` when their executables are outside the usual paths.
6. Rasterize with Inkscape, ImageMagick, or browser fallback.
7. Inspect the PNG at the intended placed size, checking every label and each artboard edge.
8. Test the SVG inside the target PDF or PPTX and repeat inspection after integration.

## Hard rules

- No accidental clipping, broken masks, unsupported filters, missing fonts, invisible initial states, or objects outside the artboard.
- Wrap labels with target-safe `<tspan>` lines when their measured width requires it; never truncate source text or rely on SVG text to wrap automatically.
- Keep text and strokes inside a safe inset and verify bounds from the rendered asset, not coordinates alone.
- Simplify paths and avoid embedded raster data unless explicitly required.
- Preserve label readability, print-safe colours, and contrast.
- Keep structural, measured-geometry, and visual review results distinct. A successful XML or bounds check does not establish visual quality.

## Checkpoints

Approve complex information architecture before detailed drawing. Review both transparent and solid variants when the asset crosses backgrounds.

## Files to read by phase

Read SVG construction before authoring and the target production reference before integration.

## Quality checks

Check XML parsing, unique IDs, references, viewBox, bounds, path closure warnings, text wrapping, edge safety, font use, colour, metadata, PNG parity, and target integration.

## Failure and fallback behaviour

Remove unsupported effects or simplify geometry. Preserve the SVG source and use a verified PNG only when the target cannot render the vector safely.

## Example invocations

- "Create a four-stage process diagram as accessible SVG."
- "Build a print-safe map with transparent and solid variants."
- "Validate these icons and test them in the deck."

## Adjacent skills

Use data visualisation for charts, image art direction for photography, and PDF or PPTX production for integration.
