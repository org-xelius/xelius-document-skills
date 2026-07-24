# Xelius Document Skills

`xelius-document-skills` is a portable Agent Skills repository for producing evidence-led reports, editable presentations, matching PDFs, visual assets, previews, and render-based quality reports.

The collection is a coordinated production system. One source inventory and evidence register can support several outputs, while reports and presentations keep separate composition logic.

## Supported outputs

- Professionally designed reports, briefs, case studies, annual reports, toolkits, and manuals
- Editable PowerPoint decks with speaker notes
- Report and presentation PDFs
- Charts, tables, maps, diagrams, SVG illustrations, and image variants
- Reusable publication and presentation design systems
- Page and slide renders, contact sheets, preflight reports, and structured QA

## Skill catalogue

Installable skill identifiers use the `xelius/` namespace:

| Skill | Responsibility |
| --- | --- |
| `xelius/document-production-orchestrator` | Route multi-stage and multi-output production |
| `xelius/professional-publication` | Compose reports for close reading |
| `xelius/professional-presentation` | Build audience-led storylines and slide systems |
| `xelius/publication-design-system` | Define output-specific design contracts and tokens |
| `xelius/content-information-architecture` | Inventory sources and create report or deck structures |
| `xelius/data-visualisation` | Select and produce accurate analytical visuals |
| `xelius/svg-illustration` | Create and validate robust vector assets |
| `xelius/pptx-production` | Build editable PowerPoint files |
| `xelius/pdf-production` | Export and preflight PDFs |
| `xelius/visual-quality-assurance` | Inspect rendered output and govern repair |
| `xelius/editorial-copy-fitting` | Fit copy without weakening meaning |
| `xelius/table-design` | Design research and presentation tables |
| `xelius/image-art-direction` | Inventory, crop, credit, and direct imagery |
| `xelius/citation-and-references` | Normalize and validate citations and source lines |

## How the skills work together

```text
brief + sources
      |
      v
orchestrator
      |
      v
source inventory + evidence register
      |
      +-------------------+
      |                   |
publication plan     deck storyline
      |                   |
report composition   slide composition
      |                   |
PDF production       PPTX + PDF production
      +---------+---------+
                |
          rendered visual QA
```

Charts, tables, SVGs, images, citations, and copy fitting join only when the plans require them.

## Installation

Install the collection from the Xelius GitHub organisation:

```sh
npx skills add org-xelius/xelius-document-skills
npx skills add org-xelius/xelius-document-skills --skill document-production-orchestrator
npx skills add org-xelius/xelius-document-skills --skill professional-publication
```

Manual installation is agent-agnostic: copy any complete folder from `skills/` into the skill directory your agent scans. Common destinations include:

| Agent | Common project location |
| --- | --- |
| Codex | `.codex/skills/<skill-name>/` |
| Claude Code | `.claude/skills/<skill-name>/` |
| Cursor and generic Agent Skills hosts | `.agents/skills/<skill-name>/` |
| Hermes and other compatible agents | Use the host's documented Agent Skills directory |

Keep each complete folder together; references, scripts, assets, templates, and examples are part of the skill.

## Optional production toolchain

The skills detect available tools and select documented fallbacks. Only install the capabilities your workflow needs.

### macOS with Homebrew

For PDF inspection and page rendering:

```sh
brew install poppler
```

Poppler provides `pdfinfo`, `pdffonts`, `pdftoppm`, and `pdftocairo`. These support PDF metadata and page-size checks, font inspection, full-page rendering, and contact-sheet workflows.

For robust SVG editing, conversion, and raster checks:

```sh
brew install --cask inkscape
```

Inkscape supports SVG-to-PNG and SVG-to-PDF conversion, path and artboard inspection, and cross-checking SVG assets before they enter reports or presentations.

Useful complementary tools:

```sh
brew install imagemagick ghostscript ffmpeg
brew install --cask libreoffice
```

