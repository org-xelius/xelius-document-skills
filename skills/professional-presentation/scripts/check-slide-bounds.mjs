#!/usr/bin/env node
import fs from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node check-slide-bounds.mjs <layout-manifest.json>");
  process.exit(2);
}
const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
const width = manifest.slide?.width;
const height = manifest.slide?.height;
const issues = [];
if (!(width > 0 && height > 0)) issues.push("Slide width and height must be positive.");
for (const [slideIndex, slide] of (manifest.slides || []).entries()) {
  for (const item of slide.items || []) {
    const { x, y, w, h } = item;
    if (![x, y, w, h].every(Number.isFinite)) issues.push(`slide ${slideIndex + 1}/${item.id}: non-finite geometry`);
    else if (w <= 0 || h <= 0 || x < 0 || y < 0 || x + w > width || y + h > height) issues.push(`slide ${slideIndex + 1}/${item.id}: outside bounds`);
    if (item.placeholder) issues.push(`slide ${slideIndex + 1}/${item.id}: unresolved placeholder`);
  }
}
if (issues.length) {
  issues.forEach((issue) => console.error(issue));
  process.exit(1);
}
console.log(`Checked ${manifest.slides?.length || 0} slides for bounds and placeholders.`);
