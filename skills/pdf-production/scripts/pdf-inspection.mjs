#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

export function parseOptions(argv) {
  const options = { positional: [], json: false, strict: false };
  const values = new Set(["--expect", "--python", "--allow-page-count-change", "--allow-text-change"]);
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === "--json") options.json = true;
    else if (arg === "--strict") options.strict = true;
    else if (values.has(arg)) {
      const value = argv[++index];
      if (!value?.trim() || value.startsWith("--")) throw new Error(`${arg} requires a value.`);
      options[arg.slice(2)] = value;
    } else if (arg.startsWith("--")) throw new Error(`Unknown option: ${arg}`);
    else options.positional.push(arg);
  }
  options.expect = options.expect ? JSON.parse(fs.readFileSync(options.expect, "utf8")) : {};
  validateExpectations(options.expect);
  return options;
}

export function validateExpectations(expected) {
  if (!expected || typeof expected !== "object" || Array.isArray(expected)) throw new Error("PDF expectations must be an object.");
  const types = { requiredMetadata: "array", requireTagged: "boolean", language: "string", minimumLinks: "integer", minimumBookmarks: "integer", pageCount: "integer", requireSelectableText: "boolean", requireEmbeddedFonts: "boolean", pageSize: "array", pageSizeTolerance: "number", rejectType3Fonts: "boolean" };
  for (const [key, value] of Object.entries(expected)) {
    if (!(key in types)) throw new Error(`Unknown PDF expectation: ${key}`);
    const type = types[key];
    if (type === "array" ? !Array.isArray(value) : type === "integer" ? !Number.isInteger(value) || value < 0 : typeof value !== type) throw new Error(`Invalid PDF expectation: ${key} must be ${type}.`);
  }
  if (expected.pageCount === 0) throw new Error("PDF pageCount must be positive.");
  if (expected.pageSize && (expected.pageSize.length !== 2 || expected.pageSize.some((value) => typeof value !== "number" || value <= 0))) throw new Error("pageSize must contain positive width and height in points.");
  if (expected.requiredMetadata?.some((key) => typeof key !== "string" || !["title", "author", "subject", "keywords"].includes(key.toLowerCase()))) throw new Error("requiredMetadata supports title, author, subject, and keywords.");
  if (expected.pageSizeTolerance !== undefined && expected.pageSizeTolerance < 0) throw new Error("pageSizeTolerance must be nonnegative.");
}

function invoke(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024, timeout: 60000 });
  return { command, args, exitCode: result.status, stdout: result.stdout || "", stderr: result.stderr || "", error: result.error?.message, missing: result.error?.code === "ENOENT" };
}

export function inspectPdf(file, options = {}) {
  const artifact = path.resolve(file);
  if (!fs.existsSync(artifact)) throw new Error(`Missing PDF: ${file}`);
  const tools = {
    info: invoke("pdfinfo", [artifact]),
    fonts: invoke("pdffonts", [artifact]),
    text: invoke("pdftotext", [artifact, "-"]),
    links: invoke("pdfinfo", ["-url", artifact])
  };
  const properties = Object.fromEntries(tools.info.stdout.split("\n").flatMap((line) => {
    const match = line.match(/^([^:]+):\s*(.*)$/);
    return match ? [[match[1].trim(), match[2].trim()]] : [];
  }));
  const python = options.python || process.env.XELIUS_PYTHON || "python3";
  const structureTool = invoke(python, [fileURLToPath(new URL("./inspect-pdf.py", import.meta.url)), artifact]);
  let structure;
  try { structure = JSON.parse(structureTool.stdout); } catch { structure = { available: false, error: structureTool.error || structureTool.stderr || "Structural inspector returned no JSON." }; }
  const text = tools.text.stdout.replace(/\s+/g, "");
  return {
    artifact, bytes: fs.statSync(artifact).size, properties, structure,
    textLength: text.length, textHash: crypto.createHash("sha256").update(text).digest("hex"),
    type3Fonts: /\bType 3\b/.test(tools.fonts.stdout),
    unembeddedFonts: tools.fonts.stdout.split("\n").slice(2).filter((line) => /\sno\s+(?:yes|no)\s+(?:yes|no)\s+\d+\s+\d+\s*$/.test(line)).length,
    tools: { ...tools, structure: structureTool }
  };
}

export function check(id, status, detail) { return { id, status, detail }; }

