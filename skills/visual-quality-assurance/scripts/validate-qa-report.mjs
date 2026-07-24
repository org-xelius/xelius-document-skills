#!/usr/bin/env node
import fs from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node validate-qa-report.mjs <qa-report.json>");
  process.exit(2);
}
const report = JSON.parse(fs.readFileSync(file, "utf8"));
const errors = [];
if (report.status !== "limited" && report.inspectionCoverage?.rendered !== report.inspectionCoverage?.total) errors.push("Render coverage is incomplete.");
if (report.status !== "limited" && report.inspectionCoverage?.inspected !== report.inspectionCoverage?.total) errors.push("Inspection coverage is incomplete.");
if (report.status === "limited" && !report.limitations?.length) errors.push("Limited status requires a stated limitation.");
const blocking = (report.issues || []).filter((issue) => ["critical", "high"].includes(issue.severity) && issue.status === "open");
if (blocking.length) errors.push(`${blocking.length} blocking issue(s) remain open.`);
if (report.status === "pass" && (errors.length || report.limitations?.length)) errors.push("Pass status conflicts with incomplete coverage or limitations.");
if (errors.length) {
  errors.forEach((error) => console.error(error));
  process.exit(1);
}
console.log(`QA report is internally consistent with ${report.issues?.length || 0} issue record(s).`);
