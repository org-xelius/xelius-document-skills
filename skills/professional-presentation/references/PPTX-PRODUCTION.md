# PPTX Production

## Build contract

Use a mature programmable JavaScript library supported by the environment. Preserve native text, shapes, and charts where reliability and editability justify them. Keep a build manifest with library version, slide size, theme, fonts, assets, and source hashes.

## Component layer

Implement reusable helpers for titles, body copy, metrics, callouts, charts, diagrams, sources, footers, image frames, section markers, and speaker notes. Components must accept semantic tokens and return measurable bounds.

## Geometry

Define slide bounds and safe area once. Check every element for finite coordinates, positive dimensions, within-slide bounds, intended overlap, and footer or source-zone collision. Create connectors behind nodes.

## Rendering

Prefer LibreOffice or another detected office renderer. Compare PPTX and PDF slide counts, render every slide, and inspect full size. A bounds pass without rendering is not visual QA.

## Template preservation

When a template is supplied, inherit masters, layouts, theme, margins, placeholders, footers, and page markers. Record every intentional deviation.

## Font recovery

Compare rendered PDF font names with the approved specification, not just embedded-font flags. If approved fonts are installed but substituted, check the renderer's font discovery/configuration and cache before accepting a limitation. Use project-local renderer configuration, preserve source font declarations, then re-export and inspect again. A renderer may not scan the host's font directories. If recovery needs unavailable fonts, new licensing, or a source/brand change, stop for that decision and report limited coverage; do not silently replace fonts or claim a match.

Run `node scripts/check-pptx-fonts.mjs deck-spec.json rendered.pdf` for a family comparison. It exits 1 for mismatches, 3 for unavailable inspection/undeclared fonts, and 2 for invalid input. Style/subset normalization is heuristic: review unusual family names rather than automatically substituting fonts. This supplements embedding checks, not glyph inspection or licensing review.

## Portable commands

Run helpers from the document project or pass its dependency root explicitly:

```sh
node scripts/build-pptx.mjs deck-spec.json deck.pptx --project-root <workspace>
node scripts/check-slide-bounds.mjs layout-manifest.json
node scripts/render-pptx.mjs deck.pptx previews
node scripts/create-contact-sheet.mjs previews contact-sheet.png
```

Install `pptxgenjs` in that workspace; global skill folders do not contain project dependencies. Preserve helper argument/output conventions. Bounds input has `slide.width/height` and `slides[].items[]` with `id/x/y/w/h` and optional `placeholder`; failures exit 1. Record library version. The supplied JSON builder implements native text, shapes, images, and notes; richer native charts or template editing need an appropriate implementation, not flattened slides. Retain the build specification and assets.

An approved specification goes straight to build; do not require a new storyline checkpoint. New designs should test an opening, evidence, explanation, image/statement, and closing sequence. Check placeholders, fonts, notes, source zones, overlap, and target-rendered SVGs. Without an office renderer, provide exact manual steps and mark visual QA limited.
