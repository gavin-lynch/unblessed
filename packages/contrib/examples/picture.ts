#!/usr/bin/env tsx
/**
 * Picture example
 * 
 * Demonstrates image display in terminal.
 * Requires optional peer dependency: picture-tuber
 * 
 * Note: The image file path should be relative to where the script is run.
 */

import { Screen } from "@unblessed/node";
import { Picture } from "../src/index.js";

const screen = new Screen({ smartCSR: true });

function ready() {
  screen.render();
}

const pic = new Picture({
  file: "./media/flower.png",
  cols: 95,
  onReady: ready,
  parent: screen,
});

screen.append(pic);

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});
