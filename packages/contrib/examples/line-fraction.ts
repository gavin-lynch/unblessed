#!/usr/bin/env tsx
/**
 * Line chart with fractional numbers example
 *
 * Demonstrates line chart with fractional Y-axis labels.
 */

import { Screen } from "@unblessed/node";
import { Line } from "../src/index.js";

const screen = new Screen({ smartCSR: true });

const line = new Line({
  width: 80,
  height: 30,
  left: 15,
  top: 12,
  xPadding: 5,
  label: "Title",
  numYLabels: 7,
  // wholeNumbersOnly: true
  parent: screen,
});

const data = [
  {
    title: "us-east",
    x: ["t1", "t2", "t3", "t4"],
    y: [0, 0.0695652173913043, 0.11304347826087, 2],
    style: {
      line: "red",
    },
  },
];

screen.append(line); // must append before setting data
line.setData(data);

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});

screen.render();
