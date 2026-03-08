# @unblessed/contrib

Dashboard widgets and charts for `@unblessed/core` - a complete port of [blessed-contrib](https://github.com/yaronn/blessed-contrib).

![Contrib dashboard with truecolor](../../example-contrib-with-truecolor.png)

## Installation

```bash
npm install @unblessed/contrib
# or
pnpm add @unblessed/contrib
```

## Features

- **Charts**: Line, Bar, StackedBar, Donut, Gauge, GaugeList
- **Displays**: LCD (16-segment), Sparkline
- **Data**: Table, Log
- **Media**: Picture, Markdown, WorldMap
- **Layouts**: Grid, Carousel
- **Full TypeScript support** with comprehensive type definitions
- **100% compatible** with blessed-contrib API

## Showcase

These screenshots are tracked in-repo with relative paths so they render both
locally and on GitHub.

### Markdown Widget

![Markdown widget](../../example-markdown-widget.png)

### Diff Widget

![Diff widget](../../example-diff-widget.png)

### Theme Example

![Themed example](../../example-themed.png)

### Optional Dependencies

Some widgets have optional peer dependencies for enhanced functionality:

- **Markdown**: `marked`, `marked-terminal`, `chalk` - for rich markdown rendering
- **WorldMap**: `map-canvas` - for detailed world map rendering
- **Picture**: `picture-tuber` - for terminal image display

Without these dependencies, widgets will display simplified/fallback content.

## Quick Start

```typescript
import { Screen } from "@unblessed/node";
import { Grid, Line, Bar, Gauge, Donut, Log } from "@unblessed/contrib";

const screen = new Screen({
  smartCSR: true,
  title: "Dashboard",
});

// Create a grid layout (12x12 cells)
const grid = new Grid({
  screen: screen,
  rows: 12,
  cols: 12,
});

// Add a line chart (top-left, 6x6)
const line = grid.set(0, 0, 6, 6, (opts) => new Line(opts), {
  label: "Network Traffic",
  showLegend: true,
  data: [
    {
      title: "Download",
      x: ["t1", "t2", "t3", "t4", "t5"],
      y: [5, 15, 7, 12, 20],
      style: { line: "yellow" },
    },
    {
      title: "Upload",
      x: ["t1", "t2", "t3", "t4", "t5"],
      y: [2, 8, 4, 6, 10],
      style: { line: "blue" },
    },
  ],
});

// Add a bar chart (top-right, 6x6)
const bar = grid.set(0, 6, 6, 6, (opts) => new Bar(opts), {
  label: "Server Load",
  barWidth: 4,
  barSpacing: 6,
  maxHeight: 100,
  data: {
    titles: ["S1", "S2", "S3", "S4"],
    data: [45, 78, 32, 91],
  },
});

// Add a gauge (bottom-left, 3x6)
const gauge = grid.set(6, 0, 3, 6, (opts) => new Gauge(opts), {
  label: "Memory",
  stroke: "green",
  percent: 65,
});

// Add a log (bottom, 3x12)
const log = grid.set(9, 0, 3, 12, (opts) => new Log(opts), {
  label: "Server Log",
  tags: true,
  bufferLength: 30,
});

// Update data periodically
setInterval(() => {
  log.log(
    "{green-fg}" + new Date().toISOString() + "{/green-fg} Server running",
  );
}, 1000);

screen.key(["escape", "q", "C-c"], () => process.exit(0));
screen.render();
```

## Sizing and Box Model

Contrib widgets prioritize blessed-contrib compatibility. Dimensions are calculated from the **bordered** box, not full inner padding. Borders reduce the drawable area; padding does not.

Key points:

- Borders reduce the available drawing area; padding is not applied to canvas sizing.
- Braille-based widgets apply extra internal padding for axes/labels.

### Configurable Chart Padding

Some widgets expose padding offsets so you can tune layout without changing code:

```ts
// Line
new Line({
  chartPaddingX: 12,
  chartPaddingY: 8,
});

// Donut
new Donut({
  chartPaddingX: 5,
  chartPaddingY: 12,
});

// LCD
new LCD({
  canvasPaddingX: 8,
  canvasPaddingY: 12,
});

// WorldMap
new WorldMap({
  mapPaddingX: 12,
});
```

## Widgets

### Line Chart

Displays multiple data series as line graphs.

```typescript
import { Line } from '@unblessed/contrib';

const line = new Line({
  parent: screen,
  width: '80%',
  height: '50%',
  label: 'Temperature',
  showLegend: true,
  data: [
    {
      title: 'Indoor',
      x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      y: [20, 22, 21, 23, 24],
      style: { line: 'yellow' }
    }
  ]
});

// Update with new data
line.setData([{ title: 'Indoor', x: [...], y: [...] }]);
```

### Bar Chart

Displays vertical bar charts.

```typescript
import { Bar } from "@unblessed/contrib";

const bar = new Bar({
  parent: screen,
  width: "50%",
  height: 10,
  label: "Sales",
  barWidth: 4,
  barSpacing: 6,
  data: {
    titles: ["Q1", "Q2", "Q3", "Q4"],
    data: [150, 200, 180, 220],
  },
});
```

### Stacked Bar Chart

Displays stacked bar charts with multiple data series.

```typescript
import { StackedBar } from "@unblessed/contrib";

const stackedBar = new StackedBar({
  parent: screen,
  width: "60%",
  height: 12,
  label: "Resource Usage",
  barBgColor: ["green", "yellow", "red"],
  data: {
    barCategory: ["Server 1", "Server 2", "Server 3"],
    stackedCategory: ["CPU", "Memory", "Disk"],
    data: [
      [20, 30, 10],
      [40, 20, 15],
      [25, 35, 20],
    ],
  },
});
```

### Gauge

Displays a horizontal progress bar.

```typescript
import { Gauge } from "@unblessed/contrib";

const gauge = new Gauge({
  parent: screen,
  width: "50%",
  height: 5,
  label: "Progress",
  stroke: "green",
  percent: 75,
});

// Update percentage
gauge.setPercent(80);

// Or use stacked values
gauge.setStack([
  { percent: 30, stroke: "green" },
  { percent: 50, stroke: "yellow" },
  { percent: 20, stroke: "red" },
]);
```

### Gauge List

Displays multiple gauges in a vertical list.

```typescript
import { GaugeList } from "@unblessed/contrib";

const gaugeList = new GaugeList({
  parent: screen,
  width: "50%",
  height: 10,
  label: "System Resources",
  gaugeHeight: 2,
  gaugeSpacing: 1,
  gauges: [
    { stack: [{ percent: 65, stroke: "green" }] },
    { stack: [{ percent: 45, stroke: "blue" }] },
    { stack: [{ percent: 80, stroke: "red" }] },
  ],
});
```

### Donut Chart

Displays donut/pie charts.

```typescript
import { Donut } from "@unblessed/contrib";

const donut = new Donut({
  parent: screen,
  width: 30,
  height: 15,
  label: "Disk Usage",
  radius: 14,
  arcWidth: 4,
  data: [
    { label: "SSD", percent: 75, color: "green" },
    { label: "HDD", percent: 45, color: "blue" },
    { label: "NAS", percent: 90, color: "red" },
  ],
});
```

### LCD Display

Displays characters using 16-segment LED-style display.

```typescript
import { LCD } from "@unblessed/contrib";

const lcd = new LCD({
  parent: screen,
  width: 30,
  height: 12,
  label: "Counter",
  elements: 5,
  color: "green",
});

lcd.setDisplay("12345");
lcd.setDisplay("HELLO");
```

### Sparkline

Displays simple ASCII sparkline charts.

```typescript
import { Sparkline } from "@unblessed/contrib";

const sparkline = new Sparkline({
  parent: screen,
  width: "50%",
  height: 8,
  label: "Metrics",
  tags: true,
  border: { type: "line" },
});

sparkline.setData(
  ["Traffic", "Errors"],
  [
    [10, 20, 30, 25, 35, 40, 30, 45],
    [5, 15, 10, 8, 12, 9, 7, 11],
  ],
);
```

### Table

Displays tabular data with headers and selectable rows.

```typescript
import { Table } from "@unblessed/contrib";

const table = new Table({
  parent: screen,
  width: "60%",
  height: "50%",
  label: "Processes",
  columnWidth: [20, 10, 10],
  columnSpacing: 2,
  keys: true,
  data: {
    headers: ["Name", "PID", "CPU"],
    data: [
      ["node", "1234", "12%"],
      ["nginx", "5678", "5%"],
      ["postgres", "9012", "8%"],
    ],
  },
});
```

### Log

Displays scrolling log messages.

```typescript
import { Log } from "@unblessed/contrib";

const log = new Log({
  parent: screen,
  width: "100%",
  height: 10,
  label: "Application Log",
  tags: true,
  bufferLength: 50,
});

log.log("Server started");
log.log("{green-fg}OK{/green-fg} Connected");
log.log("{red-fg}ERROR{/red-fg} Connection failed");
```

### Markdown

Renders markdown content with terminal formatting.
Requires optional peer dependencies: `marked`, `marked-terminal`, `chalk`.

```typescript
import { Markdown } from "@unblessed/contrib";

const markdown = new Markdown({
  parent: screen,
  width: "80%",
  height: "80%",
  label: "README",
  markdown: `
# Hello World

This is **bold** and *italic* text.

- Item 1
- Item 2

\`\`\`js
console.log('code block');
\`\`\`
  `,
});

