#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const commands = {
  node: [["node", "--version"]],
  npm: [["npm", "--version"]],
  pnpm: [["pnpm", "--version"]],
  python: [["python3", "--version"], ["python", "--version"]],
  chromium: [["chromium", "--version"], ["chromium-browser", "--version"], ["google-chrome", "--version"]],
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

function commandStatus(candidates) {
  for (const [command, ...args] of candidates) {
    const result = spawnSync(command, args, { encoding: "utf8", timeout: 5000 });
    if (!result.error && (result.status === 0 || `${result.stdout || result.stderr}`.trim())) {
      const version = `${result.stdout || result.stderr}`.trim().split("\n")[0];
      return { available: true, command, version };
    }
  }
  return { available: false };
}

function moduleStatus(name) {
  try {
    return { available: true, resolved: require.resolve(name) };
  } catch {
    return { available: false };
  }
}

const report = {
  checkedAt: new Date().toISOString(),
  commands: Object.fromEntries(Object.entries(commands).map(([name, candidates]) => [name, commandStatus(candidates)])),
  modules: Object.fromEntries(modules.map((name) => [name, moduleStatus(name)]))
};

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
