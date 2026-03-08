#!/usr/bin/env tsx
/**
 * Dashboard truecolor dump
 * Renders a subset of dashboard widgets with truecolor and writes an SGR dump.
 */

import { Screen } from "@unblessed/node";
import { writeFileSync } from "fs";
import { Grid } from "../src/layout/grid.js";
import { Bar } from "../src/widgets/bar.js";
import { Donut } from "../src/widgets/donut.js";
import { Gauge } from "../src/widgets/gauge.js";
import { LCD } from "../src/widgets/lcd.js";
import { Line } from "../src/widgets/line.js";
import { Sparkline } from "../src/widgets/sparkline.js";
import { Table } from "../src/widgets/table.js";

const screen = new Screen({
  smartCSR: true,
  width: 120,
  height: 40,
  color: {
    mode: "truecolor",
    allowTruecolorFromContent: true,
    preferForStyle: "fidelity",
    preferForContent: "fidelity",
  },
});

const grid = new Grid({ rows: 12, cols: 12, screen: screen });

const line = grid.set(0, 0, 6, 6, (opts) => new Line(opts), {
  label: "Truecolor Lines",
  showLegend: true,
  style: {
    line: [205, 0, 0],
    text: [210, 190, 120],
    baseline: [0, 0, 0],
  },
});

const bar = grid.set(4, 6, 4, 3, (opts) => new Bar(opts), {
  label: "Truecolor Bars",
  barWidth: 4,
  barSpacing: 6,
  xOffset: 2,
  maxHeight: 9,
  barBgColor: [0, 0, 238],
  barFgColor: [229, 229, 229],
  labelColor: [229, 229, 229],
});

const donut = grid.set(8, 8, 4, 2, (opts) => new Donut(opts), {
  label: "Percent Donut",
  radius: 16,
  arcWidth: 4,
  yPadding: 2,
});

const gauge = grid.set(8, 10, 2, 2, (opts) => new Gauge(opts), {
  label: "Storage",
  padding: { top: 2, left: 0, right: 0, bottom: 0 },
  stroke: [205, 0, 205],
  fill: [229, 229, 229],
});

const lcd = grid.set(0, 9, 2, 3, (opts) => new LCD(opts), {
  label: "LCD Test",
  elements: 5,
});

const sparkline = grid.set(10, 10, 2, 2, (opts) => new Sparkline(opts), {
  label: "Throughput",
  tags: true,
  style: { fg: [80, 160, 230], titleFg: [229, 229, 229] },
});

const table = grid.set(4, 9, 4, 3, (opts) => new Table(opts), {
  label: "Active Processes",
  keys: false,
  fg: [140, 200, 170],
  columnSpacing: 1,
  columnWidth: [24, 10, 10],
});

const applyData = (): void => {
  line.setData([
    {
      title: "USA",
      style: { line: [205, 0, 0] },
      x: ["00:00", "00:10", "00:20", "00:30", "00:40", "00:50"],
      y: [40, 55, 48, 62, 58, 70],
    },
    {
      title: "Europe",
      style: { line: [205, 205, 0] },
      x: ["00:00", "00:10", "00:20", "00:30", "00:40", "00:50"],
      y: [10, 15, 12, 20, 18, 22],
    },
  ]);

  bar.setData({
    titles: ["US1", "US2", "EU1", "AU1", "AS1", "JP1"],
    data: [1, 10, 2, 5, 7, 2],
  });

  donut.update([
    { label: "storage", percent: 0.82, color: [0, 205, 0] },
    { label: "other", percent: 0.18, color: [205, 0, 205] },
  ]);

  gauge.setData([80, 20]);
  lcd.setDisplay("3210");
  lcd.setOptions({ color: [229, 229, 229] });

  sparkline.setData(
    ["Server1", "Server2"],
    [
      [1, 2, 5, 2, 1, 5, 1, 2, 5, 2, 1, 5],
      [4, 4, 5, 4, 1, 5, 1, 2, 5, 2, 1, 5],
    ],
  );

  table.setData({
    headers: ["Process", "Cpu (%)", "Memory"],
    data: [
      ["watchdog", 4, 0],
      ["node", 3, 86],
      ["timer", 1, 33],
    ],
  });
};

screen.once("render", () => {
  applyData();
  screen.once("render", () => {
    const sgr = screen.screenshot();
    writeFileSync(
      "packages/contrib/examples/out/dashboard-truecolor.sgr",
      sgr,
      "utf8",
    );
    const hex = Buffer.from(sgr, "utf8").toString("hex");
    writeFileSync(
      "packages/contrib/examples/out/dashboard-truecolor.hex",
      hex,
      "utf8",
    );

    const rgbMarkers = (
      sgr.match(new RegExp("\\x1b\\[(?:38|48);2;", "g")) || []
    ).length;
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
        if (truecolorCells.length >= 50) break;
      }
      if (truecolorCells.length >= 50) break;
    }

    writeFileSync(
      "packages/contrib/examples/out/dashboard-truecolor.cells.json",
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
      "packages/contrib/examples/out/dashboard-truecolor.meta.txt",
      `truecolor_markers=${rgbMarkers}\nlength=${sgr.length}\ntruecolor_cells=${truecolorCells.length}\ncols=${screen.cols}\nrows=${screen.rows}\nlines=${screen.lines.length}\nline0=${screen.lines[0]?.length ?? 0}\n`,
      "utf8",
    );

    screen.destroy();
    process.exit(0);
  });
  screen.render();
});

screen.render();
