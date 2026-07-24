#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const target = process.argv[2];
if (!target || path.resolve(target) === path.parse(path.resolve(target)).root) {
  console.error("Usage: node create-project.mjs <safe-project-directory>");
  process.exit(2);
}
if (fs.existsSync(target) && fs.readdirSync(target).length) {
  console.error("Target exists and is not empty.");
  process.exit(1);
}
const dirs = [
  "source/documents", "source/data", "source/images", "source/brand",
  "working", "assets/charts", "assets/diagrams", "assets/svg", "assets/images", "assets/fonts",
  "report/src", "report/output", "report/renders",
  "presentation/src", "presentation/output", "presentation/renders", "qa"
];
for (const dir of dirs) fs.mkdirSync(path.join(target, dir), { recursive: true });
console.log(`Created ${dirs.length} project directories at ${path.resolve(target)}`);
