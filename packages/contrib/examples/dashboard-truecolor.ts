#!/usr/bin/env tsx
/**
 * Dashboard example
 *
 * Comprehensive dashboard demonstrating multiple widgets in a grid layout.
 * Shows line charts, bar charts, gauges, donut, sparkline, table, log, LCD, and map.
 */

import { Box, Screen } from "@gavin-lynch/unblessed-node";
import { Grid } from "../src/layout/grid.js";
import { Bar } from "../src/widgets/bar.js";
import { Donut } from "../src/widgets/donut.js";
import { Gauge } from "../src/widgets/gauge.js";
import { LCD } from "../src/widgets/lcd.js";
import { Line } from "../src/widgets/line.js";
import { Log } from "../src/widgets/log.js";
import { WorldMap } from "../src/widgets/map.js";
import { Sparkline } from "../src/widgets/sparkline.js";

const screen = new Screen({
  smartCSR: true,
  color: {
    mode: "truecolor",
    allowTruecolorFromContent: true,
    preferForStyle: "fidelity",
    preferForContent: "fidelity",
  },
});

// Create layout and widgets
const grid = new Grid({ rows: 12, cols: 12, screen: screen });

/**
 * Donut Options:
 * - radius: how wide is it? over 5 is best (default: 14)
 * - arcWidth: width of the donut (default: 4)
 * - yPadding: padding from the top (default: 2)
 */
const donut = grid.set(8, 8, 4, 2, (opts) => new Donut(opts), {
  label: "Truecolor - Percent Donut",
  colorMode: "truecolor",
  radius: 16,
  arcWidth: 4,
  yPadding: 2,
  data: [{ label: "Storage", percent: 87 }],
});

const gauge = grid.set(8, 10, 2, 2, (opts) => new Gauge(opts), {
  label: "16 - Storage",
  colorMode: "16",
  data: [80, 20],
  padding: { top: 2, left: 0, right: 0, bottom: 0 },
});

const gauge_two = grid.set(2, 9, 2, 3, (opts) => new Gauge(opts), {
  label: "256 - Deployment Progress",
  colorMode: "256",
  data: 80,
  padding: { top: 2, left: 0, right: 0, bottom: 0 },
});

const sparkline = grid.set(10, 10, 2, 2, (opts) => new Sparkline(opts), {
  label: "16 - Throughput (bits/sec)",
  colorMode: "16",
  tags: true,
  style: { fg: "blue", titleFg: "white" },
});

const bar = grid.set(4, 6, 4, 3, (opts) => new Bar(opts), {
  label: "16 - Server Utilization (%)",
  colorMode: "16",
  barWidth: 4,
  barSpacing: 6,
  xOffset: 2,
  maxHeight: 9,
  barBgColor: "blue",
  barFgColor: "white",
  labelColor: "white",
});

const truecolorGrid = grid.set(4, 9, 4, 3, (opts) => new Box(opts), {
  label: "Truecolor - Active Processes",
  colorMode: "truecolor",
  tags: false,
});

