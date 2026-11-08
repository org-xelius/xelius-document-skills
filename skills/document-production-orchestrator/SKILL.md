---
name: document-production-orchestrator
description: Coordinate reports, presentations, or combined deliverables that need several
  production stages. Use for a new publication, major revision, or shared evidence across formats;
  route a narrow edit or export directly to its specialist.
license: MIT
metadata:
  author: org-xelius
  version: 0.2.0
  source: https://github.com/org-xelius/xelius-document-skills
---

# Document Production Orchestrator

Coordinate the requested work and use only the specialists it needs.

## Select the mode

- **Create:** establish evidence, architecture, design, representative output, production, and final QA.
- **Revise:** inspect existing sources and renders, preserve approved content and identity, then repair the requested scope. Reuse valid plans and evidence instead of rebuilding them.
- **Review:** inspect and report findings; do not modify the artifact unless asked.
- **Export:** use PDF or PPTX production directly when composition is approved.

Record the selected mode and required output properties in the project manifest. Resolve routine choices from the brief and existing authorization. Use checkpoints only where a meaningful decision is unresolved; uninterrupted delivery records decisions internally.

## When to use

Use for net-new production, major redesigns, multi-format work, or any request that needs content architecture, a design system, specialist assets, rendering, and QA.

## When not to use

Route a narrow chart, citation, table, SVG, image, PPTX, PDF, or QA task directly to its specialist when no broader workflow is required.

## Inputs

- Source files, URLs, datasets, image and brand folders
- Intended audience, purpose, desired action, output types, length, deadline, and brand mode
- Existing templates, accessibility or print requirements, and approval preference

## Outputs

- `working/project-manifest.json`
- Routed specialist work products and checkpoint decisions
- Editable sources, final exports, previews, `qa/qa-report.json`
- `production-report.md` listing outputs, validation, limitations, and dependencies

## Required workflow

1. Inspect the repository, source roots, and available assets.
2. Read [ROUTING.md](references/ROUTING.md) and [TOOL-DETECTION-AND-FALLBACKS.md](references/TOOL-DETECTION-AND-FALLBACKS.md).
3. Run `node scripts/detect-environment.mjs --json` when the implementation environment matters.
4. Establish Checkpoint 1: audience, purpose, action, outputs, approximate length, brand mode, assets, formats, and interactive or uninterrupted mode.
5. Reuse the current inventory and evidence register, or invoke `content-information-architecture` when sources or structure need organizing.
6. Route the structure:
   - Reports: publication plan, then `professional-publication`.
   - Presentations: storyline, then `professional-presentation`.
   - Combined work: create both plans from the same evidence register; never convert report pages into slides.
7. Invoke `publication-design-system` once the structure and output constraints are known.
8. Establish Checkpoint 2 on architecture or storyline, design direction, image strategy, chart strategy, and production format.
9. Route specialist assets to data, table, SVG, imagery, citation, copy-fitting, PPTX, and PDF skills.
10. For a new system or major redesign, inspect a representative sample before full composition; preserve the user's checkpoint preference.
11. Render final outputs, use `visual-quality-assurance`, repair, and re-render. Validate canonical QA JSON before deriving a delivery manifest or claiming pass.
12. Establish Checkpoint 4 and write the production report.

## Hard rules

- Maintain one source inventory and one evidence register across outputs.
- Give reports and presentations separate composition logic.
- Preserve caveats, rights, credits, citations, and uncertainty.
- Do not skip render-based QA; do not call unavailable checks passed.
- Respect existing user authorization and record checkpoint decisions without inventing new approval requirements.
- Do not silently substitute synthetic documentary imagery.

## Checkpoints

Use the four checkpoints defined above. In uninterrupted mode, record internal decisions and complete the same QA without waiting.

## Files to read by phase

- Intake and routing: `references/ROUTING.md`
- Environment selection: `references/TOOL-DETECTION-AND-FALLBACKS.md`
- Structure: adjacent content architecture skill and shared schemas
- Production: selected specialist `SKILL.md` files only
- QA: adjacent visual QA skill and its reference

## Quality checks

Confirm that each deliverable maps to an approved plan, every visible claim maps to evidence, output pairs share tokens without sharing composition, editable sources open, final exports render, and no high-severity QA issue remains.

## Failure and fallback behaviour

Stop only for missing critical authority, unsafe destructive changes, irreconcilable architecture, or an unavailable dependency with no documented fallback. Otherwise select the safest fallback, record reduced validation coverage, and continue.

## Example invocations

- "Turn this research folder into a 30-page report and a 12-slide partner briefing."
- "Create a policy brief, two charts, and an editable conference deck from these sources."
- "Modernise this annual report while preserving the organisation's brand."

## Adjacent skills

Invoke all specialists through [ROUTING.md](references/ROUTING.md). The orchestrator owns sequencing and handoffs; specialists own their craft and validation.

Check that required specialist skills are installed. If one is missing, identify its role and installation selector, then use available equivalent capabilities for authorized work and state any resulting limitation. A single installed orchestrator does not imply the whole collection is present.
