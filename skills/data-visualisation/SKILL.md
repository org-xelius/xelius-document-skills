---
name: data-visualisation
description: Choose and produce charts, maps, or readable tables for evidence-led documents. Use
  table mode for exact lookup without a chart workflow.
license: MIT
metadata:
  author: org-xelius
  version: 0.2.1
  source: https://github.com/org-xelius/xelius-document-skills
---

# Data Visualisation

Start with the reader's question, not a preferred visual style.

## Modes

- **Choose a form:** use prose for a simple point, tables for exact lookup/multiple attributes, and charts/maps for patterns, trends, distribution, or magnitude.
- **Produce charts:** read [CHART-SELECTION.md](references/CHART-SELECTION.md). State the supported finding; specify scales, order, baseline, labels, units, period, sample, sources, and uncertainty. Deliver editable source, appropriate SVG/PNG, alt text, and accessible data.
- **Design tables:** read [TABLE-DESIGN.md](references/TABLE-DESIGN.md) only. Deliver an editable table with semantic headers, units, consistent precision, numeric alignment, missing-value keys, notes, and sources. No chart specification or exports are required for table-only work.

Validate source values, denominators, totals, ordering, and transformations. Never invent, interpolate, or silently impute missing data. Distinguish zero, missing, not applicable, and suppressed values; avoid false precision.

Use the simplest defensible form, non-colour encodings, direct labels where practical, and consistent comparison scales. Disclose non-zero baselines; avoid misleading truncation and decorative 3D. Slides need fewer variables and larger labels, not unchanged report figures.

Test at actual placed size. Repeat table headers after page breaks and avoid split rows. Remove redundant fields, split by question, use landscape, or provide an annex before shrinking type. Preserve notes and full data in abbreviated display versions.

Inspect inside the target report/deck. Check visual/data parity, contrast, labels, source readability, row breaks, and SVG/PNG parity when both exist. Escalate interpretation-changing transformations. Insufficient evidence yields a qualified table or data-gap note, not an invented visual.
