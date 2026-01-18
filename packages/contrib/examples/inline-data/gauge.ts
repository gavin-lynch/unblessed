#!/usr/bin/env tsx
/**
 * Gauge with inline data example
 * 
 * Demonstrates gauge with data provided in constructor.
 */

import { Screen } from "@unblessed/node";
import { Gauge } from "../../src/index.js";

const screen = new Screen({ smartCSR: true });

const gauge = new Gauge({
  label: "Progress",
  percent: 25,
  parent: screen,
});

screen.append(gauge);
screen.render();

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});
