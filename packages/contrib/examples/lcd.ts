#!/usr/bin/env tsx
/**
 * LCD display example
 *
 * Demonstrates LCD widget with interactive controls.
 *
 * LCD Options:
 * - segmentWidth: how wide are the segments in % (default: 0.06)
 * - segmentInterval: spacing between segments in % (default: 0.11)
 * - strokeWidth: stroke width in % (default: 0.11)
 * - elements: how many characters can be displayed (default: 3)
 * - display: what should be displayed initially (default: 321)
 * - elementSpacing: spacing between each element (default: 4)
 * - elementPadding: padding from edges (default: 2)
 * - color: display color (default: "white")
 */

import { Screen } from "@gavin-lynch/unblessed-node";
import { LCD } from "../src/widgets/lcd.js";

const screen = new Screen({ smartCSR: true });

const lcd = new LCD({
  label: "Test",
  elements: 4,
  parent: screen,
});

screen.append(lcd);

setInterval(() => {
  const colors = ["green", "magenta", "cyan", "red", "blue"];
  const text = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

  const value = Math.round(Math.random() * 1000);
  lcd.setDisplay(value + text[value % 12]);
  lcd.setOptions({
    color: colors[value % 5],
    elementPadding: 5,
  });
  screen.render();
}, 1000);

screen.key(["g"], () => {
  lcd.increaseWidth();
  screen.render();
});

screen.key(["h"], () => {
  lcd.decreaseWidth();
  screen.render();
});

screen.key(["t"], () => {
  lcd.increaseInterval();
  screen.render();
});

screen.key(["y"], () => {
  lcd.decreaseInterval();
  screen.render();
});

screen.key(["b"], () => {
  lcd.increaseStroke();
  screen.render();
});

screen.key(["n"], () => {
  lcd.decreaseStroke();
  screen.render();
});

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});

screen.render();
