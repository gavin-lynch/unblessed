#!/usr/bin/env tsx
/**
 * Gauge stack example
 * 
 * Demonstrates a single gauge with stacked percentages.
 */

import { Screen } from "@unblessed/node";
import { Grid, Gauge } from "../src/index.js";

const screen = new Screen({ smartCSR: true });

const grid = new Grid({
  rows: 2,
  cols: 2,
  hideBorder: true,
  screen: screen,
});

const gauge1 = grid.set(0, 0, 1, 1, (opts) => new Gauge(opts), {
  showLabel: false,
  stack: [
    { percent: 30, stroke: "green" },
    { percent: 30, stroke: "magenta" },
    { percent: 40, stroke: "cyan" },
  ],
});

screen.render();

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});
