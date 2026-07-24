---
name: data-visualisation
description: "Select, design, export, and validate analytical charts, maps, timelines, matrices, flows, small multiples, and metric displays for reports and presentations. Use when data must communicate one defensible message with accurate scales, units, periods, labels, source and sample notes, accessible tabular data, SVG and PNG exports, and output-specific report or projection treatment."
---

# Data Visualisation

Choose the visual form from the analytical relationship and audience decision.

## When to use

Use for quantitative or structured qualitative evidence that benefits materially from a visual form.

## When not to use

Keep the information as prose or a table when precise lookup, not pattern recognition, is the job.

## Inputs

Clean data, data dictionary, evidence IDs, analytical question, audience, output medium, design tokens, units, periods, sample and source notes.

## Outputs

Chart specification, accessible data table, editable source, SVG, PNG, alt text, and validation notes.

## Required workflow

1. Validate the data and intended comparison.
2. Read [CHART-SELECTION.md](references/CHART-SELECTION.md).
3. State the one-message finding before selecting a chart.
4. Choose the simplest valid form; define scales, order, baseline, labels, annotations, units, and notes.
5. Apply the chart theme and output-specific density.
6. Export SVG and PNG; render and inspect both in the target report or PPTX.
7. Verify visual values against source data and provide an accessible table.

## Hard rules

- Never invent, interpolate, or silently impute missing data.
- Use no 3D or decorative forms that obscure magnitude.
- Do not truncate scales in ways that mislead; disclose non-zero baselines.
- Use direct labels where practical and consistent scales when comparison is intended.
- State units, periods, sources, samples, and relevant uncertainty.
- Give presentation charts larger labels, fewer variables, stronger focus, and simpler annotation.

## Checkpoints

Approve chart intent and form before producing a large chart set. Escalate transformations that change interpretation.

## Files to read by phase

Read chart selection before specification, then the design-system chart theme and the target medium's composition reference.

## Quality checks

Check totals, denominators, ordering, scales, ticks, colour meaning, legibility, annotation accuracy, source notes, SVG and PNG parity, and accessible-table parity.

## Failure and fallback behaviour

If data is insufficient, produce a data-gap note or an annotated table. If SVG cannot render in the target, preserve the SVG source and use a verified high-resolution PNG fallback.

## Example invocations

- "Choose the right form for changes across five regions over time."
- "Simplify this report chart for a presentation."
- "Create an accessible map and table from this dataset."

## Adjacent skills

Use table design for lookup-heavy evidence, SVG illustration for diagrams, and visual QA for rendered inspection.
