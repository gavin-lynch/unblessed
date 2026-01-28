#!/usr/bin/env tsx
/**
 * Table example
 * 
 * Demonstrates table widget with interactive selection.
 */

import { Screen } from "@unblessed/node";
import { Table } from "../src/widgets/table.js";

const screen = new Screen({ smartCSR: true });

const table = new Table({
  keys: true,
  vi: true,
  fg: "white",
  selectedFg: "white",
  selectedBg: "blue",
  interactive: true,
  label: "Active Processes",
  width: "30%",
  height: "30%",
  border: { type: "line", fg: "cyan" },
  columnSpacing: 10,
  columnWidth: [16, 12],
  parent: screen,
});

table.focus();
table.setData({
  headers: ["col1", "col2"],
  data: [
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
  ],
});

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});

screen.render();
