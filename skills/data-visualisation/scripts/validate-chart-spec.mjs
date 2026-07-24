#!/usr/bin/env node
import fs from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node validate-chart-spec.mjs <chart-spec.json>");
  process.exit(2);
}
const spec = JSON.parse(fs.readFileSync(file, "utf8"));
const required = ["message", "form", "dataFile", "units", "period", "source", "accessibleTable"];
const missing = required.filter((key) => !spec[key]);
if (spec.dimension === "3d") missing.push("3D charts are prohibited");
if (spec.zeroBaseline === false && !spec.baselineDisclosure) missing.push("non-zero baseline requires disclosure");
if (missing.length) {
  missing.forEach((item) => console.error(item));
  process.exit(1);
}
console.log("Chart specification includes message, evidence, source, and accessibility fields.");
