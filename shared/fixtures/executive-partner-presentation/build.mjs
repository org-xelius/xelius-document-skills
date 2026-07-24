#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(os.tmpdir(), "xelius-examples", "executive-partner-presentation");
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const file of ["project-manifest.json", "deck-storyline.json", "deck-spec.json", "speaker-notes.md", "qa-report.json"]) fs.copyFileSync(path.join(here, file), path.join(output, file));
fs.cpSync(path.resolve(here, "../../example-content"), path.join(output, "evidence"), { recursive: true });
console.log(`Staged synthetic presentation source at ${output}`);
if (process.argv.includes("--render")) {
  const builder = path.resolve(here, "../../../skills/pptx-production/scripts/build-pptx.mjs");
  const result = spawnSync(process.execPath, [builder, path.join(output, "deck-spec.json"), path.join(output, "riverbend-partner-briefing.pptx")], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
}
