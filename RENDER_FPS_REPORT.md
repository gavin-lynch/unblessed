# Rendering Framerate Analysis Report

## Goal

Provide a clean, low‑overhead way to measure rendering performance (FPS, frame time, dropped frames) across `@unblessed/*` widgets and apps.

## Requirements

- Minimal overhead when disabled.
- Works in core (platform‑agnostic), with Node/browser runtime integration.
- Captures: frame duration, render count, average FPS, p50/p95/p99 frame time, dropped frames.
- Supports both **screen.render()** calls and **actual terminal output flush**.

## Options Overview

### Option A — Built into `@unblessed/core` (Recommended)

Add a lightweight “frame metrics” module in core and expose it via `Screen`.

**Pros**

- Universally available (core and all adapters).
- No extra package for users.
- Can hook directly into `Screen.render()` and `Program._write()`.

**Cons**

- Needs careful design to avoid overhead when disabled.

**Design Sketch**

- Add a `FrameMetrics` helper in core:
  - `startFrame()` / `endFrame()`
  - internal ring buffer of durations (e.g., 300 samples)
  - computed stats: avg FPS, p50/p95/p99, min/max
- Hook points:
  - `Screen.render()` start/finish
  - `Program._write()` flush counts (optional: bytes per frame)
- Enable via `screen.options.debugPerformance` or env `UNBLESSED_FPS=1`.
- Expose API: `screen.getRenderStats()` and `screen.resetRenderStats()`.

### Option B — Separate package `@unblessed/perf`

Provide a plugin that instruments core at runtime.

**Pros**

- Keeps core lean and optional.
- Allows advanced profiling features without core changes.

**Cons**

- Harder to integrate cleanly with rendering internals.
- Requires extra dependency/installation and runtime wiring.

### Option C — Optional module under `packages/vrt` or `packages/tools`

Add tooling for profiling/visual regression environments.

**Pros**

- Useful for CI/benchmarks.
- Keep production runtime minimal.

**Cons**

- Not available to end‑users in their apps without extra setup.

## Recommended Path

Implement **Option A** in core with a minimal, opt‑in stats collector:

1. **Core frame metrics**
   - New helper in `packages/core/src/lib/frame-metrics.ts`.
   - Ring buffer of frame times.
   - Simple percentile calculation.

2. **Hook into `Screen.render()`**
   - `startFrame()` at render entry.
   - `endFrame()` at render completion.

3. **Expose API on `Screen`**
   - `getRenderStats(): FrameStats`
   - `resetRenderStats()`

4. **Optional output overlay**
   - For dev builds, allow a tiny overlay widget that reads stats and draws them.

## Metrics Definition

**Frame time:** time in ms from `Screen.render()` entry to exit.

**FPS (average):** `1000 / avgFrameTime`.

**Dropped frames:**

- If target is 60 FPS, dropped when `frameTime > 16.67ms`.
- Make target configurable (30/60/120).

**Percentiles:** p50/p95/p99 based on the ring buffer.

## Minimal API Shape

```ts
interface FrameStats {
  count: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  fpsAvg: number;
  dropped: number;
  bytesWritten?: number;
}
```

## Notes on Platform Support

- Core uses runtime injection, so timing should use `getRuntime().process.hrtime` where available; fallback to `Date.now()`.
- Browser runtime can use `performance.now()`.

## Suggested Implementation Order

1. Add frame metrics helper in core.
2. Wire into `Screen.render()`.
3. Expose API and add docs.
4. (Optional) add sample overlay widget in contrib examples.

## Next Steps (If Approved)

- Implement `FrameMetrics` in core.
- Add unit tests for percentile calculation.
- Add simple example in `packages/contrib/examples/`.
