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
