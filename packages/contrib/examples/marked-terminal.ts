#!/usr/bin/env tsx
/**
 * Marked-terminal example
 *
 * Demonstrates markdown rendering with checkbox support.
 */

import { Screen } from "@unblessed/node";
import { Markdown } from "../src/index.js";

const screen = new Screen({ smartCSR: true });

const markdown = new Markdown({
  parent: screen,
});

screen.append(markdown);
markdown.setMarkdown("- [x] Checkbox");
screen.render();

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});
