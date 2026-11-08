#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

export function family(value) {
  return value.replace(/^[A-Z]{6}\+/, "").toLowerCase().replace(/[^a-z0-9]/g, "").replace(/(?:bolditalic|boldoblique|semibolditalic|semibold|demibold|regular|italic|oblique|bold|medium|light|black|psmt|mt)+$/, "");
}
export function compareFonts(expected, rendered) {
  const allowed = new Set(expected.map(family));
  return rendered.filter((font) => !allowed.has(family(font)));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [specFile, pdfFile] = process.argv.slice(2);
  if (!specFile || !pdfFile || specFile === "--help") {
    console.log("Usage: node check-pptx-fonts.mjs deck-spec.json rendered.pdf\nCompares PDF font families with explicitly declared spec fonts. Substitutions require repair/review; this does not verify glyph appearance or licensing.");
    process.exit(specFile === "--help" ? 0 : 2);
  }
  try {
    const expected = new Set();
    function visit(value) {
      if (!value || typeof value !== "object") return;
      for (const [key, child] of Object.entries(value)) {
        if (["fontFace", "headFontFace", "bodyFontFace"].includes(key) && typeof child === "string" && child.trim()) expected.add(child);
        else visit(child);
      }
    }
    visit(JSON.parse(fs.readFileSync(specFile, "utf8")));
    const tool = spawnSync("pdffonts", [pdfFile], { encoding: "utf8" });
    if (tool.error || tool.status !== 0 || !expected.size) {
      console.log(JSON.stringify({ status: "limited", expected: [...expected], reason: !expected.size ? "No explicit fonts in specification" : "pdffonts unavailable or unsuccessful", warning: tool.stderr || tool.error?.message || null }, null, 2));
      process.exit(3);
    }
    const lines = tool.stdout.trim().split(/\r?\n/).slice(2).filter(Boolean);
    const rendered = [...new Set(lines.map((line) => line.trim().split(/\s+/)[0]))];
    const mismatches = compareFonts([...expected], rendered);
    const status = !rendered.length ? "limited" : mismatches.length ? "repair-required" : "pass";
    console.log(JSON.stringify({ status, expected: [...expected], rendered, mismatches, note: "Family/style normalization is heuristic; review unusual font naming. A match does not establish visual quality or embedding." }, null, 2));
    process.exit(status === "pass" ? 0 : status === "limited" ? 3 : 1);
  } catch (error) { console.error(error.message); process.exit(2); }
}
