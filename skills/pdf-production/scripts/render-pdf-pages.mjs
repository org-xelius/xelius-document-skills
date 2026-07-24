#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const [input, outputDir] = process.argv.slice(2);
if (!input || !outputDir) {
  console.error("Usage: node render-pdf-pages.mjs <input.pdf> <output-directory>");
  process.exit(2);
}
fs.mkdirSync(outputDir, { recursive: true });
const prefix = path.join(outputDir, "page");
const result = spawnSync("pdftoppm", ["-png", "-r", "144", input, prefix], { stdio: "inherit" });
if (result.error || result.status !== 0) {
  console.error("Poppler pdftoppm is unavailable. Try pdftocairo, Ghostscript, or a documented manual renderer.");
  process.exit(result.status || 3);
}
console.log(path.resolve(outputDir));
