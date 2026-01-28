#!/usr/bin/env tsx
/**
 * Map with inline markers example
 * 
 * Demonstrates world map with markers provided in constructor.
 */

import { Screen } from "@unblessed/node";
import { WorldMap } from "../../src/index.js";

const screen = new Screen({ smartCSR: true });

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

screen.append(map);

screen.render();

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});
