# Map Canvas Rendering Report

## Context

`packages/contrib/examples/map.ts` renders a world map using `map-canvas`. The expected output (map outlines) is not showing; instead we see a simplified grid. The map widget currently passes a canvas implementation to `map-canvas` and falls back when initialization fails.

## What map-canvas expects

From `map-canvas@0.1.5/map.js`:

- Constructor signature: `new Map(options, canvas)`
- It calls `canvas.getContext('2d')` and stores it as `this.ctx`.
- Required context API (methods + properties):
  - Methods: `fillRect`, `stroke`, `moveTo`, `lineTo`, `fillText`, `beginPath`, `fill`, `arc`, `clearRect`
  - Properties: `fillStyle`, `strokeStyle`, `lineWidth`, `font`, `textBaseline`
- It **does not** use `canvas.width`/`canvas.height` directly (sizes come from `options.width/height`).

## Current unblessed canvas stack

`CanvasWidget` creates a `Canvas` wrapper and a `Canvas2DContext` backed by `DrawilleCanvas` (for map). `Canvas2DContext` already exposes the methods/properties `map-canvas` uses. The main mismatch is **API shape**:

- `map-canvas` wants an HTML‑canvas‑like object with `getContext('2d')`.
- Our `Canvas` wrapper exposes `getContext()` without accepting a type.
- Passing the raw drawille buffer (`ctx._canvas`) does **not** work because it doesn’t implement `getContext`.

## Likely failure points

1. **Canvas object shape mismatch**
   - Passing `ctx._canvas` (raw drawille) fails because it has no `getContext('2d')`.
   - Passing `Canvas` wrapper works only if it provides `getContext('2d')` or a shim does.

2. **Initialization loops / memory growth**
   - Multiple init retries without guards can cause repeated allocations and render calls.
   - Any error in `map-canvas` (or in our context) currently leads to fallback grid drawing or repeated attempts.

3. **Missing no‑op properties on context**
   - `font` and `textBaseline` are assigned; if the context rejects these, it can throw.
   - Our `Canvas2DContext` can accept these as no‑ops to keep compatibility.

## Alternative approaches

### A) Minimal HTMLCanvasElement shim (recommended)

Create a lightweight canvas object that implements:

- `getContext('2d')` returning our existing `Canvas2DContext`
- `width`/`height` (optional)
- `ctx.canvas = shim` for compatibility

This lets `map-canvas` operate exactly as designed while reusing our drawille rendering. This is the **least invasive** and keeps the dependency lightweight.

### B) Use drawille-canvas directly

`map-canvas` was built for blessed‑contrib, which historically used `drawille-canvas` (HTML‑canvas‑like). We could instantiate a drawille-canvas object instead of our `Canvas` wrapper, then render its buffer into our widget.

Pros: matches `map-canvas` expectations closely.  
Cons: adds another dependency and a second canvas stack to maintain.

### C) Render via node‑canvas, then convert to terminal

Use `canvas` (node‑canvas / Cairo) to get a real bitmap, then convert to terminal pixels using the existing image renderer.

Pros: perfect canvas compatibility.  
Cons: heavy native dependencies, slower, not ideal for a “core” terminal lib.

### D) Implement a small map renderer in‑house

Use the map data (the shape coordinates) and render directly with `DrawilleCanvas` or `AnsiTermCanvas`.

Pros: no external dependency, full control.  
Cons: more work; need to re‑implement parts of `map-canvas` (projection, graticule, labels).

## Recommendation

Start with **A (canvas shim)** and make sure errors are visible:

1. Pass a shim with `getContext('2d')` and `width/height`.
2. Ensure `Canvas2DContext` accepts `font` and `textBaseline` (no‑ops if unused).
3. Log or surface any exceptions so we can see real failures.

If the shim still fails, the next best step is **B** (use `drawille-canvas`) because it matches the environment `map-canvas` was originally built for.

## Next steps to validate

- Run the map example with the shim and capture any thrown error.
- If it still fails, capture the exact exception and adjust the context API or fallback to drawille‑canvas.
