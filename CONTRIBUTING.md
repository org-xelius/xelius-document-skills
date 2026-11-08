# Contributing

Keep skills portable, evidence-safe, and progressively disclosed.

1. Add or change the smallest responsible skill.
2. Keep critical rules in `SKILL.md`; put detailed guidance in one-level references.
3. Add deterministic behavior to scripts and fixtures rather than prose.
4. Do not add fonts, secrets, absolute local paths, large binaries, or generated outputs.
5. Run the [development and release checks](docs/development.md), including installation, migration, footprint, and rendered artifacts.
6. Describe user-visible behavior and fallback changes in `CHANGELOG.md`.

Keep the ten current identifiers stable within this release. New modes need realistic forward evaluations and regression coverage. Metadata should make scope clear; conditional detail belongs in references loaded only when needed. Do not replace tests of observable behaviour with wording-matching tests.
