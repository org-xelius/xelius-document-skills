# SVG Construction

## Required structure

Use a root `svg` with namespace, explicit `viewBox`, target width and height when useful, `<title>`, `<desc>`, and stable IDs. Group layers by semantic role.

## Safe subset

Prefer paths, rects, circles, lines, polygons, text, clip paths, and simple gradients. Avoid filters, external resources, CSS dependencies, scripts, and animation unless every target renderer is proven.

## Geometry

Keep strokes consistent, close filled paths, prevent out-of-artboard bounds, and add padding for thick strokes. Use markers and masks only after raster and target tests. Simplify generated paths.

## Typography

Use available target-safe fonts. For short display lettering, outline only when editability and accessibility are preserved elsewhere. Never rely on an unbundled font without a fallback.

SVG `<text>` does not wrap automatically. Break long labels into explicit `<tspan>` lines, increase the container, or simplify the wording without changing meaning. Do not use substring slicing or ellipses to conceal overflow in evidence, status, units, caveats, or labels. Avoid `foreignObject` for production text unless every target renderer is proven.

Estimate text width during construction, then verify the raster result. Keep a safe inset around the viewBox, including stroke width and ascenders or descenders. Treat any cropped glyph, text touching an artboard edge, overlap, or unreadable placed-size label as a failed render.

## Validation

Parse XML, reject scripts and external URLs, check IDs and references, require metadata and viewBox, and run strict validation. Render to PNG, inspect every label and artboard edge at full size and intended placed size, then test in the final PDF or PPTX path. Structural success alone is not a visual pass.
