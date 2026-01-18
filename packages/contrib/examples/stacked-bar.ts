#!/usr/bin/env tsx
/**
 * Stacked bar chart example
 * 
 * Demonstrates stacked bar chart with multiple categories.
 */

import { Screen } from "@unblessed/node";
import { StackedBar } from "../src/index.js";

const screen = new Screen({ smartCSR: true });

const bar = new StackedBar({
  label: "Server Utilization (%)",
  barWidth: 4,
  barSpacing: 6,
  xOffset: 0,
  // maxValue: 15
  height: "40%",
  width: "50%",
  barBgColor: ["red", "blue", "green"],
  parent: screen,
});

screen.append(bar);

bar.setData({
  barCategory: ["Q1", "Q2", "Q3", "Q4"],
  stackedCategory: ["US", "EU", "AP"],
  data: [
    [7, 7, 5],
    [8, 2, 0],
    [0, 0, 0],
    [2, 3, 2],
  ],
});

screen.render();

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});
