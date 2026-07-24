---
name: professional-presentation
description: "Develop audience-centred presentation strategy and composition for executive decks, pitches, partner briefings, conference talks, training decks, and data presentations. Use when a deck needs a central takeaway, desired audience action, message-led storyline, representative sequence, coherent slide system, editable PPTX, speaker notes, PDF export, slide renders, and narrative and visual QA."
---

# Professional Presentation

Design for live viewing, narration, sequencing, and decisions.

## When to use

Use for net-new decks or major narrative redesigns.

## When not to use

Do not paginate a report into slides, perform a small PPTX repair, or export an already approved deck.

## Inputs

Audience, stakes, format, speaking duration, desired action, evidence register, approved design tokens, assets, notes requirements, and delivery environment.

## Outputs

`deck-storyline.json`, editable PPTX, PDF export, speaker notes, sources file, rendered PNGs, contact sheet, and QA report.

## Required workflow

1. Define the presentation brief.
2. State: "By the end, [audience] should [outcome] because [central takeaway]."
3. Read [SLIDE-COMPOSITION.md](references/SLIDE-COMPOSITION.md) for storyline and composition guidance.
4. Build a message-led slide storyline and appendix plan.
5. At Checkpoint A, approve the storyline.
6. Generate or import the design direction and slide system.
7. Build a representative sequence: opening, evidence or chart, explanation, image or statement, and closing or recommendation.
8. At Checkpoint B, approve the sequence unless uninterrupted mode is recorded.
9. Complete the deck, add speaker notes and source lines, and invoke `pptx-production`.
10. Export PDF, render every slide, inspect narrative and visual flow, repair, and re-render.

## Hard rules

- Give each slide one primary idea, message-led headline, dominant hierarchy, and narrative job.
- Never copy report paragraphs onto slides.
- Shorten, split, or move detail to notes or appendix before shrinking text.
- Use projection-legible type and source lines.
- Simplify dense evidence; progressively disclose only when the delivery format supports it.
- Vary slide silhouettes inside one coherent system.
- Open with purpose or tension and close with the explicit decision, recommendation, or action.
- Keep visible copy audience-facing; keep production notes out of slides.

## Checkpoints

Use Checkpoint A for storyline, Checkpoint B for the representative sequence, and final QA for narrative, rendering, notes, sources, and export integrity.

## Files to read by phase

- Narrative: content architecture storyline references
- Composition: `references/SLIDE-COMPOSITION.md`
- Starter: `templates/deck-system.json`
- Build and export: adjacent PPTX and PDF production skills
- Inspection: adjacent visual QA skill

## Quality checks

Read the deck without notes for story logic, then with notes for delivery completeness. Inspect every slide at full size for wrapping, clipping, density, alignment, crop quality, chart accuracy, source readability, repetition, and a weak opening or close.

## Failure and fallback behaviour

If a native renderer is unavailable, still deliver the editable PPTX only with a recorded validation limitation and manual render instructions. If a template cannot support the storyline, identify the closest viable layouts and request a consequential template decision.

## Example invocations

- "Create a 12-slide partner briefing from this report and evidence register."
- "Build a 20-minute conference presentation with speaker notes."
- "Turn this analysis into an executive decision deck, not a report summary."

## Adjacent skills

Use content architecture, design system, copy fitting, data, tables, SVG, images, citations, PPTX production, PDF production, and visual QA.
