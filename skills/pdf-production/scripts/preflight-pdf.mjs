#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node preflight-pdf.mjs <input.pdf>");
  process.exit(2);
}
const checks = [
  { name: "pdfinfo", command: "pdfinfo", args: [file] },
  { name: "pdffonts", command: "pdffonts", args: [file] },
  { name: "links", command: "pdfinfo", args: ["-url", file] }
];
let limited = false;
for (const check of checks) {
  const result = spawnSync(check.command, check.args, { encoding: "utf8" });
  if (result.error || result.status !== 0) {
    limited = true;
    console.error(`UNAVAILABLE ${check.name}`);
  } else {
    console.log(`--- ${check.name} ---\n${result.stdout.trim()}`);
  }
}
if (limited) {
  console.error("Preflight is limited because one or more required tools were unavailable.");
  process.exit(3);
}
