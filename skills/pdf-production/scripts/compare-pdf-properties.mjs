#!/usr/bin/env node
import { inspectPdf, parseOptions, preflightChecks, check, resultStatus, printReport } from "./pdf-inspection.mjs";

if (process.argv.includes("--help")) {
  console.log("Usage: node compare-pdf-properties.mjs raw.pdf final.pdf [--expect expectations.json] [--python python3] [--json] [--strict] [--allow-page-count-change reason] [--allow-text-change reason]");
  process.exit(0);
}

try {
  const options = parseOptions(process.argv.slice(2));
  if (options.positional.length !== 2) throw new Error("Usage: node compare-pdf-properties.mjs <raw.pdf> <final.pdf> [--json] [--strict] [--expect expectations.json] [--python python3] [--allow-page-count-change <reason>] [--allow-text-change <reason>]");
  const source = inspectPdf(options.positional[0], options);
  const final = inspectPdf(options.positional[1], options);
  const checks = preflightChecks(final, options.expect);
  for (const [name, tool] of Object.entries(source.tools)) {
    if (tool.exitCode !== 0) checks.push(check(`source.${name}`, tool.missing || name === "structure" ? "limited" : "fail", tool.error || tool.stderr || source.structure.error || `${tool.command} failed.`));
    else if (tool.stderr.trim()) checks.push(check(`source.${name}.diagnostic`, "warning", tool.stderr.trim()));
  }
  const a = source.properties;
  const b = final.properties;
  checks.push(check("regression.tags", a.Tagged === "yes" && b.Tagged !== "yes" ? "fail" : "pass", `Tagged: ${a.Tagged || "unknown"} → ${b.Tagged || "unknown"}.`));
  for (const key of ["Title", "Author", "Subject", "Keywords"]) checks.push(check(`regression.metadata.${key.toLowerCase()}`, a[key] && !b[key] ? "fail" : "pass", a[key] && !b[key] ? `${key} was removed.` : `${key} was not removed.`));
  checks.push(check("regression.page-count", a.Pages !== b.Pages && !options["allow-page-count-change"] ? "fail" : "pass", `Pages: ${a.Pages} → ${b.Pages}.${options["allow-page-count-change"] ? ` Approved change: ${options["allow-page-count-change"]}` : ""}`));
  checks.push(check("regression.text", source.tools.text.exitCode !== 0 || final.tools.text.exitCode !== 0 ? "limited" : source.textHash !== final.textHash && !options["allow-text-change"] ? "fail" : "pass", source.textHash === final.textHash ? "Selectable text is unchanged after whitespace normalization." : options["allow-text-change"] ? `Approved text change: ${options["allow-text-change"]}` : "Selectable text changed; inspect the edit or supply an explicit approved-change reason."));
  if (source.structure.available && final.structure.available) {
    const s = source.structure;
    const f = final.structure;
    checks.push(check("regression.language", s.language && s.language !== f.language ? "fail" : "pass", `Language: ${s.language || "missing"} → ${f.language || "missing"}.`));
    checks.push(check("regression.bookmarks", f.bookmarkCount < s.bookmarkCount ? "fail" : "pass", `Bookmarks: ${s.bookmarkCount} → ${f.bookmarkCount}.`));
    const missingBookmarks = (s.bookmarks || []).filter((bookmark) => !(f.bookmarks || []).some((candidate) => candidate.title === bookmark.title && candidate.page === bookmark.page));
    checks.push(check("regression.bookmark-destinations", missingBookmarks.length ? "fail" : "pass", `${missingBookmarks.length} source bookmarks lost their title or page destination.`));
    const remainingTargets = f.links.map((link) => `${link.kind}:${link.target}`);
    const lostLinks = s.links.filter((link) => {
      const index = remainingTargets.indexOf(`${link.kind}:${link.target}`);
      if (index === -1) return true;
      remainingTargets.splice(index, 1);
      return false;
    });
    checks.push(check("regression.links", lostLinks.length || f.links.length < s.links.length ? "fail" : "pass", `Links: ${s.links.length} → ${f.links.length}; ${lostLinks.length} source destinations absent.`));
    const geometryChanged = s.pages.some((page, index) => f.pages[index] && (Math.abs(page.width - f.pages[index].width) > 0.1 || Math.abs(page.height - f.pages[index].height) > 0.1 || page.rotation !== f.pages[index].rotation));
    checks.push(check("regression.page-geometry", geometryChanged ? "fail" : "pass", geometryChanged ? "One or more page dimensions or rotations changed." : "Matched page dimensions and rotations are preserved."));
  }
  if (final.bytes > source.bytes * 1.5) checks.push(check("regression.file-size", "warning", `File size grew from ${source.bytes} to ${final.bytes} bytes.`));
  printReport({ schemaVersion: "1.0", kind: "comparison", source: source.artifact, artifact: final.artifact, status: resultStatus(checks, options.strict), scope: "Transformation integrity; --expect defines required final properties, and visual review remains separate.", checks, sourceProperties: source.properties, finalProperties: final.properties, limitations: checks.filter((item) => item.status === "limited").map((item) => item.detail) }, options.json);
} catch (error) {
  console.error(error.message);
  process.exitCode = 2;
}