// Update content
markdown.setMarkdown("# New Content\n\nUpdated markdown.");
```

### WorldMap

Displays a world map with markers.
Requires optional peer dependency: `map-canvas` for detailed rendering.

```typescript
import { WorldMap } from "@unblessed/contrib";

const map = new WorldMap({
  parent: screen,
  width: "80%",
  height: "80%",
  label: "Server Locations",
  markers: [
    { lon: "-122.4", lat: "37.8", color: "red", char: "X" }, // San Francisco
    { lon: "-73.9", lat: "40.7", color: "blue", char: "O" }, // New York
    { lon: "0.1", lat: "51.5", color: "green", char: "*" }, // London
  ],
});

// Add markers dynamically
map.addMarker({ lon: "139.7", lat: "35.7", color: "yellow", char: "+" }); // Tokyo
map.clearMarkers();
```

### Picture

Displays images in the terminal using ANSI colors.
Requires optional peer dependency: `picture-tuber`.

```typescript
import { Picture } from "@unblessed/contrib";

const picture = new Picture({
  parent: screen,
  width: "50%",
  height: "50%",
  file: "./logo.png",
  cols: 40,
  onReady: () => screen.render(),
});

// Or use base64-encoded image
const picture2 = new Picture({
  parent: screen,
  base64: "...base64 encoded image data...",
  cols: 30,
});
```

## Layouts

### Grid

Arranges widgets in a grid layout.

```typescript
import { Grid } from '@unblessed/contrib';

