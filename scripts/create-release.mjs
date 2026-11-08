#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const tag = process.env.GITHUB_REF_TYPE === "tag" ? process.env.GITHUB_REF_NAME : null;
if (tag && tag !== `v${pkg.version}`) throw new Error(`Release tag ${tag} does not match package version ${pkg.version}.`);
const validate = spawnSync(process.execPath, [path.join(root, "scripts", "validate-all-skills.mjs")], { stdio: "inherit" });
if (validate.status !== 0) process.exit(validate.status || 1);
const tests = spawnSync("npm", ["test"], { cwd: root, stdio: "inherit" });
if (tests.status !== 0) process.exit(tests.status || 1);

const dist = path.join(root, "dist");
fs.mkdirSync(dist, { recursive: true });
const names = fs.readdirSync(path.join(root, "skills"), { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
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
