import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { commandStatus, moduleStatus } from "./detect-environment.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

test("a broken command with output is found but not runnable", () => {
  const result = commandStatus([[process.execPath, "-e", "console.error('broken executable');process.exit(2)"]]);
  assert.equal(result.found, true);
  assert.equal(result.runnable, false);
  assert.equal(result.available, false);
  assert.equal(result.exitCode, 2);
});

test("global render and build scripts resolve dependencies from explicit project root", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "xelius-runtime-"));
  try {
    const project = path.join(temp, "project");
    const installed = path.join(temp, "installed");
    fs.mkdirSync(installed, { recursive: true });
    for (const name of ["playwright", "pptxgenjs"]) fs.mkdirSync(path.join(project, "node_modules", name), { recursive: true });
    fs.writeFileSync(path.join(project, "package.json"), '{"private":true}');
    fs.writeFileSync(path.join(project, "node_modules", "playwright", "index.js"), `const fs=require('node:fs');module.exports={chromium:{launch:async(options)=>({newPage:async()=>({goto:async()=>{},emulateMedia:async()=>{},evaluate:async()=>{},pdf:async(value)=>fs.writeFileSync(value.path,JSON.stringify({launch:options,pdf:value}))}),close:async()=>{}})}};`);
    fs.writeFileSync(path.join(project, "node_modules", "pptxgenjs", "index.js"), `module.exports=class {static ShapeType={};addSlide(){return {addText(){},addNotes(){}}}async writeFile({fileName}){require('node:fs').writeFileSync(fileName,'editable test deck')}};`);
    for (const [source, target] of [["skills/pdf-production/scripts/render-html-to-pdf.mjs", "render.mjs"], ["skills/professional-presentation/scripts/build-pptx.mjs", "build.mjs"]]) fs.copyFileSync(path.join(root, source), path.join(installed, target));
    const html = path.join(project, "report.html");
    fs.writeFileSync(html, "<h1>Project local dependencies</h1>");
    const pdf = path.join(temp, "render.pdf");
    const render = spawnSync(process.execPath, [path.join(installed, "render.mjs"), html, pdf, "--project-root", project, "--browser-executable", "test-browser"], { cwd: installed, encoding: "utf8" });
    assert.equal(render.status, 0, render.stderr);
    const result = JSON.parse(fs.readFileSync(pdf, "utf8"));
    assert.equal(result.launch.executablePath, "test-browser");
    assert.equal(result.pdf.tagged, true);
    assert.equal(result.pdf.outline, true);
    const spec = path.join(project, "deck.json");
    fs.writeFileSync(spec, JSON.stringify({ slides: [{ items: [{ type: "text", text: "Editable", options: {} }] }] }));
    const pptx = path.join(temp, "deck.pptx");
    const build = spawnSync(process.execPath, [path.join(installed, "build.mjs"), spec, pptx, "--project-root", project], { cwd: installed, encoding: "utf8" });
    assert.equal(build.status, 0, build.stderr);
    assert.equal(fs.readFileSync(pptx, "utf8"), "editable test deck");
    assert.equal(moduleStatus("pptxgenjs", project).available, true);
    assert.equal(moduleStatus("pptxgenjs", installed).available, false);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});
