# Rendering Performance Strategy

## Purpose and Scope

This document unifies our renderer performance notes and FPS reporting ideas into a single plan. The goals are to improve performance, reduce flicker, and preserve credibility through measurable regressions.

Primary target is Node.js terminal rendering. Browser support (xterm.js adapters) is secondary and should remain compatible.

## Current Renderer Snapshot

### Pipeline Today (High Level)

1. Widgets render into ANSI strings.
2. `Screen` parses ANSI into a cell buffer.
3. `Screen` diffs current vs previous buffer.
4. Minimal ANSI output is emitted.

### Strengths

- Diff + minimal output is already strong.
- Output scales with changed cells, not full screen.

### Weaknesses

- Repeated ANSI parsing for large frames (canvas-style widgets) is expensive.
- Allocation churn in hot paths.

## Performance Goals and Constraints

- Minimal overhead when instrumentation is off.
- Centralized color policy (truecolor vs 256) with low overhead.
- Avoid flicker (no full clears unless necessary).
- Keep memory footprint tight and predictable.

## Architecture Overview

### Buffer Model

- Maintain two flat buffers: `current` and `previous`.
- Cell data stored in typed arrays with compact packing (char + attributes).

### Dirty Tracking

- Diff `current` vs `previous` per frame.
- Emit only changed spans, coalesced into contiguous runs.

### Output Batching

- Prefer a single write per frame when possible.
- Minimize cursor jumps and redundant SGR sequences.

## Write Cache and Color Strategy

### Canonical Style Representation

- Store style as canonical RGB + flags in the buffer.
- Do not store terminal-specific escape sequences in cells.

### Palette Translation Layer

- A single translation function maps canonical style to output attributes.
- Switching truecolor to 256 uses this layer only (no widget changes).

### Caching

- Cache style to SGR sequence mappings.
- Cache parsed ANSI spans when safe (large static frames).

### Memory Model

- Use typed arrays for attributes.
- Use a shared glyph table for strings to avoid per-cell allocations.

## Flicker Diagnosis and Root Causes

- Full screen clears or large region resets.
- CSR edge cases causing partial redraw artifacts.
- Excessive ANSI parsing in large widgets causing late frames.

## Instrumentation and FPS Reporting

### FPS Should Measure

- Frame time for `Screen.render()` (start/end).
- Optional output flush time and bytes written.

### Metrics

- Avg FPS and frame time percentiles (p50/p95/p99).
- Dropped frames vs target FPS (configurable: 30/60/120).
- Bytes written per frame (optional).

## Dev Tooling as @gavin-lynch/unblessed-perf (Recommended)

### Design Goal

Keep instrumentation tooling in a separate package while allowing opt-in hooks from core with near-zero overhead.

### Core Hook Surface (Minimal)

Core exposes a single optional observer hook. When unset, cost is a single null check.

```ts
type RenderObserver = {
  renderStart?(screen: Screen, tMs?: number): void;
  renderEnd?(screen: Screen, tMs?: number): void;
  outputFlush?(bytes: number, tMs?: number): void;
};
```

- Hook points:
  - `Screen.render()` start/end
  - `Program._write()` flush (bytes written)

### @gavin-lynch/unblessed-perf Responsibilities

- Collect frame metrics from hooks.
- Provide FPS stats API and optional overlay widget.
- Keep all heavy logic outside core.

### Status

- Core hook surface is implemented.
- `@gavin-lynch/unblessed-perf` provides a render observer and overlay helper.
- Example: `packages/contrib/examples/perf-overlay.ts`.

## Existing Tooling: @gavin-lynch/unblessed-vrt

- VRT records `screen.screenshot()` frames and compares regressions.
- It is orthogonal to FPS measurement.
- Use VRT to validate visual stability before/after performance work.

## Optimization Roadmap (Low Risk)

1. Add hook surface in core and externalize metrics to @gavin-lynch/unblessed-perf.
2. Profile hot paths: ANSI parse, diff, output write.
3. Reduce allocations in the worst paths.
4. Introduce shared buffer support for canvas widgets first.
5. Re-evaluate larger refactors with real metrics.

## Testing and Validation

- Use VRT golden snapshots to catch visual regressions.
- Track performance baselines with repeatable benchmarks.
- Record before/after metrics for any renderer changes.

## Decisions Needed

- Confirm core hook API shape and naming.
- Decide whether to ship an FPS overlay widget in @gavin-lynch/unblessed-perf.
- Choose default target FPS threshold for dropped frame reporting.
