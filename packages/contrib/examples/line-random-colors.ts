#!/usr/bin/env tsx
/**
 * Line chart with random colors example
 *
 * Demonstrates line chart with random RGB colors.
 *
 * Modern terminals with truecolor support will display these colors
 * with full 24-bit accuracy. Older terminals will use 256-color mode
 * with x256 conversion for blessed-contrib compatibility.
 */

import { Screen } from "@unblessed/node";
import { Line } from "../src/index.js";

function randomColor(): [number, number, number] {
  return [Math.random() * 255, Math.random() * 255, Math.random() * 255];
}

const screen = new Screen({ smartCSR: true });

const line = new Line({
  width: 80,
  height: 30,
  left: 15,
  top: 12,
  xPadding: 5,
  minY: 30,
  maxY: 90,
  label: "Title",
  style: {
    line: randomColor(),
    text: randomColor(),
    baseline: randomColor(),
  },
  parent: screen,
});

const data = [
  {
    title: "us-east",
    x: ["t1", "t2", "t3", "t4"],
    y: [50, 88, 72, 91],
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
