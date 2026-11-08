#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const helper = path.join(path.dirname(fileURLToPath(import.meta.url)), "inspect-svg.py");
const args = process.argv.slice(2);
const python = process.env.XELIUS_PYTHON || "python3";
const result = spawnSync(python, [helper, ...args], { encoding: "utf8", timeout: 60000, maxBuffer: 8 * 1024 * 1024 });
if (result.error) {
  const message = `SVG inspection requires Python 3. Set XELIUS_PYTHON to its executable. ${result.error.message}`;
  if (args.includes("--json")) console.log(JSON.stringify({ status: "limited", checks: [], limitations: [message] }, null, 2));
  else console.error(message);
  process.exit(2);
}
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exit(result.status ?? 2);
