# Contrib to Core Integration Analysis

This document summarizes what should move from `packages/contrib` into `packages/core`, what should remain in `packages/contrib` (or `packages/blessed` as the compatibility layer), and the refactor considerations needed to match core conventions.

## Scope Reviewed

- `packages/contrib/src/widgets/*`
- `packages/contrib/src/layout/*`
- `packages/contrib/src/utils.ts`
- `packages/contrib/src/color-utils.ts`
- `packages/core/src/widgets/*`
- `packages/core/src/lib/*`
- `packages/blessed/src/*`

## What Should Move Into Core

These are dependency-light widgets and layout helpers that are platform-agnostic and fit core patterns. If moved, keep core naming conventions and patterns.

### Widgets (Charts/Dashboard)

- `packages/contrib/src/widgets/bar.ts`
- `packages/contrib/src/widgets/line.ts` (chart widget; conflicts with core `Line` separator widget)
- `packages/contrib/src/widgets/stacked-bar.ts`
- `packages/contrib/src/widgets/donut.ts`
- `packages/contrib/src/widgets/gauge.ts`
- `packages/contrib/src/widgets/gauge-list.ts`
- `packages/contrib/src/widgets/sparkline.ts`
- `packages/contrib/src/widgets/lcd.ts`
- `packages/contrib/src/widgets/tabs.ts`

### Layout Helpers

- `packages/contrib/src/layout/grid.ts`
- `packages/contrib/src/layout/carousel.ts`

### Shared Utilities (Core Lib Candidates)

- `mergeRecursive` in `packages/contrib/src/utils.ts`
- `abbreviateNumber` in `packages/contrib/src/utils.ts`
- `getInnerBoxSize` in `packages/contrib/src/utils.ts`
- `truncateAnsiLines` in `packages/contrib/src/utils.ts`

Notes:

- `truncateAnsiLines` overlaps with core ANSI handling. Prefer merging with `packages/core/src/lib/text-utils.ts`.
- Color handling should be holistic in core and cover all color modes with explicit upgrade/downgrade paths. Core should expose a unified API that can:
  - Normalize any color input.
  - Downgrade to 256/16/8/no-color deterministically.
  - Produce output that matches legacy blessed/blessed-contrib control sequences when requested by the compatibility layer.
  - Allow the compat layer to explicitly request non-truecolor output so the resulting control characters are identical to legacy output.

## What Should Stay In Contrib (Compatibility Layer)

These widgets rely on optional external dependencies, node-centric behaviors, or blessed-contrib compatibility.

### Widgets with Optional External Dependencies

- `packages/contrib/src/widgets/markdown.ts` (marked, marked-terminal, chalk, process.env)
- `packages/contrib/src/widgets/diff.ts` (diff, cli-highlight, chalk, x256, process.env)
- `packages/contrib/src/widgets/map.ts` (map-canvas)
- `packages/contrib/src/widgets/picture.ts` (picture-tuber)

### Compatibility Color Utilities

- `packages/contrib/src/color-utils.ts` (x256 parity for blessed-contrib)
- `packages/contrib/src/utils.ts` wrappers: `getColorCode`, `toColorTag`

These should remain in contrib so the blessed-contrib API surface stays intact and consistent.

## Known Name/Behavior Conflicts

These are currently overlapping names with different behavior in core vs contrib.

- `line`
  - Core: `packages/core/src/widgets/line.ts` (line separator)
  - Contrib: `packages/contrib/src/widgets/line.ts` (chart widget)
  - Recommendation: move chart into core as `LineChart` (or similar); keep contrib export name for compat.

- `table`
  - Core: `packages/core/src/widgets/table.ts` (blessed-style fixed table)
  - Contrib: `packages/contrib/src/widgets/table.ts` (scrollable/list-backed table)
  - Recommendation: move as a distinct core widget (`DataTable`, `TableList`, etc.) and keep contrib name.

- `log`
  - Core: `packages/core/src/widgets/log.ts` (ScrollableText-based)
  - Contrib: `packages/contrib/src/widgets/log.ts` (List-based logger)
  - Recommendation: keep contrib name as compat; consider a distinct core name if merged.

## Refactor Requirements for Core-Idiomatic Integration

If widgets/utilities move into core, align them with core patterns and runtime APIs:

- Runtime injection only in core:
  - Replace direct `process` / global usage with `getRuntime().process` or `getRuntime().buffer.Buffer`.
- Avoid node globals in core:
  - E.g., `Buffer` should be `getRuntime().buffer.Buffer`.
- Prefer existing core utilities:
  - ANSI handling should use core helpers in `packages/core/src/lib/text-utils.ts`.
  - Color conversion should rely on core color system in `packages/core/src/lib/color-converter.ts`.
- Maintain core style and naming:
  - Options objects, parent-based attachment, and consistent naming as in `packages/core/src/widgets/*`.

## Recommended Split Summary

### Core

- Dependency-free chart widgets + dashboard layout helpers.
- Shared utilities with broad use across core widgets.
- Renamed chart/table/log widgets where names conflict with existing core widgets.

### Contrib (Compatibility Surface)

- Blessed-contrib API naming and behavior.
- Optional-dependency widgets (markdown/diff/map/picture).
- Compatibility color handling using `x256`.

## File Reference Summary

- Contrib widgets: `packages/contrib/src/widgets/*`
- Contrib layout: `packages/contrib/src/layout/*`
- Contrib utils: `packages/contrib/src/utils.ts`
- Contrib color: `packages/contrib/src/color-utils.ts`
- Core widgets: `packages/core/src/widgets/*`
- Core lib: `packages/core/src/lib/*`
- Blessed compatibility: `packages/blessed/src/*`
