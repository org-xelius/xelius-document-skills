#!/usr/bin/env node
import fs from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node validate-storyline.mjs <deck-storyline.json>");
  process.exit(2);
}
const story = JSON.parse(fs.readFileSync(file, "utf8"));
const issues = [];
if (!story.centralTakeaway) issues.push("Missing central takeaway.");
if (!story.desiredAction) issues.push("Missing desired audience action.");
for (const slide of story.slides || []) {
  if (!slide.headline || slide.headline.split(/\s+/).length < 4) issues.push(`Slide ${slide.number}: headline is not message-led enough`);
  for (const field of ["purpose", "primaryMessage", "visualForm", "previousLink", "nextLink"]) {
    if (!(field in slide)) issues.push(`Slide ${slide.number}: missing ${field}`);
  }
}
if (!story.slides?.length) issues.push("No slides.");
if (issues.length) {
  issues.forEach((issue) => console.error(issue));
  process.exit(1);
}
console.log(`Storyline contains ${story.slides.length} message-led slides.`);
