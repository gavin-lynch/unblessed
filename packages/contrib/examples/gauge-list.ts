#!/usr/bin/env tsx
/**
 * Gauge list example
 *
 * Demonstrates multiple stacked gauges in a list.
 */

import { Screen } from "@unblessed/node";
import { GaugeList, Grid } from "../src/index.js";

const screen = new Screen({ smartCSR: true });

const grid = new Grid({
  rows: 2,
  cols: 2,
  hideBorder: true,
  screen: screen,
});

const gaugeList = grid.set(0, 0, 1, 2, (opts) => new GaugeList(opts), {
  gaugeSpacing: 0,
  gaugeHeight: 1,
  gauges: [
    {
      showLabel: false,
      stack: [
        { percent: 30, stroke: "green" },
        { percent: 30, stroke: "magenta" },
        { percent: 40, stroke: "cyan" },
      ],
    },
    {
      showLabel: false,
      stack: [
        { percent: 40, stroke: "yellow" },
        { percent: 20, stroke: "magenta" },
        { percent: 40, stroke: "green" },
      ],
    },
    {
      showLabel: false,
      stack: [
        { percent: 50, stroke: "red" },
        { percent: 10, stroke: "magenta" },
        { percent: 40, stroke: "cyan" },
      ],
    },
  ],
});

screen.render();

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});
