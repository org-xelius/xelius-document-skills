#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { validateJsonFile } from "../shared/validation/schema-utils.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const warnings = [];
const textExtensions = new Set([".md", ".json", ".mjs", ".js", ".sh", ".yaml", ".yml", ".css", ".html", ".csv", ".txt"]);
const ignoredLinkPrefixes = ["http://", "https://", "mailto:", "#", "$"];
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\b(?:sk|ghp|xox[baprs])_[A-Za-z0-9_-]{20,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/
];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function frontmatter(file) {
  const text = fs.readFileSync(file, "utf8");
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split("\n")) {
    const field = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (field) fields[field[1]] = field[2].replace(/^["']|["']$/g, "");
  }
  return fields;
}

function validateLinks(file, text) {
  for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const raw = match[1].trim().replace(/^<|>$/g, "");
    if (ignoredLinkPrefixes.some((prefix) => raw.startsWith(prefix))) continue;
    const target = decodeURIComponent(raw.split("#")[0]);
    if (!target) continue;
    const resolved = path.resolve(path.dirname(file), target);
    if (!fs.existsSync(resolved)) errors.push(`${path.relative(root, file)}: missing link target ${raw}`);
  }
}

const skillRoot = path.join(root, "skills");
const skillDirs = fs.readdirSync(skillRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory());
const names = new Map();

for (const entry of skillDirs) {
  const dir = path.join(skillRoot, entry.name);
  const file = path.join(dir, "SKILL.md");
  if (!fs.existsSync(file)) {
    errors.push(`skills/${entry.name}: missing SKILL.md`);
    continue;
  }
  const fields = frontmatter(file);
  if (!fields?.name || !fields?.description) errors.push(`skills/${entry.name}/SKILL.md: invalid or incomplete front matter`);
  if (fields?.name !== entry.name) errors.push(`skills/${entry.name}/SKILL.md: name must match folder`);
  if (fields?.name && !/^[a-z0-9-]{1,64}$/.test(fields.name)) errors.push(`skills/${entry.name}/SKILL.md: invalid skill name`);
  if (fields?.name) {
    if (names.has(fields.name)) errors.push(`duplicate skill name: ${fields.name}`);
    names.set(fields.name, file);
  }
  const files = walk(dir);
  if (files.length < 2) warnings.push(`skills/${entry.name}: only one file beyond the directory`);
  for (const markdownFile of files.filter((item) => item.endsWith(".md"))) {
    const text = fs.readFileSync(markdownFile, "utf8");
    if (text.includes("../../")) {
      errors.push(`${path.relative(root, markdownFile)}: references a path outside its standalone skill package`);
    }
  }
}

const portableCopies = [
  ...[
    "project-manifest.schema.json",
    "source-inventory.schema.json",
    "evidence-register.schema.json",
    "publication-plan.schema.json",
    "deck-storyline.schema.json"
  ].map((name) => [
    path.join(root, "shared", "schemas", name),
    path.join(root, "skills", "content-information-architecture", "assets", "schemas", name)
  ]),
  [
    path.join(root, "shared", "schemas", "qa-report.schema.json"),
    path.join(root, "skills", "visual-quality-assurance", "assets", "schemas", "qa-report.schema.json")
  ],
  [
    path.join(root, "shared", "design-tokens", "design-direction-profiles.json"),
    path.join(root, "skills", "publication-design-system", "assets", "design-direction-profiles.json")
  ],
  [
    path.join(root, "shared", "validation", "detect-environment.mjs"),
    path.join(root, "skills", "document-production-orchestrator", "scripts", "detect-environment.mjs")
  ]
];
for (const [source, target] of portableCopies) {
  if (!fs.existsSync(target)) {
    errors.push(`${path.relative(root, target)}: missing portable copy; run npm run sync:portable`);
  } else if (!fs.readFileSync(source).equals(fs.readFileSync(target))) {
    errors.push(`${path.relative(root, target)}: portable copy is stale; run npm run sync:portable`);
  }
}

const allFiles = walk(root).filter((file) => !file.includes(`${path.sep}dist${path.sep}`));
for (const file of allFiles) {
  const rel = path.relative(root, file);
  const stat = fs.statSync(file);
  const ext = path.extname(file).toLowerCase();
  if ([".ttf", ".otf", ".woff", ".woff2"].includes(ext)) errors.push(`${rel}: bundled font requires explicit review and is prohibited in release validation`);
  if (stat.size > 1_000_000) errors.push(`${rel}: file exceeds 1 MB release limit`);
  if (!textExtensions.has(ext) && stat.size > 250_000) warnings.push(`${rel}: inspect binary size and rights`);
  if (!textExtensions.has(ext)) continue;
  const text = fs.readFileSync(file, "utf8");
  if (/\bTODO\b|\bTBD\b|\[placeholder\]/i.test(text)) errors.push(`${rel}: contains release placeholder`);
  if (/\/Users\/|\/home\/[A-Za-z0-9._-]+\/|[A-Za-z]:\\Users\\/.test(text)) errors.push(`${rel}: contains an absolute local path`);
  for (const pattern of secretPatterns) if (pattern.test(text)) errors.push(`${rel}: possible secret`);
  if (ext === ".md") validateLinks(file, text);
  if (ext === ".json") {
    try {
      JSON.parse(text);
    } catch (error) {
      errors.push(`${rel}: invalid JSON (${error.message})`);
    }
  }
}

for (const file of allFiles.filter((item) => [".mjs", ".sh"].includes(path.extname(item)))) {
  if ((fs.statSync(file).mode & 0o111) === 0) errors.push(`${path.relative(root, file)}: script is not executable`);
}

for (const schemaFile of allFiles.filter((item) => item.endsWith(".schema.json"))) {
  const schema = JSON.parse(fs.readFileSync(schemaFile, "utf8"));
  if (!schema.$schema || !schema.type || !schema.title) errors.push(`${path.relative(root, schemaFile)}: incomplete JSON schema`);
}

const exampleSchemas = {
  "project-manifest.json": "project-manifest.schema.json",
  "source-inventory.json": "source-inventory.schema.json",
  "evidence-register.json": "evidence-register.schema.json",
  "publication-plan.json": "publication-plan.schema.json",
  "deck-storyline.json": "deck-storyline.schema.json",
  "qa-report.json": "qa-report.schema.json"
};
for (const file of allFiles) {
  const schemaName = exampleSchemas[path.basename(file)];
  if (!schemaName) continue;
  const schemaFile = path.join(root, "shared", "schemas", schemaName);
  for (const issue of validateJsonFile(file, schemaFile)) errors.push(`${path.relative(root, file)}: ${issue}`);
}

const expectedScripts = ["validate-all-skills.mjs", "package-skill.mjs", "render-examples.mjs", "create-release.mjs", "sync-portable-assets.mjs"];
for (const script of expectedScripts) if (!fs.existsSync(path.join(root, "scripts", script))) errors.push(`scripts/${script}: missing`);
if (!fs.existsSync(path.join(root, "dist", ".gitkeep"))) errors.push("dist/.gitkeep: missing");

for (const warning of warnings) console.warn(`WARN ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`ERROR ${error}`);
  console.error(`Validation failed with ${errors.length} error(s).`);
  process.exit(1);
}
console.log(`Validated ${skillDirs.length} skills, ${allFiles.length} files, and ${allFiles.filter((f) => f.endsWith(".schema.json")).length} schemas.`);
