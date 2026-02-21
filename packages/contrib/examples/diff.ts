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

const screen = new Screen({
  smartCSR: true,
  forceUnicode: true,
  fullUnicode: true,
});
// Disable ACS line drawing to prevent charset bleed
screen.program.tput.brokenACS = true;
screen.program.tput.unicode = true;

// Example: Show diff between two code versions
const oldCode = `export function calculateTotal(items) {
  let total = 0;
  const taxRate = 0.0825;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item || item.price == null) {
      continue;
    }
    total += item.price;
  }
  return total;
}

class Checkout {
  constructor(userId) {
    this.userId = userId;
  }

  applyDiscount(total, code) {
    if (code === "SUMMER") return total * 0.9;
    if (code === "VIP") return total * 0.8;
    return total;
  }
}

const items = [{ price: 10 }, { price: 5 }];
const checkout = new Checkout("user_123");
const subtotal = calculateTotal(items);
const finalTotal = checkout.applyDiscount(subtotal, "SUMMER");
console.log(finalTotal, taxRate);`;

const newCode = `export function calculateTotal(items) {
  let total = 0;
  const taxRate = 0.0825;
  for (const item of items) {
    if (!item || item.price == null) {
      continue;
    }
    total += item.price * item.quantity;
  }
  return total;
}

class Checkout {
  constructor(userId) {
    this.userId = userId;
  }

  applyDiscount(total, code) {
    if (code === "SUMMER") return total * 0.9;
    if (code === "VIP") return total * 0.8;
    return total;
  }
}

const items = [{ price: 10, quantity: 2 }, { price: 5, quantity: 1 }];
const checkout = new Checkout("user_123");
const subtotal = calculateTotal(items);
const finalTotal = checkout.applyDiscount(subtotal, "SUMMER");
console.log(finalTotal, taxRate);`;

const diff = new Diff({
  parent: screen,
  width: "100%",
  height: "100%",
  // No label/border for baseline text rendering
  oldContent: oldCode,
  newContent: newCode,
  oldFileName: "src/utils.ts",
  newFileName: "src/utils.ts",
  contextLines: 2,
  showLineNumbers: true,
  // Re-enable syntax highlighting
  syntaxHighlight: true,
  // Re-enable background colors
  additionColor: [40, 60, 40],
  deletionColor: [60, 40, 40],
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
