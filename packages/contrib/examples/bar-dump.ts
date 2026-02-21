#!/usr/bin/env tsx
/**
 * Bar chart render dump
 *
 * Renders the bar example and dumps the char-canvas buffer so we can
 * verify edges, spacing, and label coloring in a deterministic way.
 */

import { Screen } from "@unblessed/node";
import { PassThrough } from "stream";
import { Bar } from "../src/widgets/bar.js";

function stripAnsi(input: string): string {
  return input.replace(new RegExp("\\u001b\\[[0-9;]*m", "g"), "");
}

function escapeAnsi(input: string): string {
  return input.replace(new RegExp("\\u001b", "g"), "\\x1b");
}

type GridCell = {
  bg: boolean;
};

function renderOutputToBgMask(
  output: string,
  cols: number,
  rows: number,
): string[] {
  const grid: GridCell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ bg: false })),
  );
  let x = 0;
  let y = 0;
  let bgOn = false;

  function clampCursor(): void {
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x >= cols) x = cols - 1;
    if (y >= rows) y = rows - 1;
  }

  let i = 0;
  while (i < output.length) {
    const ch = output[i];
    if (ch === "\x1b" && output[i + 1] === "[") {
      const end = output.indexOf("m", i);
      const escEnd = output.indexOf("K", i);
      const cupEnd = output.indexOf("H", i);
      const cufEnd = output.indexOf("C", i);
      const nextEnd = [end, escEnd, cupEnd, cufEnd]
        .filter((v) => v !== -1)
        .sort((a, b) => a - b)[0];
      if (nextEnd == null) {
        i++;
        continue;
      }
      const seq = output.slice(i + 2, nextEnd);
      const code = output[nextEnd];

      if (code === "m") {
        const parts = seq.length ? seq.split(";") : ["0"];
        let idx = 0;
        while (idx < parts.length) {
          const part = parts[idx] || "0";
          const num = parseInt(part, 10);
          if (num === 0) {
            bgOn = false;
          } else if (num === 49) {
            bgOn = false;
          } else if (num >= 40 && num <= 47) {
            bgOn = true;
          } else if (num >= 100 && num <= 107) {
            bgOn = true;
          } else if (num === 48) {
            const mode = parts[idx + 1];
            if (mode === "5") {
              bgOn = true;
              idx += 2;
            } else if (mode === "2") {
              bgOn = true;
              idx += 4;
            }
          }
          idx++;
        }
      } else if (code === "H") {
        const [row, col] = seq.split(";").map((v) => parseInt(v, 10));
        y = (row || 1) - 1;
        x = (col || 1) - 1;
        clampCursor();
      } else if (code === "C") {
        const step = parseInt(seq || "1", 10);
        x += step;
        clampCursor();
      } else if (code === "K") {
        for (let cx = x; cx < cols; cx++) {
          grid[y][cx].bg = false;
        }
      }

      i = nextEnd + 1;
      continue;
    }

    if (ch === "\n") {
      y += 1;
      x = 0;
      i++;
      continue;
    }

    if (x >= 0 && x < cols && y >= 0 && y < rows) {
      grid[y][x].bg = bgOn;
    }
    x += 1;
    i++;
  }

  return grid.map((row) => row.map((cell) => (cell.bg ? "#" : ".")).join(""));
}

const input = new PassThrough();
const output = new PassThrough();

const screen = new Screen({
  smartCSR: true,
  width: 40,
  height: 20,
  input,
  output,
});

const bar = new Bar({
  label: "Server Utilization (%)",
  barWidth: 4,
  barSpacing: 6,
  xOffset: 0,
  maxHeight: 9,
  height: "40%",
});

screen.append(bar);