| Tool | Enables |
| --- | --- |
| ImageMagick | Image inspection, format conversion, and page or slide contact sheets |
| Ghostscript | Secondary PDF rendering and print-oriented inspection |
| LibreOffice | Headless PPTX-to-PDF export when Microsoft PowerPoint is unavailable |
| ffmpeg | Media inspection, frame extraction, and visual-scene preparation |

For browser-based paged-media PDF generation:

```sh
npm add --save-dev playwright
npx playwright install chromium
```

Install Playwright in the document-production project rather than bundling it inside an individual skill.

### Verify the environment

```sh
npm run check:environment
command -v inkscape pdfinfo pdffonts pdftoppm
```

When Inkscape was installed as a macOS cask, its command may live inside the application bundle rather than on `PATH`. The environment check recognizes both locations. You can verify the cask directly with:

```sh
/Applications/Inkscape.app/Contents/MacOS/inkscape --version
```

Tool availability does not itself prove output quality. PDF, SVG, and PPTX artifacts must still be rendered and visually inspected. When a required utility is absent or cannot run in the host environment, the QA report must use `limited` status and name the missing check.

## Quick start

Multi-output production:

```text
Use xelius/document-production-orchestrator to turn the supplied research,
dataset, brand assets, and photographs into a 24-page report and a 12-slide
partner briefing. Preserve one evidence register, use separate report and
presentation composition, and deliver editable sources, PDFs, renders, and QA.
```

Focused report:

```text
Use xelius/professional-publication with this approved publication plan and
design system. Build and review a representative spread before full composition.
```

Focused deck:

```text
Use xelius/professional-presentation to create a 15-minute executive decision
deck with message-led headlines, speaker notes, an editable PPTX, and PDF export.
```

## Repository structure

```text
xelius/
├── skills/                  # Fourteen portable Agent Skills
├── shared/
│   ├── schemas/             # Project, evidence, plan, storyline, and QA schemas
│   ├── design-tokens/       # Machine-readable direction contracts
│   ├── example-content/     # Shared synthetic evidence base
│   ├── fixtures/            # Report and presentation source projects
│   └── validation/          # Environment and schema utilities
├── scripts/                 # Validation, packaging, examples, and release
└── dist/                    # Generated packages, excluded from source control
```

## Validation

Requires Node.js 20 or later.

```sh
npm run validate
npm test
npm run check:environment
npm run render:examples
```

Validation checks skill front matter, unique names, internal links, JSON and schema shape, executable scripts, release placeholders, large files, fonts, secrets, absolute local paths, and required packaging files.

Visual validation remains environment-dependent. A missing renderer produces a limited status, never a false pass.

## Examples

`shared/fixtures/development-impact-report/` specifies a nine-page synthetic report. `shared/fixtures/executive-partner-presentation/` uses the same evidence base for an 11-slide partner deck with speaker notes. Both include reproducible source and explicit synthetic-image labels; generated binaries are not committed.

## Releases

Run `npm run release` to validate and create one compressed package per skill plus a SHA-256 release manifest in `dist/`. The release workflow performs the same validation before uploading artifacts.

## Publishing to GitHub and Skills.sh

Publish the contents of this `xelius/` directory as the root of a public GitHub repository named `xelius-document-skills`. Before the first push:

```sh
npm run sync:portable
npm run validate
npm test
npx skills add . --list
```

After publishing, repeat discovery against GitHub:

```sh
npx skills add org-xelius/xelius-document-skills --list
npx skills add org-xelius/xelius-document-skills --skill professional-publication
```

The Skills CLI discovers each folder under `skills/` from its `SKILL.md` front matter. The public Skills.sh page is expected at `https://skills.sh/org-xelius/xelius-document-skills/<skill-name>` after the repository has been indexed. Indexing is an external service step, so verify the final URLs after the first public installation.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). Keep changes portable, evidence-safe, render-aware, and scoped to the smallest responsible skill.

## License

MIT. See [LICENSE](LICENSE). Fonts and third-party assets require their own compatible licenses and are not included by default.
