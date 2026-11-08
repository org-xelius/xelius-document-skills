#!/usr/bin/env node
import path from "node:path";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const args = process.argv.slice(2);
if (args.includes("--help")) {
  console.log("Usage: node render-html-to-pdf.mjs input.html output.pdf [--project-root directory] [--browser-executable path]");
  process.exit(0);
}
const projectFlag = args.indexOf("--project-root");
if (projectFlag !== -1 && (!args[projectFlag + 1] || args[projectFlag + 1].startsWith("--"))) {
  console.error("--project-root requires a directory.");
  process.exit(2);
}
const projectRoot = path.resolve(projectFlag === -1 ? process.cwd() : args[projectFlag + 1] || "");
if (projectFlag !== -1) args.splice(projectFlag, 2);
const browserFlag = args.indexOf("--browser-executable");
if (browserFlag !== -1 && (!args[browserFlag + 1] || args[browserFlag + 1].startsWith("--"))) {
  console.error("--browser-executable requires an executable path.");
  process.exit(2);
}
const executablePath = browserFlag === -1 ? process.env.CHROME_PATH : args[browserFlag + 1];
if (browserFlag !== -1) args.splice(browserFlag, 2);
const [input, output] = args;
if (!input || !output) {
  console.error("Usage: node render-html-to-pdf.mjs <input.html> <output.pdf> [--project-root <directory>] [--browser-executable <path>]");
  process.exit(2);
}
const require = createRequire(path.join(projectRoot, "package.json"));
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.error(`Playwright is unavailable from project ${projectRoot}. Install it there or pass --project-root to the workspace containing it.`);
  process.exit(3);
}
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(path.resolve(input)).href, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
  });
  fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
  await page.pdf({ path: path.resolve(output), printBackground: true, preferCSSPageSize: true, tagged: true, outline: true });
  console.log(path.resolve(output));
} finally {
  await browser.close();
}
