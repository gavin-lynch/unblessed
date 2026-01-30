# Performance Playbook (Rendering)

Terminal UI performance is primarily about **minimizing bytes written** to the terminal, then minimizing the CPU required to decide what to write. Parallelism/WASM can help for preparation work, but output is inherently serialized.

This document lists realistic, high-ROI options for improving render time and responsiveness in this codebase.

## Guiding Principles

- Measure first: profile the pipeline stages separately (layout, render, diff, encode/emit, flush latency).
- Optimize for the common case: most frames change a small portion of the screen.
- Reduce allocations and GC: prefer dense, typed, interned representations.
- Avoid full-screen work when possible: damage tracking beats faster full-screen scans.

## Highest ROI Changes (Recommended Order)

### 1) Damage Tracking (Render Only What Changed)

Instead of diffing the entire screen each frame, track damage as you compose/render.

- Track damage as rectangles or per-line spans.
- Each widget render/composition step reports its dirty area.
- Screen draw iterates only damaged lines/spans.
- Keep a full redraw escape hatch (resize, global style/theme switch, terminal capability change).

Why it matters: If most frames touch a small region, this turns an O(width*height) scan into O(changed).

### 2) Dense Cell Storage (Typed Arrays + Attribute Interning)

Replace allocation-heavy per-cell objects with dense storage.

Suggested model:

- `attrs: Uint32Array` (or per-line `Uint32Array`) storing `attrId`.
- `chars: Uint32Array` storing Unicode codepoints (0 for space).
- Optional `flags: Uint8Array` (wide-char markers, combining flags, etc.).
- `AttrTable`: `attrId -> { flags, fg, bg }` where `fg/bg` can be default/index/rgb.

Benefits:

- Dramatically reduced GC pressure.
- Faster comparisons (integer equality).
- Enables fast hashing/memcmp-style operations.

### 3) Fast Line Skips (Line Hashing)

If you keep a pending vs output buffer model, add a cheap line-level skip.

- Maintain per-line hashes for pending and output lines.
- If hashes match, skip per-cell comparisons for that line.
- If hashes differ, diff that line (optionally using span/binary-search strategies).

Use hashes over integers (`attrId`, `codepoint`) rather than strings.

### 4) Fewer / Better ANSI Sequences (Output Minimization)

Even with perfect diffing, output strategy dominates perceived performance.

- Coalesce changed cells into spans: `CUP` once, `SGR` once, then emit a run.
- Reduce cursor movement: prefer relative moves (`CUB/CUF`) when beneficial.
- Reduce SGR churn: track current SGR state and emit deltas only.
- Use terminal features where it wins (BCE, ECH, CSR+IL/DL for inserts/deletes).

Key metric: bytes written per frame (and count of `CUP`/`SGR` notices).

### 5) Incremental Layout (Yoga/React)

Yoga is good, but layout can be a frame-cost when run too often.

- Only re-run layout when layout-affecting inputs change.
- Cache text measurement and wrapping by `(text, width constraint, style)`.
- Use subtree versioning: if inputs unchanged, skip layout+render for that subtree.
- Separate measurement (text) from Yoga layout; invalidate precisely.

## Text & Unicode Hot Paths

Text shaping/wrapping can dominate in list-heavy or log-heavy UIs.

- Cache wrapping/truncation results; keep invalidation tight.
- Avoid re-parsing ANSI on every frame; store parsed segments.
- Keep ASCII as the hot path; handle wide/combining as a slower side path.

## Parallelism: Where It Helps (and Where It Does Not)

Output is serialized. Parallelism helps only for expensive preparation work.

Good worker candidates (Node workers / Web Workers):

- Yoga layout + measurement for large trees.
- Heavy text work (wrapping, syntax highlighting, markdown).
- Image decode/quantize/dither.

Not great candidates:

- Final terminal output (must be ordered; IPC overhead can erase gains).

Rule of thumb: workers help when the result you send back is compact (damage spans + runs), not a full screen buffer.

## WASM: Best Realistic Uses

WASM is most useful once you already use typed arrays for the screen buffer.

Strong candidates:

- Per-line diff/hashing over typed arrays (SIMD-friendly).
- Image quantization/dithering (if image widgets matter).
- Potentially Unicode width calculations (only if current profiling shows it hot).

Less compelling:

- Replacing the entire renderer (bridging costs + still need JS to write to streams/DOM).

## Browser-Specific Notes

If targeting xterm.js, most wins still come from reducing bytes written and avoiding full-screen updates.

Radical option:

- A dedicated canvas/WebGL grid renderer can be extremely fast, but it becomes a separate backend with different semantics and maintenance cost.

## Instrumentation (Do This Early)

Add stage timing + counters so changes are data-driven:

- Timings: layout, render-to-buffer, diff, encode/emit, flush latency.
- Counters: cells visited, lines visited, spans emitted, bytes written, `CUP` count, `SGR` count.
- Benchmarks: keep representative cases (empty render, 100 boxes, large list scroll, resize).

## Suggested Implementation Sequence

1. Add render stats and stage profiling.
2. Implement damage tracking and span-based draw.
3. Switch to typed arrays + attribute interning.
4. Add line hashing fast path.
5. Improve ANSI emission coalescing and SGR delta tracking.
6. Make layout incremental and measurement cached.
7. Consider workers for heavy layout/text/image workloads.
8. Consider WASM for diff/hashing (only after typed-array buffers exist).
