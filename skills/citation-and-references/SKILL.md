---
name: citation-and-references
description: Normalize and check citations, bibliographies, figure sources, table notes, and image
  credits. Use for missing entries, duplicate sources, numbering, DOI formatting, and link
  validation while preserving source traceability.
license: MIT
metadata:
  author: org-xelius
  version: 0.2.0
  source: https://github.com/org-xelius/xelius-document-skills
---

# Citation and References

Maintain a complete path from visible claim or asset to its source.

## When to use

Use during architecture, production, and final preflight.

## When not to use

Do not treat citation presence as proof that a claim is true; factual verification remains separate.

## Inputs

Evidence register, manuscript or deck text, bibliography, source style, figure and table inventory, image credits, DOI and URL fields.

## Outputs

Normalized citations and bibliography, source lines, link-check report, unmatched-entry report, and unresolved-source warnings.

## Required workflow

1. Read [CITATIONS.md](references/CITATIONS.md).
2. Select or preserve the approved citation system.
3. Parse in-text citations, notes, bibliography entries, figures, tables, and images.
4. Match citations bidirectionally with bibliography entries and evidence IDs.
5. Normalize authors, dates, titles, DOIs, URLs, numbering, punctuation, and access dates as required.
6. Validate links when network access is available.
7. Recheck the rendered artifact for legible and correctly placed source lines.

## Hard rules

- Never invent bibliographic fields or resolve ambiguity silently.
- Preserve stable identifiers and original source locators.
- Keep figure, table, and image sources attached to the correct object.
- Distinguish unavailable network validation from a passed link check.

## Checkpoints

Escalate style changes, incomplete high-value sources, ambiguous matches, and rights or attribution gaps.

## Files to read by phase

Read citations guidance before normalization and the evidence register throughout matching.

## Quality checks

Check missing and uncited entries, duplicates, broken numbering, DOI syntax, URL status, link text, note order, source-line coverage, image credits, and rendered legibility.

## Failure and fallback behaviour

Mark incomplete entries with structured warnings outside audience-facing copy. Preserve the supplied citation rather than guessing.

## Example invocations

- "Audit this report for missing bibliography entries and figure sources."
- "Normalize these endnotes and DOIs."
- "Check every chart, table, and image credit in the deck."

## Adjacent skills

Receive evidence IDs from content architecture and return corrected sources to publication, presentation, data, table, image, PDF, and PPTX production.
