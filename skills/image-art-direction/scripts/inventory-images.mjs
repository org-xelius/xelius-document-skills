#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";

const dir = process.argv[2];
if (!dir || !fs.existsSync(dir)) {
  console.error("Usage: node inventory-images.mjs <image-directory>");
  process.exit(2);
}
const extensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff"]);
const files = fs.readdirSync(dir).filter((name) => extensions.has(path.extname(name).toLowerCase()));
const records = files.map((name) => {
  const file = path.join(dir, name);
  const hash = crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
  const identify = spawnSync("identify", ["-format", "%w %h %[colorspace]", file], { encoding: "utf8" });
  const [width, height, colourSpace] = identify.status === 0 ? identify.stdout.trim().split(/\s+/) : [];
  return { id: path.parse(name).name, file: name, bytes: fs.statSync(file).size, sha256: hash, width: Number(width) || null, height: Number(height) || null, colourSpace: colourSpace || null, rights: "unknown", credit: "", caption: "", approvedUses: [] };
});
const byHash = new Map();
for (const record of records) byHash.set(record.sha256, [...(byHash.get(record.sha256) || []), record]);
const duplicateGroups = [...byHash.values()].filter((group) => group.length > 1).map((group) => group.map((record) => record.file));
console.log(JSON.stringify({ images: records, exactDuplicateGroups: duplicateGroups, limitations: records.some((record) => record.width === null) ? ["ImageMagick identify unavailable for some or all files."] : [] }, null, 2));
