#!/usr/bin/env tsx
/**
 * Grid no border example
 * 
 * Demonstrates grid layout without borders.
 */

import { Screen } from "@unblessed/node";
import { Grid, WorldMap } from "../src/index.js";
import { Box } from "@unblessed/core";

const screen = new Screen({ smartCSR: true });

const grid = new Grid({
  rows: 12,
  cols: 12,
  hideBorder: true,
  screen: screen,
});

const map = grid.set(0, 0, 4, 4, (opts) => new WorldMap(opts), {});

const box = grid.set(4, 4, 4, 4, (opts) => new Box(opts), {
  content: "My Box",
});

screen.render();

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});
