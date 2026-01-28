#!/usr/bin/env tsx
/**
 * Grid layout example
 *
 * Demonstrates grid-based layout for arranging widgets.
 */

import { Box, Screen } from "@unblessed/node";
import { Grid } from "../src/layout/grid.js";
import { WorldMap } from "../src/widgets/map.js";

const screen = new Screen({ smartCSR: true });

const grid = new Grid({ rows: 12, cols: 12, screen: screen });

const map = grid.set(0, 0, 4, 4, (opts) => new WorldMap(opts), {
  label: "World Map",
});

const box = grid.set(4, 4, 4, 4, (opts) => new Box(opts), {
  content: "My Box",
});

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});

screen.render();
