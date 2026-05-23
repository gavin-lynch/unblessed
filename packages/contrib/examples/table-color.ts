#!/usr/bin/env tsx
/**
 * Table with colored content example
 *
 * Demonstrates table with colored cell content.
 */

import { Screen } from "@gavin-lynch/unblessed-node";
import { Table } from "../src/index.js";

const screen = new Screen({ smartCSR: true });

const table = new Table({
  keys: true,
  fg: "white",
  selectedFg: "white",
  selectedBg: "blue",
  interactive: false,
  label: "Active Processes",
  width: "80%",
  height: "30%",
  border: { type: "line", fg: "cyan" },
  columnSpacing: 10,
  columnWidth: [7, 12, 15],
  parent: screen,
});

table.focus();
screen.append(table);

// Note: colors package is not available, so we'll use ANSI codes directly
// In a real scenario, you'd use colors.blue() or similar
table.setData({
  headers: ["col1", "col2", "col3"],
  data: [
    ["\x1b[34m1111\x1b[0m", "22222", "55555"], // blue text
    ["33333", "44444", "66666"],
  ],
});

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});

screen.render();
