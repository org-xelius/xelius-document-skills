#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
  ]
];

for (const [sourceRelative, targetRelative] of copies) {
  const source = path.join(root, sourceRelative);
  const target = path.join(root, targetRelative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  if (target.endsWith(".mjs")) fs.chmodSync(target, 0o755);
}

console.log(`Synchronized ${copies.length} portable skill assets.`);
