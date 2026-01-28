#!/usr/bin/env tsx
/**
 * Test truecolor background codes directly
 */

import { Box } from "@unblessed/core";
import { Screen } from "@unblessed/node";

const screen = new Screen({ smartCSR: true });

// Test 1: Direct terminal output
console.log("=== Direct Terminal Test ===");
console.log("\x1b[48;2;40;60;40mGREEN BG\x1b[49m");
console.log("\x1b[48;2;60;40;40mRED BG\x1b[49m");
console.log("\x1b[48;2;0;80;0mBRIGHT GREEN BG\x1b[49m");
console.log("\x1b[48;2;80;0;0mBRIGHT RED BG\x1b[49m");
console.log("");

// Test 2: Box with truecolor in content
const box = new Box({
  parent: screen,
  width: "100%",
  height: "100%",
  content:
    "\x1b[48;2;40;60;40m" +
    "GREEN BACKGROUND LINE".padEnd(50, " ") +
    "\x1b[49m\n" +
    "\x1b[48;2;60;40;40m" +
    "RED BACKGROUND LINE".padEnd(50, " ") +
    "\x1b[49m\n" +
    "\x1b[48;2;0;80;0m" +
    "BRIGHT GREEN BACKGROUND LINE".padEnd(50, " ") +
    "\x1b[49m\n" +
    "\x1b[48;2;80;0;0m" +
    "BRIGHT RED BACKGROUND LINE".padEnd(50, " ") +
    "\x1b[49m",
  border: { type: "line" },
  label: "Truecolor Background Test",
});

screen.append(box);
screen.render();

// Get the actual rendered output
const content = box.content || "";
console.log("\n=== Box Content (first 500 chars) ===");
console.log(content.substring(0, 500));
console.log("\n=== Hex Dump ===");
console.log(
  Array.from(content.substring(0, 200))
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
    .join(" "),
);

setTimeout(() => {
  screen.destroy();
  process.exit(0);
}, 1000);

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});
