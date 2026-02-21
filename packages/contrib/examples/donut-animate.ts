#!/usr/bin/env tsx
/**
 * Donut animation example
 *
 * Demonstrates animating between two datasets with easing.
 */

import { Screen } from "@unblessed/node";
import { Donut } from "../src/widgets/donut.js";

const screen = new Screen({ smartCSR: true });

const donut = new Donut({
  label: "Animated",
  width: "100%",
  height: "100%",
  radius: 22,
  arcWidth: 8,
  yPadding: 2,
  parent: screen,
});

screen.append(donut);

let current = [0.12, 0.42];
let target = [0.63, 0.42];
const labels = ["rcp", "web1"];
const colors = [
  [100, 200, 170],
  [255, 128, 0],
];

const durationMs = 1200;
const tickMs = 30;
const holdMs = 3000;
let startTime = Date.now();
let phase: "animating" | "holding" = "animating";

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function randomTarget(): number[] {
  return [Math.random() * 0.95, 0.42];
}

function renderValues(values: number[]): void {
  donut.update(
    values.map((value, index) => ({
      percent: clamp(value, 0, 1),
      label: labels[index]!,
      color: colors[index]!,
      percentAltNumber: index === 1 ? 42 : undefined,
    })),
  );
  screen.render();
}

function update(): void {
  const now = Date.now();
  const elapsed = now - startTime;

  if (phase === "holding") {
    if (elapsed >= holdMs) {
      phase = "animating";
      startTime = Date.now();
      target = randomTarget();
    }
    return;
  }

  const t = clamp(elapsed / durationMs, 0, 1);
  const eased = easeOutBack(t);

  const nextValues = current.map(
    (value, index) => value + (target[index] - value) * eased,
  );
  renderValues(nextValues);

  if (t >= 1) {
    current = target.slice();
    renderValues(current);
    phase = "holding";
    startTime = Date.now();
  }
}

const interval = setInterval(update, tickMs);

screen.key(["escape", "q", "C-c"], () => {
  clearInterval(interval);
  screen.destroy();
  process.exit(0);
});

renderValues(current);
