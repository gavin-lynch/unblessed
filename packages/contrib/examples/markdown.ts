#!/usr/bin/env tsx
/**
 * Markdown example
 * 
 * Demonstrates markdown rendering in terminal.
 * Requires optional peer dependencies: marked, marked-terminal, chalk
 */

import { Screen } from "@unblessed/node";
import { Markdown } from "../src/index.js";

const screen = new Screen({ smartCSR: true });

const markdown = new Markdown({
  parent: screen,
});

screen.append(markdown);

// Set markdown options (requires chalk)
markdown.setMarkdown(
  "# Hello \n This is **markdown** printed in the `terminal` 11",
);

screen.render();

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});
