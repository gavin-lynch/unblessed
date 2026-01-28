#!/usr/bin/env tsx
/**
 * Bar chart example
 *
 * Demonstrates basic bar chart usage with server utilization data.
 */

import { Screen } from "@unblessed/node";
import { Bar } from "../src/widgets/bar.js";

const screen = new Screen({ smartCSR: true });

const bar = new Bar({
  label: "Server Utilization (%)",
  barWidth: 4,
  barSpacing: 6,
  xOffset: 0,
  maxHeight: 9,
  height: "40%",
  parent: screen,
});

// Must append to screen before calling setData() so canvas can be initialized
screen.append(bar);

bar.setData({
  titles: ["bar1", "bar2"],
  data: [5, 10],
});

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});

screen.render();
