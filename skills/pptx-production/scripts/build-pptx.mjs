#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const [specFile, outputFile] = process.argv.slice(2);
if (!specFile || !outputFile) {
  console.error("Usage: node build-pptx.mjs <deck-spec.json> <output.pptx>");
  process.exit(2);
}
let PptxGenJS;
try {
  PptxGenJS = require("pptxgenjs");
} catch {
  console.error("pptxgenjs is unavailable. Install it in the production workspace or select another documented PPTX implementation.");
  process.exit(3);
}
const spec = JSON.parse(fs.readFileSync(specFile, "utf8"));
const pptx = new PptxGenJS();
pptx.layout = spec.layout || "LAYOUT_WIDE";
pptx.author = spec.metadata?.author || "";
pptx.subject = spec.metadata?.subject || "";
pptx.title = spec.metadata?.title || "";
pptx.company = spec.metadata?.company || "";
pptx.lang = spec.metadata?.language || "en-US";
pptx.theme = spec.theme || {};

for (const slideSpec of spec.slides || []) {
  const slide = pptx.addSlide(slideSpec.masterName);
  if (slideSpec.background) slide.background = slideSpec.background;
  for (const item of slideSpec.items || []) {
    if (item.type === "text") slide.addText(item.text, item.options);
    else if (item.type === "image") slide.addImage(item.options);
    else if (item.type === "shape") slide.addShape(pptx.ShapeType[item.shape] || item.shape, item.options);
    else throw new Error(`Unsupported item type: ${item.type}`);
  }
  if (slideSpec.notes?.length) slide.addNotes(slideSpec.notes);
}
if (!spec.slides?.length) throw new Error("Deck specification contains no slides.");
fs.mkdirSync(path.dirname(path.resolve(outputFile)), { recursive: true });
await pptx.writeFile({ fileName: outputFile });
console.log(path.resolve(outputFile));
