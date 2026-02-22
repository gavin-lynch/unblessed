#!/usr/bin/env tsx
/**
 * Truecolor proof
 *
 * Renders explicit RGB colors and dumps an SGR screenshot for inspection.
 */

import { Box, Screen } from "@unblessed/node";
import { writeFileSync } from "fs";

if (!process.env.COLORTERM) {
  process.env.COLORTERM = "truecolor";
}
if (!process.env.TERM) {
  process.env.TERM = "xterm-256color";
}

const screen = new Screen({
  smartCSR: true,
  color: {
    mode: "truecolor",
    allowTruecolorFromContent: true,
    preferForStyle: "fidelity",
    preferForContent: "fidelity",
  },
});

const header = new Box({
  parent: screen,
  top: 0,
  left: 0,
  width: "100%",
  height: 3,
  tags: true,
  content: "Truecolor proof: RGB arrays with SGR dump",
  style: { fg: [210, 190, 120] },
});

const swatches = new Box({
  parent: screen,
  top: 4,
  left: 2,
  width: 40,
  height: 10,
  border: "line",
  label: "Swatches",
});

const rows: Array<{
  label: string;
  fg: [number, number, number];
  bg: [number, number, number];
}> = [
  { label: "muted-blue", fg: [140, 170, 210], bg: [30, 44, 63] },
  { label: "soft-green", fg: [140, 200, 170], bg: [28, 46, 36] },
  { label: "warm-pink", fg: [210, 140, 170], bg: [55, 32, 44] },
  { label: "amber", fg: [220, 170, 110], bg: [52, 40, 20] },
];

rows.forEach((row, i) => {
  new Box({
    parent: swatches,
    top: 1 + i * 2,
    left: 2,
    width: 34,
    height: 1,
    content: ` ${row.label} `,
    style: {
      fg: row.fg,
      bg: row.bg,
    },
  });
});

const note = new Box({
  parent: screen,
  top: 4,
  left: 45,
  width: 40,
  height: 6,
  border: "line",
  label: "Dump",
  content:
    "Writing screenshot to:\n./packages/contrib/examples/out/truecolor-proof.sgr",
  style: { fg: [150, 170, 190] },
});

const finalize = (): void => {
  const sgr = screen.screenshot();
  writeFileSync(
    "packages/contrib/examples/out/truecolor-proof.sgr",
    sgr,
    "utf8",
  );

  const hex = Buffer.from(sgr, "utf8").toString("hex");
  writeFileSync(
    "packages/contrib/examples/out/truecolor-proof.hex",
    hex,
    "utf8",
  );

  const rgbMarkers = (sgr.match(new RegExp("\\x1b\\[(?:38|48);2;", "g")) || [])
    .length;
  const truecolorCells: Array<{
    x: number;
    y: number;
    ch: string;
    tcBg: [number, number, number] | null;
    tcFg: [number, number, number] | null;
    attr: number;
  }> = [];

  const lines = screen.lines;
  for (let y = 0; y < lines.length; y++) {
    const line = lines[y];
    if (!line) continue;
    for (let x = 0; x < line.length; x++) {
      const cell = line[x];
      if (!cell) continue;
      const tcBg = cell[2] as [number, number, number] | null;
      const tcFg = cell[3] as [number, number, number] | null;
      if (tcBg || tcFg) {
        truecolorCells.push({
          x,
          y,
          ch: cell[1] as string,
          tcBg,
          tcFg,
          attr: cell[0] as number,
        });
      }
      if (truecolorCells.length >= 20) break;
    }
    if (truecolorCells.length >= 20) break;
  }

  writeFileSync(
    "packages/contrib/examples/out/truecolor-proof.cells.json",
    JSON.stringify(
      {
        count: truecolorCells.length,
        cells: truecolorCells,
      },
      null,
      2,
    ) + "\n",
    "utf8",
  );

  writeFileSync(
    "packages/contrib/examples/out/truecolor-proof.meta.txt",
    `truecolor_markers=${rgbMarkers}\nlength=${sgr.length}\ntruecolor_cells=${truecolorCells.length}\n`,
    "utf8",
  );

  screen.destroy();
  process.exit(0);
};

screen.key(["escape", "q", "C-c"], () => {
  finalize();
});

screen.once("render", () => {
  finalize();
});

screen.render();
