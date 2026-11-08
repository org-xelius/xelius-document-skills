#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { validateQa } from "./qa-utils.mjs";

const file = process.argv[2];
if (!file || file === "--help") {
  console.log("Usage: node validate-qa-report.mjs <qa-report.json> [--verify-files]\nSchema and status checks always run. --verify-files also verifies artifact/render hashes relative to the report directory.");
  process.exit(file ? 0 : 2);
}
try {
  const report = JSON.parse(fs.readFileSync(file, "utf8"));
  const errors = validateQa(report, { reportDir: path.dirname(path.resolve(file)), verifyFiles: process.argv.includes("--verify-files") });
  if (errors.length) throw new Error(errors.join("\n"));
  console.log(`QA schema and status are valid: ${report.status}; ${report.surfaceReviews.length} surface review(s).${process.argv.includes("--verify-files") ? " File hashes verified." : " Run --verify-files before delivery."}`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
