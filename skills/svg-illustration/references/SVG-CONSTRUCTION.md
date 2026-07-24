# SVG Construction

## Required structure

Use a root `svg` with namespace, explicit `viewBox`, target width and height when useful, `<title>`, `<desc>`, and stable IDs. Group layers by semantic role.

## Safe subset

Prefer paths, rects, circles, lines, polygons, text, clip paths, and simple gradients. Avoid filters, external resources, CSS dependencies, scripts, and animation unless every target renderer is proven.

## Geometry

Keep strokes consistent, close filled paths, prevent out-of-artboard bounds, and add padding for thick strokes. Use markers and masks only after raster and target tests. Simplify generated paths.

## Typography

Use available target-safe fonts. For short display lettering, outline only when editability and accessibility are preserved elsewhere. Never rely on an unbundled font without a fallback.

## Validation

Parse XML, reject scripts and external URLs, check IDs and references, require metadata and viewBox, render to PNG, inspect visually, then test in the final PDF or PPTX path.
