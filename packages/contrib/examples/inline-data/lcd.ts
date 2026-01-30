#!/usr/bin/env tsx
/**
 * LCD with inline data example
 *
 * Demonstrates LCD display with data provided in constructor.
 */

import { Screen } from "@unblessed/node";
import { Grid, LCD, WorldMap } from "../../src/index.js";

const screen = new Screen({ smartCSR: true });

const grid = new Grid({ rows: 12, cols: 12, screen: screen });

const _map = grid.set(0, 0, 4, 4, (opts) => new WorldMap(opts), {
  label: "World Map",
});

const _lcd = grid.set(4, 4, 4, 4, (opts) => new LCD(opts), {
  label: "LCD Test",
  segmentWidth: 0.06,
  segmentInterval: 0.11,
  strokeWidth: 0.1,
  elements: 5,
  display: 3210,
  elementSpacing: 4,
  elementPadding: 2,
});

screen.render();

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});