function dumpFrame(): void {
  bar.setData({
    titles: ["bar1", "bar2"],
    data: [5, 10],
  });

  let outputBuffer = "";
  const originalWrite = (screen as any).program._write.bind(
    (screen as any).program,
  );
  (screen as any).program._write = (data: string) => {
    outputBuffer += data;
  };

  screen.render();
  (screen as any).program._write = originalWrite;

  const canvas = (bar as any)._canvas;
  const ctx = (bar as any).ctx;
  const inner = ctx?._canvas;

  const frame = canvas?.frame?.() ?? "";
  const stripped = stripAnsi(frame);
  const rawLines = frame.split("\n");
  const strippedLines = stripped.split("\n");

  const width = inner?.width ?? 0;
  const height = inner?.height ?? 0;
  const content: (string | null)[] = inner?.content ?? [];

  process.stdout.write("FRAME_STRIPPED\n");
  for (const line of stripped.split("\n")) {
    if (line.length === 0) continue;
    process.stdout.write(line.replace(/ /g, ".") + "\n");
  }

  process.stdout.write("\nMASK\n");
  for (let y = 0; y < height; y++) {
    let row = "";
    for (let x = 0; x < width; x++) {
      const cell = content[y * width + x];
      row += cell === null ? "." : "#";
    }
    process.stdout.write(String(y).padStart(2, "0") + "|" + row + "\n");
  }

  process.stdout.write("\nMETA\n");
  process.stdout.write(`canvas=${width}x${height}\n`);
  process.stdout.write(`barWidth=${bar.options.barWidth}\n`);
  process.stdout.write(`barSpacing=${bar.options.barSpacing}\n`);
  process.stdout.write(`xOffset=${bar.options.xOffset}\n`);

  process.stdout.write("\nFRAME_RAW\n");
  for (const line of rawLines) {
    if (line.length === 0) continue;
    process.stdout.write(escapeAnsi(line) + "\n");
  }

  const labelRow = strippedLines.findIndex((line) => line.includes("bar1"));
  const valueRow = strippedLines.findIndex((line) => line.includes("5"));

  function dumpRow(rowIndex: number, label: string): void {
    if (rowIndex < 0) return;
    process.stdout.write(`\nCELL_ROW_${label}_${rowIndex}\n`);
    for (let x = 0; x < width; x++) {
      const cell = content[rowIndex * width + x];
      const cellText = cell === null ? "null" : escapeAnsi(cell);
      process.stdout.write(String(x).padStart(2, "0") + ":" + cellText + "\n");
    }
  }

  dumpRow(valueRow, "VALUE");
  dumpRow(labelRow, "LABEL");

  const lines = (screen as any).lines as any[];
  const defAttr = (screen as any).dattr as number;
  const defBg = defAttr & 0x1ff;

  process.stdout.write("\nSCREEN_BG_MASK\n");
  for (let y = 0; y < lines.length; y++) {
    const line = lines[y];
    if (!line) continue;
    let row = "";
    for (let x = 0; x < line.length; x++) {
      const cell = line[x];
      if (!cell) {
        row += ".";
        continue;
      }
      const attr = cell[0] as number;
      const tcBg = cell[2] as number[] | null;
      const bg = attr & 0x1ff;
      row += bg !== defBg || tcBg ? "#" : ".";
    }
    process.stdout.write(String(y).padStart(2, "0") + "|" + row + "\n");
  }

  process.stdout.write("\nSCREEN_TEXT\n");
  for (let y = 0; y < lines.length; y++) {
    const line = lines[y];
    if (!line) continue;
    let row = "";
    for (let x = 0; x < line.length; x++) {
      const cell = line[x];
      row += cell?.[1] ?? " ";
    }
    process.stdout.write(String(y).padStart(2, "0") + "|" + row + "\n");
  }

  process.stdout.write("\nOUTPUT_BG_MASK\n");
  const outMask = renderOutputToBgMask(outputBuffer, screen.cols, screen.rows);
  for (let y = 0; y < outMask.length; y++) {
    process.stdout.write(String(y).padStart(2, "0") + "|" + outMask[y] + "\n");
  }

  screen.destroy();
}

function waitForCanvas(tries: number): void {
  if ((bar as any).ctx) {
    dumpFrame();
    return;
  }
  if (tries <= 0) {
    throw new Error("Canvas context not initialized in time");
  }
  setTimeout(() => waitForCanvas(tries - 1), 10);
}

waitForCanvas(50);
