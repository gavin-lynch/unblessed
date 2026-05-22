#!/usr/bin/env tsx
/*
 * Debug helper for Diff widget rendering.
 * Captures raw content, parsed content, and _clines data.
 */

import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
const { Screen } = require("@unblessed/node") as { Screen: any };
const { Diff } = require("../packages/contrib/src/widgets/diff.js") as {
  Diff: any;
};
const highlightRequire = createRequire(
  resolve("./packages/contrib/package.json"),
);
const { highlight } = highlightRequire("cli-highlight") as {
  highlight: (code: string, options?: Record<string, unknown>) => string;
};

process.env.FORCE_COLOR = process.env.FORCE_COLOR || "1";

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

function findLine(lines: string[], needle: string): string {
  const idx = lines.findIndex((line) => line.includes(needle));
  if (idx === -1) return "";
  return lines[idx] ?? "";
}

function stripAnsi(text: string): string {
  const ansiRegex = new RegExp("\\x1b\\[[0-9;]*m", "g");
  return text.replace(ansiRegex, "");
}

function findLineWithIndex(lines: string[], needle: string): [number, string] {
  const idx = lines.findIndex((line) => stripAnsi(line).includes(needle));
  if (idx === -1) return [-1, ""];
  return [idx, lines[idx] ?? ""];
}

const screen = new Screen({ smartCSR: true });
const program = screen.program;
let writeBuffer = "";
if (program && typeof program._write === "function") {
  const originalWrite = program._write.bind(program);
  program._write = (data: any) => {
    if (typeof data === "string") writeBuffer += data;
    return originalWrite(data);
  };
}

const diff = new Diff({
  parent: screen,
  width: 120,
  height: 40,
  label: "Code Diff",
  border: { type: "line" },
  oldContent: oldCode,
  newContent: newCode,
  oldFileName: "src/utils.ts",
  newFileName: "src/utils.ts",
  contextLines: 2,
  showLineNumbers: true,
  syntaxHighlight: true,
  additionColor: [40, 60, 40],
  deletionColor: [60, 40, 40],
  headerColor: "cyan",
});

(diff as any)._renderDiff();
screen.render();

const detectedLanguage = (diff as any)._detectLanguage?.();
const highlightSample = highlight("for (let i = 0; i < 1; i++) {", {
  language: detectedLanguage || "typescript",
  ignoreIllegals: true,
});

const rawContent = diff.content ?? "";
const parsedContent = diff.getContent();
const clines = (diff as any)._clines?.fake ?? [];

const rawLines = rawContent.split("\n");
const parsedLines = parsedContent.split("\n");
const clineLines = Array.isArray(clines) ? clines : [];

const [rawForIndex, rawForLine] = findLineWithIndex(rawLines, "for (");
const [parsedForIndex, parsedForLine] = findLineWithIndex(parsedLines, "for (");
const [clineForIndex, clineForLine] = findLineWithIndex(clineLines, "for (");

const escRegex = new RegExp("\\x1b", "g");
const escCount = (text: string) => (text.match(escRegex) || []).length;
const fgTruecolorRegex = new RegExp("\\x1b\\[38;2;", "g");
const bgTruecolorRegex = new RegExp("\\x1b\\[48;2;", "g");
const fgTruecolorCount = (writeBuffer.match(fgTruecolorRegex) || []).length;
const bgTruecolorCount = (writeBuffer.match(bgTruecolorRegex) || []).length;

const screenLines = screen.lines || [];
let screenForIndex = -1;
let screenForLine = "";
let screenForCells: any[] = [];
let tcSampleLineIndex = -1;
let tcSampleLine = "";
let tcSampleDump = "";
const screenLinePreview: string[] = [];

for (let y = 0; y < screenLines.length; y++) {
  const line = screenLines[y] as any[];
  if (!line) continue;
  let text = "";
  for (let x = 0; x < line.length; x++) {
    const cell = line[x];
    if (!cell) continue;
    text += cell[1] || " ";
  }
  if (y < 12) {
    screenLinePreview.push(`${y}:${JSON.stringify(text.trimEnd())}`);
  }
  if (text.includes("for (")) {
    screenForIndex = y;
    screenForLine = text;
    screenForCells = line;
    break;
  }
}

