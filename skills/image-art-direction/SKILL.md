---
name: image-art-direction
description: "Inventory, evaluate, crop, credit, and direct photography and raster imagery for reports, presentations, handouts, and visual scenes. Use when a project must detect low resolution and duplicates, identify focal points, protect faces and meaningful objects, create aspect-ratio variants, distinguish documentary from decorative imagery, standardize treatment, or flag replacement instead of aggressive upscaling."
---

# Image Art Direction

Treat images as evidence, atmosphere, or explanation; never as anonymous filler.

## When to use

Use when raster imagery affects narrative, authenticity, brand recognition, or layout.

## When not to use

Do not generate fake documentary photographs for real people, places, programs, or events.

## Inputs

Image folder, rights and credits, captions, intended page or slide roles, target sizes, aspect ratios, design tokens, and authenticity requirements.

## Outputs

Image inventory, duplicate and resolution report, focal and crop recommendations, aspect variants, treatment rules, captions, credits, and replacement flags.

## Required workflow

1. Read [IMAGE-ART-DIRECTION.md](references/IMAGE-ART-DIRECTION.md).
2. Inventory dimensions, colour mode, metadata, rights, captions, and likely duplicates.
3. Classify each image as documentary, product or interface evidence, portrait, contextual, decorative, or unusable.
4. Define the focal subject and protected crop region.
5. Recommend variants for each real destination, preserving faces and meaningful objects.
6. Apply one coherent treatment and test crops in the target artifact.
7. Flag low-resolution, repeated hero, rights-unknown, and replacement-needed assets.

## Hard rules

- Do not fabricate documentary evidence.
- Do not repeat a hero image without narrative reason.
- Do not aggressively upscale an unsuitable image to hide quality limits.
- Keep captions and credits attached to the correct asset.
- Do not crop out context that changes meaning.

## Checkpoints

Approve the hero-image strategy and any synthetic decorative imagery before generation or full composition.

## Files to read by phase

Read image art direction before inventory and the target composition reference before cropping.

## Quality checks

Check resolution at placed size, focal protection, duplicates, rights, captions, credits, colour consistency, crop diversity, and target rendering.

## Failure and fallback behaviour

Use a neutral asset-pending frame, alternate authentic image, or non-photographic diagram when the right image is unavailable. State the limitation.

## Example invocations

- "Audit these photographs for an annual report."
- "Recommend portrait, landscape, and widescreen crops without cutting faces."
- "Find duplicate hero images and flag weak replacements."

## Adjacent skills

Supply approved variants to publication and presentation; use SVG illustration for non-photographic explanation and visual QA for placed-image inspection.
