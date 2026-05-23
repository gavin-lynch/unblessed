#!/usr/bin/env tsx
/**
 * Debug test for map hanging issue
 */

import { Screen } from "@gavin-lynch/unblessed-node";
import { WorldMap } from "./src/index.js";

console.log("[Test] Starting map test...");

const screen = new Screen({ smartCSR: true });
console.log("[Test] Screen created");

const map = new WorldMap({
  label: "World Map",
  width: "100%",
  height: "100%",
  markers: [
    { lon: "-79.0000", lat: "37.5000", color: "red", char: "X" },
    { lon: "79.0000", lat: "37.5000", color: "blue", char: "O" },
  ],
  parent: screen,
});
console.log("[Test] Map widget created");

screen.append(map);
console.log("[Test] Map appended to screen");
console.log("[Test] Map dimensions:", map.width, "x", map.height);
console.log("[Test] Screen dimensions:", screen.width, "x", screen.height);

screen.render();
console.log("[Test] Screen rendered");
console.log(
  "[Test] After render - Map dimensions:",
  map.width,
  "x",
  map.height,
);
console.log(
  "[Test] After render - Map canvas:",
  map._canvas ? "exists" : "missing",
);
console.log("[Test] After render - Map ctx:", map.ctx ? "exists" : "missing");

// Set a timeout to detect if process hangs
setTimeout(() => {
  console.log("[Test] 5 second timeout reached - process may be hanging");
  process.exit(1);
}, 5000);

screen.key(["escape", "q", "C-c"], () => {
  console.log("[Test] Exit key pressed");
  screen.destroy();
  process.exit(0);
});

console.log("[Test] Setup complete, waiting for events...");
