#!/usr/bin/env tsx
/**
 * Perf overlay example
 *
 * Shows live FPS stats using @unblessed/perf.
 */

import { Box, Screen } from "@unblessed/node";
import { createPerfOverlay, installRenderPerfObserver } from "@unblessed/perf";
import { appendFileSync, writeFileSync } from "fs";

const screen = new Screen({
  smartCSR: true,
});

const perf = installRenderPerfObserver({ targetFps: 60 });
(createPerfOverlay as any)(screen, perf, { label: "render" });

const logPath = "./perf-overlay.log";
writeFileSync(
  logPath,
  "fps,avgMs,renderAvgMs,outputAvgMs,p95Ms,dropped,bytesPerSec,flushAvg\n",
  "utf8",
);
const logTimer = setInterval(() => {
  const stats = perf.getStats() as unknown as {
    fpsAvg: number;
    avgMs: number;
    renderAvgMs: number;
    outputAvgMs: number;
    p95Ms: number;
    dropped: number;
    bytesPerSec: number;
    flushAvg: number;
  };
  appendFileSync(
    logPath,
    `${stats.fpsAvg.toFixed(2)},${stats.avgMs.toFixed(2)},${stats.renderAvgMs.toFixed(2)},${stats.outputAvgMs.toFixed(2)},${stats.p95Ms.toFixed(2)},${stats.dropped},${stats.bytesPerSec.toFixed(0)},${stats.flushAvg.toFixed(2)}\n`,
    "utf8",
  );
}, 1000);

const status = new Box({
  parent: screen,
  top: "center",
  left: "center",
  width: 40,
  height: 7,
  border: { type: "line" },
  content: "Animating...",
  style: {
    fg: "white",
    bg: "blue",
    border: { fg: "white" },
  },
});

let frame = 0;
const timer = setInterval(() => {
  frame += 1;
  status.setContent(`Animating...\nframe ${frame}`);
  screen.renderThrottled();
}, 50);

screen.key(["q", "C-c"], () => {
  clearInterval(timer);
  clearInterval(logTimer);
  screen.destroy();
  process.exit(0);
});

screen.render();
