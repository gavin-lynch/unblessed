#!/usr/bin/env tsx
/*
 * Debug helper for Diff widget highlighting output.
 * Writes a text dump so we can inspect raw ANSI/control bytes.
 */

import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { highlight } = require("cli-highlight") as {
  highlight: (code: string, options?: Record<string, unknown>) => string;
};

const oldCode = `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`;

const newCode = `function calculateTotal(items) {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }
  return total;
}`;

function dumpLine(label: string, text: string): string {
  const hex = Array.from(text)
    .map((ch) => ch.charCodeAt(0).toString(16).padStart(2, "0"))
    .join(" ");
  const json = JSON.stringify(text);
  return [
    `## ${label}`,
    `len=${text.length}`,
    `json=${json}`,
    `hex=${hex}`,
    "",
  ].join("\n");
}

function highlightLine(line: string): string {
  return highlight(line, {
    language: "typescript",
    ignoreIllegals: true,
  });
}

const oldLine = "for (let i = 0; i < items.length; i++) {";
const newLine = "for (const item of items) {";

const output = [
  "Diff highlight debug dump",
  "",
  dumpLine("oldLine raw", oldLine),
  dumpLine("newLine raw", newLine),
  dumpLine("oldLine highlighted", highlightLine(oldLine)),
  dumpLine("newLine highlighted", highlightLine(newLine)),
  dumpLine("oldCode highlighted", highlightLine(oldCode)),
  dumpLine("newCode highlighted", highlightLine(newCode)),
].join("\n");

writeFileSync("./diff-highlight-debug.txt", output, "utf8");
console.log("Wrote diff-highlight-debug.txt");
