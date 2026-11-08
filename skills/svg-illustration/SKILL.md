---
name: svg-illustration
description: Create and verify editable SVG diagrams, icons, and timelines, including measured label
  fit and target rendering. Use data visualisation for charts.
license: MIT
metadata:
  author: org-xelius
  version: 0.2.1
  source: https://github.com/org-xelius/xelius-document-skills
---

# SVG Illustration

Create editable diagrams, icons, timelines, and conceptual illustrations; use data visualisation for quantitative charts.

Read [SVG-CONSTRUCTION.md](references/SVG-CONSTRUCTION.md). Define purpose, hierarchy, target dimensions, backgrounds, and accessibility text. Use valid XML with explicit `viewBox`, `<title>`, `<desc>`, unique IDs, and resolvable references.

Use consistent strokes, safe masks, available fonts, and readable contrast. Wrap labels with measured, target-safe `<tspan>` lines; SVG text does not automatically wrap. Never truncate source wording to hide overflow. Keep text/strokes inside a safe inset; coordinates alone do not prove rendered bounds.

Run `node scripts/validate-svg.mjs asset.svg --geometry --strict --json` and retain its report. Python 3 parses XML; Inkscape measures geometry. Select unusual executables through `XELIUS_PYTHON`, `--inkscape`, or `XELIUS_INKSCAPE`. Keep structural, measured, and visual results distinct. Missing measurement tools mean limited coverage, not pass.

Rasterize and inspect every label, connector, mask, and artboard edge at placed size. Test inside the actual PDF/PPTX and inspect again. Agree complex information architecture before detailed drawing; test transparent/solid variants when backgrounds change.

Deliver SVG, preview PNG, integration evidence, and validation notes. Remove unsupported filters, invisible initial states, broken masks, clipping, and out-of-artboard objects. Simplify paths; avoid embedded raster data unless required. If the target cannot render safely, preserve SVG and use a verified high-resolution PNG fallback with the limitation named.
