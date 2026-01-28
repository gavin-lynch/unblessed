#!/usr/bin/env tsx
/**
 * Donut chart with inline data example
 *
 * Demonstrates donut chart with data provided in constructor.
 */

import { Screen } from "@unblessed/node";
import { Donut } from "../../src/index.js";

const screen = new Screen({ smartCSR: true });

const donut = new Donut({
  data: [
    { color: "red", percent: "50", label: "a" },
    { color: "blue", percent: "20", label: "b" },
    { color: "yellow", percent: "80", label: "c" },
  ],
  parent: screen,
});

screen.append(donut);

screen.render();

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});
