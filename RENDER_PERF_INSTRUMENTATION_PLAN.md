# Render Performance Instrumentation Plan

## Goal

Add low-overhead instrumentation to separate render cost from output cost, so we can explain and fix the 20–30 FPS ceiling (especially under iTerm2 + tmux).

## What We Need to Measure

- Frame time (already tracked).
- Render time (`Screen.render()` duration).
- Output span (`Program._owrite()` activity within a frame).
- Bytes per frame and bytes per second.
- Flush count per frame (helps identify chatty output).

## Hook Strategy (Core)

Expose a minimal observer interface from core and pass timestamps:

```ts
type RenderObserver = {
  renderStart?(screen: Screen, tMs?: number): void;
  renderEnd?(screen: Screen, tMs?: number): void;
  outputFlush?(bytes: number, tMs?: number): void;
};
```

- `Screen.render()` calls `renderStart`/`renderEnd` with timestamps.
- `Program._owrite()` calls `outputFlush` with bytes + timestamp.
- When no observer is set, overhead is a single null check.

## Perf Package Metrics

Track:

- `renderAvgMs`: average render duration.
- `outputAvgMs`: average output span per frame.
- `bytesPerFrame` and `bytesPerSec`.
- `flushCount` (total) and `flushAvg` (per frame).

## Validation Workflow

1. Run animated truecolor example in iTerm2 + tmux.
2. Compare `renderAvgMs` vs `outputAvgMs`:
   - If output dominates, terminal throughput is limiting.
   - If render dominates, ANSI generation/diff is limiting.
3. Repeat outside tmux and compare.

## Optimization Plan (No Quantization)

### #2 Add a Selective String Builder

Introduce a small `StringBuilder` helper in core and use it only in hot paths
that build very large strings (e.g., full-screen gradients/canvas renderers).

Goal: reduce intermediate string allocations and GC pressure in tight loops.

### #3 Reduce Redundant SGR Codes

Avoid full resets (e.g., `\x1b[0m`) where possible, and minimize redundant
foreground/background changes by tracking prior state across rows.

Goal: reduce output bytes and terminal parsing overhead without changing output.

### #5 Batch Writing Aggressively

Ensure the renderer emits as few writes per frame as possible, ideally one.
Reduce small writes caused by intermediate flushes.

Goal: improve throughput in terminals and under tmux.

### #6 Validate With New Metrics

Use `renderAvgMs` vs `outputAvgMs` and `bytesPerSec` to confirm where time is
spent (render vs output) and whether batching reduces output cost.

## Terminal Notes (iTerm2 + tmux)

- tmux can reduce output throughput, especially with truecolor.
- If output dominates, test iTerm2 outside tmux to isolate the bottleneck.
- Consider tmux truecolor overrides if not already set.

## Deliverables

- Core hook signatures updated with timestamp support.
- Perf stats expanded to include render/output timing and throughput.
- Overlay updated to display new stats.
- Example stays unchanged; overlay should show the new fields.
