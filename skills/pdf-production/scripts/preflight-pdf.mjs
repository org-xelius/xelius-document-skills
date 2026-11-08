#!/usr/bin/env node
import { inspectPdf, parseOptions, preflightChecks, resultStatus, printReport } from "./pdf-inspection.mjs";

if (process.argv.includes("--help")) {
  console.log("Usage: node preflight-pdf.mjs input.pdf [--expect expectations.json] [--python python3] [--json] [--strict]");
  process.exit(0);
}

try {
  const options = parseOptions(process.argv.slice(2));
  if (options.positional.length !== 1) throw new Error("Usage: node preflight-pdf.mjs <input.pdf> [--expect expectations.json] [--python python3] [--json] [--strict]");
  const snapshot = inspectPdf(options.positional[0], options);
  const checks = preflightChecks(snapshot, options.expect);
  printReport({ schemaVersion: "1.0", kind: "preflight", artifact: snapshot.artifact, status: resultStatus(checks, options.strict), scope: "Technical preflight; visual quality, reading order, and PDF/UA conformance require separate review.", checks, properties: snapshot.properties, structure: snapshot.structure, limitations: checks.filter((item) => item.status === "limited").map((item) => item.detail) }, options.json);
} catch (error) {
  console.error(error.message);
  process.exitCode = 2;
}
