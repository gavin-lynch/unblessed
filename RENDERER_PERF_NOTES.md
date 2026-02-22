# Renderer Performance Notes

## Scope

- Primary target: Node.js terminal rendering.
- Secondary target: browser compatibility (xterm.js style adapters).

## What High-Performance Renderers Do

### Typical Rendering Pipeline

1. **Shared cell buffer** (char + fg/bg + attrs per cell)
2. **Dirty tracking** (diff current vs previous buffer)
3. **Minimal ANSI emission** (only changed cells)
4. **Batched writes** (single write per frame)
5. **Skip unchanged regions** (cursor jumps, partial redraw)

### Why It’s Fast

- Avoids per-frame ANSI parsing and large string allocation.
- Diffing is O(n) on a flat buffer with cache‑friendly access.
- Output is proportional to the number of changes, not the full screen size.

## How This Relates to unblessed

### Current Path (Summary)

- Widgets often render **ANSI strings** (canvas frames, tags, etc.).
- `Screen` parses those strings into its **cell buffer**.
- `Screen` diffs current vs old buffer and outputs only changes.

**Strength:** The diff + minimal output stage is already strong.

**Weakness:** Widgets that emit large ANSI frames incur extra parsing and allocations each frame.

### Where A Shared Buffer Helps

- Canvas widgets (Line/Map/Donut/LCD) are the biggest wins.
- They currently produce large ANSI frames that are re‑parsed.
- Writing directly into a shared cell buffer would skip that step.

## TypeScript-Level Optimization Ideas

### Reduce Allocations in Hot Paths

- Use **typed arrays** (Uint32/Uint16) for attributes, colors, and chars.
- Reuse buffers (ring buffer / free list) instead of allocating per frame.
- Avoid repeated string concatenation in the render loop.

### Improve Cache Locality

- Use a **flat array** for the cell buffer (row-major order).
- Keep “current” and “previous” arrays contiguous to improve diff speed.

### Minimize Escape Parsing

- Avoid ANSI strings where possible.
- If ANSI must be used, avoid re‑parsing unchanged data by caching parsed spans.

## WASM: When It Helps (and When It Doesn’t)

### Good Candidates

- **Diffing** two large buffers (tight loop).
- **ANSI parsing** if input is huge and stable.
- **Text layout** (wrap/truncate) if heavily used.

### Risks

- JS↔WASM boundary costs can outweigh gains for small frames.
- WASM is best when the work is **large and batchable**.

### Practical Guidance

- Start with JS/TS optimizations first.
- Use WASM only for diff/parse if profiling shows they dominate runtime.

## Suggested Roadmap (Low‑Risk)

1. **Instrument render timing** in core (frame time + output size).
2. **Profile hot paths** (string building, ANSI parsing, diff).
3. **Optimize allocations** in the worst paths.
4. **Optional shared buffer** for canvas widgets only.
5. **Re‑evaluate** before migrating other widgets.

## Node vs Browser Considerations

### Node

- Prefer `process.stdout.write()` batching.
- Use `process.hrtime()` for accurate frame timing.

### Browser

- Rendering is mediated by xterm.js (or other terminal emulators).
- Avoid massive per‑frame reflows by minimizing output.
- Prefer the same diff strategy; output is still ANSI.

## Bottom Line

- unblessed already has a fast **diff + minimal output** stage in `Screen`.
- The biggest perf win is avoiding repeated **ANSI parsing** for large frames.
- A shared buffer can help, but should be introduced incrementally (canvas first).
