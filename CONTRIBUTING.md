# Contributing

Keep skills portable, evidence-safe, and progressively disclosed.

1. Add or change the smallest responsible skill.
2. Keep critical rules in `SKILL.md`; put detailed guidance in one-level references.
3. Add deterministic behavior to scripts and fixtures rather than prose.
4. Do not add fonts, secrets, absolute local paths, large binaries, or generated outputs.
5. Run `npm run validate` and `npm test`.
6. Describe user-visible behavior and fallback changes in `CHANGELOG.md`.

New skills require unique lowercase hyphenated names, valid YAML front matter, adjacent-skill routing, failure behavior, and at least one realistic invocation.
