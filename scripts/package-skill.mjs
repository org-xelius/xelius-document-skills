#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const name = process.argv[2];
if (!name || !/^[a-z0-9-]+$/.test(name)) {
  console.error("Usage: node scripts/package-skill.mjs <skill-name>");
  process.exit(2);
}
const skillDir = path.join(root, "skills", name);
if (!fs.existsSync(path.join(skillDir, "SKILL.md"))) {
  console.error(`Unknown skill: ${name}`);
  process.exit(1);
}
fs.mkdirSync(path.join(root, "dist"), { recursive: true });
const output = path.join(root, "dist", `xelius-${name}.tgz`);
const stagingRoot = fs.mkdtempSync(path.join(os.tmpdir(), "xelius-package-"));
const stagedSkill = path.join(stagingRoot, name);
try {
  fs.cpSync(skillDir, stagedSkill, { recursive: true });
  fs.copyFileSync(path.join(root, "LICENSE"), path.join(stagedSkill, "LICENSE"));
  const result = spawnSync("tar", ["-czf", output, "-C", stagingRoot, name], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
} finally {
  fs.rmSync(stagingRoot, { recursive: true, force: true });
}
console.log(output);
