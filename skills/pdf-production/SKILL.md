---
name: pdf-production
description: Export and preflight PDFs; check expected properties and transformed-file integrity.
  Use after composition or for focused PDF inspection.
license: MIT
metadata:
  author: org-xelius
  version: 0.2.1
  source: https://github.com/org-xelius/xelius-document-skills
---

# PDF Production

Export success starts preflight; it does not establish publication quality.

Use after composition for PDF export, inspection, or focused export repair. Preserve editable sources. Read [PDF-PREFLIGHT.md](references/PDF-PREFLIGHT.md) for commands, dependencies, expectations, and status semantics.

Derive metadata, dimensions/count, tags, language, fonts, links/outlines, and selectable-text requirements from the output contract. Adapt `assets/pdf-expectations.template.json`; do not invent universal requirements.

Export through the approved browser/office path, then run `scripts/preflight-pdf.mjs` with expectations. After any optimizer, split/merge, sanitizer, converter, or print driver changes the PDF, run `scripts/compare-pdf-properties.mjs` on raw/final files. Explain intended page/text changes; reject unexplained loss of tags, metadata, links, outlines, text, or geometry. Identical raw/final files may both fail publication requirements.

Render every page, compare expected/rendered counts, review contact sheet and all full-size pages, then repair at source. Check glyphs, clipping, black boxes, soft imagery, pagination, fonts, links, furniture, and source readability. Do not conceal blank-page/overflow defects with transformations that strip properties.

Retain preflight JSON, transformation comparisons, renders, and limitations. Technical success proves only listed checks—not reading order, link reachability, appearance, or full accessibility conformance. Type 3 fonts need review unless the brief rejects them; avoid uncalibrated replacement.

Missing required checks produce `limited`; known failures need repair. Never pass unavailable checks. Use documented fallbacks and exact manual checks when validation is incomplete.
