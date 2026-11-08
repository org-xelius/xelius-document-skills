# Citations

## Supported systems

Preserve or explicitly choose footnotes, endnotes, author-date, or numbered references. Do not mix systems accidentally.

## Matching checks

- Every in-text citation or note resolves to one bibliography record.
- Every bibliography record is cited or intentionally listed as further reading.
- Every chart and table has a source or documented original-analysis statement.
- Every non-owned image has a correct credit and rights status.
- Numbered references are sequential after edits.
- Duplicate records are consolidated without losing distinct editions.

## Identifiers and links

Normalize DOI values to `https://doi.org/...` when appropriate. Preserve accessed dates when the style requires them. Validate links with network access; record status, redirects, and check date. Do not guess missing author, year, title, publisher, or page.

## Structured validation and scope

Run `node scripts/validate-references.mjs references.json` for missing/uncited entries, duplicate IDs, and DOI syntax. Input has `citations` (ID array) and `bibliography` (records with `id`, optional `doi` and `furtherReading`). Output lists `missing`, `uncited`, `duplicates`, and `invalidDois`; findings exit 1. This helper does not detect duplicate sources with different IDs or check network links; audit those separately. Inspect rendered source-line legibility when renders exist. Preserve stable IDs/locators. Missing fields and unavailable link checks remain warnings, not guesses or passes. Matching a reference does not prove truth or rights.
