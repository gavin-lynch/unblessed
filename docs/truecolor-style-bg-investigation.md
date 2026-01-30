# Truecolor style.bg investigation: #2B353C showing as #303030

## Summary

**Root cause:** `style.bg` (and `style.fg`) when set to a hex value like `#2B353C` are **always quantized to the 256-color xterm palette**. There is no truecolor path for default/fill cell background. The closest 256-color match to #2B353C is likely a grey like #303030, so you see the wrong color.

## Evidence

### 1. Element default style uses `colors.convert()` only

**File:** `packages/core/src/widgets/element.ts`

```ts
sattr(style: any, fg?: any, bg?: any): number {
  // ...
  return (
    ((invisible ? 16 : 0) << 18) |
    // ...
    (colors.convert(fg) << 9) |
    colors.convert(bg)
  );
}
```

- `dattr = this.sattr(this.style)` packs **only** the result of `colors.convert(style.bg)` into the attribute integer.
- There is no `toCellColor()` or truecolor path here; the packed integer holds a **256-color index**, not RGB.

### 2. `colors.convert()` quantizes hex to 256-color

**File:** `packages/core/src/lib/colors.ts`

- `colors.convert("#2B353C")` → for string input, calls `color = colors.match(color)`.
- `colors.match(hex)` → `hexToRGB(hex)` gives `[43, 53, 60]`, then finds the **closest** color in `colors.vcolors` (the 256 xterm palette) and returns that **index** (0–255).
- So #2B353C is turned into an index; the actual RGB is never stored for style.

### 3. Fill/default cells get no truecolor

**File:** `packages/core/src/widgets/screen.ts` – `fillRegion()`

```ts
lines[yi][xx] = createCell(attr, ch, null, null);
```

- Fill regions (padding, cleared area, etc.) are filled with `(dattr, ch, null, null)`.
- **truecolorBg and truecolorFg are always `null`** for these cells.
- So when the screen renders, it uses the packed `attr` and outputs **48;5;n** (256-color), not **48;2;r;g;b** (truecolor).

### 4. Truecolor is only used when it comes from content

**File:** `packages/core/src/widgets/element.ts` (parseContent / _parseContent)

- `truecolorBg` / `truecolorFg` are set only when parsing **content** that contains `\x1b[48;2;r;g;bm` or `\x1b[38;2;r;g;bm`.
- Default style (empty/fill cells) never sets truecolor; it only uses `dattr` from `sattr(this.style)`.

## Conclusion

- **#2B353C** is converted to an xterm 256-color index via `colors.match()`.
- That index is rendered as **48;5;n**; the terminal shows the n-th xterm color (e.g. a grey like #303030).
- So the wrong color is **not** a terminal bug; it’s the code path: **element style.bg/style.fg never produce truecolor for default/fill cells**.

## Fix (implemented)

See **docs/truecolor-holistic-analysis-and-testing.md** for the full analysis and testing strategy.

Summary of what was implemented:

1. **`screen.fillRegion()`** – Added optional `truecolorBg` and `truecolorFg`; filled cells use them when provided so output uses `48;2;r;g;b` / `38;2;r;g;b`.

2. **Element default fill** – In render we compute `defaultTruecolorBg` / `defaultTruecolorFg` from `this.style.bg` / `this.style.fg` via `toCellColor()`, pass them to `fillRegion()` for padding/valign fill, and use `truecolorBg ?? defaultTruecolorBg` (and fg) when creating content/fill cells.

3. **Scrollbar / track** – Resolve scrollbar/track style with `toCellColor()` and pass truecolor to `fillRegion()` and `createCell()` for the scrollbar column.

4. **ProgressBar** – Resolve `style.bar` with `toCellColor()` and pass truecolor to `fillRegion()` for the bar fill.
