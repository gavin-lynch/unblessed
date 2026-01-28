#!/usr/bin/env tsx
/**
 * Bar chart with inline data example
 *
 * Demonstrates bar chart with data provided in constructor.
 */

import { Screen } from "@unblessed/node";
import { Bar } from "../../src/index.js";

const screen = new Screen({ smartCSR: true });

const bar = new Bar({
  label: "Server Utilization (%)",
  barWidth: 4,
  barSpacing: 6,
  xOffset: 0,
  maxHeight: 9,
  height: "40%",
  data: {
    titles: ["bar1", "bar2"],
    data: [5, 10],
  },
  parent: screen,
});

screen.append(bar);

screen.render();

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});
