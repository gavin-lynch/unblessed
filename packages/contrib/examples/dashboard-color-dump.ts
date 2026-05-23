#!/usr/bin/env tsx
/**
 * Dashboard color-mode dump
 * Renders each widget in isolation and writes minimal SGR + meta snapshots.
 */

import { Screen } from "@gavin-lynch/unblessed-node";
import { writeFileSync } from "fs";
import { Bar } from "../src/widgets/bar.js";
import { Donut } from "../src/widgets/donut.js";
import { Gauge } from "../src/widgets/gauge.js";
import { LCD } from "../src/widgets/lcd.js";
import { Line } from "../src/widgets/line.js";
import { Log } from "../src/widgets/log.js";
import { WorldMap } from "../src/widgets/map.js";
import { Sparkline } from "../src/widgets/sparkline.js";
import { Table } from "../src/widgets/table.js";

type DumpEntry = {
  id: string;
  label: string;
  colorMode: "truecolor" | "256" | "16" | "mono";
  build: (screen: Screen) => { widget: any; setup?: () => void };
};

const outDir = "packages/contrib/examples/out";

const entries: DumpEntry[] = [
  {
    id: "donut-truecolor",
    label: "Truecolor - Percent Donut",
    colorMode: "truecolor",
    build: (screen) => {
      const donut = new Donut({
        parent: screen,
        label: "Truecolor - Percent Donut",
        colorMode: "truecolor",
        width: "100%",
        height: "100%",
        radius: 12,
        arcWidth: 4,
        yPadding: 2,
      });
      return {
        widget: donut,
        setup: () => {
          donut.update([
            { label: "storage", percent: 0.78, color: "green" },
            { label: "other", percent: 0.22, color: "magenta" },
          ]);
        },
      };
    },
  },
  {
    id: "gauge-16",
    label: "16 - Storage",
    colorMode: "16",
    build: (screen) => {
      const gauge = new Gauge({
        parent: screen,
        label: "16 - Storage",
        colorMode: "16",
        width: "100%",
        height: "100%",
        padding: { top: 2, left: 0, right: 0, bottom: 0 },
      });
      return { widget: gauge, setup: () => gauge.setData([80, 20]) };
    },
  },
  {
    id: "gauge-256",
    label: "256 - Deployment Progress",
    colorMode: "256",
    build: (screen) => {
      const gauge = new Gauge({
        parent: screen,
        label: "256 - Deployment Progress",
        colorMode: "256",
        width: "100%",
        height: "100%",
        padding: { top: 2, left: 0, right: 0, bottom: 0 },
      });
      return { widget: gauge, setup: () => gauge.setData(80) };
    },
  },
  {
    id: "sparkline-16",
    label: "16 - Throughput (bits/sec)",
    colorMode: "16",
    build: (screen) => {
      const sparkline = new Sparkline({
        parent: screen,
        label: "16 - Throughput (bits/sec)",
        colorMode: "16",
        width: "100%",
        height: "100%",
        tags: true,
        style: { fg: "blue", titleFg: "white" },
      });
      return {
        widget: sparkline,
        setup: () =>
          sparkline.setData(
            ["Server1", "Server2"],
            [
              [1, 2, 5, 2, 1, 5, 1, 2, 5, 2, 1, 5],
              [4, 4, 5, 4, 1, 5, 1, 2, 5, 2, 1, 5],
            ],
          ),
      };
    },
  },
  {
    id: "bar-16",
    label: "16 - Server Utilization (%)",
    colorMode: "16",
    build: (screen) => {
      const bar = new Bar({
        parent: screen,
        label: "16 - Server Utilization (%)",
        colorMode: "16",
        width: "100%",
        height: "100%",
        barWidth: 4,
        barSpacing: 6,
        xOffset: 2,
        maxHeight: 9,
        barBgColor: "blue",
        barFgColor: "white",
        labelColor: "white",
      });
      return {
        widget: bar,
        setup: () =>
          bar.setData({
            titles: ["US1", "US2", "EU1", "AU1", "AS1", "JP1"],
            data: [3, 7, 4, 6, 8, 2],
          }),
      };
    },
  },
  {
    id: "table-mono",
    label: "Mono - Active Processes",
    colorMode: "mono",
    build: (screen) => {
      const table = new Table({
        parent: screen,
        label: "Mono - Active Processes",
        colorMode: "mono",
        width: "100%",
        height: "100%",
        keys: false,
        fg: "green",
        columnSpacing: 1,
        columnWidth: [24, 10, 10],
      });
      return {
        widget: table,
        setup: () =>
          table.setData({
            headers: ["Process", "Cpu (%)", "Memory"],
            data: [
              ["watchdog", 4, 0],
              ["node", 3, 86],
              ["timer", 1, 33],
            ],
          }),
      };
    },
  },
  {
    id: "lcd-256",
    label: "256 - LCD Test",
    colorMode: "256",
    build: (screen) => {
      const lcd = new LCD({
        parent: screen,
        label: "256 - LCD Test",
        colorMode: "256",
        width: "100%",
        height: "100%",
        segmentWidth: 0.06,
        segmentInterval: 0.11,
        strokeWidth: 0.1,
        elements: 5,
        display: 3210,
        elementSpacing: 4,
        elementPadding: 2,
      });
      return { widget: lcd, setup: () => lcd.setDisplay("3210") };
    },
  },
  {
    id: "errors-256",
    label: "256 - Errors Rate",
    colorMode: "256",
    build: (screen) => {
      const line = new Line({
        parent: screen,
        label: "256 - Errors Rate",
        colorMode: "256",
        width: "100%",
        height: "100%",
        style: {
          line: [220, 80, 80],
          text: "white",
          baseline: "black",
        },
        maxY: 60,
        showLegend: true,
      });
      return {
        widget: line,
        setup: () =>
          line.setData([
            {
              title: "Errors",
              style: { line: [220, 80, 80] },
              x: ["00:00", "00:10", "00:20", "00:30", "00:40", "00:50"],
              y: [10, 18, 25, 20, 16, 30],
            },
          ]),
      };
    },
  },
  {
    id: "transactions-truecolor",
    label: "Truecolor - Total Transactions",
    colorMode: "truecolor",
    build: (screen) => {
      const line = new Line({
        parent: screen,
        label: "Truecolor - Total Transactions",
        colorMode: "truecolor",
        width: "100%",
        height: "100%",
        showNthLabel: 5,
        maxY: 100,
        showLegend: true,
        legend: { width: 10 },
      });
      return {
        widget: line,
        setup: () =>
          line.setData([
            {
              title: "Total",
              style: { line: [96, 160, 255] },
              x: ["00:00", "00:10", "00:20", "00:30", "00:40", "00:50"],
              y: [20, 35, 42, 55, 68, 80],
            },
            {
              title: "EU",
              style: { line: [255, 136, 0] },
              x: ["00:00", "00:10", "00:20", "00:30", "00:40", "00:50"],
              y: [10, 18, 24, 32, 45, 50],
            },
          ]),
      };
    },
  },
  {
    id: "map-mono",
    label: "Mono - Servers Location",
    colorMode: "mono",
    build: (screen) => {
      const map = new WorldMap({
        parent: screen,
        label: "Mono - Servers Location",
        colorMode: "mono",
        width: "100%",
        height: "100%",
      });
      return {
        widget: map,
        setup: () =>
          map.addMarker({
            lon: "-73.935242",
            lat: "40.73061",
            color: "red",
            char: "X",
          }),
      };
    },
  },
  {
    id: "log-16",
    label: "16 - Server Log",
    colorMode: "16",
    build: (screen) => {
      const log = new Log({
        parent: screen,
        label: "16 - Server Log",
        colorMode: "16",
        width: "100%",
        height: "100%",
        fg: "green",
        selectedFg: "green",
      });
      return { widget: log, setup: () => log.log("dashboard color dump") };
    },
  },
];

