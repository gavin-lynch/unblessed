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

## Priority Order

1. **Color system refactor (core-first)**
   - This is a foundational refactor and must land before widget migration.
   - Canonical plan lives in `packages/core/COLOR_SYSTEM_REFACTOR.md`.
2. **Core layout essentials**
   - Grid and carousel are structural and should land before or alongside widget moves.
3. **Widget migrations and compatibility shims**
   - Move dependency-light widgets into core, then provide contrib/blessed compatibility wrappers.

## Completed (Current Refactor)

- Truecolor output restored in core screenshot rendering (`screen.screenshot()` now emits `38;2`/`48;2`).
- Color capability detection hardened (beyond `COLORTERM`/`getColorDepth`) to avoid false negatives.
- Core chart widgets updated to use unified color resolution (compat mode removed).
- Contrib color helpers now wrap core `resolveColor` directly (no compat pipeline).
- Truecolor proof examples added/updated:
  - `packages/contrib/examples/truecolor.ts` (static visual proof)
  - `packages/contrib/examples/truecolor-proof.ts`
  - `packages/contrib/examples/dashboard-truecolor-dump.ts`
- Dashboard proof: bar widget label prefixed with `Truecolor -` and forced RGB colors.
- Unified core `Table` to support data-table mode (headers + scrollable rows).
- Moved contrib log widget into core as `LogList` (contrib wrapper preserved).

## Known Gaps / Regressions

- Dashboard output still deviates from pre-refactor visuals (root cause pending).
- Parity verification still requires deterministic dumps and comparison.

## Planned Work (Concrete Steps)

1. **Layout helpers into core**
   - Move `Grid` and `Carousel` to `packages/core`.
   - Keep contrib wrappers to preserve API shape.
2. **Dependency-light widget migrations**
   - Move `bar`, `stacked-bar`, `donut`, `gauge`, `gauge-list`, `sparkline`, `lcd`, `tabs` into core.
3. **Name conflict resolution**
   - Contrib `line` (chart) → core `LineChart`.
   - Contrib `log` → core `LogList`.
4. **Shared utils into core**
   - `mergeRecursive`, `abbreviateNumber`, `getInnerBoxSize`, `truncateAnsiLines` (merge with `text-utils.ts`).
5. **Compatibility shims**
   - Preserve contrib exports and blessed-contrib naming while core types move/rename.
6. **Runtime alignment**
   - Ensure migrated code uses runtime injection and core utilities only.

## Validation / Proof

- Visual proof: `pnpm exec tsx packages/contrib/examples/truecolor.ts`
- Dashboard run: `pnpm exec tsx packages/contrib/examples/dashboard.ts`
- Dump proof: `pnpm exec tsx packages/contrib/examples/dashboard-truecolor-dump.ts`
- Inspect dumps: `packages/contrib/examples/out/*`

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
  - Detailed plan: `packages/core/COLOR_SYSTEM_REFACTOR.md`.

## What Should Stay In Contrib (Compatibility Layer)

These widgets rely on optional external dependencies, node-centric behaviors, or blessed-contrib compatibility.

### Widgets with Optional External Dependencies

- `packages/contrib/src/widgets/markdown.ts` (marked, marked-terminal, chalk, process.env)
- `packages/contrib/src/widgets/diff.ts` (diff, cli-highlight, chalk, x256, process.env)
- `packages/contrib/src/widgets/map.ts` (map-canvas)
- `packages/contrib/src/widgets/picture.ts` (picture-tuber)

### Compatibility Color Utilities

- `packages/contrib/src/color-utils.ts` (compat wrappers over core `resolveColor`)
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
  - Status: unified core `Table` supports data-table mode; contrib wrapper points to core `Table`.

- `log`
  - Core: `packages/core/src/widgets/log.ts` (ScrollableText-based)
  - Contrib: `packages/contrib/src/widgets/log.ts` (List-based logger)
  - Status: list-based logger moved to core as `LogList` with contrib wrapper.

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
