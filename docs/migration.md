# Upgrade from v0.2.0

V0.2.1 intentionally retires four identifiers, without compatibility wrappers:

| Retired | Use instead | Mode |
| --- | --- | --- |
| editorial-copy-fitting | content-information-architecture | edit/fit |
| citation-and-references | content-information-architecture | audit references |
| table-design | data-visualisation | table |
| pptx-production | professional-presentation | build, repair, or export |

Update saved prompts and helper paths. The resources and command interfaces still exist in the surviving skill folders; see [relocated helpers](development.md#relocated-helpers).

**Ordinary installation does not remove old copies.** Clone this repository at v0.2.1, then preview the migration:

```sh
node scripts/migrate-installations.mjs
```

The default is dry-run. To make the previewed changes:

```sh
node scripts/migrate-installations.mjs --apply
```

The helper checks current Codex, Hermes, Claude Code, and the legacy Codex directory when present. Before replacing repository-owned current skills or removing repository-owned retired skills, it backs up all affected copies and a manifest. It installs the ten current folders from this checkout, and never deletes unrelated skills.

Provenance requires matching skill name, repository source URL, and publisher metadata. Foreign skills with matching names are preserved and reported as conflicts. Resolve a current-name conflict yourself or choose a different destination; the helper does not assume ownership. Backups dereference owned skill symlinks but replacements remove only the installation link, not its external target.

Use `--home <directory>` for an isolated test account and `--backup-dir <directory>` to select a new backup location. No overwrite is allowed at an existing backup directory. Repeated execution skips byte-identical current copies; absent retired skills are harmless.

The JSON result lists actions, conflicts, and the backup path. Retain the backup until you verify fresh agent sessions. Restore individual affected folders from the backup manifest if needed, or reinstall the immutable `v0.2.0` release; rollback installation likewise does not automatically remove v0.2.1 copies.

The helper also backs up the Skills CLI global lock and removes retired records only when their repository/path provenance matches and the canonical skill is absent or owned. Foreign records and unrelated settings remain untouched. Current CLI hashes are refreshed by the next normal installation/update; the helper does not invent them.

Historical skills.sh entries may remain visible. Only the ten current identifiers are discovered from this release.
