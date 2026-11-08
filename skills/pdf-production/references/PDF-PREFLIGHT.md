# PDF Preflight

## Technical checks

- File opens, is not unexpectedly encrypted, and matches expected page count.
- Page dimensions, orientation, trim, and bleed match the brief.
- Required fonts are embedded or safely substituted; glyphs render.
- Body text is selectable unless intentionally outlined.
- Images are adequate at placed size.
- Bookmarks, internal links, external links, and annotations work.
- Title, author, subject, keywords, language, and dates are appropriate.
- SVGs, transparency, overprint, and colour spaces render as intended.
- Page numbers and running furniture are consistent.
- File size is proportionate to purpose.
- Tagged structure and reading order are checked when accessibility is requested.

## Transformation integrity

Treat PDF splitting, merging, sanitizing, optimizing, office conversion, and print-driver output as new exports. Compare the transformed file with its input:

- Preserve or improve tagging, document language, metadata, outlines, links, annotations, selectable text, page geometry, and intended page count.
- Investigate Type 3 fonts, glyph bounding-box warnings, substitutions, and unusually repeated font subsets.
- Explain material file-size growth.
- Fix accidental blank pages and pagination defects in the editable source whenever possible.
- Do not deliver a visually similar transformation that silently removes accessibility or navigation features. If a required property cannot be preserved, use `limited` or `repair-required`.

## Render checks

Render every page with Poppler when available. Use a second renderer for suspicious transparency or font issues. Compare render count to page count and inspect both contact sheet and full-size pages.

## Status

Use `pass`, `repair-required`, or `limited`. A missing tool produces `limited`, never an assumed pass.

## Publication expectations

Use `assets/pdf-expectations.template.json` as a starting point, and retain only requirements from the brief. Supported fields are `requiredMetadata` (title, author, subject, keywords), `requireTagged`, `language`, `requireSelectableText`, `requireEmbeddedFonts`, `minimumLinks`, `minimumBookmarks`, `pageCount`, `pageSize` (width and height in points), `pageSizeTolerance`, and `rejectType3Fonts`.

`preflight-pdf.mjs input.pdf --expect expectations.json --json` checks those properties even when they were absent in the raw export. Structural checks require `pypdf`; select its interpreter with `--python` or `XELIUS_PYTHON`.

`compare-pdf-properties.mjs raw.pdf final.pdf --expect expectations.json --json` additionally checks lost metadata, tags, language, bookmark/link destinations, normalized text content, and dimensions or rotation on every matched page. Approved revisions can supply `--allow-page-count-change "reason"` or `--allow-text-change "reason"`; these allowances do not waive metadata, links, or geometry failures. `--strict` blocks unresolved warning conditions; it does not mean a warning is universally forbidden for every document type.

Inspect every diagnostic and keep the machine-readable result with the delivered QA. A passing technical result concerns only its listed checks; reading order, link reachability, font appearance, image quality, and full accessibility conformance need their own appropriate review.

## Export and result conventions

`node scripts/render-html-to-pdf.mjs input.html output.pdf --project-root <workspace>` resolves Playwright from the document project's dependencies, waits for fonts/images, and requests tags/outlines. Use `--browser-executable <path>` or `CHROME_PATH` for installed Chromium; inspect resulting properties rather than assuming they exist.

Preflight uses Poppler and Python `pypdf`. Select Python with `--python` or `XELIUS_PYTHON`. Missing required tools yield `limited` with exit code 3; detected failures use 1, invalid arguments 2. JSON preserves stable check IDs and tool warnings. Render with `scripts/render-pdf-pages.mjs`; create previews with `scripts/create-page-contact-sheet.mjs`.
