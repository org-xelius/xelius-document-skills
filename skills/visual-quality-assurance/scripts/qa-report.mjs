#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { deriveStatus, hashFile, validateQa } from "./qa-utils.mjs";

const [command, ...args] = process.argv.slice(2);
const help = `Usage: node qa-report.mjs <action> [options]
  init --artifact file.pdf --type pdf --total 3 --out qa/qa-report.json
  record-artifact --report qa/qa-report.json --artifact revised.pdf [--total 4]
  record-render --report qa/qa-report.json --location page-001 --render renders/page-001.png
  record-review --report qa/qa-report.json --location page-001 --method full-size-render --result clear --reviewer Hermes --observation "Labels and edges are legible."
  record-issue --report qa/qa-report.json --issue issue.json
  record-check --report qa/qa-report.json --check check.json
  report --report qa/qa-report.json --out qa/summary.md --manifest qa/manifest.json
Issue and check actions upsert a canonical object by ID. Review --issues takes comma-separated IDs.
Paths on the command line are relative to the current directory; stored paths are relative to the QA report.
Registering a changed artifact clears old renders and reviews; a changed render removes its previous review. Record fresh reviews after repairs.
Schema v1 reports must be recreated from current renders; the helper never invents review evidence.`;
if (!command || ["--help", "help"].includes(command)) {
  console.log(help);
  process.exit(command ? 0 : 2);
}

