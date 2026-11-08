#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { retired } from "./migrate-installations.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const tag = process.env.GITHUB_REF_TYPE === "tag" ? process.env.GITHUB_REF_NAME : null;
if (tag && tag !== `v${pkg.version}`) throw new Error(`Release tag ${tag} does not match package version ${pkg.version}.`);
const evidence = JSON.parse(fs.readFileSync(path.join(root, "evals", `v${pkg.version}-results.json`), "utf8"));
const requiredCases = ["protected-copy", "citation-audit", "chart-table", "editable-deck"].sort();
if (evidence.version !== pkg.version || evidence.pairedEvaluation?.baselineRef !== "v0.2.0" || JSON.stringify(evidence.pairedEvaluation.cases.map((item) => item.id).sort()) !== JSON.stringify(requiredCases)) throw new Error("Release needs all four v0.2.0/candidate paired evaluations.");
for (const item of evidence.pairedEvaluation.cases) if (item.completed !== true || item.comparison?.regressionDetected !== false) throw new Error(`Incomplete or regressed evaluation: ${item.id}`);
for (const [name, expected] of Object.entries(evidence.evaluatedCandidateEntrypoints || {})) {
  if (!/^[a-z-]+$/.test(name)) throw new Error("Invalid evidence skill identifier");
  const actual = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, "skills", name, "SKILL.md"))).digest("hex");
  if (actual !== expected) throw new Error(`Candidate entrypoint changed since evaluation: ${name}`);
}
if (Object.keys(evidence.evaluatedCandidateEntrypoints || {}).length !== 3) throw new Error("Expected evidence for three consolidated entrypoints.");
const validate = spawnSync(process.execPath, [path.join(root, "scripts", "validate-all-skills.mjs")], { stdio: "inherit" });
if (validate.status !== 0) process.exit(validate.status || 1);
const tests = spawnSync("npm", ["test"], { cwd: root, stdio: "inherit" });
if (tests.status !== 0) process.exit(tests.status || 1);

const dist = path.join(root, "dist");
fs.mkdirSync(dist, { recursive: true });
const names = fs.readdirSync(path.join(root, "skills"), { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
if (names.length !== 10) throw new Error("Release requires exactly ten skills.");
for (const name of retired) {
  const stale = path.join(dist, `xelius-${name}.tgz`);
  if (fs.existsSync(stale)) { fs.unlinkSync(stale); console.log(`Removed stale generated archive: ${path.basename(stale)}`); }
}
const expectedArchives = names.map((name) => `xelius-${name}.tgz`);
for (const file of fs.readdirSync(dist).filter((name) => name.endsWith(".tgz"))) if (!expectedArchives.includes(file)) throw new Error(`Unknown archive in dist: ${file}`);
const artifacts = [];
for (const name of names) {
  const build = spawnSync(process.execPath, [path.join(root, "scripts", "package-skill.mjs"), name], { encoding: "utf8" });
  if (build.status !== 0) {
    process.stderr.write(build.stderr);
    process.exit(build.status || 1);
  }
  const file = path.join(dist, `xelius-${name}.tgz`);
  const listing = spawnSync("tar", ["-tzf", file], { encoding: "utf8" });
  if (listing.status !== 0) throw new Error(`Cannot inspect archive ${name}`);
  const paths = listing.stdout.trim().split("\n");
  if (!paths.includes(`${name}/SKILL.md`) || !paths.includes(`${name}/LICENSE`) || paths.some((entry) => entry.startsWith("/") || entry.split("/").includes("..") || !entry.startsWith(`${name}/`))) throw new Error(`Unsafe or incomplete archive: ${name}`);
  artifacts.push({
    file: path.basename(file),
    bytes: fs.statSync(file).size,
    sha256: crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")
  });
}
const revision = spawnSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" });
if (revision.status !== 0) throw new Error("Cannot determine source commit");
fs.writeFileSync(path.join(dist, "release-manifest.json"), `${JSON.stringify({ name: pkg.name, version: pkg.version, sourceCommit: revision.stdout.trim(), license: pkg.license, createdAt: new Date().toISOString(), artifacts }, null, 2)}\n`);
console.log(`Created ${artifacts.length} skill packages.`);
if (fs.readdirSync(dist).filter((file) => file.endsWith(".tgz")).length !== 10) throw new Error("Release archive count differs from ten.");
