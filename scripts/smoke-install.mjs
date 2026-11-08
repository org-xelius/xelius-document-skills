#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { retired } from "./migrate-installations.mjs";

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
assert.match(listed.replace(/\u001b\[[0-9;]*m/g, ""), /Found 10 skills/, "Discovery must find exactly ten skills");
for (const name of names) assert.ok(listed.includes(name), `Missing discovery: ${name}`);
for (const name of retired) {
  const result = spawnSync(process.execPath, [cli, "add", root, "--skill", name, "--agent", "codex", "--copy", "--yes"], { cwd: destination, encoding: "utf8", env: { ...process.env, DISABLE_TELEMETRY: "1" } });
  assert.notEqual(result.status, 0, `Retired selector unexpectedly installed: ${name}`);
  assert.match(result.stdout + result.stderr, /no matching|not found|could not find/i, `Retired selector should fail clearly: ${name}`);
}
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
for (const name of names) {
  const project = path.join(single, name);
  fs.mkdirSync(project);
  run(["add", root, "--skill", name, "--agent", "codex", "--copy", "--yes"], project);
  const directory = path.join(project, ".agents", "skills");
  assert.deepEqual(fs.readdirSync(directory), [name], "Single-skill install pulled another skill");
  const source = path.join(root, "skills", name);
  for (const entry of fs.readdirSync(source, { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile())) {
    const absolute = path.join(entry.parentPath || entry.path, entry.name);
    assert.deepEqual(fs.readFileSync(path.join(directory, name, path.relative(source, absolute))), fs.readFileSync(absolute));
  }
}
console.log(JSON.stringify({ status: "pass", skills: names.length, agents: ["codex", "hermes-agent", "claude-code"], installedRoot: destination, isolatedSpecialistRoot: single }, null, 2));