export function preflightChecks(snapshot, expected = {}) {
  const checks = [];
  for (const [name, result] of Object.entries(snapshot.tools)) {
    if (name === "structure") {
      checks.push(check("pdf.structure", snapshot.structure.available ? "pass" : "limited", snapshot.structure.available ? "Structural inspection completed; this is not a PDF/UA conformance assessment." : snapshot.structure.error));
    } else {
      checks.push(check(`tool.${name}`, result.exitCode === 0 ? "pass" : result.missing ? "limited" : "fail", result.exitCode === 0 ? `${result.command} completed.` : result.error || result.stderr || `${result.command} exited ${result.exitCode}.`));
    }
    if (result.stderr.trim() && result.exitCode === 0) checks.push(check(`tool.${name}.diagnostic`, "warning", result.stderr.trim()));
  }
  const encrypted = snapshot.properties.Encrypted || (snapshot.structure.available && typeof snapshot.structure.encrypted === "boolean" ? snapshot.structure.encrypted ? "yes" : "no" : undefined);
  checks.push(check("pdf.unencrypted", encrypted === undefined ? "limited" : encrypted === "no" ? "pass" : "fail", `Encrypted: ${encrypted || "unknown"}`));
  const count = Number(snapshot.properties.Pages || (snapshot.structure.available ? snapshot.structure.pages?.length : undefined));
  checks.push(check("pdf.page-count", !Number.isInteger(count) ? "limited" : count > 0 && (expected.pageCount === undefined || expected.pageCount === count) ? "pass" : "fail", `Found ${count || 0} pages${expected.pageCount === undefined ? "" : `; expected ${expected.pageCount}`}.`));
  if (snapshot.type3Fonts) checks.push(check("pdf.type3-fonts", expected.rejectType3Fonts ? "fail" : "warning", "Type 3 fonts require glyph and extraction review; they are not inherently invalid."));
  if (expected.requireEmbeddedFonts) checks.push(check("pdf.embedded-fonts", snapshot.tools.fonts?.exitCode === 0 ? snapshot.unembeddedFonts ? "fail" : "pass" : "limited", `${snapshot.unembeddedFonts ?? "Unknown number of"} unembedded fonts.`));
  if (expected.requireSelectableText) checks.push(check("pdf.selectable-text", snapshot.tools.text?.exitCode !== 0 ? "limited" : snapshot.textLength > 0 ? "pass" : "fail", snapshot.tools.text?.exitCode !== 0 ? "Text extraction did not complete; selectable text could not be verified." : `Extracted ${snapshot.textLength} non-whitespace characters.`));
  const structure = snapshot.structure;
  for (const key of expected.requiredMetadata || []) {
    const lower = key.toLowerCase();
    const value = structure.available ? structure.metadata[lower] : snapshot.properties[lower[0].toUpperCase() + lower.slice(1)];
    const available = structure.available || snapshot.tools.info?.exitCode === 0;
    checks.push(check(`pdf.metadata.${lower}`, !available ? "limited" : value?.trim() ? "pass" : "fail", value || `${key} metadata is missing.`));
  }
  if (expected.requireTagged) checks.push(check("pdf.tags", structure.available ? structure.tagged ? "pass" : "fail" : "limited", structure.available ? `Tagged structure: ${structure.tagged}` : "pypdf is required to inspect structure."));
  if (expected.language) checks.push(check("pdf.language", structure.available ? structure.language.toLowerCase() === expected.language.toLowerCase() ? "pass" : "fail" : "limited", structure.available ? `Language: ${structure.language || "missing"}; expected ${expected.language}.` : "pypdf is required to inspect document language."));
  if (expected.minimumLinks !== undefined) checks.push(check("pdf.links", structure.available ? structure.links.length >= expected.minimumLinks ? "pass" : "fail" : "limited", structure.available ? `Found ${structure.links.length} link annotations; expected at least ${expected.minimumLinks}.` : "pypdf is required for link annotation inspection."));
  if (expected.minimumBookmarks !== undefined) checks.push(check("pdf.bookmarks", structure.available ? structure.bookmarkCount >= expected.minimumBookmarks ? "pass" : "fail" : "limited", structure.available ? `Found ${structure.bookmarkCount} bookmarks; expected at least ${expected.minimumBookmarks}.` : "pypdf is required for bookmark inspection."));
  if (expected.pageSize) {
    const tolerance = expected.pageSizeTolerance ?? 1;
    const invalid = structure.available ? structure.pages.filter((page) => Math.abs(page.width - expected.pageSize[0]) > tolerance || Math.abs(page.height - expected.pageSize[1]) > tolerance) : [];
    checks.push(check("pdf.page-geometry", structure.available ? invalid.length ? "fail" : "pass" : "limited", structure.available ? `${invalid.length} pages outside expected ${expected.pageSize.join(" x ")} pt ±${tolerance}.` : "pypdf is required to inspect every page size."));
  }
  return checks;
}

export function resultStatus(checks, strict = false) {
  if (checks.some((item) => item.status === "fail" || (strict && item.status === "warning"))) return "repair-required";
  if (checks.some((item) => item.status === "limited")) return "limited";
  return "pass";
}

export function printReport(report, json) {
  if (json) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`PDF ${report.kind}: ${report.status}`);
    for (const item of report.checks) console.log(`${item.status.toUpperCase()} ${item.id}: ${item.detail}`);
  }
  process.exitCode = report.status === "pass" ? 0 : report.status === "limited" ? 3 : 1;
}
