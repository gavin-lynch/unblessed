#!/usr/bin/env tsx
/**
 * Debug truecolor rendering - comprehensive logging
 */

import { getRuntime } from "@gavin-lynch/unblessed-core";
import { Screen } from "@gavin-lynch/unblessed-node";
import { Diff } from "../src/widgets/diff.js";

// Enable all debug flags
process.env.DEBUG_DIFF_COLORS = "1";
process.env.DEBUG_RENDERING = "1";
process.env.DEBUG_ELEMENT = "1";

const screen = new Screen({ smartCSR: true, fullUnicode: true });

// Check terminal size
const runtime = getRuntime();
console.log("=== TERMINAL SIZE ===");
console.log("screen.width:", screen.width);
console.log("screen.height:", screen.height);
console.log("runtime.process.stdout.columns:", runtime.process.stdout?.columns);
console.log("runtime.process.stdout.rows:", runtime.process.stdout?.rows);
console.log("process.stdout.columns:", process.stdout.columns);
console.log("process.stdout.rows:", process.stdout.rows);
console.log("");

// Force screen to calculate dimensions
screen.render();

console.log("=== AFTER FIRST RENDER ===");
console.log("screen.width:", screen.width);
console.log("screen.height:", screen.height);
console.log("");

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

console.log("=== CREATING DIFF WIDGET ===\n");

const diff = new Diff({
  parent: screen,
  width: "100%",
  height: "100%",
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
});

// Force layout by rendering the screen
screen.render();

console.log("\n=== DIFF CONTENT ===\n");
const content = diff.content || "";
console.log("Content length:", content.length);
console.log("Content (first 500 chars):");
console.log(JSON.stringify(content.substring(0, 500)));
console.log("\nContent (hex dump, first 200 bytes):");
const hexDump = Array.from(content.substring(0, 200))
  .map((c, i) => {
    const hex = c.charCodeAt(0).toString(16).padStart(2, "0");
    const char = c >= " " && c <= "~" ? c : ".";
    return `${i.toString(16).padStart(4, "0")}: ${hex} '${char}'`;
  })
  .join("\n");
console.log(hexDump);

console.log("\n=== DIFF WIDGET STATE (BEFORE RENDER) ===\n");
console.log("diff.width:", diff.width);
console.log("diff.height:", diff.height);
console.log("diff.content length:", (diff.content || "").length);
console.log("diff._pcontent length:", (diff._pcontent || "").length);
console.log(
  "diff._clines:",
  diff._clines ? `length=${diff._clines.length}` : "null",
);
console.log(
  "diff.lpos:",
  diff.lpos
    ? `${diff.lpos.xl - diff.lpos.xi} x ${diff.lpos.yl - diff.lpos.yi}`
    : "null",
);

console.log("\n=== RENDERING ===\n");
screen.render();

console.log("\n=== DIFF WIDGET STATE (AFTER RENDER) ===\n");
console.log("diff.width:", diff.width);
console.log("diff.height:", diff.height);
console.log("diff.content length:", (diff.content || "").length);
console.log("diff._pcontent length:", (diff._pcontent || "").length);
console.log(
  "diff.lpos:",
  diff.lpos
    ? `${diff.lpos.xl - diff.lpos.xi} x ${diff.lpos.yl - diff.lpos.yi}`
    : "null",
);

console.log("\n=== SCREEN LINES (first 20 lines, first 50 cells) ===\n");
const lines = screen.lines;
for (let y = 0; y < Math.min(20, lines.length); y++) {
  const line = lines[y];
  if (!line) {
    console.log(`Line ${y}: (empty)`);
    continue;
  }
  console.log(`Line ${y} (length=${line.length}):`);
  let cellsShown = 0;
  for (let x = 0; x < Math.min(50, line.length) && cellsShown < 30; x++) {
    const cell = line[x];
    if (!cell) continue;
    const [attr, ch, truecolorBg, truecolorFg] = cell;
    const chStr =
      typeof ch === "string" ? JSON.stringify(ch.substring(0, 20)) : String(ch);
    const bgStr = truecolorBg ? `bg[${truecolorBg.join(",")}]` : "bg:null";
    const fgStr = truecolorFg ? `fg[${truecolorFg.join(",")}]` : "fg:null";
    // Only show non-blank cells or cells with truecolor
    if (ch !== " " || truecolorBg || truecolorFg) {
      console.log(`  [${x}]: attr=${attr} ch=${chStr} ${bgStr} ${fgStr}`);
      cellsShown++;
    }
  }
  if (cellsShown === 0) {
    console.log(`  (all blank cells)`);
  }
}

// Write detailed debug output to file
const debugOutput = `
=== DIFF TRUECOLOR DEBUG ===

Content length: ${content.length}
Content preview (first 1000 chars):
${JSON.stringify(content.substring(0, 1000))}

Content hex dump (first 500 bytes):
${Array.from(content.substring(0, 500))
  .map((c, i) => {
    const hex = c.charCodeAt(0).toString(16).padStart(2, "0");
    const char = c >= " " && c <= "~" ? c : ".";
    return `${i.toString(16).padStart(4, "0")}: ${hex} '${char}'`;
  })
  .join("\n")}

Screen lines analysis (first 20 lines, first 30 cells each):
${lines
  .slice(0, 20)
  .map((line, y) => {
    if (!line) return `Line ${y}: (empty)`;
    return `Line ${y}:\n${line
      .slice(0, 30)
      .map((cell, x) => {
        if (!cell) return `  [${x}]: (empty)`;
        const [attr, ch, truecolorBg, truecolorFg] = cell;
        const chStr =
          typeof ch === "string"
            ? JSON.stringify(ch.substring(0, 50))
            : String(ch);
        const bgStr = truecolorBg ? `bg[${truecolorBg.join(",")}]` : "bg:null";
        const fgStr = truecolorFg ? `fg[${truecolorFg.join(",")}]` : "fg:null";
        return `  [${x}]: attr=${attr} ch=${chStr} ${bgStr} ${fgStr}`;
      })
      .join("\n")}`;
  })
  .join("\n\n")}
`;

const outputPath = "/tmp/diff-truecolor-debug.txt";
runtime.fs.writeFileSync(outputPath, debugOutput);
console.log(`\n=== Debug output written to: ${outputPath} ===\n`);

// Auto-exit after a delay
setTimeout(() => {
  screen.destroy();
  process.exit(0);
}, 2000);

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});
