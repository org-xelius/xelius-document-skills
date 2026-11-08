# Xelius Document Skills

[![skills.sh](https://skills.sh/b/org-xelius/xelius-document-skills)](https://skills.sh/org-xelius/xelius-document-skills)

Fourteen portable Agent Skills for evidence-led reports, editable presentations, charts, diagrams, PDF export, and visual review. Reports and presentations share evidence and design tokens while retaining composition suited to each medium.

## Install

Requires Node.js 22.20 or later for the current Skills CLI. No Xelius npm package is required.

```sh
# Explore without installing
npx skills add org-xelius/xelius-document-skills --list

# Install all skills globally for these agents
npx skills add org-xelius/xelius-document-skills --global --skill '*' --agent codex hermes-agent claude-code

# Pin this release for reproducible installation
npx skills add org-xelius/xelius-document-skills@v0.2.0 --global --skill '*' --agent codex hermes-agent claude-code
```

Omit `--global` for a project installation. The CLI normally links each agent to a canonical copy; use `--copy` when your environment requires independent copies. Use `--yes` for an unattended install after choosing the source and agents.

| Agent | CLI selector | Global skill directory |
| --- | --- | --- |
| Codex | `codex` | `~/.agents/skills/` |
| Hermes | `hermes-agent` | `~/.hermes/skills/` |
| Claude Code | `claude-code` | `~/.claude/skills/` |

Some older Codex installations also contain `~/.codex/skills/`. Check for stale duplicate copies when upgrading; do not delete unrelated skills. Manual installation copies a complete folder from `skills/`, including its license and resources, to the directory your agent scans.

```sh
npx skills list --global
npx skills check
npx skills update --global
npx skills find publication --owner org-xelius
```

See the [catalogue on skills.sh](https://skills.sh/org-xelius/xelius-document-skills) and the [official CLI reference](https://github.com/vercel-labs/skills/blob/main/docs/commands.md) for update, removal, and agent options. skills.sh visibility and install rankings are external services; installation does not guarantee a particular search ranking.

## Choose a workflow

The source is `org-xelius/xelius-document-skills`; actual skill names have no slash prefix. For example, use `--skill professional-publication` when installing, and `$professional-publication` in a supporting agent or ask it to use that skill by name.

| Skill | Responsibility |
| --- | --- |
| `document-production-orchestrator` | Coordinate stages and outputs |
| `professional-publication` | Compose and revise reports for close reading |
| `professional-presentation` | Develop narrative, slides, and speaker notes |
| `publication-design-system` | Set typography, layout, component, and output contracts |
| `content-information-architecture` | Inventory sources and plan evidence-led structure |
| `data-visualisation` | Produce accurate analytical visuals |
| `svg-illustration` | Create and inspect vector diagrams |
| `pptx-production` | Build editable PowerPoint files |
| `pdf-production` | Export, inspect, and compare PDFs |
| `visual-quality-assurance` | Review rendered surfaces and verify repairs |
| `editorial-copy-fitting` | Fit copy while preserving meaning |
| `table-design` | Make exact lookup and comparison legible |
| `image-art-direction` | Select, crop, and credit raster imagery |
| `citation-and-references` | Maintain citations and traceability |

Install an individual specialist for a focused task. A report workflow usually also needs content architecture, design system, PDF production, and visual QA; presentation work additionally needs PPTX production. The orchestrator checks available specialists and reports missing capabilities. Installing the full collection is the easiest starting point.

```text
Use document-production-orchestrator to turn the supplied knowledge base into
a report and an editable partner deck. Share one evidence register, preserve
the supplied brand, and deliver sources, exports, renders, and validated QA.
```

```text
Use professional-publication in revise mode on this existing report.
Preserve the approved content and design. Repair the identified layout defects,
re-render affected pages, and produce QA against the current renders.
```

For review-only work, report findings without modifying the artifact. For export-only work, use the relevant production specialist. Load only the instructions and references needed for the selected mode.

## Production dependencies

Skill installation does not install production programs. Install capabilities in the document project when needed:

```sh
npm add --save-dev playwright pptxgenjs
npx playwright install chromium
python3 -m pip install pypdf
```

The render/build scripts accept `--project-root` so globally installed scripts can resolve the project's dependencies. Use `--help` on a helper to see its options. In restricted environments, use approved existing tools and report unavailable checks as limited.

On macOS:

```sh
brew install poppler imagemagick ghostscript
brew install --cask inkscape libreoffice
```

Poppler supplies PDF inspection and rendering. Inkscape supplies SVG geometry and previews; its macOS cask executable may be inside `/Applications/Inkscape.app/Contents/MacOS/inkscape`. LibreOffice exports PPTX to PDF. Browser, office, and accessibility capabilities vary by host.

## Quality and QA

V0.2.0 separates schema validity, technical preflight, and actual visual review. A successful export or a matching raw/final PDF does not prove that a publication meets its requirements.

- Define audience, typography minima, placed visual sizes, contrast, language, and required PDF features in an output contract.
- Keep facts, caveats, sources, credits, and protected status wording traceable.
- Create QA using the bundled helper and schema version `2.0`; see the installed `visual-quality-assurance` skill for exact commands.
- Review every surface in final-delivery QA. Render hashes tie reviews to the artifact version; records document coverage but cannot prove that someone viewed an image.
- Derive Markdown summaries and delivery status from canonical QA JSON. Schema `1.0` reports require explicit migration and fresh review evidence; do not silently relabel old reports as current.
- Use `repair-required` for known defects and `limited` for missing required checks. Respect accepted deviations with attribution and rationale.

## Develop and verify

```sh
npm ci
npm run sync:portable
npm run validate
npm test
npm run test:install
npx playwright install chromium
npm run test:artifacts
```

`test:install` uses the pinned Skills CLI in a temporary project and verifies installed files for Codex, Hermes, and Claude Code. `test:artifacts` produces real PDF/PPTX output, renders every page, and writes technical evidence; it does not fabricate a visual-review pass. Set `PYTHON` to a Python executable with `pypdf` and optionally `CHROME_PATH` to an installed Chromium executable. LibreOffice and Poppler must be runnable for the complete artifact test.

`npm run render:examples` stages synthetic source projects; add `-- --render` for binary output. `npm run eval:prepare` prepares isolated v0.1.1/v0.2.0 evaluation workspaces. See [evals/README.md](evals/README.md) for prompts, expected behavior, and how to record actual results without invented benchmark scores.

## Release

`npm run release` validates, tests, inspects all fourteen archives, and writes a manifest containing versions, source commit, and SHA-256 checksums. CI additionally performs installation and rendered-artifact checks before creating a tagged GitHub release. Tag and package versions must agree. Each installed skill includes MIT licensing and author/version/source metadata.

The repository retains the standard `skills/<name>/SKILL.md` layout for Skills CLI discovery. A separate npm CLI and optional skills.sh packs are future distribution options, not dependencies of this release.

## Contributing and license

Read [CONTRIBUTING.md](CONTRIBUTING.md). The repository and skill instructions are [MIT licensed](LICENSE). Third-party tools and assets retain their own licenses; documentary or proprietary source material must not be redistributed as public evaluation fixtures.
