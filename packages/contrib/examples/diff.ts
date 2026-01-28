#!/usr/bin/env tsx
/**
 * Example: Diff widget
 *
 * Shows how to use the Diff widget to display code changes
 */

import { Screen } from "@unblessed/node";
import { Diff } from "../src/widgets/diff.js";

// Force exit on SIGINT/SIGTERM for debugging
if (process.env.DEBUG_DIFF_COLORS || process.env.DEBUG_RENDERING) {
  process.on("SIGINT", () => process.exit(0));
  process.on("SIGTERM", () => process.exit(0));
}

const screen = new Screen({ smartCSR: true });

// Example: Show diff between two code versions
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
  // Enable syntax highlighting
  syntaxHighlight: true,
  // Custom colors - use truecolor RGB arrays for desaturated colors
  // These match the colors from the demo that looked correct
  additionColor: [40, 60, 40], // Desaturated dark green (truecolor)
  deletionColor: [60, 40, 40], // Desaturated dark red (truecolor)
  // You can also use:
  // - String names: "green", "red"
  // - 256-color codes: 22, 52
  // - Chalk functions: chalk.bgGreen.dim
  headerColor: "cyan",
});

screen.append(diff);

// Render multiple times to ensure layout and content are set
screen.render();
setTimeout(() => {
  screen.render();
}, 50);

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});