const findFirstTruecolorCell = (
  screen: Screen,
): {
  x: number;
  y: number;
  ch: string;
  tcBg: [number, number, number] | null;
  tcFg: [number, number, number] | null;
} | null => {
  for (let y = 0; y < screen.lines.length; y++) {
    const line = screen.lines[y];
    if (!line) continue;
    for (let x = 0; x < line.length; x++) {
      const cell = line[x];
      if (!cell) continue;
      const tcBg = cell[2] as [number, number, number] | null;
      const tcFg = cell[3] as [number, number, number] | null;
      if (tcBg || tcFg) {
        return { x, y, ch: cell[1] as string, tcBg, tcFg };
      }
    }
  }
  return null;
};

const findFirstColorCell = (
  screen: Screen,
): {
  x: number;
  y: number;
  ch: string;
  fg: number;
  bg: number;
} | null => {
  for (let y = 0; y < screen.lines.length; y++) {
    const line = screen.lines[y];
    if (!line) continue;
    for (let x = 0; x < line.length; x++) {
      const cell = line[x];
      if (!cell) continue;
      const attr = cell[0] as number;
      const fg = (attr >> 9) & 0x1ff;
      const bg = attr & 0x1ff;
      if (fg !== 0x1ff || bg !== 0x1ff) {
        return { x, y, ch: cell[1] as string, fg, bg };
      }
    }
  }
  return null;
};

