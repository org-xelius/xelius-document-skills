#!/usr/bin/env node
import fs from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node validate-page-plan.mjs <publication-plan.json>");
  process.exit(2);
}
const plan = JSON.parse(fs.readFileSync(file, "utf8"));
const issues = [];
if (!Array.isArray(plan.sections) || !plan.sections.length) issues.push("No sections.");
for (const section of plan.sections || []) {
  if (!section.purpose) issues.push(`${section.id || "section"}: missing purpose`);
  if (!Array.isArray(section.pageFamilies) || !section.pageFamilies.length) issues.push(`${section.id || "section"}: missing page families`);
  if (!Array.isArray(section.evidenceIds)) issues.push(`${section.id || "section"}: missing evidence IDs`);
}
if (issues.length) {
  issues.forEach((issue) => console.error(issue));
  process.exit(1);
}
console.log(`Publication plan contains ${plan.sections.length} structured sections.`);
