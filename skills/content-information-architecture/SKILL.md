---
name: content-information-architecture
description: Turn mixed research, notes, documents, and datasets into a source inventory, evidence
  register, report plan, or presentation storyline. Use before composition when the evidence or
  structure needs organizing.
license: MIT
metadata:
  author: org-xelius
  version: 0.2.0
  source: https://github.com/org-xelius/xelius-document-skills
---

# Content Information Architecture

Create the content and evidence spine before design or production.

## When to use

Use after intake and before a design system, report composition, or slide design.

## When not to use

Do not use for pure copyediting, visual restyling, or export-only work when an approved structure already exists.

## Inputs

Raw sources, project brief, target outputs, audience, duration or page range, rights information, and known exclusions.

## Outputs

- `source-inventory.json` and `evidence-register.json`
- For reports: `publication-plan.json`
- For decks: `deck-storyline.json`
- Missing-input, contradiction, and content-risk notes

## Required workflow

1. Inventory every source using `assets/schemas/source-inventory.schema.json`.
2. Extract claims, data, quotes, images, methods, caveats, and rights; assign stable evidence IDs.
3. Separate fact, interpretation, recommendation, testimonial, and unverified assertion.
4. For reports, read [PUBLICATION-ARCHETYPES.md](references/PUBLICATION-ARCHETYPES.md), then define front matter, hierarchy, page families, visual opportunities, tables, charts, annex, and references.
5. For presentations, read [PRESENTATION-ARCHETYPES.md](references/PRESENTATION-ARCHETYPES.md), [STORYLINE-DESIGN.md](references/STORYLINE-DESIGN.md), and [MESSAGE-LED-HEADLINES.md](references/MESSAGE-LED-HEADLINES.md).
6. Give every slide one purpose, one message, one dominant evidence form, and explicit links to adjacent slides.
7. Validate outputs against the shared schemas before handoff.

## Hard rules

- Never invent content, data, quotes, citations, or image rights.
- Keep report architecture and deck storyline separate.
- Use message-led slide headlines; topic labels are insufficient.
- Trace every important claim to an evidence ID and locator.
- Preserve methodological limitations and conflicting evidence.
- Put detail in annexes or notes only when the main narrative remains honest without it.

## Checkpoints

At the structure checkpoint, show the inventory summary, unresolved gaps, report architecture or storyline, proposed evidence forms, and annex or appendix plan.

## Files to read by phase

- Intake: [PROJECT-FILE-CONVENTION.md](references/PROJECT-FILE-CONVENTION.md)
- Report planning: publication archetypes
- Deck planning: presentation archetypes, storyline design, and message-led headlines
- Validation: shared schemas named above

## Quality checks

Check source coverage, duplicate and superseded sources, evidence-to-claim traceability, section purpose, headline quality, narrative continuity, missing caveats, overloaded pages or slides, and realistic length.

## Failure and fallback behaviour

Mark unreadable or restricted sources in the inventory. If critical evidence is missing, produce a provisional plan with explicit blockers rather than filling gaps. If OCR or parsing is unavailable, request or use a text equivalent and record the limitation.

## Example invocations

- "Structure these PDFs, interview notes, and CSV into a research report."
- "Create a 15-minute executive storyline from this evidence register."
- "Find the strongest shared evidence for a report and partner deck."

## Adjacent skills

Hand publication plans to `professional-publication`, storylines to `professional-presentation`, evidence forms to data or table skills, and source risks to `citation-and-references`.
