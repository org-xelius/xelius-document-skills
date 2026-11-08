#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const examplesRoot = path.join(root, "shared", "fixtures");
const projects = fs.readdirSync(examplesRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory());
let failed = false;
for (const project of projects) {
  const build = path.join(examplesRoot, project.name, "build.mjs");
  if (!fs.existsSync(build)) continue;
  const result = spawnSync(process.execPath, [build, ...(process.argv.includes("--render") ? ["--render"] : [])], { cwd: root, stdio: "inherit" });
  if (result.status !== 0) failed = true;
}
if (failed) process.exit(1);
console.log(`${process.argv.includes("--render") ? "Rendered" : "Staged"} ${projects.length} synthetic example projects.`);
