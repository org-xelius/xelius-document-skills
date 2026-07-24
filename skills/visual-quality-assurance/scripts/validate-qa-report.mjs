#!/usr/bin/env node
import fs from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node validate-qa-report.mjs <qa-report.json>");
  process.exit(2);
}
const report = JSON.parse(fs.readFileSync(file, "utf8"));
const errors = [];
const coverage = report.inspectionCoverage || {};
const reviews = report.surfaceReviews || [];
const locations = reviews.map((review) => review.location);
const duplicateLocations = locations.filter((location, index) => locations.indexOf(location) !== index);
const openIssues = (report.issues || []).filter((issue) => issue.status === "open");
const unverifiableIssues = (report.issues || []).filter((issue) => issue.status === "unverifiable");

if (coverage.rendered > coverage.total || coverage.inspected > coverage.total) errors.push("Inspection coverage exceeds the declared total.");
if (report.status !== "limited" && coverage.rendered !== coverage.total) errors.push("Render coverage is incomplete.");
if (report.status !== "limited" && coverage.inspected !== coverage.total) errors.push("Inspection coverage is incomplete.");
if (report.status === "limited" && !report.limitations?.length) errors.push("Limited status requires a stated limitation.");
if (report.status !== "limited" && !["manual-full-size", "manual-and-automated"].includes(report.reviewMethod)) errors.push("Complete QA requires a declared manual full-size review method.");
if (report.status !== "limited" && reviews.length !== coverage.total) errors.push("Complete QA requires one surface review per declared surface.");
if (duplicateLocations.length) errors.push(`Duplicate surface review locations: ${[...new Set(duplicateLocations)].join(", ")}`);
if (report.status !== "limited" && reviews.some((review) => review.method !== "full-size-render")) errors.push("Complete QA requires every surface review to use a full-size render.");
if (report.status === "pass" && reviews.some((review) => review.result !== "clear")) errors.push("Pass status requires every surface review to be clear.");
if (report.status === "pass" && (openIssues.length || unverifiableIssues.length)) errors.push("Pass status conflicts with open or unverifiable issues.");
if (report.status === "pass" && (errors.length || report.limitations?.length)) errors.push("Pass status conflicts with incomplete coverage or limitations.");
if (report.status === "repair-required" && !openIssues.length) errors.push("Repair-required status needs at least one open issue.");
if (errors.length) {
  errors.forEach((error) => console.error(error));
  process.exit(1);
}
console.log(`QA report is internally consistent with ${report.issues?.length || 0} issue record(s).`);
