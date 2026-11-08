---
name: professional-presentation
description: Develop, build, repair, or export editable presentations. Use narrative mode for new
  decks and build mode for approved slide specifications.
license: MIT
metadata:
  author: org-xelius
  version: 0.2.1
  source: https://github.com/org-xelius/xelius-document-skills
---

# Professional Presentation

Use the narrowest mode. Preserve approved content, branding, and template geometry unless change is authorized.

## Modes

- **Narrative/compose:** for a new deck or major redesign, read [SLIDE-COMPOSITION.md](references/SLIDE-COMPOSITION.md). Establish audience, duration, desired action, central takeaway, storyline, and appendix. Approve a representative sequence before scaling unless uninterrupted work is requested.
- **Build:** implement an approved specification directly. Read [PPTX-PRODUCTION.md](references/PPTX-PRODUCTION.md); use `assets/deck-spec.template.json` when useful. Do not reopen narrative strategy or require a new evidence plan.
- **Repair:** inspect supplied sources/renders, repair requested defects, preserve unaffected masters, notes, and assets, then re-render.
- **Export:** use the build/export reference without redesign; deliver requested previews/PDF and renderer limitations.

Give each slide one primary idea, message-led headline, dominant hierarchy, and narrative job. Never paginate report prose into slides. Shorten, split, or move detail to notes/appendix before shrinking text; keep source lines projection-legible and production notes outside visible copy.

Preserve native editable text, shapes, and charts where reliable. Keep build source, notes, sources, asset manifest, theme/fonts, and aspect ratio. Test SVGs in the target renderer and retain verified PNG fallbacks. Do not flatten whole slides to avoid layout work.

Run bounds/placeholder checks, render every slide, compare slide counts/PDF parity, and inspect clipping, wrapping, z-order, fonts, crops, values, and sources. Bounds success is not visual QA. Use the QA specialist if available, or provide explicit inspection evidence and limitations.

Without a renderer, deliver editable PPTX with source-level checks and exact manual rendering instructions; mark visual validation `limited`, never passed.
