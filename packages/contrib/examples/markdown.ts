#!/usr/bin/env tsx
/**
 * Markdown example
 *
 * Demonstrates markdown rendering with terminal formatting.
 * Requires: marked, marked-terminal, chalk (peer dependencies)
 */

import { Screen } from "@gavin-lynch/unblessed-node";
import chalk from "chalk";
import { Markdown } from "../src/widgets/markdown.js";

const screen = new Screen({ smartCSR: true });

const markdown = new Markdown({
  parent: screen,
  width: "100%",
  height: "100%",
  label: "Markdown Example",
});

screen.append(markdown);

// Set custom styles (blessed-contrib compatibility)
markdown.setOptions({ firstHeading: chalk.red.italic });

// Set markdown content
markdown.setMarkdown(
  "# Hello \n This is **markdown** printed in the `terminal`",
);

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});

screen.render();
