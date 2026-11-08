#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const [inputDir, output] = process.argv.slice(2);
if (!inputDir || !output) {
  console.error("Usage: node create-contact-sheet.mjs <render-directory> <output.png>");
  process.exit(2);
}
const images = fs.readdirSync(inputDir).filter((file) => /\.(png|jpe?g)$/i.test(file)).sort().map((file) => path.join(inputDir, file));
if (!images.length) {
  console.error("No rendered images found.");
  process.exit(1);
}
const montage = spawnSync("montage", [...images, "-thumbnail", "320x180", "-tile", "4x", "-geometry", "+12+12", "-background", "#E5E7EB", output], { stdio: "inherit" });
if (montage.status !== 0 && !fs.existsSync(output)) {
  console.error("ImageMagick montage is unavailable. Use another documented image compositor.");
  process.exit(montage.status || 3);
}
if (montage.status !== 0) console.warn("ImageMagick reported a warning, but the contact sheet was created. Inspect it before use.");
console.log(path.resolve(output));
