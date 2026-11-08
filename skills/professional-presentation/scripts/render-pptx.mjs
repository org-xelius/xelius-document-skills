#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const [input, outputDir] = process.argv.slice(2);
if (!input || !outputDir) {
  console.error("Usage: node render-pptx.mjs <input.pptx> <output-directory>");
  process.exit(2);
}
fs.mkdirSync(outputDir, { recursive: true });
const office = ["libreoffice", "soffice"].find((command) => spawnSync(command, ["--version"], { stdio: "ignore" }).status === 0);
if (!office) {
  console.error("No LibreOffice renderer found. Open the PPTX in PowerPoint or LibreOffice, export a PDF, and render that PDF with the PDF production skill.");
  process.exit(3);
}
const profile = path.join(os.tmpdir(), `xelius-soffice-${process.pid}`);
fs.mkdirSync(profile, { recursive: true });
const result = spawnSync(office, [`-env:UserInstallation=${pathToFileURL(profile).href}`, "--headless", "--convert-to", "pdf", "--outdir", outputDir, input], { stdio: "inherit" });
fs.rmSync(profile, { recursive: true, force: true });
if (result.status !== 0) process.exit(result.status || 1);
console.log(path.join(path.resolve(outputDir), `${path.basename(input, path.extname(input))}.pdf`));
