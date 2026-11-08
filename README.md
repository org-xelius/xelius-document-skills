# Document Production Skills

[![skills.sh](https://skills.sh/b/org-xelius/xelius-document-skills)](https://skills.sh/org-xelius/xelius-document-skills)

Make professional documents with your agent: research reports, consulting and communications briefs, education manuals, organisational reports, editable presentations, charts, tables, diagrams, and reviewed PDF deliverables.

Maintained by **Xelius**. Designed for any organisation, audience, and brand—not an Xelius house style.

## What better quality looks like

A useful document has a coherent structure, accurate evidence, readable typography, and visuals that help readers understand. It also needs editable sources, inspected exports, and an honest account of anything that could not be checked.

These ten skills connect those decisions into a workflow. They help your agent preserve caveats and citations, fit content without tiny text, check every rendered page or slide, and repair defects at source. They do not guarantee factual accuracy or accessibility certification without the relevant evidence and review.

Supported outputs: **PDF, editable HTML/CSS, PPTX, SVG, and associated assets**. This collection does not provide native Word or Google Docs production.

## Install for your agent

With Node.js 22.20 or later, discover the collection first:

```sh
npx skills add org-xelius/xelius-document-skills --list
```

Install all ten for Codex, Hermes, and Claude Code:

```sh
npx skills add org-xelius/xelius-document-skills@v0.2.1 --global --skill '*' --agent codex hermes-agent claude-code
```

Keep only your agent's selector if preferred: `codex`, `hermes-agent`, or `claude-code`. Omit `--global` to install for one project. To install one specialist, replace `'*'` with its catalogue name. No Xelius npm package is needed.

Start a fresh agent session after installation. Rendering programs are separate from the skills; ask your agent to check available tools before production. See [installation and tools](docs/installation.md) for dependencies, manual installation, updates, and agent locations.

**Upgrading from v0.2.0?** Four identifiers have deliberately been merged. Ordinary installation does not remove old copies. Use the [backed-up migration guide](docs/migration.md) to avoid duplicate instructions.

## Prompts to start with

Attach your sources or give the agent their paths, then adapt one of these.

### Create a report

```text
Use document-production-orchestrator to create a research report from the
attached notes, data, and references. The audience is programme leaders
deciding next year's priorities. Preserve the supplied brand and all
methodological caveats. Choose a useful length from the evidence.
Deliver editable HTML/CSS, a PDF, assets, page previews, and a QA summary.
Test a representative spread before completing the report.
```

### Improve an existing report

```text
Use professional-publication in revise mode on this report and its sources.
Preserve approved facts, caveats, citations, and branding. Improve hierarchy,
page pacing, table readability, and figure labels. Identify changes before
applying them; do not introduce unsupported claims. Re-render the final
document, inspect every page, and report repairs and remaining limitations.
```

### Produce an editable presentation

```text
Use professional-presentation to make a 15-minute decision briefing from
these consulting findings. The audience needs to choose between the options.
Build a message-led story, not report pages copied onto slides. Preserve
sources and uncertainty. Deliver an editable PPTX, speaker notes, build
sources, PDF, and inspected slide previews. If the supplied slide
specification is already approved, go directly to build mode.
```

### Review a PDF without changing it

```text
Use visual-quality-assurance and pdf-production to review this PDF only.
Inspect every page at full size, check the required PDF properties, and
give page-specific findings with severity and suggested repairs.
Do not edit the document. Distinguish visual inspection from automated
checks, and mark anything unavailable or unverifiable as limited.
```

For a small job, ask directly: “Use content-information-architecture to fit this caption without losing its caveat,” or “Use data-visualisation in table mode to make this course-comparison table readable.”

## Give your agent a useful brief

Supply what you have; ask it to identify consequential gaps before filling them.

- **Sources:** notes, datasets with definitions, existing reports, citations, images, and any restrictions. Identify authoritative versions.
- **Reader and purpose:** who will use it, what they need to understand or decide, and whether it is read closely, presented live, or both.
- **Brand:** logos, colours, licensed fonts, templates, protected wording, and what may change. Your branding takes priority.
- **References:** examples of useful structure or design, plus what to borrow—not an instruction to copy their claims or identity.
- **Output requirements:** formats, approximate length, page/slide size, print or screen use, editable-source needs, language, accessibility targets, and deadlines.
- **Working preference:** review representative pages first, or work uninterrupted and record decisions.

A policy team might provide legislation and interview notes; a research team might provide study data and methods; an educator might provide learning objectives and course material. The same quality principles apply.

## A simple workflow

1. **Understand the material.** Inventory evidence and agree the report structure or presentation story where needed.
2. **Set the design.** Preserve the brand and test real content in representative pages or slides.
3. **Build the document.** Compose for the medium, keeping text, tables, charts, and sources editable where supported.
4. **Inspect and repair.** Export, render, inspect every page/slide, repair the source, and repeat affected checks.
5. **Deliver with evidence.** Include sources, assets, exports, previews, and a clear QA summary.

Local edits and approved-deck builds skip stages they do not need. Reports and presentations can share evidence and design tokens, but should not share the same composition.

Your QA result means:

- **pass:** all agreed checks and current full-size surface reviews are complete, with no unresolved issues.
- **repair-required:** a known defect still needs attention.
- **limited:** a required tool, check, or inspection could not be completed; the result names the gap.

A technical preflight pass is not a claim of full visual quality or PDF accessibility conformance.

## The ten skills

| Skill | Use it for |
| --- | --- |
| `document-production-orchestrator` | Coordinating new reports, major revisions, or multiple outputs |
| `professional-publication` | Composing and revising reports, briefs, and manuals |
| `professional-presentation` | Developing, building, repairing, and exporting editable decks |
| `publication-design-system` | Typography, colour, layout, and reusable component contracts |
| `content-information-architecture` | Planning content, fitting copy, and auditing references |
| `data-visualisation` | Choosing visual forms, producing charts, and designing tables |
| `svg-illustration` | Editable diagrams, icons, timelines, and measured SVG verification |
| `image-art-direction` | Authentic imagery, crops, resolution, rights, and credits |
| `pdf-production` | PDF export, expectations, preflight, and transformation integrity |
| `visual-quality-assurance` | Full-size surface inspection, defect records, and verified repairs |

Use names without a slash prefix: `--skill professional-publication` when installing, or `$professional-publication` in agents that support that invocation syntax. Each skill is independently installable; full workflows benefit from the collection.

Browse the [skills.sh catalogue](https://skills.sh/org-xelius/xelius-document-skills). Historical listings and search rankings are controlled by that service, not this repository.

## More information

[Installation and tools](docs/installation.md) · [Migration from v0.2.0](docs/migration.md) · [Development and release checks](docs/development.md) · [Evaluation evidence](evals/README.md) · [Release notes](CHANGELOG.md)

Contributions are welcome; see [CONTRIBUTING.md](CONTRIBUTING.md). The instructions and helpers are [MIT licensed](LICENSE). Third-party tools, fonts, images, and source documents retain their own rights.
