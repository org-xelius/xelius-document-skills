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

## Render checks

Render every page with Poppler when available. Use a second renderer for suspicious transparency or font issues. Compare render count to page count and inspect both contact sheet and full-size pages.

## Status

Use `pass`, `repair-required`, or `limited`. A missing tool produces `limited`, never an assumed pass.
