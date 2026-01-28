#!/usr/bin/env tsx
/**
 * Sparkline example
 *
 * Demonstrates sparkline widget usage.
 */

import { Screen } from "@unblessed/node";
import { Sparkline } from "../src/widgets/sparkline.js";

const screen = new Screen({ smartCSR: true });

const spark = new Sparkline({
  label: "Sparkline",
  tags: true,
  border: { type: "line", fg: "cyan" },
  width: "50%",
  height: "50%",
  style: { fg: "blue" },
  parent: screen,
});

// Append to screen (sparkline doesn't use canvas but good practice)
screen.append(spark);

spark.setData(
  ["Sparkline1", "Sparkline2"],
  [
    [10, 20, 30, 20, 50, 70, 60, 30, 35, 38],
    [40, 10, 40, 50, 20, 30, 20, 20, 19, 40],
  ],
);

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});

screen.render();
