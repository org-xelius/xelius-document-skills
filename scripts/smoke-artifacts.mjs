#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = process.env.XELIUS_ARTIFACTS_DIR ? path.resolve(process.env.XELIUS_ARTIFACTS_DIR) : fs.mkdtempSync(path.join(os.tmpdir(), "xelius-artifacts-"));
if (process.env.XELIUS_ARTIFACTS_DIR) {
  if (fs.existsSync(output) && fs.readdirSync(output).length) throw new Error("XELIUS_ARTIFACTS_DIR must be new or empty.");
  fs.mkdirSync(output, { recursive: true });
}
const project = path.join(output, "document-project");
const installed = path.join(output, "installed-skills");
fs.mkdirSync(project);
fs.mkdirSync(installed);
fs.symlinkSync(path.join(root, "node_modules"), path.join(project, "node_modules"), "dir");
fs.writeFileSync(path.join(project, "package.json"), '{"private":true}\n');
for (const name of ["pdf-production", "professional-presentation", "svg-illustration", "visual-quality-assurance"]) fs.cpSync(path.join(root, "skills", name), path.join(installed, name), { recursive: true });
fs.cpSync(path.join(root, "shared", "fixtures", "development-impact-report", "report"), path.join(project, "report"), { recursive: true });
fs.cpSync(path.join(root, "shared", "example-content", "images"), path.join(project, "report", "images"), { recursive: true });
fs.copyFileSync(path.join(root, "shared", "fixtures", "executive-partner-presentation", "deck-spec.json"), path.join(project, "deck-spec.json"));

function run(command, args, label) {
  const result = spawnSync(command, args, { cwd: project, encoding: "utf8", env: { ...process.env, XELIUS_PYTHON: process.env.XELIUS_PYTHON || process.env.PYTHON || "python3" }, timeout: 180000 });
  fs.writeFileSync(path.join(output, `${label}.log`), `${result.stdout || ""}\n${result.stderr || ""}`);
  assert.equal(result.status, 0, `${label}: ${result.stdout}\n${result.stderr}`);
  return result.stdout;
}
function node(skill, file, args, label) { return run(process.execPath, [path.join(installed, skill, "scripts", file), ...args], label); }
const reportPdf = path.join(project, "report.pdf");
const deck = path.join(project, "presentation.pptx");
node("pdf-production", "render-html-to-pdf.mjs", [path.join(project, "report", "index.html"), reportPdf, "--project-root", project], "report-export");
node("professional-presentation", "build-pptx.mjs", [path.join(project, "deck-spec.json"), deck, "--project-root", project], "deck-build");
const specification = JSON.parse(fs.readFileSync(path.join(project, "deck-spec.json"), "utf8"));
const escapeXml = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const decodeXml = (value) => value.replace(/&(?:amp|lt|gt|quot|apos);/g, (entity) => ({ "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'" })[entity]);
const normalized = (value) => value.replace(/\s+/g, " ").trim();
let nativeTextObjects = 0, notesVerified = 0;
for (const [index, slide] of specification.slides.entries()) {
  const xml = run("unzip", ["-p", deck, `ppt/slides/slide${index + 1}.xml`], `editable-slide-${index + 1}`);
  const nativeTexts = [...xml.matchAll(/<p:sp>[\s\S]*?<\/p:sp>/g)].map((shape) => normalized([...shape[0].matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map((match) => decodeXml(match[1])).join(" ")));
  for (const item of slide.items.filter((item) => item.type === "text")) {
    const match = nativeTexts.indexOf(normalized(item.text));
    assert.notEqual(match, -1, `Slide ${index + 1}: text was changed or flattened`);
    nativeTexts.splice(match, 1);
    nativeTextObjects++;
  }
  assert.ok(xml.includes("<p:sp>"), `Slide ${index + 1}: native editable objects missing`);
  if (slide.notes?.length) {
    const notes = run("unzip", ["-p", deck, `ppt/notesSlides/notesSlide${index + 1}.xml`], `notes-${index + 1}`);
    for (const note of slide.notes) assert.ok(notes.includes(escapeXml(note)), `Slide ${index + 1}: notes changed`);
    notesVerified++;
  }
}
const boundsFile = path.join(output, "layout-manifest.json");
fs.writeFileSync(boundsFile, JSON.stringify({ slide: { width: 13.333334, height: 7.5 }, slides: specification.slides.map((slide) => ({ items: slide.items.map((item, i) => ({ id: String(i), ...item.options })) })) }));
node("professional-presentation", "check-slide-bounds.mjs", [boundsFile], "slide-bounds");
node("professional-presentation", "render-pptx.mjs", [deck, project], "deck-export");
for (const [name, count] of [["report", 9], ["presentation", 11]]) {
  const pdf = path.join(project, `${name}.pdf`);
  const renders = path.join(output, `${name}-pages`);
  const expectations = path.join(output, `${name}-expectations.json`);
  fs.writeFileSync(expectations, JSON.stringify({ requiredMetadata: ["title"], pageCount: count, requireSelectableText: true, ...(name === "report" ? { requireTagged: true, language: "en" } : {}) }));
  const inspection = node("pdf-production", "preflight-pdf.mjs", [pdf, "--expect", expectations, "--json"], `${name}-preflight`);
  fs.writeFileSync(path.join(output, `${name}-preflight.json`), inspection);
  node("pdf-production", "render-pdf-pages.mjs", [pdf, renders], `${name}-render`);
  assert.equal(fs.readdirSync(renders).filter((f) => f.endsWith(".png")).length, count, `${name}: render count`);
}
node("pdf-production", "compare-pdf-properties.mjs", [reportPdf, reportPdf, "--strict", "--json"], "raw-final-comparison");
const helper = path.join(installed, "visual-quality-assurance", "scripts", "qa-report.mjs");
assert.ok(fs.existsSync(helper), "QA helper missing from standalone skill");
const summary = { status: "technical-checks-pass", visualReview: "not-performed-by-automation", output, reportPages: 9, presentationSlides: 11, nativeTextObjects, notesVerified, installedSkillsRoot: installed };
fs.writeFileSync(path.join(output, "smoke-summary.json"), JSON.stringify(summary, null, 2) + "\n");
console.log(JSON.stringify(summary, null, 2));