try {
  const options = {};
  for (let index = 0; index < args.length; index += 2) {
    if (!args[index]?.startsWith("--") || args[index + 1] === undefined || args[index + 1].startsWith("--")) throw new Error(`Expected --option value near ${args[index] || "end of input"}.`);
    const key = args[index].slice(2);
    if (Object.hasOwn(options, key)) throw new Error(`Repeated option --${key}.`);
    options[key] = args[index + 1];
  }
  const need = (...keys) => keys.forEach((key) => { if (!options[key]?.trim()) throw new Error(`--${key} is required.\n${help}`); });
  const saveJson = (file, value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`); };
  let report;
  let reportFile;
  if (command === "init") {
    need("artifact", "type", "total", "out");
    reportFile = path.resolve(options.out);
    if (fs.existsSync(reportFile)) throw new Error(`Report already exists: ${reportFile}. Preserve it or choose a new revision path.`);
    const total = Number(options.total);
    if (!Number.isInteger(total) || total < 1) throw new Error("--total must be a positive integer.");
    const artifact = path.resolve(options.artifact);
    const now = new Date().toISOString();
    report = {
      schemaVersion: "2.0", artifact: path.relative(path.dirname(reportFile), artifact), artifactType: options.type,
      ...(fs.existsSync(artifact) ? { artifactSha256: hashFile(artifact) } : {}),
      createdAt: now, updatedAt: now, status: "limited", reviewMethod: "source-only",
      inspectionCoverage: { rendered: 0, inspected: 0, total }, renders: [], surfaceReviews: [], issues: [], checks: [], limitations: []
    };
  } else {
    need("report");
    reportFile = path.resolve(options.report);
    report = JSON.parse(fs.readFileSync(reportFile, "utf8"));
    const existingErrors = validateQa(report);
    if (existingErrors.length) throw new Error(existingErrors.join("\n"));
  }
  const reportDir = path.dirname(reportFile);
  const storedPath = (file) => path.relative(reportDir, path.resolve(file));
  const upsert = (items, item, key) => {
    const index = items.findIndex((current) => current[key] === item[key]);
    if (index < 0) items.push(item); else items[index] = item;
  };
  if (command === "record-artifact") {
    need("artifact");
    if (options.total !== undefined) {
      const total = Number(options.total);
      if (!Number.isInteger(total) || total < 1) throw new Error("--total must be a positive integer.");
      report.inspectionCoverage.total = total;
    }
    report.artifact = storedPath(options.artifact);
    report.artifactSha256 = hashFile(path.resolve(options.artifact));
    report.renders = [];
    report.surfaceReviews = [];
    report.reviewMethod = "source-only";
    report.checks = report.checks.map((check) => check.status === "not-requested" ? check : { ...check, status: "limited", evidence: "Artifact changed; rerun this check against the current export." });
  } else if (command === "record-render") {
    need("location", "render");
    const render = { location: options.location, path: storedPath(options.render), sha256: hashFile(path.resolve(options.render)) };
    const previous = report.renders.find((item) => item.location === render.location);
    if (!previous || previous.sha256 !== render.sha256 || previous.path !== render.path) report.surfaceReviews = report.surfaceReviews.filter((review) => review.location !== render.location);
    upsert(report.renders, render, "location");
  } else if (command === "record-review") {
    need("location", "method", "result", "reviewer", "observation");
    const render = report.renders.find((item) => item.location === options.location);
    if (options.method === "full-size-render") {
      if (!render) throw new Error("Register the current render with record-render before reviewing it.");
      if (hashFile(path.resolve(reportDir, render.path)) !== render.sha256) throw new Error("Render has changed; register it again before recording a review.");
      report.reviewMethod = report.checks.length ? "manual-and-automated" : "manual-full-size";
    }
    const review = {
      location: options.location, method: options.method, result: options.result, observation: options.observation,
      reviewer: options.reviewer, reviewedAt: new Date().toISOString(), issueIds: options.issues ? options.issues.split(",").map((id) => id.trim()).filter(Boolean) : [],
      ...(options.method === "full-size-render" ? { renderPath: render.path, renderSha256: render.sha256 } : {})
    };
    upsert(report.surfaceReviews, review, "location");
  } else if (command === "record-issue" || command === "record-check") {
    const option = command === "record-issue" ? "issue" : "check";
    need(option);
    const item = JSON.parse(fs.readFileSync(options[option], "utf8"));
    upsert(option === "issue" ? report.issues : report.checks, item, "id");
    if (option === "check" && report.reviewMethod === "manual-full-size") report.reviewMethod = "manual-and-automated";
  } else if (!["init", "report"].includes(command)) throw new Error(`Unknown action ${command}.\n${help}`);

  report.inspectionCoverage.rendered = report.renders.length;
  report.inspectionCoverage.inspected = report.surfaceReviews.filter((review) => review.method === "full-size-render" && review.result !== "unverifiable").length;
  report.status = deriveStatus(report);
  report.updatedAt = new Date().toISOString();
  const errors = validateQa(report, { reportDir, verifyFiles: command === "report" && report.status === "pass" });
  if (errors.length) throw new Error(errors.join("\n"));
  if (command === "report") {
    need("out", "manifest");
    const escape = (value) => String(value).replace(/[\r\n]+/g, " ");
    const lines = ["# QA report", "", `Status: **${report.status}**`, "", `Artifact: ${escape(report.artifact)}`, `Reviewed: ${report.inspectionCoverage.inspected}/${report.inspectionCoverage.total}; rendered: ${report.inspectionCoverage.rendered}/${report.inspectionCoverage.total}.`, "", "## Surface reviews", "", ...report.surfaceReviews.map((review) => `- ${escape(review.location)}: ${review.result} — ${escape(review.observation)} (${escape(review.reviewer)}, ${review.reviewedAt})`), "", "## Issues", "", ...(report.issues.length ? report.issues.map((issue) => `- ${escape(issue.id)}: ${issue.severity}, ${issue.status} — ${escape(issue.evidence)}${issue.status === "accepted" ? `; accepted by ${escape(issue.acceptedBy)}: ${escape(issue.acceptanceReason)}` : ""}`) : ["No issues recorded."]), "", "## Checks", "", ...report.checks.map((check) => `- ${check.domain}/${escape(check.id)}: ${check.status} — ${escape(check.evidence)}`), "", "## Limitations", "", ...(report.limitations.length ? report.limitations.map((limitation) => `- ${escape(limitation)}`) : [report.status === "limited" ? "Review coverage or a required check is incomplete; see the JSON coverage and checks." : "None recorded."]), ""];
    fs.mkdirSync(path.dirname(path.resolve(options.out)), { recursive: true });
    fs.writeFileSync(options.out, lines.join("\n"));
    saveJson(path.resolve(options.manifest), {
      schemaVersion: "2.0", status: report.status, artifact: report.artifact,
      ...(report.artifactSha256 ? { artifactSha256: report.artifactSha256 } : {}),
      qaReport: path.relative(path.dirname(path.resolve(options.manifest)), reportFile),
      renders: report.renders, inspectionCoverage: report.inspectionCoverage,
      checks: report.checks, limitations: report.limitations
    });
  }
  saveJson(reportFile, report);
  console.log(`${command}: ${reportFile} (${report.status})`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
