#!/usr/bin/env tsx
/**
 * Line chart zoomed in example
 *
 * Demonstrates line chart with a narrow Y-axis range (zoomed view).
 */

import { Screen } from "@gavin-lynch/unblessed-node";
import { Line } from "../src/index.js";

const screen = new Screen({ smartCSR: true });

const line = new Line({
  width: 80,
  height: 30,
  left: 15,
  top: 12,
  xPadding: 5,
  minY: 1000,
  maxY: 1050,
  label: "Title",
  style: { baseline: "white" },
  parent: screen,
});

const data = [
  {
    title: "us-east",
    x: ["t1", "t2", "t3", "t4"],
    y: [1010, 1040, 1020, 1030],
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
