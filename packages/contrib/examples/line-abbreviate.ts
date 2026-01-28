#!/usr/bin/env tsx
/**
 * Line chart with abbreviated numbers example
 * 
 * Demonstrates line chart with number abbreviation (1k, 1m, etc.).
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
  abbreviate: true,
  style: { baseline: "white" },
  parent: screen,
});

const data = [
  {
    title: "us-east",
    x: ["t1", "t2", "t3", "t4"],
    y: [5, 8800, 99999, 3179000000],
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
