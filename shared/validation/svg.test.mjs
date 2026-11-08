import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const script = path.join(root, "skills/svg-illustration/scripts/validate-svg.mjs");
const fixtures = path.join(root, "shared/validation/fixtures");
function run(file, ...options) {
  const result = spawnSync(process.execPath, [script, file, "--json", ...options], { encoding: "utf8" });
  return { ...result, report: JSON.parse(result.stdout) };
}
function temporarySvg(text, callback) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "xelius-svg-test-"));
  try {
    const file = path.join(temporary, "test.svg");
    fs.writeFileSync(file, text);
    callback(file);
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
}

test("SVG uses an XML parser rather than root-tag matching", () => {
  temporarySvg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><title>Test</title><desc>Broken XML</desc><g></svg>', (file) => {
    const result = run(file);
    assert.equal(result.status, 1);
    assert.equal(result.report.checks[0].id, "svg.xml");
    assert.equal(result.report.status, "repair-required");
  });
});

test("SVG rejects missing fragment references and active content", () => {
  temporarySvg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><title>Test</title><desc>Broken reference</desc><path id="p" fill="url(#missing)" d="M0 0h10v10z"/></svg>', (file) => {
    const result = run(file);
    assert.equal(result.status, 1);
    assert.ok(result.report.checks.some((check) => check.id === "svg.references" && check.status === "fail"));
  });
});

test("long SVG labels remain advisory when geometry is not requested", () => {
  const result = run(path.join(fixtures, "svg-valid-long-label.svg"), "--strict");
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.report.scope, "structural");
  assert.ok(result.report.checks.some((check) => check.id === "svg.label-length" && check.status === "warning"));
});

test("missing requested geometry is limited and strict mode fails", () => {
  const result = run(path.join(fixtures, "svg-valid-long-label.svg"), "--geometry", "--strict", "--inkscape", path.join(os.tmpdir(), "xelius-no-such-inkscape"));
  assert.equal(result.status, 1);
  assert.equal(result.report.status, "limited");
  assert.ok(result.report.limitations.length);
});

const renderer = process.env.XELIUS_INKSCAPE || "inkscape";
const rendererProbe = spawnSync(renderer, ["--version"], { encoding: "utf8", timeout: 10000 });
const geometryAvailable = rendererProbe.status === 0;
test("measured geometry accepts wide long labels and rejects short clipped text", { skip: !geometryAvailable }, () => {
  const wide = run(path.join(fixtures, "svg-valid-long-label.svg"), "--geometry", "--strict", "--inkscape", renderer);
  assert.equal(wide.status, 0, wide.stderr);
  const clipped = run(path.join(fixtures, "svg-clipped-short-label.svg"), "--geometry", "--strict", "--inkscape", renderer);
  assert.equal(clipped.status, 1);
  assert.ok(clipped.report.checks.some((check) => check.id === "svg.bounds" && check.status === "fail"));
  const container = run(path.join(fixtures, "svg-safe-box-overflow.svg"), "--geometry", "--strict", "--inkscape", renderer);
  assert.equal(container.status, 1);
  assert.ok(container.report.checks.some((check) => check.id === "svg.container-bounds" && check.status === "fail"));
});
