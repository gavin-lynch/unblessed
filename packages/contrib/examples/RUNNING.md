# Running @unblessed/contrib Examples

## Prerequisites

- Node.js >= 22.0.0
- pnpm installed
- Dependencies installed (run `pnpm install` from project root)
- Packages built (run `pnpm build` from project root)

**Note:** Bun may have issues resolving workspace dependencies. Use `tsx` or `pnpm exec` instead.

## Quick Start

### Option 1: Using tsx directly (Recommended)

From the project root:

```bash
# Run any example
tsx packages/contrib/examples/bar.ts
tsx packages/contrib/examples/gauge.ts
tsx packages/contrib/examples/dashboard.ts

# Or from the contrib package directory
cd packages/contrib
tsx examples/bar.ts
```

### Option 2: Using pnpm exec

From the project root:

```bash
# Run examples using pnpm
pnpm --filter @unblessed/contrib exec tsx examples/bar.ts
pnpm --filter @unblessed/contrib exec tsx examples/dashboard.ts
```

### Option 3: Using node with tsx

If `tsx` is installed globally:

```bash
tsx packages/contrib/examples/bar.ts
```

## Available Examples

### Basic Widgets

```bash
tsx packages/contrib/examples/bar.ts          # Bar chart
tsx packages/contrib/examples/gauge.ts         # Gauge/progress bar
tsx packages/contrib/examples/donut.ts         # Animated donut chart
tsx packages/contrib/examples/sparkline.ts     # Sparkline widget
tsx packages/contrib/examples/lcd.ts           # LCD display (use g/h/t/y/b/n keys)
tsx packages/contrib/examples/table.ts         # Interactive table
tsx packages/contrib/examples/log.ts           # Log widget
```

### Charts

```bash
tsx packages/contrib/examples/multi-line-chart.ts  # Multi-series line chart
```

### Layouts

```bash
tsx packages/contrib/examples/grid.ts         # Grid layout demo
tsx packages/contrib/examples/dashboard.ts    # Full dashboard (most comprehensive)
```

## Interactive Controls

Most examples support:
- **`q`** - Quit
- **`C-c`** - Quit (Ctrl+C)
- **`escape`** - Quit

### LCD Example Special Keys

The `lcd.ts` example has additional controls:
- **`g`** - Increase width
- **`h`** - Decrease width
- **`t`** - Increase interval
- **`y`** - Decrease interval
- **`b`** - Increase stroke
- **`n`** - Decrease stroke

### Table Example

The `table.ts` example supports:
- Arrow keys for navigation
- `vi` mode navigation (if enabled)

## Troubleshooting

### Error: Cannot find module '@unblessed/node'

This usually means:
1. Packages aren't built - run `pnpm build` from project root
2. Using Bun - Bun may not resolve workspace dependencies correctly. Use `tsx` or `pnpm exec` instead:

```bash
# ✅ Recommended: Use pnpm exec
pnpm --filter @unblessed/contrib exec tsx examples/bar.ts

# ✅ Or use tsx directly (if installed)
tsx packages/contrib/examples/bar.ts

# ❌ Bun may not work with workspace dependencies
# bun run bar.ts  # May fail with module resolution
```

### Error: tsx command not found

Install tsx globally or use pnpm:

```bash
# Install tsx globally
npm install -g tsx

# Or use pnpm exec (no global install needed)
pnpm --filter @unblessed/contrib exec tsx examples/bar.ts
```

### Error: Runtime not initialized

This shouldn't happen with the examples, but if you see this error, make sure you're importing from `@unblessed/node` for the Screen component.

### Terminal Display Issues

If the display looks corrupted:
1. Make sure your terminal supports 256 colors
2. Try resizing your terminal window
3. Some examples may need a minimum terminal size (80x24 recommended)

## Building Before Running

If you've made changes to the source code, rebuild first:

```bash
# Build all packages
pnpm build

# Or build just the contrib package
pnpm --filter @unblessed/contrib build
```

## Example Output

### Bar Chart Example

Shows a simple bar chart with two bars labeled "bar1" and "bar2" with values 5 and 10.

### Dashboard Example

Shows a comprehensive dashboard with:
- Line charts (transactions, errors)
- Bar chart (server utilization)
- Gauges (storage, deployment progress)
- Donut chart (storage percentage)
- Sparkline (throughput)
- Table (active processes)
- Log (server log)
- LCD display
- World map with markers

The dashboard updates automatically with dummy data every few seconds.

## Development

To modify examples:

1. Edit the `.ts` file in `packages/contrib/examples/`
2. Run with `tsx` as shown above
3. Changes take effect immediately (no rebuild needed for examples)

## Notes

- All examples are standalone and can be run independently
- Examples use TypeScript and modern ES modules
- The examples demonstrate the API patterns for each widget type
- Press `q` or `C-c` to exit any example
