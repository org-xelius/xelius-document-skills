import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { preflightChecks, resultStatus } from "../../skills/pdf-production/scripts/pdf-inspection.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const hasPoppler = spawnSync("pdfinfo", ["-v"], { encoding: "utf8" }).status === 0;

function pdf(file, text, title = "Synthetic report") {
  const stream = `BT /F1 12 Tf 20 150 Td (${text}) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R /Lang (en) >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    title ? `<< /Title (${title}) /Author (Xelius) >>` : "<< /Author (Xelius) >>"
  ];
  let data = "%PDF-1.4\n";
  const offsets = [];
  objects.forEach((value, index) => { offsets.push(Buffer.byteLength(data)); data += `${index + 1} 0 obj\n${value}\nendobj\n`; });
  const start = Buffer.byteLength(data);
  data += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n `).join("\n")}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 6 0 R >>\nstartxref\n${start}\n%%EOF\n`;
  fs.writeFileSync(file, data);
}

test("PDF contract checks missing properties even when neither export had them", () => {
  const snapshot = { properties: { Pages: "1", Encrypted: "no" }, structure: { available: true, metadata: {}, tagged: false, language: "", links: [], bookmarkCount: 0, pages: [{ width: 300, height: 200 }] }, tools: {}, type3Fonts: false, textLength: 10 };
  const checks = preflightChecks(snapshot, { requiredMetadata: ["title", "author"], requireTagged: true, language: "en", minimumLinks: 1, minimumBookmarks: 1, pageSize: [595, 842] });
  assert.equal(resultStatus(checks), "repair-required");
  for (const id of ["pdf.metadata.title", "pdf.tags", "pdf.language", "pdf.links", "pdf.bookmarks", "pdf.page-geometry"]) assert.equal(checks.find((item) => item.id === id).status, "fail");
});

test("Type 3 fonts are review warnings unless the output contract rejects them", () => {
  const snapshot = { properties: { Pages: "1", Encrypted: "no" }, structure: { available: true }, tools: {}, type3Fonts: true };
  assert.equal(preflightChecks(snapshot).find((item) => item.id === "pdf.type3-fonts").status, "warning");
  assert.equal(resultStatus(preflightChecks(snapshot, { rejectType3Fonts: true })), "repair-required");
});

test("missing text extractor limits verification rather than inventing a text defect", () => {
  const snapshot = { properties: { Pages: "1", Encrypted: "no" }, structure: { available: true }, tools: { text: { exitCode: null, missing: true, stderr: "", error: "not found" } }, type3Fonts: false, textLength: 0 };
  const checks = preflightChecks(snapshot, { requireSelectableText: true });
  assert.equal(checks.find((item) => item.id === "pdf.selectable-text").status, "limited");
  assert.equal(resultStatus(checks), "limited");
});

test("PDF comparison detects same-length text corruption and removed metadata", { skip: !hasPoppler }, () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "xelius-pdf-"));
  try {
    const raw = path.join(temp, "raw.pdf");
    const final = path.join(temp, "final.pdf");
    pdf(raw, "Hello world");
    pdf(final, "Hallo world", "");
    const result = spawnSync(process.execPath, [path.join(root, "skills/pdf-production/scripts/compare-pdf-properties.mjs"), raw, final, "--json"], { encoding: "utf8" });
    assert.equal(result.status, 1, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.equal(report.status, "repair-required");
    assert.equal(report.checks.find((item) => item.id === "regression.text").status, "fail");
    assert.equal(report.checks.find((item) => item.id === "regression.metadata.title").status, "fail");
    const approved = spawnSync(process.execPath, [path.join(root, "skills/pdf-production/scripts/compare-pdf-properties.mjs"), raw, final, "--json", "--allow-text-change", "Approved source edit"], { encoding: "utf8" });
    assert.equal(JSON.parse(approved.stdout).checks.find((item) => item.id === "regression.text").status, "pass");
    assert.equal(approved.status, 1, "Approved text changes must not waive removed metadata.");
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});
