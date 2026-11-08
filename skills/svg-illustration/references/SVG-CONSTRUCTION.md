# SVG Construction

## Required structure

Use a root `svg` with namespace, explicit `viewBox`, target width and height when useful, `<title>`, `<desc>`, and stable IDs. Group layers by semantic role.

## Safe subset

Prefer paths, rects, circles, lines, polygons, text, clip paths, and simple gradients. Avoid filters, external resources, CSS dependencies, scripts, and animation unless every target renderer is proven.

## Geometry

Keep strokes consistent, close filled paths, prevent out-of-artboard bounds, and add padding for thick strokes. Use markers and masks only after raster and target tests. Simplify generated paths.

## Typography

Use available target-safe fonts. For short display lettering, outline only when editability and accessibility are preserved elsewhere. Never rely on an unbundled font without a fallback.

SVG `<text>` does not wrap automatically. Use measured text width to decide whether to add explicit `<tspan>` lines, increase the container, or simplify wording without changing meaning. A character-count warning is advisory: a short label can overflow a small box while a long label can fit a wide artboard. Do not use substring slicing or ellipses to conceal overflow in evidence, status, units, caveats, or labels. Avoid `foreignObject` for production text unless every target renderer is proven.

Estimate text width during construction, then verify the raster result. Keep a safe inset around the viewBox, including stroke width and ascenders or descenders. Treat any cropped glyph, text touching an artboard edge, overlap, or unreadable placed-size label as a failed render.

## Validation

Run the bundled inspector from the skill directory:

```sh
node scripts/validate-svg.mjs asset.svg --geometry --strict --json
```

The Python standard-library parser checks XML, namespace, viewBox, metadata, duplicate IDs, fragment references, scripts and external resources. Inkscape measures visible drawable bounds against the artboard. `--safe-inset 4` reserves a text inset in viewBox units. Mark a label with `data-safe-box="x y width height"` to check its rendered bounds against a known container. A deliberately overflowing element or group may use `data-allow-overflow="true"` only when the design contract records why; this skips its geometry check.

For placed-size inspection add `--placed-width-mm 170 --min-font-pt 8`. Explicit authored font sizes are estimated at that scale; transforms, inherited styles, reading order, overlaps and contrast still need visual review. The inspector does not establish font licensing or semantic adequacy.

Without `--geometry`, `pass` covers structural checks only. Missing requested geometry tools produce `limited`; `--strict` exits unsuccessfully for a failed or unavailable requested check. Character-length advisories do not fail strict validation. Preserve tool limitations rather than reporting an assumed geometry pass.

Render to PNG, inspect every label and artboard edge at full size and intended placed size, then test in the final PDF or PPTX path. Structural or geometry success alone is not a visual pass.
