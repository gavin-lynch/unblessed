# Picture Bleed: Divergence from Tree Branch

## Goal

- Add truecolor support with minimal change from the `tree` branch.
- Functionality should match tree branch; efficiency should be preserved.

## What the Tree Branch Did

In the content-drawing loop (`element.ts`, inner loop over `x`):

```text
for (x = xi; x < xl; x++) {
  cell = lines[y][x];
  if (!cell) { ... }

  ch = content![ci++] || bch;   // Always advances; uses bch when content runs out
  while (ch === "\x1b") { ... } // Handle escape codes (ANSI only, no truecolor)
  if (ch === "\n") { ... }      // Newline: fill rest of line with bch, then continue
  ...
  lines[y][x] = createCell(attr, ch, ...);  // Write cell
}
```

- The loop always runs over the full line width: `x = xi` to `x < xl`.
- When content runs out, `ch = content![ci++] || bch` becomes `bch` (background char, usually space).
- So every cell on the line is written: either a content character or `bch`.
- The “rest of the line” is filled naturally inside the same loop by continuing to iterate and using `bch` (and current/default attr). No separate fill step.

## Where We Diverged

### 1. We break early instead of continuing and filling with `bch`

We introduced `_contentWidth` and stop the loop when we pass the content boundary:

```ts
if (this._contentWidth != null && x - xi >= this._contentWidth) {
  break;
}
```

So we never visit cells with `x - xi >= _contentWidth`. Those cells are never written in the loop.

### 2. We added a separate fill after the loop

Because we break early, we added a second mechanism to fill the “bleed” region:

```ts
if (this._contentWidth != null) {
  const fillStartX = xi + this._contentWidth;
  if (fillStartX < xl) {
    this.screen.fillRegion(dattr, bch, fillStartX, xl, yi, yl);
  }
}
```

So we now have:

- Loop: “draw content until _contentWidth, then stop.”
- Separate call: “then fill the rest of the line with dattr + bch.”

In the tree branch there is only one mechanism: the same loop that draws content also fills the rest of the line with `bch` (and the same “current” semantics) by never breaking.

### 3. Newline fill was constrained to _contentWidth

On newline we fill from current `x` up to `fillEndX`, and we defined:

```ts
const fillEndX = this._contentWidth != null ? Math.min(xl, xi + this._contentWidth) : xl;
```

So when `_contentWidth` is set we only fill up to the content width on newline, not to `xl`. That is consistent with “content ends at _contentWidth” but is another behavioral change from tree (which would fill to `xl`).

## Why the fill was “necessary” in the current design

- We wanted to avoid drawing content past `_contentWidth` (correct).
- We did that by breaking out of the loop, so cells past `_contentWidth` were never written.
- The screen output assumes every cell in the line is written; otherwise we get stale/truecolor bleed.
- So we had to do something for those cells; the minimal fix was a separate `fillRegion` for the bleed area.

So the fill is “necessary” only because we chose to implement the boundary by breaking and not writing those cells in the loop. It is not necessary if we instead match the tree behavior and keep filling the rest of the line inside the same loop.

## How to match tree branch behavior (recommended direction)

Do not break the loop at `_contentWidth`. Keep the loop over the full line `x = xi .. xl` and:

- When `x - xi < _contentWidth`:  
  - Read from content: `ch = content![ci++] || bch`, handle escape codes (including truecolor), then write the cell as we do now (with truecolor support).
- When `x - xi >= _contentWidth`:  
  - Do not read from content (do not advance `ci`).  
  - Force fill semantics: e.g. `ch = bch`, and use default attr (and no truecolor), e.g. `attr = dattr`, `truecolorBg = null`, `truecolorFg = null`, then write the cell.

So we still “don’t draw content” past `_contentWidth` (we never use content or content-driven attr/truecolor there), but we do “fill the rest of the line” the same way tree did: one cell at a time, with `bch` and default attr, inside the same loop. No separate `fillRegion` call.

Concretely:

- Remove the two `_contentWidth` checks that cause `break`.
- When `this._contentWidth != null && x - xi >= this._contentWidth`:  
  - Set `ch = bch`, `attr = dattr`, `truecolorBg = null`, `truecolorFg = null` (and do not advance `ci`), then fall through to the same “write cell” path.
- Remove the post-loop `fillRegion(dattr, bch, fillStartX, xl, yi, yl)`.
- Newline fill: either keep `fillEndX = Math.min(xl, xi + _contentWidth)` for consistency with “content ends here,” or align with tree and fill to `xl`; that’s a separate small decision.

Result:

- Behavior matches tree: “content then fill rest of line with bch/default” in one loop.
- Minimal change: one loop, one place that decides “content vs fill” based on `_contentWidth`.
- No extra full-region fill call; we only write cells that need to be written (same as tree, plus truecolor).

## Summary

| Aspect | Tree branch | Current code | Preferred (match tree) |
|--------|-------------|-------------|------------------------|
| Loop bounds | `x = xi` to `x < xl` | Same, but we `break` at _contentWidth | Same bounds, no break |
| Past content | Same loop, `ch = bch`, keep writing | Not written in loop | Same loop, `ch = bch`, dattr, no truecolor, write |
| Extra fill | None | `fillRegion(dattr, bch, ...)` after loop | None |
| Truecolor | N/A | Supported in content region | Same; past _contentWidth force null truecolor + dattr |

So: we diverged by implementing “content boundary” as “stop the loop and then fill in a separate pass.” To match the tree branch and keep changes minimal, we should implement it as “same loop, but past _contentWidth treat as fill (bch + default attr, no truecolor)” and remove the separate fill.