let screenForCellDump = "";
if (screenForIndex !== -1) {
  const start = screenForLine.indexOf("for (");
  const end = Math.min(screenForLine.length, start + 20);
  const parts: string[] = [];
  for (let x = start; x < end; x++) {
    const cell = screenForCells[x] as any;
    if (!cell) continue;
    const ch = cell[1] || " ";
    const tcBg = cell[2] ? `[${cell[2].join(",")}]` : "null";
    const tcFg = cell[3] ? `[${cell[3].join(",")}]` : "null";
    parts.push(`${x}:${JSON.stringify(ch)} bg=${tcBg} fg=${tcFg}`);
  }
  screenForCellDump = parts.join(" | ");
}

if (tcSampleLineIndex === -1) {
  for (let y = 0; y < screenLines.length; y++) {
    const line = screenLines[y] as any[];
    if (!line) continue;
    let text = "";
    let hasTc = false;
    for (let x = 0; x < line.length; x++) {
      const cell = line[x];
      if (!cell) continue;
      text += cell[1] || " ";
      if (cell[2] || cell[3]) hasTc = true;
    }
    if (hasTc) {
      tcSampleLineIndex = y;
      tcSampleLine = text;
      const parts: string[] = [];
      const end = Math.min(line.length, 40);
      for (let x = 0; x < end; x++) {
        const cell = line[x] as any;
        if (!cell) continue;
        const ch = cell[1] || " ";
        const tcBg = cell[2] ? `[${cell[2].join(",")}]` : "null";
        const tcFg = cell[3] ? `[${cell[3].join(",")}]` : "null";
        if (cell[2] || cell[3]) {
          parts.push(`${x}:${JSON.stringify(ch)} bg=${tcBg} fg=${tcFg}`);
        }
      }
      tcSampleDump = parts.join(" | ");
      break;
    }
  }
}

const output = [
  "Diff widget debug dump",
  `TERM=${process.env.TERM || ""}`,
  `LANG=${process.env.LANG || ""}`,
  `LC_ALL=${process.env.LC_ALL || ""}`,
  `FORCE_COLOR=${process.env.FORCE_COLOR || ""}`,
  `screen colorMode=${screen.getEffectiveColorMode?.() || ""}`,
  `screen colorPolicy=${JSON.stringify(screen.getColorPolicy?.() || {})}`,
  "",
  `rawContent length=${rawContent.length} esc=${escCount(rawContent)}`,
  `parsedContent length=${parsedContent.length} esc=${escCount(parsedContent)}`,
  `clines length=${clineLines.length}`,
  `render output length=${writeBuffer.length}`,
  `render output fg truecolor count=${fgTruecolorCount}`,
  `render output bg truecolor count=${bgTruecolorCount}`,
  `detected language=${detectedLanguage || ""}`,
  `highlight sample=${JSON.stringify(highlightSample)}`,
  `screen for-line index=${screenForIndex}`,
  `raw for-line index=${rawForIndex}`,
  `parsed for-line index=${parsedForIndex}`,
  `clines for-line index=${clineForIndex}`,
  `tc sample line index=${tcSampleLineIndex}`,
  "",
  `screen line preview=${JSON.stringify(screenLinePreview)}`,
  `screen for-line preview=${JSON.stringify(screenForLine.trim())}`,
  `screen for-cells=${screenForCellDump}`,
  `tc sample preview=${JSON.stringify(tcSampleLine.trim())}`,
  `tc sample cells=${tcSampleDump}`,
  "",
  dumpLine("raw for-line", rawForLine),
  dumpLine("parsed for-line", parsedForLine),
  dumpLine("clines for-line", clineForLine),
].join("\n");

writeFileSync("./diff-widget-debug.txt", output, "utf8");
screen.destroy();
console.log("Wrote diff-widget-debug.txt");
