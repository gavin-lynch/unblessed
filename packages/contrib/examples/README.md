# @unblessed/contrib Examples

This directory contains example programs demonstrating how to use the various widgets and layouts from `@unblessed/contrib`.

## Running Examples

### Quick Start

**Important:** Make sure packages are built first:

```bash
# 1. Build packages (from project root)
pnpm build

# 2. Run any example
pnpm --filter @unblessed/contrib exec tsx examples/bar.ts
```

**Alternative methods:**

```bash
# Using tsx directly (if installed globally)
tsx packages/contrib/examples/bar.ts

# Or using node with tsx
node --loader tsx packages/contrib/examples/bar.ts

# Note: Bun may not resolve workspace dependencies correctly
# Use pnpm exec or tsx instead
```

### Prerequisites

1. **Install dependencies** (if not already done):
   ```bash
   pnpm install
   ```

2. **Build packages** (if you've made changes):
   ```bash
   pnpm build
   ```

### Available Examples

```bash
# Basic widgets
pnpm --filter @unblessed/contrib exec tsx examples/bar.ts
pnpm --filter @unblessed/contrib exec tsx examples/gauge.ts
pnpm --filter @unblessed/contrib exec tsx examples/donut.ts
pnpm --filter @unblessed/contrib exec tsx examples/sparkline.ts
pnpm --filter @unblessed/contrib exec tsx examples/lcd.ts
pnpm --filter @unblessed/contrib exec tsx examples/table.ts
pnpm --filter @unblessed/contrib exec tsx examples/log.ts

# Charts
pnpm --filter @unblessed/contrib exec tsx examples/multi-line-chart.ts

# Layouts
pnpm --filter @unblessed/contrib exec tsx examples/grid.ts
pnpm --filter @unblessed/contrib exec tsx examples/dashboard.ts
```

### Interactive Controls

- **`q`**, **`C-c`**, or **`escape`** - Exit any example
- **LCD example** (`lcd.ts`) has additional keys: `g`/`h` (width), `t`/`y` (interval), `b`/`n` (stroke)

See [RUNNING.md](./RUNNING.md) for detailed instructions and troubleshooting.

## Available Examples

### Basic Widgets

- **bar.ts** - Simple bar chart with server utilization data
- **gauge.ts** - Basic gauge/progress bar widget
- **donut.ts** - Animated donut chart with multiple segments
- **sparkline.ts** - Sparkline widget with multiple series
- **lcd.ts** - LCD display with interactive controls (g/h/t/y/b/n keys)
- **table.ts** - Interactive table with keyboard navigation
- **log.ts** - Log widget with scrolling and colored output

### Charts

- **multi-line-chart.ts** - Line chart with multiple data series and legend

### Layouts

- **grid.ts** - Grid-based layout system demonstration
- **dashboard.ts** - Comprehensive dashboard with multiple widgets

## Widget APIs

### Bar Chart

```typescript
import { Bar } from '@unblessed/contrib';

const bar = new Bar({
  parent: screen,
  label: 'Server Utilization (%)',
  barWidth: 4,
  barSpacing: 6,
});

bar.setData({
  titles: ['Server1', 'Server2'],
  data: [75, 90]
});
```

### Gauge

```typescript
import { Gauge } from '@unblessed/contrib';

const gauge = new Gauge({
  parent: screen,
  label: 'Progress'
});

// Single value
gauge.setPercent(75);

// Or stacked values
gauge.setData([30, 50, 20]);
```

### Line Chart

```typescript
import { Line } from '@unblessed/contrib';

const line = new Line({
  parent: screen,
  label: 'Network Traffic',
  showLegend: true
});

line.setData([
  {
    title: 'Series 1',
    x: ['t1', 't2', 't3'],
    y: [10, 20, 15],
    style: { line: 'red' }
  }
]);
```

### Grid Layout

```typescript
import { Grid } from '@unblessed/contrib';
import { Line, Bar } from '@unblessed/contrib';

const grid = new Grid({
  screen: screen,
  rows: 12,
  cols: 12
});

// Add widget at row 0, col 0, spanning 6 rows and 6 cols
const line = grid.set(0, 0, 6, 6, (opts) => new Line(opts), {
  label: 'Chart'
});
```

## Notes

- All examples use `@unblessed/node` for the Screen component
- Widgets must be appended to the screen before calling `setData()` or similar methods
- Use `screen.render()` after updating widget data to refresh the display
- Press `q`, `C-c`, or `escape` to exit examples

## Porting Status

Examples ported from `blessed-contrib`:
- ✅ Basic widgets (bar, gauge, donut, sparkline, lcd, table, log)
- ✅ Line chart examples
- ✅ Grid layout
- ✅ Dashboard example
- ⏳ Line chart variants (zoomed, fractional, etc.)
- ⏳ Additional examples (carousel, explorer, gauge-list, etc.)
- ⏳ Inline-data examples
