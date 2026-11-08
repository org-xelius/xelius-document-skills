#!/usr/bin/env node
import fs from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node validate-references.mjs <references.json>");
  process.exit(2);
}
const data = JSON.parse(fs.readFileSync(file, "utf8"));
const citations = new Set(data.citations || []);
const bibliography = data.bibliography || [];
const ids = bibliography.map((entry) => entry.id);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
const bibSet = new Set(ids);
const missing = [...citations].filter((id) => !bibSet.has(id));
const uncited = ids.filter((id) => !citations.has(id) && !bibliography.find((entry) => entry.id === id)?.furtherReading);
const invalidDois = bibliography.filter((entry) => entry.doi && !/^10\.\d{4,9}\/\S+$/i.test(entry.doi)).map((entry) => entry.id);
const result = { missing, uncited, duplicates: [...new Set(duplicates)], invalidDois };
console.log(JSON.stringify(result, null, 2));
if (Object.values(result).some((items) => items.length)) process.exit(1);