const grid = new Grid({
  screen: screen,
  rows: 12,
  cols: 12,
  color: 6 // cyan border
});

// Add widgets: (row, col, rowSpan, colSpan, constructor, options)
const widget1 = grid.set(0, 0, 6, 6, (opts) => new Line(opts), { ... });
const widget2 = grid.set(0, 6, 6, 6, (opts) => new Bar(opts), { ... });
const widget3 = grid.set(6, 0, 6, 12, (opts) => new Log(opts), { ... });
```

### Carousel

Cycle through multiple pages of widgets.

```typescript
import { Carousel } from '@unblessed/contrib';

const pages = [
  (screen, pageIndex) => {
    // Page 1: Dashboard
    const grid = new Grid({ screen, rows: 12, cols: 12 });
    grid.set(0, 0, 12, 12, (opts) => new Line(opts), { ... });
  },
  (screen, pageIndex) => {
    // Page 2: Details
    const grid = new Grid({ screen, rows: 12, cols: 12 });
    grid.set(0, 0, 12, 12, (opts) => new Table(opts), { ... });
  }
];

const carousel = new Carousel(pages, {
  screen: screen,
  rotate: true,      // Wrap around at ends
  controlKeys: true  // Use left/right arrows
});

carousel.start();
```

## API Reference

For detailed API documentation, see the TypeScript type definitions included with the package.

## Migration from blessed-contrib

This package is a drop-in replacement for blessed-contrib. Most code should work with minimal changes:

```diff
- const contrib = require('blessed-contrib');
+ import { Grid, Line, Bar } from '@unblessed/contrib';

- const line = contrib.line({ ... });
+ const line = new Line({ ... });

- grid.set(0, 0, 6, 6, contrib.line, { ... });
+ grid.set(0, 0, 6, 6, (opts) => new Line(opts), { ... });
```

## License

MIT
