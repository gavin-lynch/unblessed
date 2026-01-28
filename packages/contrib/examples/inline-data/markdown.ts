#!/usr/bin/env tsx
/**
 * Markdown with inline content example
 * 
 * Demonstrates markdown widget with content provided in constructor.
 * Requires optional peer dependencies: marked, marked-terminal, chalk
 */

import { Screen } from "@unblessed/node";
import { Markdown } from "../../src/index.js";

const screen = new Screen({ smartCSR: true });

const markdown = new Markdown({
  markdown: "# Hello \n blessed-contrib renders markdown using `marked-terminal` ",
  markdownStyle: { firstHeading: "chalk.green.italic" },
  parent: screen,
});

screen.append(markdown);

screen.render();

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});