const runDump = async (entry: DumpEntry): Promise<void> => {
  await new Promise<void>((resolve) => {
    const screen = new Screen({
      smartCSR: true,
      width: 80,
      height: 24,
      color: {
        mode: "truecolor",
        allowTruecolorFromContent: true,
        preferForStyle: "fidelity",
        preferForContent: "fidelity",
      },
    });

    const { setup, widget } = entry.build(screen);

    screen.once("render", () => {
      setTimeout(() => {
        if (setup) setup();
        screen.once("render", () => {
          const sgr = screen.screenshot();
          const truecolorMarkers = (
            sgr.match(new RegExp("\\x1b\\[(?:38|48);2;", "g")) || []
          ).length;
          const hasTruecolorCells = screen.lines.some((line) =>
            line?.some((cell) => !!cell && (cell[2] || cell[3])),
          );
          const hasColorCells = screen.lines.some((line) =>
            line?.some((cell) => {
              if (!cell) return false;
              const attr = cell[0] as number;
              return (
                ((attr >> 9) & 0x1ff) !== 0x1ff || (attr & 0x1ff) !== 0x1ff
              );
            }),
          );
          const sample = findFirstTruecolorCell(screen);
          const colorSample = findFirstColorCell(screen);

          const colorMarkers = (
            sgr.match(
              new RegExp(
                "\\x1b\\[(?:3[0-7]|4[0-7]|9[0-7]|10[0-7]|38;5;|48;5;|38;2;|48;2;)",
                "g",
              ),
            ) || []
          ).length;

          writeFileSync(
            `${outDir}/dashboard-modes-${entry.id}.sgr`,
            sgr,
            "utf8",
          );

          writeFileSync(
            `${outDir}/dashboard-modes-${entry.id}.meta.json`,
            JSON.stringify(
              {
                label: entry.label,
                colorMode: entry.colorMode,
                widgetColorMode: widget?.colorMode ?? null,
                optionsColorMode: widget?.options?.colorMode ?? null,
                color_markers: colorMarkers,
                has_color_cells: hasColorCells,
                truecolor_markers: truecolorMarkers,
                has_truecolor_cells: hasTruecolorCells,
                color_sample: colorSample,
                truecolor_sample: sample,
              },
              null,
              2,
            ) + "\n",
            "utf8",
          );

          screen.destroy();
          resolve();
        });
        screen.render();
      }, 0);
    });

    screen.render();
  });
};

const main = async (): Promise<void> => {
  for (const entry of entries) {
    await runDump(entry);
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
