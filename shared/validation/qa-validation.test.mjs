import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { validateRequiredShape } from "./schema-utils.mjs";
import { validateQa } from "../../skills/visual-quality-assurance/scripts/qa-utils.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const fixture = (name) => JSON.parse(fs.readFileSync(path.join(root, "shared/validation/fixtures", name), "utf8"));
const script = path.join(root, "skills/visual-quality-assurance/scripts/qa-report.mjs");

test("schema vocabulary enforces unknown properties, arrays, numeric bounds, and union types", () => {
  const schema = { type: "object", required: ["items", "count", "optional"], properties: { items: { type: "array", maxItems: 1, uniqueItems: true, items: { type: "string", maxLength: 2 } }, count: { type: "integer", minimum: 0, maximum: 2 }, optional: { type: ["string", "null"] } }, additionalProperties: false };
  assert.deepEqual(validateRequiredShape({ items: ["ok"], count: 1, optional: null }, schema), []);
  const errors = validateRequiredShape({ items: ["long", "long"], count: 2.5, optional: 2, extra: true }, schema);
  assert.ok(errors.some((error) => error.includes("extra is not allowed")));
  assert.ok(errors.some((error) => error.includes("unique items")));
  assert.ok(errors.some((error) => error.includes("at most 1 items")));
  assert.ok(errors.some((error) => error.includes("must be integer")));
  assert.ok(validateRequiredShape(2, { multipleOf: 3 }).some((error) => error.includes("unsupported schema keyword")));
});

test("invalid or legacy QA cannot pass by omitting fields", () => {
  for (const report of [null, {}, { status: "limited", limitations: ["Unavailable"] }, { schemaVersion: "1.0", status: "pass" }, { status: "pass", reviewMethod: "manual-full-size", inspectionCoverage: { rendered: 0, inspected: 0, total: 0 }, surfaceReviews: [] }]) {
    assert.ok(validateQa(report).length > 0);
  }
  const report = fixture("qa-pass.json");
  report.inspectionCoverage.total = 0;
  assert.ok(validateQa(report).some((error) => error.includes("at least 1")));
});

test("QA rejects the near-compatible v2 output shape instead of trusting its pass", () => {
  const report = { createdAt: "2026-07-24T23:15:09", artifact: "report.pdf", pdfPages: 10, renderedPages: 10, status: "pass", surfaceReviews: [{ surfaceId: "page-001", location: "Final PDF page 1", method: "full-size-render", status: "clear", observation: "No defect found." }], openIssues: [], acceptedWarnings: [], limitations: [] };
  const errors = validateQa(report);
  assert.ok(errors.some((error) => error.includes("reviewMethod is required")));
  assert.ok(errors.some((error) => error.includes("pdfPages is not allowed")));
  assert.ok(errors.some((error) => error.includes("result is required")));
});

test("status follows open, unverifiable, accepted, and required-check results", () => {
  const pass = fixture("qa-pass.json");
  assert.deepEqual(validateQa(pass), []);
  assert.deepEqual(validateQa(fixture("qa-repair-required.json")), []);
  const automated = fixture("qa-automated-only.json");
  assert.ok(validateQa(automated).some((error) => error.includes("manual full-size review")));
  const changed = fixture("qa-pass.json");
  changed.issues.push({ id: "QA-1", location: "page-001", severity: "low", category: "spacing", evidence: "Small visual deviation.", repair: "Adjust spacing.", status: "accepted" });
  assert.ok(validateQa(changed).some((error) => error.includes("acceptedBy")));
  changed.issues[0].acceptedBy = "Report owner";
  changed.issues[0].acceptanceReason = "Approved spacing preserves the supplied template.";
  assert.deepEqual(validateQa(changed), []);
  changed.issues[0].status = "unverifiable";
  assert.ok(validateQa(changed).some((error) => error.includes("Status must be limited")));
  changed.status = "limited";
  assert.deepEqual(validateQa(changed), []);
  changed.checks.push({ id: "metadata", domain: "technical", status: "repair-required", evidence: "Title is absent." });
  changed.status = "repair-required";
  assert.deepEqual(validateQa(changed), []);
});

test("QA helper records explicit reviews, derives reports, and detects stale files", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "xelius-qa-"));
  try {
    const artifact = path.join(temp, "report.pdf");
    const render = path.join(temp, "page-001.png");
    const reportFile = path.join(temp, "qa", "qa-report.json");
    fs.writeFileSync(artifact, "synthetic artifact bytes");
    fs.writeFileSync(render, "synthetic render bytes");
    const run = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
    const okay = (...args) => { const result = run(...args); assert.equal(result.status, 0, result.stderr); };
    okay("init", "--artifact", artifact, "--type", "pdf", "--total", "1", "--out", reportFile);
    let report = JSON.parse(fs.readFileSync(reportFile));
    assert.equal(report.status, "limited");
    assert.deepEqual(report.surfaceReviews, []);
    assert.notEqual(run("record-review", "--report", reportFile, "--location", "page-001", "--method", "full-size-render", "--reviewer", "Test", "--observation", "Checked.").status, 0);
    okay("record-render", "--report", reportFile, "--location", "page-001", "--render", render);
    okay("record-review", "--report", reportFile, "--location", "page-001", "--method", "full-size-render", "--result", "clear", "--reviewer", "Test reviewer", "--observation", "Labels and page edges are readable.");
    report = JSON.parse(fs.readFileSync(reportFile));
    assert.equal(report.status, "pass");
    assert.deepEqual(validateQa(report, { reportDir: path.dirname(reportFile), verifyFiles: true }), []);
    const summary = path.join(temp, "summary.md");
    const manifest = path.join(temp, "manifest.json");
    okay("report", "--report", reportFile, "--out", summary, "--manifest", manifest);
    assert.match(fs.readFileSync(summary, "utf8"), /Status: \*\*pass\*\*/);
    assert.equal(JSON.parse(fs.readFileSync(manifest)).status, "pass");
    fs.appendFileSync(render, "changed");
    assert.ok(validateQa(report, { reportDir: path.dirname(reportFile), verifyFiles: true }).some((error) => error.includes("stale")));
    assert.notEqual(run("report", "--report", reportFile, "--out", summary, "--manifest", manifest).status, 0);
    okay("record-render", "--report", reportFile, "--location", "page-001", "--render", render);
    report = JSON.parse(fs.readFileSync(reportFile));
    assert.equal(report.status, "limited");
    assert.equal(report.surfaceReviews.length, 0);
    const checkFile = path.join(temp, "check.json");
    fs.writeFileSync(checkFile, JSON.stringify({ id: "metadata", domain: "technical", status: "pass", evidence: "Title verified on original export." }));
    okay("record-check", "--report", reportFile, "--check", checkFile);
    fs.appendFileSync(artifact, "changed");
    assert.ok(validateQa(report, { reportDir: path.dirname(reportFile), verifyFiles: true }).some((error) => error.includes("Artifact")));
    okay("record-artifact", "--report", reportFile, "--artifact", artifact, "--total", "2");
    report = JSON.parse(fs.readFileSync(reportFile));
    assert.deepEqual(report.renders, []);
    assert.deepEqual(report.surfaceReviews, []);
    assert.equal(report.status, "limited");
    assert.equal(report.inspectionCoverage.total, 2);
    assert.equal(report.checks[0].status, "limited", "Checks from the previous artifact cannot stay passed.");
    assert.deepEqual(validateQa(report, { reportDir: path.dirname(reportFile), verifyFiles: true }), []);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});
