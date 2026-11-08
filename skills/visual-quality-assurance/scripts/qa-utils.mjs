import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { validateRequiredShape, readJson } from "./schema-utils.mjs";

const schemaFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../assets/schemas/qa-report.schema.json");
export const hashFile = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
export const manualMethods = ["manual-full-size", "manual-and-automated"];

export function deriveStatus(report) {
  if (report.issues.some((issue) => issue.status === "open") || report.checks.some((check) => check.status === "repair-required")) return "repair-required";
  const coverage = report.inspectionCoverage;
  if (report.limitations.length || !manualMethods.includes(report.reviewMethod) || coverage.rendered !== coverage.total || coverage.inspected !== coverage.total || report.issues.some((issue) => issue.status === "unverifiable") || report.surfaceReviews.some((review) => review.result !== "clear") || report.checks.some((check) => check.status === "limited")) return "limited";
  return "pass";
}

export function validateQa(report, { reportDir = process.cwd(), verifyFiles = false } = {}) {
  const errors = validateRequiredShape(report, readJson(schemaFile));
  if (report?.schemaVersion !== "2.0") errors.unshift("QA schemaVersion 2.0 is required. For legacy reports, use qa-report.mjs init, register current renders, then record actual reviews; do not rename fields to imply unperformed review.");
  if (errors.length) return errors;
  const coverage = report.inspectionCoverage;
  const renders = report.renders;
  const reviews = report.surfaceReviews;
  const issues = report.issues;
  const unique = (items, field, label) => {
    const seen = new Set();
    for (const item of items) {
      if (seen.has(item[field])) errors.push(`Duplicate ${label}: ${item[field]}`);
      seen.add(item[field]);
    }
  };
  unique(renders, "location", "render location");
  unique(reviews, "location", "surface review location");
  unique(issues, "id", "issue ID");
  unique(report.checks, "id", "check ID");
  if (coverage.rendered !== renders.length) errors.push("Rendered coverage must equal the registered render count.");
  const inspected = reviews.filter((review) => review.method === "full-size-render" && review.result !== "unverifiable").length;
  if (coverage.inspected !== inspected) errors.push("Inspected coverage must equal the full-size review count.");
  if (coverage.rendered > coverage.total || coverage.inspected > coverage.total || reviews.length > coverage.total) errors.push("Inspection coverage exceeds the declared total.");
  for (const review of reviews) {
    if (Number.isNaN(Date.parse(review.reviewedAt))) errors.push(`${review.location}: reviewedAt must be a valid timestamp.`);
    if (review.method === "full-size-render") {
      const render = renders.find((item) => item.location === review.location);
      if (!render || render.path !== review.renderPath || render.sha256 !== review.renderSha256) errors.push(`${review.location}: review must reference the current registered render path and SHA-256.`);
    }
    const linked = review.issueIds.map((id) => issues.find((issue) => issue.id === id));
    if (linked.some((issue) => !issue)) errors.push(`${review.location}: review references an unknown issue ID.`);
    if (review.result === "issue-found" && !review.issueIds.length) errors.push(`${review.location}: issue-found requires a linked issue.`);
    if (review.result === "clear" && linked.some((issue) => issue && ["open", "unverifiable"].includes(issue.status))) errors.push(`${review.location}: clear review conflicts with a linked open or unverifiable issue.`);
  }
  for (const issue of issues) {
    if (issue.status === "accepted" && (!issue.acceptedBy?.trim() || !issue.acceptanceReason?.trim())) errors.push(`${issue.id}: accepted deviations require acceptedBy and acceptanceReason.`);
  }
  if (report.status === "pass") {
    if (!manualMethods.includes(report.reviewMethod)) errors.push("Pass requires a declared manual full-size review method.");
    if (reviews.length !== coverage.total || reviews.some((review) => review.method !== "full-size-render" || review.result !== "clear")) errors.push("Pass requires a clear full-size review for every declared surface.");
  }
  const expected = deriveStatus(report);
  if (report.status !== expected) errors.push(`Status must be ${expected}, derived from coverage, issues, checks, and limitations.`);
  if (verifyFiles) {
    const verify = (file, expectedHash, label) => {
      const resolved = path.resolve(reportDir, file);
      if (!fs.existsSync(resolved)) errors.push(`${label}: file is missing (${file}).`);
      else if (!expectedHash || hashFile(resolved) !== expectedHash) errors.push(`${label}: SHA-256 is missing or stale; register/review the current file.`);
    };
    verify(report.artifact, report.artifactSha256, "Artifact");
    for (const render of renders) verify(render.path, render.sha256, render.location);
  }
  return errors;
}
