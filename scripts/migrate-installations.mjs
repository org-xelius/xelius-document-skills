#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const repository = "https://github.com/org-xelius/xelius-document-skills";
export const retired = ["editorial-copy-fitting", "citation-and-references", "table-design", "pptx-production"];
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const exists = (file) => { try { fs.lstatSync(file); return true; } catch (e) { if (e.code === "ENOENT") return false; throw e; } };
export function owned(directory, name) {
  try {
    const text = fs.readFileSync(path.join(directory, "SKILL.md"), "utf8");
    const front = text.match(/^---\n([\s\S]*?)\n---/)[1];
    const field = (key) => front.match(new RegExp(`^\\s*${key}:\\s*["']?([^\\n"']+)["']?\\s*$`, "m"))?.[1]?.trim();
    return field("name") === name && field("author") === "org-xelius" && field("source")?.replace(/\/$/, "") === repository;
  } catch { return false; }
}
function digest(directory) {
  const hash = crypto.createHash("sha256");
  function walk(dir, prefix = "") {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = path.join(dir, entry.name), relative = path.join(prefix, entry.name);
      if (entry.isDirectory()) walk(file, relative);
      else if (entry.isFile()) hash.update(relative).update("\0").update(fs.readFileSync(file));
      else throw new Error(`Nested link or unsupported entry: ${file}`);
    }
  }
  walk(directory);
  return hash.digest("hex");
}
export function migrate({ home = os.homedir(), source = path.join(root, "skills"), apply = false, backupDir } = {}) {
  home = path.resolve(home); source = path.resolve(source);
  if (home === path.parse(home).root || !fs.statSync(home).isDirectory()) throw new Error("Choose an existing user home, not a filesystem root.");
  const catalogue = JSON.parse(fs.readFileSync(path.join(root, "shared", "skill-catalogue.json"), "utf8"));
  const names = Object.keys(catalogue).sort();
  if (names.length !== 10) throw new Error("Expected exactly ten current skills.");
  for (const name of names) if (!owned(path.join(source, name), name)) throw new Error(`Missing source provenance: ${name}`);
  const locations = [".agents/skills", ".hermes/skills", ".claude/skills"];
  if (exists(path.join(home, ".codex", "skills"))) locations.push(".codex/skills");
  const actions = [], conflicts = [];
  for (const location of locations) {
    const directory = path.join(home, location);
    // Do not traverse a redirected installation root or parent.
    for (const component of [path.dirname(directory), directory]) if (exists(component) && fs.lstatSync(component).isSymbolicLink()) throw new Error(`Installation root is a symlink: ${component}`);
    for (const name of [...names, ...retired]) {
      const target = path.join(directory, name);
      if (path.dirname(target) !== directory) throw new Error("Unsafe skill target.");
      const current = names.includes(name), present = exists(target);
      if (present && !owned(target, name)) { conflicts.push({ location, name, reason: "foreign-or-unverifiable-provenance" }); continue; }
      if (!current && !present) continue;
      if (current && present && digest(target) === digest(path.join(source, name))) continue;
      actions.push({ location, name, target, action: current ? "install" : "remove-retired", backup: present });
    }
  }
  const lockFile = path.join(home, ".agents", ".skill-lock.json");
  let lock, lockText;
  const lockRemovals = [];
  if (exists(lockFile)) {
    if (fs.lstatSync(lockFile).isSymbolicLink()) throw new Error("Skills lock file is a symlink; inspect it manually.");
    lockText = fs.readFileSync(lockFile, "utf8");
    lock = JSON.parse(lockText);
    if (!lock.skills || typeof lock.skills !== "object" || Array.isArray(lock.skills)) throw new Error("Unrecognized Skills CLI lock structure; preserve and inspect it manually.");
    for (const name of retired) {
      const record = lock.skills[name];
      const installed = path.join(home, ".agents", "skills", name);
      if (record?.source === "org-xelius/xelius-document-skills" && record.sourceUrl === repository + ".git" && record.skillPath === `skills/${name}/SKILL.md` && (!exists(installed) || owned(installed, name))) lockRemovals.push(name);
    }
  }
  const result = { mode: apply ? "apply" : "dry-run", status: conflicts.length ? "limited" : "pass", actions, lockRemovals, conflicts, backupDirectory: null };
  if (!apply || (!actions.length && !lockRemovals.length)) return result;
  const selectedBackup = path.resolve(backupDir || path.join(home, ".xelius-skill-backups", new Date().toISOString().replace(/[:.]/g, "-") + "-" + crypto.randomBytes(3).toString("hex")));
  if (exists(selectedBackup)) throw new Error("Backup directory must not already exist.");
  if (locations.some((loc) => selectedBackup === path.join(home, loc) || selectedBackup.startsWith(path.join(home, loc) + path.sep))) throw new Error("Backup must be outside skill installations.");
  fs.mkdirSync(selectedBackup, { recursive: true });
  // Finish every backup before changing any installation, including shared symlink targets.
  for (const item of actions.filter((item) => item.backup)) {
    const destination = path.join(selectedBackup, item.location, item.name);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.cpSync(item.target, destination, { recursive: true, dereference: true, errorOnExist: true });
  }
  if (lockRemovals.length) fs.writeFileSync(path.join(selectedBackup, "skills-cli-lock.backup.json"), lockText);
  fs.writeFileSync(path.join(selectedBackup, "manifest.json"), JSON.stringify({ repository, createdAt: new Date().toISOString(), actions, lockRemovals, conflicts }, null, 2) + "\n");
  result.backupDirectory = selectedBackup;
  for (const item of actions) {
    // Targets are exact catalogue names below validated agent directories. Never remove a symlink's target.
    if (exists(item.target)) fs.rmSync(item.target, { recursive: !fs.lstatSync(item.target).isSymbolicLink(), force: false });
    if (item.action === "install") {
      fs.mkdirSync(path.dirname(item.target), { recursive: true });
      fs.cpSync(path.join(source, item.name), item.target, { recursive: true, errorOnExist: true });
    }
  }
  if (lockRemovals.length) {
    if (fs.readFileSync(lockFile, "utf8") !== lockText) throw new Error("Skills lock changed during migration; preserve it and retry after review.");
    for (const name of lockRemovals) delete lock.skills[name];
    const staged = lockFile + ".xelius-" + crypto.randomBytes(6).toString("hex");
    fs.writeFileSync(staged, JSON.stringify(lock, null, 2) + "\n", { flag: "wx", mode: fs.statSync(lockFile).mode });
    fs.renameSync(staged, lockFile);
  }
  return result;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2), options = {};
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--apply") options.apply = true;
      else if (["--home", "--backup-dir"].includes(args[i]) && args[i + 1] && !args[i + 1].startsWith("--")) options[args[i++] === "--home" ? "home" : "backupDir"] = args[i];
      else if (args[i] === "--help") { console.log("Usage: node migrate-installations.mjs [--apply] [--home directory] [--backup-dir new-directory]\nDefault: dry run. Back up owned installs; preserve foreign skills."); process.exit(0); }
      else throw new Error(`Unknown or incomplete argument: ${args[i]}`);
    }
    const result = migrate(options);
    console.log(JSON.stringify(result, null, 2));
    if (result.conflicts.length) process.exitCode = 3;
  } catch (error) { console.error(error.message); process.exitCode = 2; }
}
