#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(root, "node_modules", "skills", "bin", "cli.mjs");
const destination = fs.mkdtempSync(path.join(os.tmpdir(), "xelius-install-"));
const names = Object.keys(JSON.parse(fs.readFileSync(path.join(root, "shared", "skill-catalogue.json"), "utf8"))).sort();
function run(args, cwd) {
  const result = spawnSync(process.execPath, [cli, ...args], { cwd, encoding: "utf8", env: { ...process.env, DISABLE_TELEMETRY: "1" } });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  return result.stdout;
}
const listed = run(["add", root, "--list"], destination);
for (const name of names) assert.ok(listed.includes(name), `Missing discovery: ${name}`);
run(["add", root, "--skill", "*", "--agent", "codex", "hermes-agent", "claude-code", "--copy", "--yes"], destination);
for (const location of [".agents/skills", ".hermes/skills", ".claude/skills"]) {
  for (const name of names) {
    const source = path.join(root, "skills", name);
    const installed = path.join(destination, location, name);
    for (const entry of fs.readdirSync(source, { recursive: true, withFileTypes: true })) {
      if (!entry.isFile()) continue;
      const absolute = path.join(entry.parentPath || entry.path, entry.name);
      const rel = path.relative(source, absolute);
      assert.deepEqual(fs.readFileSync(path.join(installed, rel)), fs.readFileSync(absolute), `${location}/${name}/${rel} differs`);
    }
  }
}
const single = fs.mkdtempSync(path.join(os.tmpdir(), "xelius-single-install-"));
run(["add", root, "--skill", "visual-quality-assurance", "--agent", "codex", "--copy", "--yes"], single);
assert.ok(fs.existsSync(path.join(single, ".agents", "skills", "visual-quality-assurance", "scripts", "schema-utils.mjs")));
console.log(JSON.stringify({ status: "pass", skills: names.length, agents: ["codex", "hermes-agent", "claude-code"], installedRoot: destination, isolatedSpecialistRoot: single }, null, 2));
