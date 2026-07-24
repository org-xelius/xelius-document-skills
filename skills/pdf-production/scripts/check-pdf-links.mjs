#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node check-pdf-links.mjs <input.pdf>");
  process.exit(2);
}
const result = spawnSync("pdfinfo", ["-url", file], { encoding: "utf8" });
if (result.error || result.status !== 0) {
  console.error("The installed PDF tools cannot extract links; report link validation as limited.");
  process.exit(3);
}
console.log(result.stdout.trim() || "No external URLs reported.");
