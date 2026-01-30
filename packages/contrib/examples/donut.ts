#!/usr/bin/env tsx
/**
 * Donut chart example
 *
 * Demonstrates donut chart with animated updates.
 */

import { Screen } from "@unblessed/node";
import { Donut } from "../src/widgets/donut.js";

const screen = new Screen({ smartCSR: true });

/**
 * Donut Options:
 * - stroke: line color (default: "magenta")
 * - radius: donut radius (default: 14)
 * - arcWidth: width of the arc (default: 4)
 * - spacing: spacing between segments (default: 2)
 * - yPadding: padding from top (default: 2)
 */
const donut = new Donut({
  label: "Test",
  radius: 8,
  arcWidth: 3,
  yPadding: 2,
  data: [{ percent: 80, label: "web1", color: "green" }],
  parent: screen,
});

// Must append to screen before calling update/setData so canvas can be initialized
screen.append(donut);

let pct = 0.0;

function updateDonuts() {
  if (pct > 0.99) pct = 0.0;
  donut.update([
    {
      percent: parseFloat(((pct + 0.0) % 1).toFixed(2)),
      label: "rcp",
      color: [100, 200, 170],
    },
    {
      percent: parseFloat(((pct + 0.25) % 1).toFixed(2)),
      label: "rcp",
      color: [128, 128, 128],
    },
    {
      percent: parseFloat(((pct + 0.5) % 1).toFixed(2)),
      label: "rcp",
      color: [255, 0, 0],
    },
    {
      percentAltNumber: 42,
      percent: parseFloat(((pct + 0.75) % 1).toFixed(2)),
      label: "web1",
      color: [255, 128, 0],
    },
  ]);
  screen.render();
  pct += 0.01;
}

setInterval(updateDonuts, 10);

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});

screen.render();
