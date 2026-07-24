#!/usr/bin/env node
import fs from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node validate-svg.mjs <asset.svg>");
  process.exit(2);
}
const svg = fs.readFileSync(file, "utf8");
const issues = [];
const warnings = [];
const strict = process.argv.includes("--strict");
if (!/^\s*<svg\b[\s\S]*<\/svg>\s*$/i.test(svg)) issues.push("Root svg element is missing or unclosed.");
if (!/\bviewBox\s*=\s*["'][^"']+["']/i.test(svg)) issues.push("Explicit viewBox is required.");
if (!/<title(?:\s[^>]*)?>[\s\S]*?<\/title>/i.test(svg)) issues.push("Accessible title is required.");
if (!/<desc(?:\s[^>]*)?>[\s\S]*?<\/desc>/i.test(svg)) issues.push("Accessible description is required.");
if (/<script\b/i.test(svg)) issues.push("Scripts are prohibited.");
if (/(?:href|xlink:href)\s*=\s*["']https?:/i.test(svg)) issues.push("External resources are prohibited.");
if (/filter\s*=\s*["']/i.test(svg)) issues.push("Filters require explicit target-render review.");
const ids = [...svg.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map((match) => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicates.length) issues.push(`Duplicate IDs: ${[...new Set(duplicates)].join(", ")}`);
for (const match of svg.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/gi)) {
  const content = match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (content.length > 70 && !/<tspan\b/i.test(match[2])) {
    warnings.push(`Long single-line text (${content.length} characters) requires explicit wrapping and rendered bounds review: "${content.slice(0, 60)}..."`);
  }
}
if (issues.length) {
  issues.forEach((issue) => console.error(issue));
  process.exit(1);
}
warnings.forEach((warning) => console.warn(`WARN ${warning}`));
if (strict && warnings.length) process.exit(1);
console.log(`SVG passed structural checks with ${ids.length} IDs. Render and target-integration checks remain required.`);
