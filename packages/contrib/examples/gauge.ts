#!/usr/bin/env tsx
/**
 * Gauge example
 * 
 * Demonstrates basic gauge widget usage.
 */

import { Screen } from "@unblessed/node";
import { Gauge } from "../src/widgets/gauge.js";

const screen = new Screen({ smartCSR: true });

const gauge = new Gauge({
  label: "Progress",
  parent: screen,
});

// Must append to screen before calling setData/setPercent so canvas can be initialized
screen.append(gauge);

gauge.setPercent(25);

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});

screen.render();
