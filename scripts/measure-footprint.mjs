#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

export const baseline = { version: "0.2.0", skills: 14, bodyWords: 6581, descriptionCharacters: 2971, bytes: 208048 };
export function measure(directory) {
  const names = fs.readdirSync(directory).filter((name) => fs.existsSync(path.join(directory, name, "SKILL.md"))).sort();
  const result = { skills: names.length, bodyWords: 0, descriptionCharacters: 0, bytes: 0, files: 0 };
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (entry.isFile()) { result.bytes += fs.statSync(file).size; result.files++; }
      else throw new Error(`Unexpected non-file in installed collection: ${file}`);
    }
  }
  for (const name of names) {
    const text = fs.readFileSync(path.join(directory, name, "SKILL.md"), "utf8");
    const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) throw new Error(`Invalid frontmatter: ${name}`);
    result.descriptionCharacters += parse(match[1]).description.length;
    result.bodyWords += match[2].trim().split(/\s+/).filter(Boolean).length;
    walk(path.join(directory, name));
  }
  return result;
}
export function gates(current) {
  return current.skills === 10 && current.bodyWords <= baseline.bodyWords * 0.7 && current.descriptionCharacters <= baseline.descriptionCharacters * 0.8 && current.bytes <= baseline.bytes;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const current = measure(path.join(root, "skills"));
  const reductions = Object.fromEntries(["bodyWords", "descriptionCharacters", "bytes"].map((key) => [key, Number(((1 - current[key] / baseline[key]) * 100).toFixed(2))]));
  console.log(JSON.stringify({ baseline, current, reductionPercent: reductions, status: gates(current) ? "pass" : "repair-required", note: "File measurements, not model token savings." }, null, 2));
  if (!gates(current)) process.exitCode = 1;
}
