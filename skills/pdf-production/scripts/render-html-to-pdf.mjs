#!/usr/bin/env node
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("Usage: node render-html-to-pdf.mjs <input.html> <output.pdf>");
  process.exit(2);
}
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.error("Playwright is unavailable. Use a detected Chromium print-to-PDF path or install Playwright in the project workspace.");
  process.exit(3);
}
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(path.resolve(input)).href, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  await page.pdf({ path: path.resolve(output), printBackground: true, preferCSSPageSize: true });
  console.log(path.resolve(output));
} finally {
  await browser.close();
}
