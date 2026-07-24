#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(os.tmpdir(), "xelius-examples", "development-impact-report");
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
fs.cpSync(path.join(here, "report"), path.join(output, "report"), { recursive: true });
fs.cpSync(path.resolve(here, "../../example-content/images"), path.join(output, "report", "images"), { recursive: true });
for (const file of ["project-manifest.json", "publication-plan.json", "qa-report.json"]) fs.copyFileSync(path.join(here, file), path.join(output, file));
console.log(`Staged synthetic report source at ${output}`);
if (process.argv.includes("--render")) {
  const renderer = path.resolve(here, "../../../skills/pdf-production/scripts/render-html-to-pdf.mjs");
  const result = spawnSync(process.execPath, [renderer, path.join(output, "report", "index.html"), path.join(output, "riverbend-impact-report.pdf")], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
}