/**
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
const lcdLineOne = grid.set(0, 9, 2, 3, (opts) => new LCD(opts), {
  label: "256 - LCD Test",
  colorMode: "256",
  segmentWidth: 0.06,
  segmentInterval: 0.11,
  strokeWidth: 0.1,
  elements: 5,
  display: 3210,
  elementSpacing: 4,
  elementPadding: 2,
});

const errorsLine = grid.set(0, 6, 4, 3, (opts) => new Line(opts), {
  style: {
    line: "default",
    text: "default",
    baseline: "default",
    border: { fg: "white" },
    label: { fg: "white" },
  },
  label: "Mono - Errors Rate",
  colorMode: "mono",
  maxY: 60,
  showLegend: true,
});

const transactionsLine = grid.set(0, 0, 6, 6, (opts) => new Line(opts), {
  showNthLabel: 5,
  maxY: 100,
  label: "Truecolor - Total Transactions",
  colorMode: "truecolor",
  showLegend: true,
  legend: { width: 10 },
});

const map = grid.set(6, 0, 6, 6, (opts) => new WorldMap(opts), {
  label: "256 - Servers Location",
  colorMode: "256",
});

const log = grid.set(8, 6, 4, 2, (opts) => new Log(opts), {
  fg: "green",
  selectedFg: "green",
  label: "16 - Server Log",
  colorMode: "16",
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

function buildTruecolorGrid(width: number, height: number): string {
  if (width <= 0 || height <= 0) return "";
  const tl: [number, number, number] = [15, 30, 60];
  const tr: [number, number, number] = [10, 120, 200];
  const bl: [number, number, number] = [180, 70, 40];
  const br: [number, number, number] = [230, 210, 120];

  const label = "ACTIVE PROCESSES";
  const labelY = Math.max(0, Math.floor(height / 2));
  const labelX = Math.max(0, Math.floor(width / 2 - label.length / 2));

  const rows: string[] = [];
  for (let y = 0; y < height; y++) {
    const ty = height > 1 ? y / (height - 1) : 0;
    const left = mixColor(tl, bl, ty);
    const right = mixColor(tr, br, ty);
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

      if (y === labelY && x >= labelX && x < labelX + label.length) {
        if (lastFg === "default") {
          row += "\x1b[38;2;250;250;250m";
          lastFg = [250, 250, 250];
        }
        row += label[x - labelX];
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

function renderTruecolorGrid(): void {
  const borderSize = truecolorGrid.border ? 2 : 0;
  const width = Math.max(1, truecolorGrid.width - borderSize);
  const height = Math.max(1, truecolorGrid.height - borderSize);
  truecolorGrid.setContent(buildTruecolorGrid(width, height));
}

// Dummy data
const servers = ["US1", "US2", "EU1", "AU1", "AS1", "JP1"];
const commands = [
  "grep",
  "node",
  "java",
  "timer",
  "~/ls -l",
  "netns",
  "watchdog",
  "gulp",
  "tar -xvf",
  "awk",
  "npm install",
];

// Set dummy data on gauge
let gauge_percent = 0;
let gauge_percent_two = 0;
setInterval(() => {
  gauge.setData([gauge_percent, 100 - gauge_percent]);
  gauge_percent++;
  if (gauge_percent >= 100) gauge_percent = 0;
  screen.render();
}, 200);

setInterval(() => {
  gauge_two.setData(gauge_percent_two);
  gauge_percent_two++;
  if (gauge_percent_two >= 100) gauge_percent_two = 0;
  screen.render();
}, 200);

// Set dummy data on bar chart
function fillBar() {
  const arr: number[] = [];
  for (let i = 0; i < servers.length; i++) {
    arr.push(Math.round(Math.random() * 10));
  }
  bar.setData({ titles: servers, data: arr });
  screen.render();
}
fillBar();
setInterval(fillBar, 2000);

renderTruecolorGrid();

// Set log dummy data
setInterval(() => {
  const rnd = Math.round(Math.random() * 2);
  if (rnd === 0) {
    log.log(
      "starting process " +
        commands[Math.round(Math.random() * (commands.length - 1))],
    );
  } else if (rnd === 1) {
    log.log(
      "terminating server " +
        servers[Math.round(Math.random() * (servers.length - 1))],
    );
  } else if (rnd === 2) {
    log.log("avg. wait time " + Math.random().toFixed(2));
  }
  screen.render();
}, 500);

// Set spark dummy data
let spark1 = [
  1, 2, 5, 2, 1, 5, 1, 2, 5, 2, 1, 5, 4, 4, 5, 4, 1, 5, 1, 2, 5, 2, 1, 5, 1, 2,
  5, 2, 1, 5, 1, 2, 5, 2, 1, 5,
];
let spark2 = [
  4, 4, 5, 4, 1, 5, 1, 2, 5, 2, 1, 5, 4, 4, 5, 4, 1, 5, 1, 2, 5, 2, 1, 5, 1, 2,
  5, 2, 1, 5, 1, 2, 5, 2, 1, 5,
];

function refreshSpark() {
  spark1.shift();
  spark1.push(Math.random() * 5 + 1);
  spark2.shift();
  spark2.push(Math.random() * 5 + 1);
  sparkline.setData(["Server1", "Server2"], [spark1, spark2]);
  screen.render();
}
refreshSpark();
setInterval(refreshSpark, 1000);

// Set map dummy markers
let marker = true;
setInterval(() => {
  if (marker) {
    map.addMarker({
      lon: "-79.0000",
      lat: "37.5000",
      color: "yellow",
      char: "X",
    });
    map.addMarker({ lon: "-122.6819", lat: "45.5200" });
    map.addMarker({ lon: "-6.2597", lat: "53.3478" });
    map.addMarker({ lon: "103.8000", lat: "1.3000" });
  } else {
    map.clearMarkers();
  }
  marker = !marker;
  screen.render();
}, 1000);

// Set line charts dummy data
const transactionsData = {
  title: "USA",
  style: { line: [255, 110, 90] },
  x: [
    "00:00",
    "00:05",
    "00:10",
    "00:15",
    "00:20",
    "00:30",
    "00:40",
    "00:50",
    "01:00",
    "01:10",
    "01:20",
    "01:30",
    "01:40",
    "01:50",
    "02:00",
    "02:10",
    "02:20",
    "02:30",
    "02:40",
    "02:50",
    "03:00",
    "03:10",
    "03:20",
    "03:30",
    "03:40",
    "03:50",
    "04:00",
    "04:10",
    "04:20",
    "04:30",
  ],
  y: [
    0, 20, 40, 45, 45, 50, 55, 70, 65, 58, 50, 55, 60, 65, 70, 80, 70, 50, 40,
    50, 60, 70, 82, 88, 89, 89, 89, 80, 72, 70,
  ],
};

const transactionsData1 = {
  title: "Europe",
  style: { line: [240, 210, 90] },
  x: [
    "00:00",
    "00:05",
    "00:10",
    "00:15",
    "00:20",
    "00:30",
    "00:40",
    "00:50",
    "01:00",
    "01:10",
    "01:20",
    "01:30",
    "01:40",
    "01:50",
    "02:00",
    "02:10",
    "02:20",
    "02:30",
    "02:40",
    "02:50",
    "03:00",
    "03:10",
    "03:20",
    "03:30",
    "03:40",
    "03:50",
    "04:00",
    "04:10",
    "04:20",
    "04:30",
  ],
  y: [
    0, 5, 5, 10, 10, 15, 20, 30, 25, 30, 30, 20, 20, 30, 30, 20, 15, 15, 19, 25,
    30, 25, 25, 20, 25, 30, 35, 35, 30, 30,
  ],
};

const errorsData = {
  title: "server 1",
  style: { line: "default" },
  x: ["00:00", "00:05", "00:10", "00:15", "00:20", "00:25"],
  y: [30, 50, 70, 40, 50, 20],
};

function setLineData(mockData: (typeof transactionsData)[], line: Line) {
  for (let i = 0; i < mockData.length; i++) {
    const last = mockData[i].y[mockData[i].y.length - 1];
    mockData[i].y.shift();
    const num = Math.max(last + Math.round(Math.random() * 10) - 5, 10);
    mockData[i].y.push(num);
  }

  line.setData(mockData);
  screen.render();
}

setLineData([transactionsData, transactionsData1], transactionsLine);
setLineData([errorsData], errorsLine);

setInterval(() => {
  setLineData([transactionsData, transactionsData1], transactionsLine);
}, 500);

setInterval(() => {
  setLineData([errorsData], errorsLine);
}, 1500);

setInterval(() => {
  const colors = ["green", "magenta", "cyan", "red", "blue"];
  const text = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

  const value = Math.round(Math.random() * 100);
  lcdLineOne.setDisplay(value + text[value % 12]);
  lcdLineOne.setOptions({
    color: colors[value % 5],
    elementPadding: 4,
  });
  screen.render();
}, 1500);

let pct = 0.0;

function updateDonut() {
  if (pct > 0.99) pct = 0.0;
  let color = "green";
  if (pct >= 0.25) color = "cyan";
  if (pct >= 0.5) color = "yellow";
  if (pct >= 0.75) color = "red";
  donut.update([
    {
      percent: parseFloat(((pct + 0.0) % 1).toFixed(2)),
      label: "storage",
      color: color,
    },
  ]);
  pct += 0.01;
  screen.render();
}

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});

// Handle resize events
screen.on("resize", () => {
  donut.emit("attach");
  gauge.emit("attach");
  gauge_two.emit("attach");
  sparkline.emit("attach");
  bar.emit("attach");
  lcdLineOne.emit("attach");
  errorsLine.emit("attach");
  transactionsLine.emit("attach");
  map.emit("attach");
  log.emit("attach");
  renderTruecolorGrid();
  screen.render();
});

setInterval(() => {
  updateDonut();
}, 500);

screen.render();
