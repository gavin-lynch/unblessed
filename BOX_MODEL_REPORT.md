# Box Model Investigation (Core)

## Summary

- The universal layout/box model lives in `Element` (core), not in a separate layout class.
- `Box` is a thin subclass of `Element` and is the foundational widget for all rectangular UI.
- Most widgets rely on `Element`'s computed “inner” metrics (`iwidth`, `iheight`, `ileft`, `itop`, etc.) and then manage their own drawing logic on top of those values.

## Where the Box Model Lives

### Core Element

- `Element` parses and normalizes padding/border at construction time.
- Computed getters expose a consistent inner-box model:
  - `ileft` / `itop` / `iright` / `ibottom`
  - `iwidth` / `iheight`
- These are used throughout layout, child positioning, clipping, and rendering.

Relevant references:

- `packages/core/src/widgets/element.ts`
  - Padding normalization and border handling
  - `iwidth` / `iheight` getters

### Box

- `Box` is just `Element` with no extra layout logic.
- Any “box model” semantics are inherited from `Element`.

Relevant references:

- `packages/core/src/widgets/box.ts`

## How Widgets Use It

### Canvas Widgets

- Canvas widgets use the inner-box metrics to size the drawable area.
- `CanvasWidget.calcSize()` uses:
  - `width - iwidth`
  - `height - iheight`
- `CanvasWidget.getFrameFromCanvas()` trims output based on available inner width.

Relevant references:

- `packages/core/src/widgets/canvas.ts`

### Other Widgets

- Many widgets use `iwidth`/`iheight` directly for sizing, e.g. terminal, tables.
- There is no separate, reusable “box model class” beyond `Element`.
- Widgets generally own their own internal sizing rules, but use `Element`’s inner metrics as the baseline.

Relevant references:

- `packages/core/src/widgets/terminal.ts`
- `packages/core/src/widgets/table.ts`
- `packages/core/src/widgets/listtable.ts`

## Types/Contracts

- Box model inputs are defined in `ElementOptions` (padding, border, etc.).
- `BoxOptions` extends `ElementOptions` via type imports.

Relevant references:

- `packages/core/src/types/options.ts`

## Conclusion

There is no standalone “box model” class. The canonical source of truth is `Element` and its computed inner metrics (`iwidth`, `iheight`, `ileft`, `itop`, etc.). Widgets (core and contrib) compute their own internal layout/drawing, but they anchor sizing and clipping to the `Element` inner box model.

---

## Contrib Consistency Audit

### Summary

- Mixed usage: some contrib widgets honor `iwidth`/`iheight` (inner box) correctly, others hardcode raw `width`/`height` and subtract magic numbers.
- Most inconsistencies are in `calcSize()` overrides for Canvas-based widgets and in manual layout math.
- Result: padding/border changes can clip or misalign content.

### Status (Applied)

- Updated `calcSize()` to use **border-only** inner sizing (blessed-contrib compatibility) in:
  - `packages/contrib/src/widgets/gauge.ts`
  - `packages/contrib/src/widgets/gauge-list.ts`
  - `packages/contrib/src/widgets/line.ts`
  - `packages/contrib/src/widgets/map.ts`
  - `packages/contrib/src/widgets/donut.ts`
  - `packages/contrib/src/widgets/lcd.ts`
- Updated sizing for non-canvas renderers:
  - `packages/contrib/src/widgets/sparkline.ts`
  - `packages/contrib/src/widgets/picture.ts`

### Uses `iwidth`/`iheight` (consistent)

- `packages/contrib/src/widgets/bar.ts`
  - `calcSize()` uses `this.width - this.iwidth`, `this.height - this.iheight`.
- `packages/contrib/src/widgets/stacked-bar.ts`
  - `calcSize()` uses `this.width - this.iwidth`, `this.height - this.iheight`.

### Uses raw `width`/`height` (inconsistent with core box model)

- `packages/contrib/src/widgets/gauge.ts`
  - `calcSize()` uses `this.width - 2` and `this.height` (ignores padding/border via `iwidth/iheight`).
- `packages/contrib/src/widgets/gauge-list.ts`
  - `calcSize()` uses `this.width - 2` and `this.height`.
- `packages/contrib/src/widgets/line.ts`
  - `calcSize()` uses `this.width * 2 - 12` and `this.height * 4 - 8`.
  - Does not use inner metrics; assumes fixed padding regardless of border/padding.
- `packages/contrib/src/widgets/map.ts`
  - `calcSize()` uses `this.width * 2 - 12` and `this.height * 4`.
  - Ignores border/padding.
- `packages/contrib/src/widgets/donut.ts`
  - `calcSize()` uses `this.width * 2 - 5` and `this.height * 4 - 12`.
- `packages/contrib/src/widgets/lcd.ts`
  - `calcSize()` uses `this.width * 2 - 8` and `this.height * 4 - 12`.

### Layout math that ignores inner box

- `packages/contrib/src/widgets/sparkline.ts`
  - `maxWidth = this.width - 2` (does not use `iwidth`).
- `packages/contrib/src/widgets/picture.ts`
  - Placeholder sizing uses `this.width - 2`, `this.height - 2`.

### Notes on Core Behavior

- Core `CanvasWidget.calcSize()` already uses `width - iwidth` / `height - iheight` for the inner canvas and handles braille scaling.
- Many contrib Canvas widgets override `calcSize()` and bypass that logic.

## Next Steps

1. **Normalize contrib `calcSize()` to respect inner box** (done)
   - Updated Canvas widgets to use `innerWidthChars`/`innerHeightChars`.

2. **Replace magic constants with named offsets** (done)
   - Added named padding constants in `line`, `map`, `donut`, and `lcd` calcSize logic.

3. **Audit non-canvas widgets that do manual sizing** (done)
   - `sparkline.ts` and `picture.ts` now use inner box metrics.

4. **Add regression checks** (done)
   - Added a box model sizing test in `packages/contrib/__tests__/widgets.test.ts`.
