#!/usr/bin/env tsx
/**
 * Truecolor animated visual proof
 *
 * Renders a full-screen 24-bit gradient and rotates hue over time.
 */

import { Box, Screen } from "@gavin-lynch/unblessed-node";
import {
  createPerfOverlay,
  installRenderPerfObserver,
} from "@gavin-lynch/unblessed-perf";
import { appendFileSync, writeFileSync } from "fs";

const screen = new Screen({ smartCSR: true });
screen.program.useBuffer = true;
const background = new Box({
  parent: screen,
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  tags: false,
});

const perf = installRenderPerfObserver({ targetFps: 60 });
createPerfOverlay(screen as unknown as any, perf, {
  label: "truecolor",
});

const logPath = "./perf-truecolor.log";
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

function clamp8(value: number): number {
  if (value < 0) return 0;
  if (value > 255) return 255;
  return value | 0;
}

class StringBuilder {
  private parts: string[] = [];

  append(value: string): void {
    this.parts.push(value);
  }

  toString(): string {
    return this.parts.join("");
  }
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function mixColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    clamp8(lerp(a[0], b[0], t)),
    clamp8(lerp(a[1], b[1], t)),
    clamp8(lerp(a[2], b[2], t)),
  ];
}

function luminance(rgb: [number, number, number]): number {
  return rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114;
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const hp = (h % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;

  if (hp >= 0 && hp < 1) [r, g, b] = [c, x, 0];
  else if (hp >= 1 && hp < 2) [r, g, b] = [x, c, 0];
  else if (hp >= 2 && hp < 3) [r, g, b] = [0, c, x];
  else if (hp >= 3 && hp < 4) [r, g, b] = [0, x, c];
  else if (hp >= 4 && hp < 5) [r, g, b] = [x, 0, c];
  else if (hp >= 5 && hp < 6) [r, g, b] = [c, 0, x];

  const m = v - c;
  return [clamp8((r + m) * 255), clamp8((g + m) * 255), clamp8((b + m) * 255)];
}

function buildGradient(
  width: number,
  height: number,
  hueOffset: number,
): string {
  if (width <= 0 || height <= 0) return "";

  const tl = hsvToRgb((210 + hueOffset) % 360, 0.7, 0.3);
  const tr = hsvToRgb((180 + hueOffset) % 360, 0.95, 0.75);
  const bl = hsvToRgb((20 + hueOffset) % 360, 0.8, 0.65);
  const br = hsvToRgb((45 + hueOffset) % 360, 0.5, 0.95);

  const textLines = ["UNBLESSED TRUECOLOR", "RGB 24-BIT GRADIENT", "Q TO QUIT"];
  const textStartY = Math.max(0, Math.floor(height / 2 - textLines.length / 2));

  const output: StringBuilder = new StringBuilder();
  let lastBg: [number, number, number] | null = null;
  let lastFg: [number, number, number] | "default" = "default";

  for (let y = 0; y < height; y++) {
    if (y > 0) output.append("\n");
    const ty = height > 1 ? y / (height - 1) : 0;
    const left = mixColor(tl, bl, ty);
    const right = mixColor(tr, br, ty);

    const lineIndex = y - textStartY;
    const lineText =
      lineIndex >= 0 && lineIndex < textLines.length
        ? textLines[lineIndex]
        : null;
    const textStartX = lineText
      ? Math.max(0, Math.floor(width / 2 - lineText.length / 2))
      : -1;

    for (let x = 0; x < width; x++) {
      const tx = width > 1 ? x / (width - 1) : 0;
      const rgb = mixColor(left, right, tx);
      const [r, g, b] = rgb;
      if (!lastBg || lastBg[0] !== r || lastBg[1] !== g || lastBg[2] !== b) {
        output.append(`\x1b[48;2;${r};${g};${b}m`);
        lastBg = [r, g, b];
      }

      if (lineText && x >= textStartX && x < textStartX + lineText.length) {
        const ch = lineText[x - textStartX];
        const bright = luminance(rgb) >= 140;
        const fg: [number, number, number] = bright
          ? [20, 20, 20]
          : [245, 245, 245];
        if (
          lastFg === "default" ||
          (Array.isArray(lastFg) &&
            (lastFg[0] !== fg[0] || lastFg[1] !== fg[1] || lastFg[2] !== fg[2]))
        ) {
          output.append(`\x1b[38;2;${fg[0]};${fg[1]};${fg[2]}m`);
          lastFg = fg;
        }
        output.append(ch);
      } else {
        if (lastFg !== "default") {
          output.append("\x1b[39m");
          lastFg = "default";
        }
        output.append(" ");
      }
    }
  }

  output.append("\x1b[0m");
  return output.toString();
}

function render(hueOffset: number): void {
  const width = Math.max(1, screen.cols);
  const height = Math.max(1, screen.rows);
  background.setContent(buildGradient(width, height, hueOffset));
  screen.renderThrottled();
}

let hue = 0;
let running = true;

const loop = () => {
  if (!running) return;
  hue = (hue + 2) % 360;
  render(hue);
  setTimeout(loop, 50);
};

screen.on("resize", () => render(hue));
screen.key(["escape", "q", "C-c"], () => {
  running = false;
  clearInterval(logTimer);
  screen.destroy();
  process.exit(0);
});

render(hue);
loop();
