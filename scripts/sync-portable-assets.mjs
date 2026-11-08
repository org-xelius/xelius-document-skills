#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const copies = [
  ...[
    "project-manifest.schema.json",
    "source-inventory.schema.json",
    "evidence-register.schema.json",
    "publication-plan.schema.json",
    "deck-storyline.schema.json"
  ].map((name) => [
    path.join("shared", "schemas", name),
    path.join("skills", "content-information-architecture", "assets", "schemas", name)
  ]),
  [
    path.join("shared", "schemas", "qa-report.schema.json"),
    path.join("skills", "visual-quality-assurance", "assets", "schemas", "qa-report.schema.json")
  ],
  [
    path.join("shared", "design-tokens", "design-direction-profiles.json"),
    path.join("skills", "publication-design-system", "assets", "design-direction-profiles.json")
  ],
  [
    path.join("shared", "validation", "detect-environment.mjs"),
    path.join("skills", "document-production-orchestrator", "scripts", "detect-environment.mjs")
  ],
  [
    path.join("shared", "validation", "schema-utils.mjs"),
    path.join("skills", "visual-quality-assurance", "scripts", "schema-utils.mjs")
  ]
];

for (const [sourceRelative, targetRelative] of copies) {
  const source = path.join(root, sourceRelative);
  const target = path.join(root, targetRelative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  if (target.endsWith(".mjs")) fs.chmodSync(target, 0o755);
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const catalogue = JSON.parse(fs.readFileSync(path.join(root, "shared", "skill-catalogue.json"), "utf8"));
for (const [name, description] of Object.entries(catalogue)) {
  const dir = path.join(root, "skills", name);
  const skillFile = path.join(dir, "SKILL.md");
  const content = fs.readFileSync(skillFile, "utf8");
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) throw new Error(`Missing frontmatter: ${name}`);
  const fields = parse(match[1]);
  fields.description = description;
  fields.license = "MIT";
  fields.metadata = { ...fields.metadata, author: "org-xelius", version: pkg.version, source: "https://github.com/org-xelius/xelius-document-skills" };
  fs.writeFileSync(skillFile, `---\n${stringify(fields, { lineWidth: 100 }).trimEnd()}\n---\n${content.slice(match[0].length)}`);
  fs.copyFileSync(path.join(root, "LICENSE"), path.join(dir, "LICENSE"));
}
console.log(`Synchronized ${copies.length} portable assets and ${Object.keys(catalogue).length} licensed skill metadata records.`);
