#!/usr/bin/env tsx
/**
 * Log widget example
 * 
 * Demonstrates log widget with scrolling and colored output.
 */

import { Screen } from "@unblessed/node";
import { Log } from "../src/widgets/log.js";

const screen = new Screen({ smartCSR: true });

const log = new Log({
  fg: "green",
  label: "Server Log",
  height: "20%",
  tags: true,
  border: { type: "line", fg: "cyan" },
  parent: screen,
});

let i = 0;
setInterval(() => {
  log.log("new {red-fg}log{/red-fg} line " + i++);
  screen.render();
}, 500);

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});

screen.render();
