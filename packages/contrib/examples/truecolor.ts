#!/usr/bin/env tsx
/**
 * Truecolor visual proof
 *
 * Renders a full-screen 24-bit gradient with overlaid text.
 */

import { Box, Screen } from "@gavin-lynch/unblessed-node";

const screen = new Screen({ smartCSR: true });

const background = new Box({
  parent: screen,
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  tags: false,
});

function clamp8(value: number): number {
  if (value < 0) return 0;
  if (value > 255) return 255;
  return value | 0;
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

function buildGradient(width: number, height: number): string {
  if (width <= 0 || height <= 0) return "";

  const tl: [number, number, number] = [20, 40, 70];
  const tr: [number, number, number] = [0, 140, 210];
  const bl: [number, number, number] = [190, 80, 50];
  const br: [number, number, number] = [240, 220, 120];

  const textLines = ["UNBLESSED TRUECOLOR", "RGB 24-BIT GRADIENT", "Q TO QUIT"];
  const textStartY = Math.max(0, Math.floor(height / 2 - textLines.length / 2));

  const rows: string[] = [];

  for (let y = 0; y < height; y++) {
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

    let row = "";
    let lastBg: [number, number, number] | null = null;
    let lastFg: [number, number, number] | "default" = "default";
    for (let x = 0; x < width; x++) {
      const tx = width > 1 ? x / (width - 1) : 0;
      const rgb = mixColor(left, right, tx);
      const [r, g, b] = rgb;
      if (!lastBg || lastBg[0] !== r || lastBg[1] !== g || lastBg[2] !== b) {
        row += `\x1b[48;2;${r};${g};${b}m`;
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
          row += `\x1b[38;2;${fg[0]};${fg[1]};${fg[2]}m`;
          lastFg = fg;
        }
        row += ch;
      } else {
        if (lastFg !== "default") {
          row += "\x1b[39m";
          lastFg = "default";
        }
        row += " ";
      }
    }

    row += "\x1b[0m";
    rows.push(row);
  }

  return rows.join("\n");
}

function render(): void {
  const width = Math.max(1, screen.cols);
  const height = Math.max(1, screen.rows);
  background.setContent(buildGradient(width, height));
  screen.render();
}

screen.on("resize", render);
screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});

render();
