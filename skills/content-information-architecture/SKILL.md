---
name: content-information-architecture
description: Plan evidence-led content, fit copy without losing meaning, or audit citations and
  credits. Select a focused mode for local edits or reference checks.
license: MIT
metadata:
  author: org-xelius
  version: 0.2.1
  source: https://github.com/org-xelius/xelius-document-skills
---

# Content Information Architecture

Select only the requested mode; an approved structure is not permission to replan it.

## Modes

- **Plan content:** organize sources into an evidence-led report plan or deck storyline. Read [PROJECT-FILE-CONVENTION.md](references/PROJECT-FILE-CONVENTION.md), then [CONTENT-PLANNING.md](references/CONTENT-PLANNING.md). Reuse inventories and evidence IDs.
- **Edit/fit copy:** shorten headings, captions, paragraphs, table notes, or slides to real capacity. Read [EDITORIAL-COPY-FITTING.md](references/EDITORIAL-COPY-FITTING.md) only. A local edit needs no new inventory or plan.
- **Audit references:** match and normalize citations, bibliography, source lines, and credits. Read [CITATIONS.md](references/CITATIONS.md) only; use `scripts/validate-references.mjs` for structured records. Citation presence is not factual verification.

Preserve facts, denominators, periods, uncertainty, safeguarding/legal language, attribution, and locators. Never invent evidence, quotes, rights, or bibliographic fields. Separate fact, interpretation, recommendation, and unverified assertion. Retain contradictions and methodological limitations.

For fitting, remove repetition before qualifications. Keep protected wording exact; compare source and result, and log substantive edits in `copy-transformations.json`. If honest copy cannot fit, offer a split, larger component, notes, or annex—not tiny type or hidden evidence loss. Never manufacture pull quotes or strengthen association into causation.

For references, preserve the approved style and stable IDs; keep credits attached to their objects. Missing fields and unavailable link checks remain explicit warnings, not guessed values or passed checks.

Deliver only mode-relevant outputs: schema-validated plans/registers; fitted copy and transformation notes; or normalized references and unresolved warnings. Report unreadable sources and consequential scope changes.
