#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cases = JSON.parse(fs.readFileSync(path.join(root, "evals", "consolidation-cases.json"), "utf8"));
const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "xelius-evals-"));
const baseline = path.join(workspace, "baseline");
const candidate = path.join(workspace, "candidate");
fs.mkdirSync(baseline);
fs.mkdirSync(candidate);
const archive = path.join(workspace, "baseline.tar");
const snapshot = spawnSync("git", ["archive", "--format=tar", "-o", archive, cases.baselineRef, "skills", "shared"], { cwd: root, encoding: "utf8" });
if (snapshot.status !== 0) throw new Error(snapshot.stderr);
const extract = spawnSync("tar", ["-xf", archive, "-C", baseline], { encoding: "utf8" });
if (extract.status !== 0) throw new Error(extract.stderr);
for (const dir of ["skills", "shared"]) fs.cpSync(path.join(root, dir), path.join(candidate, dir), { recursive: true });
for (const configuration of [baseline, candidate]) {
  fs.cpSync(path.join(root, "evals", "fixtures"), path.join(configuration, "inputs"), { recursive: true });
  fs.copyFileSync(path.join(root, "shared", "fixtures", "executive-partner-presentation", "deck-spec.json"), path.join(configuration, "inputs", "deck-spec.json"));
}
for (const item of cases.cases) {
  for (const configuration of ["baseline", "candidate"]) {
    const out = path.join(workspace, "runs", item.id, configuration);
    fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(path.join(out, "result.json"), JSON.stringify({ case: item.id, configuration, status: "not-run", agent: null, model: null, durationMs: null, tokens: null, checks: [], observations: [] }, null, 2) + "\n");
  }
}
fs.writeFileSync(path.join(workspace, "cases.json"), JSON.stringify(cases, null, 2) + "\n");
console.log(JSON.stringify({ workspace, baseline, candidate, cases: cases.cases.length, status: "prepared-not-evaluated" }, null, 2));
