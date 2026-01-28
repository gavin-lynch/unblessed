#!/usr/bin/env tsx
/**
 * Multi-line chart example
 *
 * Demonstrates line chart with multiple data series.
 */

import { Screen } from "@unblessed/node";
import { Line } from "../src/widgets/line.js";

const screen = new Screen({ smartCSR: true });

const line = new Line({
  width: 80,
  height: 30,
  left: 15,
  top: 12,
  xPadding: 5,
  label: "Title",
  showLegend: true,
  legend: { width: 12 },
  parent: screen,
});

const data = [
  {
    title: "us-east",
    x: ["t1", "t2", "t3", "t4"],
    y: [5, 1, 7, 5],
    style: {
      line: "red",
    },
  },
  {
    title: "us-west",
    x: ["t1", "t2", "t3", "t4"],
    y: [2, 4, 9, 8],
    style: { line: "yellow" },
  },
  {
    title: "eu-north-with-some-long-string",
    x: ["t1", "t2", "t3", "t4"],
    y: [22, 7, 12, 1],
    style: { line: "blue" },
  },
];

// Must append to screen before calling setData so canvas can be initialized
screen.append(line);
line.setData(data);

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});

screen.render();
