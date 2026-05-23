#!/usr/bin/env tsx
/**
 * Theme switcher example
 *
 * Demonstrates live theming across widgets.
 */

import { Box } from "@gavin-lynch/unblessed-core";
import { Screen } from "@gavin-lynch/unblessed-node";
import { Gauge, Grid, Line, Table } from "../src/index.js";

const screen = new Screen({ smartCSR: true });

const grid = new Grid({ rows: 12, cols: 12, screen });

const line: Line = grid.set(0, 0, 7, 8, (opts) => new Line(opts), {
  label: "Latency",
  xPadding: 5,
  xLabelPadding: 3,
}) as Line;

const gauge: Gauge = grid.set(7, 0, 3, 8, (opts) => new Gauge(opts), {
  label: "Utilization",
  showLabel: true,
}) as Gauge;

const table: Table = grid.set(0, 8, 10, 4, (opts) => new Table(opts), {
  label: "Services",
  columnWidth: [10, 8, 6],
}) as Table;

const footer = new Box({
  parent: screen,
  bottom: 0,
  height: 1,
  width: "100%",
  left: 1,
});

const lineData = [
  {
    title: "p95",
    x: ["t1", "t2", "t3", "t4"],
    y: [0.2, 1.4, 0.6, 1.9],
  },
];

const tableData = {
  headers: ["Name", "Status", "RTT"],
  data: [
    ["auth", "ok", "12"],
    ["billing", "warn", "64"],
    ["edge", "ok", "8"],
  ],
};

const themes = [
  {
    name: "Ocean",
    line: "cyan",
    text: "white",
    baseline: "blue",
    gauge: "cyan",
    gaugeText: "white",
    tableFg: "white",
    tableBg: "",
    tableSelBg: "blue",
    footerFg: "cyan",
  },
  {
    name: "Sunset",
    line: "yellow",
    text: "white",
    baseline: "red",
    gauge: "yellow",
    gaugeText: "black",
    tableFg: "white",
    tableBg: "",
    tableSelBg: "magenta",
    footerFg: "yellow",
  },
  {
    name: "Forest",
    line: "green",
    text: "white",
    baseline: "black",
    gauge: "green",
    gaugeText: "white",
    tableFg: "green",
    tableBg: "",
    tableSelBg: "blue",
    footerFg: "green",
  },
];

let themeIndex = 0;

function applyTheme() {
  const theme = themes[themeIndex]!;

  line.options.style = {
    line: theme.line,
    text: theme.text,
    baseline: theme.baseline,
  } as any;
  line.setData(lineData);

  gauge.options.stroke = theme.gauge as any;
  gauge.options.fill = theme.gaugeText as any;
  gauge.setPercent(0.72);

  table.options.fg = theme.tableFg as any;
  table.options.bg = theme.tableBg as any;
  table.options.selectedBg = theme.tableSelBg as any;
  table.rows.style = {
    item: { fg: theme.tableFg, bg: theme.tableBg },
    selected: { fg: "white", bg: theme.tableSelBg },
  } as any;
  table.setData(tableData);

  footer.style = { fg: theme.footerFg } as any;
  footer.setContent(`Theme: ${theme.name}`);

  screen.render();
}

applyTheme();

screen.key(["left", "right"], (_ch, key) => {
  if (key.name === "right") {
    themeIndex = (themeIndex + 1) % themes.length;
  }
  if (key.name === "left") {
    themeIndex = (themeIndex + themes.length - 1) % themes.length;
  }
  applyTheme();
});

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});

screen.render();
