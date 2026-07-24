import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const fixtures = path.join(root, "shared", "fixtures");
const validationFixtures = path.join(root, "shared", "validation", "fixtures");

function run(script, input) {
  return spawnSync(process.execPath, [path.join(root, script), input], { encoding: "utf8" });
}

test("publication plan validator accepts the synthetic report", () => {
  const result = run("skills/professional-publication/scripts/validate-page-plan.mjs", path.join(fixtures, "development-impact-report", "publication-plan.json"));
  assert.equal(result.status, 0, result.stderr);
});

test("storyline validator accepts the synthetic deck", () => {
  const result = run("skills/professional-presentation/scripts/validate-storyline.mjs", path.join(fixtures, "executive-partner-presentation", "deck-storyline.json"));
  assert.equal(result.status, 0, result.stderr);
});

test("SVG validator accepts an accessible fixture", () => {
  const result = run("skills/svg-illustration/scripts/validate-svg.mjs", path.join(root, "shared", "example-content", "images", "community-hub.svg"));
  assert.equal(result.status, 0, result.stderr);
});

test("chart specification includes analytical safeguards", () => {
  const result = run("skills/data-visualisation/scripts/validate-chart-spec.mjs", path.join(fixtures, "development-impact-report", "chart-spec.json"));
  assert.equal(result.status, 0, result.stderr);
});

test("slide bounds and reference fixtures pass", () => {
  const bounds = run("skills/pptx-production/scripts/check-slide-bounds.mjs", path.join(validationFixtures, "layout-manifest.json"));
  const references = run("skills/citation-and-references/scripts/validate-references.mjs", path.join(validationFixtures, "references.json"));
  assert.equal(bounds.status, 0, bounds.stderr);
  assert.equal(references.status, 0, references.stderr);
});

test("limited QA reports require explicit limitations", () => {
  const result = run("skills/visual-quality-assurance/scripts/validate-qa-report.mjs", path.join(fixtures, "executive-partner-presentation", "qa-report.json"));
  assert.equal(result.status, 0, result.stderr);
});
