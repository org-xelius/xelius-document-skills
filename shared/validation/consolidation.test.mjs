#!/usr/bin/env node
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { measure, gates, baseline } from "../../scripts/measure-footprint.mjs";
import { migrate, retired } from "../../scripts/migrate-installations.mjs";
import { compareFonts } from "../../skills/professional-presentation/scripts/check-pptx-fonts.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const names = Object.keys(JSON.parse(fs.readFileSync(path.join(root, "shared/skill-catalogue.json"), "utf8"))).sort();
test("font checks distinguish installed-family substitutions from styles and subsets", () => {
  assert.deepEqual(compareFonts(["Arial"], ["BAAAAA+Arial-BoldMT", "CAAAAA+ArialMT"]), []);
  assert.deepEqual(compareFonts(["Arial"], ["BAAAAA+LiberationSans-Bold"]), ["BAAAAA+LiberationSans-Bold"]);
  assert.deepEqual(compareFonts(["Times New Roman"], ["TimesNewRomanPSMT"]), []);
  assert.deepEqual(compareFonts(["Arial"], ["ArialNarrow"]), ["ArialNarrow"]);
});
function temp() { return fs.mkdtempSync(path.join(os.tmpdir(), "xelius-migration-test-")); }
function install(home, location, name, source = path.join(root, "skills")) {
  fs.cpSync(path.join(source, name), path.join(home, location, name), { recursive: true });
}
test("ten current identifiers, footprint gates, and current trigger selectors", () => {
  assert.equal(names.length, 10);
  assert.deepEqual(fs.readdirSync(path.join(root, "skills")).sort(), names);
  assert.ok(gates(measure(path.join(root, "skills"))));
  const triggers = JSON.parse(fs.readFileSync(path.join(root, "evals/triggers.json"), "utf8"));
  for (const entry of triggers) for (const expected of entry.expected) assert.ok(names.includes(expected));
  for (const name of retired) assert.ok(!names.includes(name));
});
test("relocated production helpers retain immutable v0.2.0 implementations", () => {
  const moves = [
    ["citation-and-references", "content-information-architecture", "validate-references.mjs"],
    ...["build-pptx.mjs", "check-slide-bounds.mjs", "render-pptx.mjs", "create-contact-sheet.mjs"].map((file) => ["pptx-production", "professional-presentation", file])
  ];
  for (const [oldName, current, file] of moves) {
    const previous = spawnSync("git", ["show", `v0.2.0:skills/${oldName}/scripts/${file}`], { cwd: root });
    assert.equal(previous.status, 0);
    assert.deepEqual(fs.readFileSync(path.join(root, "skills", current, "scripts", file)), previous.stdout);
  }
});
test("real v0.2.0 migration backs up all four locations, retires owned copies, and is idempotent", () => {
  const home = temp(), snapshot = path.join(home, "baseline");
  fs.mkdirSync(snapshot);
  const archive = spawnSync("git", ["archive", "v0.2.0", "skills"], { cwd: root });
  assert.equal(archive.status, 0);
  assert.equal(spawnSync("tar", ["-xf", "-", "-C", snapshot], { input: archive.stdout }).status, 0);
  const original = measure(path.join(snapshot, "skills"));
  for (const key of ["skills", "bytes", "bodyWords", "descriptionCharacters"]) assert.equal(original[key], baseline[key], `Baseline changed: ${key}`);
  const locations = [".agents/skills", ".codex/skills", ".hermes/skills", ".claude/skills"];
  for (const location of locations) for (const name of [...names, ...retired]) install(home, location, name, path.join(snapshot, "skills"));
  const dry = migrate({ home });
  assert.equal(dry.mode, "dry-run");
  assert.equal(dry.actions.length, 56);
  assert.ok(fs.existsSync(path.join(home, ".codex/skills", retired[0])));
  const done = migrate({ home, apply: true });
  assert.equal(done.status, "pass");
  for (const location of locations) {
    assert.deepEqual(fs.readdirSync(path.join(home, location)).sort(), names);
    for (const name of [...names, ...retired]) assert.ok(fs.existsSync(path.join(done.backupDirectory, location, name, "SKILL.md")));
  }
  assert.equal(migrate({ home, apply: true }).actions.length, 0);
});
test("absent skills install safely; unrelated and foreign matching names survive", () => {
  const home = temp(), location = ".agents/skills";
  const foreign = path.join(home, location, names[0]);
  fs.mkdirSync(foreign, { recursive: true });
  fs.writeFileSync(path.join(foreign, "SKILL.md"), "---\nname: " + names[0] + "\n---\nForeign current skill\n");
  const oldForeign = path.join(home, location, retired[0]);
  fs.mkdirSync(oldForeign); fs.writeFileSync(path.join(oldForeign, "SKILL.md"), "Foreign retired skill\n");
  const unrelated = path.join(home, location, "unrelated");
  fs.mkdirSync(unrelated); fs.writeFileSync(path.join(unrelated, "notes.txt"), "Keep me\n");
  const result = migrate({ home, apply: true });
  assert.equal(result.status, "limited"); assert.equal(result.conflicts.length, 2);
  assert.match(fs.readFileSync(path.join(foreign, "SKILL.md"), "utf8"), /Foreign current/);
  assert.equal(fs.readFileSync(path.join(oldForeign, "SKILL.md"), "utf8"), "Foreign retired skill\n");
  assert.equal(fs.readFileSync(path.join(unrelated, "notes.txt"), "utf8"), "Keep me\n");
  assert.ok(!fs.existsSync(path.join(home, ".codex/skills")), "Absent legacy directory should not be created");
  assert.equal(migrate({ home, apply: true }).actions.length, 0);
});
test("owned symlinks are backed up without deleting external targets", () => {
  const home = temp(), external = temp(), source = path.join(external, "original");
  fs.cpSync(path.join(root, "skills", names[0]), source, { recursive: true });
  fs.writeFileSync(path.join(source, "custom.txt"), "old copy\n");
  const directory = path.join(home, ".agents/skills"); fs.mkdirSync(directory, { recursive: true });
  fs.symlinkSync(source, path.join(directory, names[0]), "dir");
  const result = migrate({ home, apply: true });
  assert.ok(fs.existsSync(path.join(source, "custom.txt")));
  assert.ok(!fs.lstatSync(path.join(directory, names[0])).isSymbolicLink());
  assert.equal(fs.readFileSync(path.join(result.backupDirectory, ".agents/skills", names[0], "custom.txt"), "utf8"), "old copy\n");
});
test("migration rejects broad homes, redirected roots, and backup reuse", () => {
  assert.throws(() => migrate({ home: path.parse(root).root }), /filesystem root/);
  const home = temp(); fs.symlinkSync(temp(), path.join(home, ".agents"), "dir");
  assert.throws(() => migrate({ home, apply: true }), /symlink/);
  const safe = temp(); assert.throws(() => migrate({ home: safe, apply: true, backupDir: safe }), /already exist/);
});
test("migration backs up and prunes only proven retired Skills CLI lock records", () => {
  const home = temp(); fs.mkdirSync(path.join(home, ".agents"));
  const records = Object.fromEntries(retired.map((name) => [name, { source: "org-xelius/xelius-document-skills", sourceUrl: "https://github.com/org-xelius/xelius-document-skills.git", skillPath: `skills/${name}/SKILL.md` }]));
  records[retired[0]].source = "foreign/publisher";
  records.unrelated = { source: "other/repo" };
  const lock = { version: 3, skills: records, dismissed: { notice: true } };
  const file = path.join(home, ".agents/.skill-lock.json"); fs.writeFileSync(file, JSON.stringify(lock));
  const dry = migrate({ home }); assert.equal(dry.lockRemovals.length, 3);
  assert.deepEqual(JSON.parse(fs.readFileSync(file)), lock);
  const result = migrate({ home, apply: true });
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(result.backupDirectory, "skills-cli-lock.backup.json"))), lock);
  const updated = JSON.parse(fs.readFileSync(file));
  assert.deepEqual(Object.keys(updated.skills).sort(), [retired[0], "unrelated"].sort());
  assert.deepEqual(updated.dismissed, lock.dismissed);
  assert.equal(migrate({ home, apply: true }).lockRemovals.length, 0);
});
