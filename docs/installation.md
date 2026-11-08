# Installation and production tools

The README contains the short [installation guide](../README.md#install-for-your-agent). The Skills CLI source is `org-xelius/xelius-document-skills`; actual skill selectors are the ten folder names under `skills/`.

## Locations and options

| Agent | CLI selector | Global location |
| --- | --- | --- |
| Codex | `codex` | `~/.agents/skills/` |
| Hermes | `hermes-agent` | `~/.hermes/skills/` |
| Claude Code | `claude-code` | `~/.claude/skills/` |

The CLI normally links agent installations to a canonical copy. Use `--copy` for independent copies and `--yes` for unattended installation after selecting source/agents. Manual installation copies a whole skill folder, including LICENSE, scripts, references, and assets. Some older Codex setups also scan `~/.codex/skills/`; check that location for duplicates.

```sh
npx skills list --global
npx skills check
npx skills update --global
npx skills find publication --owner org-xelius
```

Updates do not remove retired identifiers. Use the [migration helper](migration.md) for v0.2.0. New instructions become available in a fresh session (or the next turn where the host reloads its skills).

See the [Skills CLI reference](https://github.com/vercel-labs/skills/blob/main/docs/commands.md). Discoverability, historical listings, and rankings on skills.sh are external; publication does not guarantee a ranking.

## Optional production dependencies

Installing skills does not install rendering programs. Install capabilities in the **document project**, only for the outputs you need:

```sh
npm add --save-dev playwright pptxgenjs
npx playwright install chromium
python3 -m pip install pypdf
```

HTML export uses Playwright; editable deck building uses PptxGenJS. Portable helpers accept `--project-root` to resolve project dependencies rather than looking inside a global skill folder. The supplied deck-spec builder supports native text/shapes/images/notes; richer chart or template work needs an appropriate implementation.

On macOS:

```sh
brew install poppler imagemagick ghostscript
brew install --cask inkscape libreoffice
```

Poppler inspects/renders PDFs, Inkscape measures SVG geometry, and LibreOffice exports PPTX. The Inkscape cask may expose its executable inside `/Applications/Inkscape.app/Contents/MacOS/inkscape`. Set `XELIUS_INKSCAPE` if needed. Set `XELIUS_PYTHON` to Python with pypdf, and `CHROME_PATH` to an installed Chromium when required.

On other platforms use equivalent trusted packages. Tool availability and accessibility support vary. Check capabilities with the orchestrator's `scripts/detect-environment.mjs --json`; missing checks must remain explicit limitations. Do not claim native Word or Google Docs output from this collection.
