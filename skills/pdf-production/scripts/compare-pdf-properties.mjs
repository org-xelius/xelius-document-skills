#!/usr/bin/env node
import fs from "node:fs";
import { spawnSync } from "node:child_process";

const [sourceFile, finalFile] = process.argv.slice(2).filter((arg) => arg !== "--strict");
const strict = process.argv.includes("--strict");
if (!sourceFile || !finalFile) {
  console.error("Usage: node compare-pdf-properties.mjs <raw.pdf> <final.pdf> [--strict]");
  process.exit(2);
}
for (const file of [sourceFile, finalFile]) {
  if (!fs.existsSync(file)) {
    console.error(`Missing PDF: ${file}`);
    process.exit(2);
  }
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.error || result.status !== 0) {
    console.error(`${command} failed for ${args.at(-1)}.`);
    process.exit(2);
  }
  return result.stdout;
}

function info(file) {
  return Object.fromEntries(
    run("pdfinfo", [file]).split("\n").flatMap((line) => {
      const match = line.match(/^([^:]+):\s*(.*)$/);
      return match ? [[match[1].trim(), match[2].trim()]] : [];
    })
  );
}

const sourceInfo = info(sourceFile);
const finalInfo = info(finalFile);
const errors = [];
const warnings = [];

if (sourceInfo.Tagged === "yes" && finalInfo.Tagged !== "yes") errors.push("Tagged structure regressed from yes to no.");
if (sourceInfo.Encrypted === "no" && finalInfo.Encrypted !== "no") errors.push("Final PDF became encrypted.");
if (sourceInfo["Page size"] && finalInfo["Page size"] && sourceInfo["Page size"] !== finalInfo["Page size"]) errors.push("Page geometry changed.");
for (const key of ["Title", "Author", "Subject", "Keywords"]) {
  if (sourceInfo[key] && !finalInfo[key]) errors.push(`${key} metadata was removed.`);
}
if (sourceInfo.Pages !== finalInfo.Pages) warnings.push(`Page count changed from ${sourceInfo.Pages || "unknown"} to ${finalInfo.Pages || "unknown"}.`);

const sourceText = run("pdftotext", [sourceFile, "-"]).replace(/\s+/g, "");
const finalText = run("pdftotext", [finalFile, "-"]).replace(/\s+/g, "");
if (sourceText.length && finalText.length < sourceText.length * 0.98) errors.push("More than 2% of selectable text was lost.");

const finalFonts = run("pdffonts", [finalFile]);
if (/\bType 3\b/.test(finalFonts)) warnings.push("Final PDF contains Type 3 fonts; inspect glyph rendering, text extraction, and bounding-box warnings.");

const sourceBytes = fs.statSync(sourceFile).size;
const finalBytes = fs.statSync(finalFile).size;
if (finalBytes > sourceBytes * 1.5) warnings.push(`File size grew by ${Math.round((finalBytes / sourceBytes - 1) * 100)}%.`);

errors.forEach((message) => console.error(`ERROR ${message}`));
warnings.forEach((message) => console.warn(`WARN ${message}`));
if (errors.length || (strict && warnings.length)) process.exit(1);
console.log("Raw and final PDF properties show no detected regression.");
