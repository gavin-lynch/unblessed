#!/usr/bin/env tsx
/**
 * Debug diff colors - tests color rendering and conversion
 *
 * This helps diagnose:
 * 1. RGB to 256-color conversion
 * 2. ANSI code generation
 * 3. Terminal color support
 * 4. Actual rendered output
 */

import { getRuntime } from "@unblessed/core";
import { Screen } from "@unblessed/node";
import chalk from "chalk";
import x256 from "x256";
import { Diff } from "../src/widgets/diff.js";

// Enable debug logging
process.env.DEBUG_DIFF_COLORS = "1";

const screen = new Screen({ smartCSR: true });

// Test colors
const greenRgb = [40, 60, 40];
const redRgb = [60, 40, 40];

console.log("=== DIFF COLOR DEBUG ===\n");

// Test 1: RGB to 256-color conversion
console.log("1. RGB to 256-color conversion:");
const greenCode = x256(greenRgb[0], greenRgb[1], greenRgb[2]);
const redCode = x256(redRgb[0], redRgb[1], redRgb[2]);
console.log(
  `   Green RGB [${greenRgb.join(", ")}] → 256-color code: ${greenCode}`,
);
console.log(`   Red RGB [${redRgb.join(", ")}] → 256-color code: ${redCode}`);
console.log(
  `   Codes are different: ${greenCode !== redCode ? "YES ✓" : "NO ✗"}\n`,
);

// Test 2: ANSI code generation
console.log("2. ANSI code generation:");
const greenAnsi = `\x1b[48;5;${greenCode}m`;
const redAnsi = `\x1b[48;5;${redCode}m`;
const resetAnsi = `\x1b[49m`;
console.log(`   Green ANSI: ${JSON.stringify(greenAnsi)}`);
console.log(`   Red ANSI: ${JSON.stringify(redAnsi)}`);
console.log(`   Reset ANSI: ${JSON.stringify(resetAnsi)}\n`);

// Test 3: Terminal color support
console.log("3. Terminal color support:");
const runtime = getRuntime();
const colorDepth = runtime.process.stdout?.getColorDepth?.() || 0;
const colorTerm = process.env.COLORTERM || "";
const term = process.env.TERM || "";
console.log(`   Color depth: ${colorDepth}`);
console.log(`   Supports 256 colors: ${colorDepth >= 8 ? "YES" : "NO"}`);
console.log(`   Supports truecolor: ${colorDepth >= 24 ? "YES" : "NO"}`);
console.log(`   COLORTERM: ${colorTerm || "not set"}`);
console.log(`   TERM: ${term || "not set"}`);
console.log(`   isTTY: ${runtime.process.stdout?.isTTY || false}`);
console.log(`   FORCE_COLOR: ${process.env.FORCE_COLOR || "not set"}`);
// Check truecolor support
const supportsTruecolor =
  colorDepth >= 24 ||
  colorTerm.includes("truecolor") ||
  colorTerm.includes("24bit");
console.log(
  `   Supports truecolor (calculated): ${supportsTruecolor ? "YES" : "NO"}\n`,
);

// Test 4: Direct color rendering test
console.log("4. Direct color rendering test:");
console.log("   Green background (should be dark green):");
console.log(`   ${greenAnsi}${" ".repeat(50)}${resetAnsi}`);
console.log("   Red background (should be dark red):");
console.log(`   ${redAnsi}${" ".repeat(50)}${resetAnsi}`);
console.log("   Side by side comparison:");
console.log(`   ${greenAnsi}GREEN${resetAnsi}${redAnsi}RED${resetAnsi}\n`);

// Test 5: Chalk comparison
console.log("5. Chalk color comparison:");
console.log(`   chalk.bgGreen: ${chalk.bgGreen("GREEN")}`);
console.log(`   chalk.bgRed: ${chalk.bgRed("RED")}`);
console.log(`   chalk.bgGreen.dim: ${chalk.bgGreen.dim("GREEN DIM")}`);
console.log(`   chalk.bgRed.dim: ${chalk.bgRed.dim("RED DIM")}\n`);

// Test 6: Create diff widget and inspect
console.log("6. Creating diff widget...");
const oldCode = `function test() {
  return "old";
}`;

const newCode = `function test() {
  return "new";
}`;

const diff = new Diff({
  parent: screen,
  width: "100%",
  height: "100%",
  oldContent: oldCode,
  newContent: newCode,
  oldFileName: "test.ts",
  newFileName: "test.ts",
  syntaxHighlight: true,
  additionColor: greenRgb,
  deletionColor: redRgb,
});

// Get the rendered content
screen.render();
const content = diff.content || "";

// Write debug output to file
const outputPath = "/tmp/diff-color-debug.txt";
runtime.fs.writeFileSync(
  outputPath,
  `=== DIFF COLOR DEBUG OUTPUT ===\n\n` +
    `Green RGB: [${greenRgb.join(", ")}]\n` +
    `Red RGB: [${redRgb.join(", ")}]\n` +
    `Green 256-color code: ${greenCode}\n` +
    `Red 256-color code: ${redCode}\n` +
    `Color depth: ${colorDepth}\n` +
    `Supports 256 colors: ${colorDepth >= 8}\n` +
    `Supports truecolor: ${colorDepth >= 24}\n\n` +
    `Green ANSI: ${JSON.stringify(greenAnsi)}\n` +
    `Red ANSI: ${JSON.stringify(redAnsi)}\n\n` +
    `Rendered content (first 1000 chars):\n${content.substring(0, 1000)}\n\n` +
    `Rendered content (hex dump of first 500 bytes):\n${Array.from(
      content.substring(0, 500),
    )
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join(" ")}\n\n` +
    `Has green ANSI codes: ${content.includes(greenAnsi)}\n` +
    `Has red ANSI codes: ${content.includes(redAnsi)}\n`,
);

console.log(`\nDebug output written to: ${outputPath}`);
console.log(
  `Content preview (first 300 chars):\n${content.substring(0, 300)}\n`,
);

// Show the diff for visual inspection
// Auto-exit after a delay for debugging
setTimeout(() => {
  screen.destroy();
  process.exit(0);
}, 1000);

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});
