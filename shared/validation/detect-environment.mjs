#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

const commands = {
  node: [["node", "--version"]],
  npm: [["npm", "--version"]],
  pnpm: [["pnpm", "--version"]],
  python: [["python3", "--version"], ["python", "--version"]],
  chromium: [["chromium", "--version"], ["chromium-browser", "--version"], ["google-chrome", "--version"], ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "--version"]],
  libreoffice: [["libreoffice", "--version"], ["soffice", "--version"]],
  popplerPdfInfo: [["pdfinfo", "-v"]],
  popplerPdfFonts: [["pdffonts", "-v"]],
  popplerPdfRender: [["pdftoppm", "-v"], ["pdftocairo", "-v"]],
  imagemagick: [["magick", "-version"], ["convert", "-version"]],
  ghostscript: [["gs", "--version"]],
  inkscape: [
    ["inkscape", "--version"],
    ["/Applications/Inkscape.app/Contents/MacOS/inkscape", "--version"]
  ],
  ffmpeg: [["ffmpeg", "-version"]],
  playwrightCli: [["playwright", "--version"]],
  vivliostyleCli: [["vivliostyle", "--version"]]
};

const modules = ["playwright", "pptxgenjs", "pagedjs", "@vivliostyle/cli"];

export function commandStatus(candidates) {
  let failed;
  for (const [command, ...args] of candidates) {
    const result = spawnSync(command, args, { encoding: "utf8", timeout: 5000 });
    if (!result.error && result.status === 0) {
      const version = `${result.stdout || result.stderr}`.trim().split("\n")[0];
      return { available: true, found: true, runnable: true, command, version, exitCode: 0 };
    }
    if (!result.error || result.error.code !== "ENOENT") failed = { available: false, found: true, runnable: false, command, exitCode: result.status, error: result.error?.message || `${result.stderr || result.stdout}`.trim().split("\n")[0] };
  }
  return failed || { available: false, found: false, runnable: false };
}

export function moduleStatus(name, projectRoot = process.cwd()) {
  try {
    const require = createRequire(path.join(path.resolve(projectRoot), "package.json"));
    return { available: true, resolved: require.resolve(name) };
  } catch {
    return { available: false };
  }
}

export function detectEnvironment(projectRoot = process.cwd()) {
return {
  checkedAt: new Date().toISOString(),
  commands: Object.fromEntries(Object.entries(commands).map(([name, candidates]) => [name, commandStatus(candidates)])),
  projectRoot: path.resolve(projectRoot),
  modules: Object.fromEntries(modules.map((name) => [name, moduleStatus(name, projectRoot)]))
};
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
const projectFlag = process.argv.indexOf("--project-root");
if (projectFlag !== -1 && (!process.argv[projectFlag + 1] || process.argv[projectFlag + 1].startsWith("--"))) {
  console.error("--project-root requires a directory.");
  process.exit(2);
}
const report = detectEnvironment(projectFlag === -1 ? process.cwd() : process.argv[projectFlag + 1]);
if (process.argv.includes("--json")) {
  console.log(JSON.stringify(report, null, 2));
} else {
  for (const [name, status] of Object.entries(report.commands)) {
    console.log(`${status.available ? "yes" : "no "}  ${name}${status.available ? ` (${status.command})` : ""}`);
  }
  for (const [name, status] of Object.entries(report.modules)) {
    console.log(`${status.available ? "yes" : "no "}  module:${name}`);
  }
}
}
