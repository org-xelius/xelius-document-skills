---
name: publication-design-system
description: Define typography, colour, layout, and component contracts for reports and
  presentations. Use to preserve a supplied template, extend a brand, or establish a reusable
  publication system.
license: MIT
metadata:
  author: org-xelius
  version: 0.2.0
  source: https://github.com/org-xelius/xelius-document-skills
---

# Publication Design System

Define a design contract that can survive multiple page and slide families.

## When to use

Use after the content structure is understood and before representative composition.

## When not to use

Do not restyle a locked template without permission or invent a brand when protected assets are missing.

## Inputs

Approved plans, brand assets, reference artifacts, output formats, audience, density, viewing distance, print constraints, accessibility target, and brand mode.

## Outputs

- `design-direction.md`
- `design-tokens.json`, `typography.json`, `colour-tokens.json`, `layout-tokens.json`, `chart-theme.json`
- `component-rules.md` and a representative visual test

## Required workflow

1. Classify the brand mode: extend, preserve, new, light modernisation, or reusable system.
2. Audit protected assets, licenses, existing token patterns, and template geometry.
3. Read [DESIGN-DIRECTION-PROFILES.md](references/DESIGN-DIRECTION-PROFILES.md) and select a contract based on output and evidence, not taste alone.
4. Read typography, colour, grid, accessibility, and anti-pattern references as needed.
5. Define roles for type, colour, spacing, images, charts, tables, icons, SVGs, borders, radii, shadows, footers, page numbers, and source lines.
6. Derive distinct report and presentation scales from the shared semantic system.
7. Test real dense, sparse, image-led, data-led, and source-heavy content.
8. Record protected, flexible, and prohibited decisions.

## Hard rules

- Use design tokens as semantic decisions, not a rigid CSS theme.
- Never bundle fonts without explicit redistribution rights.
- Do not default to generic AI gradients, glowing brains, robots, excessive rounded cards, glassmorphism, stock-photo collages, decorative charts, or mixed icon families.
- Maintain accessible contrast and non-colour encodings.
- Preserve a supplied template unless the approved mode permits change.

## Checkpoints

Approve the direction before representative composition. Revisit it only when real content exposes a structural failure.

## Files to read by phase

- Direction: `references/DESIGN-DIRECTION-PROFILES.md`
- Token definition: `TYPOGRAPHY.md`, `COLOUR-AND-CONTRAST.md`, `GRID-AND-SPACING.md`
- Compliance: `ACCESSIBILITY.md`, `ANTI-PATTERNS.md`
- Starter shape: `assets/design-tokens.template.json`

## Quality checks

Test contrast, long headings, dense tables, chart series, image crops, small source lines, print behaviour, projection distance, component consistency, and at least three layout families.

## Failure and fallback behaviour

If brand assets are incomplete, preserve what is known, use documented system-font fallbacks, and mark assets pending. Do not fabricate logos or proprietary visual assets.

## Example invocations

- "Create a human-centred design system for this development report."
- "Modernise this policy brief while preserving its institutional identity."
- "Define a shared report and deck system without making the deck look like report pages."

## Adjacent skills

Supply tokens to publication, presentation, data, table, SVG, image, PPTX, and PDF production. Let those skills adapt the contract to their medium.
