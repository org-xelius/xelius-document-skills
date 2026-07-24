#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const [inputDir, output] = process.argv.slice(2);
if (!inputDir || !output) {
  console.error("Usage: node create-page-contact-sheet.mjs <page-render-directory> <output.png>");
  process.exit(2);
}
const images = fs.readdirSync(inputDir).filter((file) => /\.(png|jpe?g)$/i.test(file)).sort().map((file) => path.join(inputDir, file));
if (!images.length) process.exit(1);
const result = spawnSync("montage", [...images, "-thumbnail", "180x255", "-tile", "6x", "-geometry", "+10+10", "-background", "#E5E7EB", output], { stdio: "inherit" });
if (result.status !== 0 && !fs.existsSync(output)) process.exit(result.status || 3);
if (result.status !== 0) console.warn("ImageMagick reported a warning, but the contact sheet was created. Inspect it before use.");
console.log(path.resolve(output));
