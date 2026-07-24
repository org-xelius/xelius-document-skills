---
name: editorial-copy-fitting
description: "Adapt evidence-based copy to fit reports, briefs, slides, charts, tables, sidebars, captions, callouts, and speaker notes without weakening meaning. Use when headings, standfirsts, pull quotes, captions, insight titles, slide copy, terminology, dates, or numbers must be shortened or standardized while preserving caveats, uncertainty, safeguarding language, legal qualifications, attribution, and citations."
---

# Editorial Copy Fitting

Fit meaning to form; never make the evidence fit by deletion.

## When to use

Use after structure and real component constraints are known.

## When not to use

Do not replace substantive editing, fact-checking, translation, or legal review.

## Inputs

Source copy, evidence IDs, target component and capacity, audience, tone, terminology rules, protected phrases, and citation requirements.

## Outputs

Fitted copy, slide copy, speaker notes, captions and insight titles, plus `copy-transformations.json` for substantive changes.

## Required workflow

1. Read [EDITORIAL-COPY-FITTING.md](references/EDITORIAL-COPY-FITTING.md).
2. Identify the communication job and immutable meaning.
3. Remove repetition and weak framing before facts or qualifiers.
4. Rewrite headings as specific messages; write standfirsts, captions, sidebars, and notes for their actual roles.
5. Standardize terms, dates, units, and number formats.
6. Compare fitted and source meaning, then log substantive edits.

## Hard rules

- Never silently remove limitations, qualifiers, uncertainty, safeguarding language, legal caveats, attribution, or sources.
- Do not invent a pull quote from words a person did not say; label editorial summaries as summaries.
- Do not turn correlation into causation or estimates into facts.
- Shorten or change the layout before using unreadable type.

## Checkpoints

Escalate any fit that changes claim scope, tone, legal meaning, or evidence interpretation.

## Files to read by phase

Read the fitting reference before transformations and the evidence register when checking meaning.

## Quality checks

Check factual equivalence, terminology, numerals, citation survival, headline specificity, component fit, natural spoken language for slides, and notes completeness.

## Failure and fallback behaviour

When copy cannot fit honestly, return structured alternatives: split, move detail, enlarge the component, or redesign the page or slide. Do not force-fit.

## Example invocations

- "Fit this methodology summary into a 90-word sidebar without losing caveats."
- "Rewrite these chart titles as findings."
- "Create concise slide copy and complete speaker notes from this section."

## Adjacent skills

Receive constraints from publication or presentation; preserve evidence and citations; return layout blockers to the design owner.
