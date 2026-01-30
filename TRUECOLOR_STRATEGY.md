# Grand Unified Truecolor Strategy

This document proposes a single, coherent architecture for color handling (16/256/truecolor), cell storage, and diff-based screen rendering in this repo.

It is intentionally biased toward:

- correctness (no silent color loss, no “truecolor leaks”)
- performance (no extra redraws, minimal SGR output)
- predictability (one place to decide color mode, one place to parse/apply SGR)

Related background:

- `packages/core/TRUECOLOR_ANALYSIS.md`
- `truecolor-holistic-analysis-and-testing.md`

## Goals

1. Every color in the system has a single, explicit representation at the point it becomes a cell.
2. Truecolor is used only when (a) supported by the terminal and (b) requested by policy and (c) actually needed for fidelity.
3. Screen diffing accounts for color changes (including truecolor) so we never skip required redraw.
4. Rendering output emits the minimal ANSI needed, without forcing full-line resets.
5. Widgets do not reinvent color conversion; they call screen-level helpers.
6. Runtime switching between color modes (truecolor <-> 256 <-> 16) is supported and triggers a correct full repaint.

## Terminology

- **Palette color**: anything representable in 16 or 256 colors.
- **Truecolor**: 24-bit RGB emitted via `38;2;r;g;b` / `48;2;r;g;b`.
- **Cell**: the atomic unit stored in `screen.lines[y][x]` and `screen.olines[y][x]`.
- **Style resolution**: converting `style.{fg,bg}` and flags into a cell-ready representation.
- **Render state**: the current ANSI “state” the terminal is in (flags + fg/bg mode + fg/bg values).

## Non-negotiable invariants

These invariants are the foundation for correctness *and* speed.

1. **Cells are always normalized**.
   - One shape everywhere: `[attr, ch, tcBg, tcFg]`.
   - `tcBg`/`tcFg` are `null` when absent.
   - No 2-element cells, no `undefined` as a sentinel.
   - Source of truth: `packages/core/src/widgets/cell.ts`.

2. **Diffing compares all cell fields**.
   - A redraw decision must include `attr`, `ch`, `tcBg`, `tcFg`.
   - `screen.olines` must store and update truecolor fields too.

3. **Truecolor never disables flags**.
   - Bold/underline/inverse/etc apply regardless of palette vs truecolor.
   - “Truecolor present => skip attr” is not acceptable long-term.

4. **Color mode selection is screen-owned**.
   - Widgets and elements ask the screen for the chosen mode/policy.
   - SGR parsing in elements respects screen policy (e.g. if no truecolor support, a `38;2` becomes best-effort palette).

## Proposed architecture

### 1) Screen-level ColorProfile (capabilities + policy)

Introduce a single object owned by Screen:

```ts
type ColorMode = '16' | '256' | 'truecolor';

type ColorPolicy = {
  mode: 'auto' | ColorMode;          // what we target

  // When an RGB/hex color is exactly representable as a palette entry, should we
  // still store/emit it as truecolor? Splitting this by source avoids surprises.
  preferForStyle: 'fidelity' | 'compact';
  preferForContent: 'fidelity' | 'compact';

  // Should SGR truecolor sequences embedded in element content (e.g. from chalk,
  // syntax highlighters, diff renderers) be honored as truecolor when possible?
  // If false, they should be quantized to the active palette (recommended) or ignored.
  allowTruecolorFromContent: boolean;

  // When allowTruecolorFromContent is false (or effectiveMode != truecolor):
  // choose what to do with 38;2/48;2.
  // - 'quantize': convert r,g,b -> nearest palette, apply to attr (recommended)
  // - 'ignore': drop the color change
  contentTruecolorFallback: 'quantize' | 'ignore';
};

type ColorCapabilities = {
  supports16: true;
  supports256: boolean;
  supportsTruecolor: boolean;
  paletteSize: 16 | 256;             // from terminfo/tput
};

type ColorProfile = {
  capabilities: ColorCapabilities;
  policy: ColorPolicy;
  effectiveMode: ColorMode;          // resolved from policy+capabilities
};
```

**Where it lives**

- Core: `packages/core/src/lib/color-capabilities.ts` and `packages/core/src/lib/color-converter.ts` already exist.
- Screen should cache a `this.colorProfile` and expose:
  - `screen.getColorProfile()`
  - `screen.setColorPolicy(policy)` (forces repaint)

**Detection inputs (recommended)**

- `tput.colors` (authoritative for 16 vs 256)
- truecolor:
  - env: `COLORTERM=truecolor|24bit` (keep)
  - terminfo: presence of `setrgbf`/`setrgbb` if available in your tput parser
  - platform hints (optional): `TERM_PROGRAM=iTerm.app`, `WT_SESSION`, `KONSOLE_VERSION`, etc.

The project is DI-based: detection must use `getRuntime().process.env` rather than `process.env`.

**Runtime switching**

When `effectiveMode` changes:

- clear color conversion caches
- mark all lines dirty or force `screen.alloc()` + reset `olines` to blank
- next `draw()` should be treated like a full repaint

### 2) One conversion path to cell-ready color

We should converge on a single primitive:

```ts
type CellColor = {
  // always keep palette fallback in attr, even if truecolor is also present
  attrPart: number; // packed fg bits or bg bits only (not full attr)
  tc: [number, number, number] | null;
};

screen.resolveColor(color: ColorInput, channel: 'fg' | 'bg'): CellColor
```

Key rules:

- If `effectiveMode !== 'truecolor'`, `tc` must be null.
- If `effectiveMode === 'truecolor'`:
  - `color` that is already a palette index/name stays palette.
  - `color` that is RGB/hex becomes truecolor **unless** it exactly matches a palette color and policy says to keep it compact for that source.
- Always compute an attrPart (palette fallback) to keep flags + support blending/fallback.

This is where existing helpers should converge:

- `packages/core/src/lib/color-converter.ts` (`normalizeColor`, `toCellColor`) becomes screen-aware (profile-driven) instead of auto-detecting globally.
- Any widget-specific conversion logic (including in `contrib`) should depend on `screen.resolveColor()`.

### 3) Style resolution returns a CellStyle, not just attr

Today many paths call `sattr(style)` which cannot express truecolor.

Add a parallel resolver:

```ts
type CellStyle = {
  attr: number; // packed flags + palette fg/bg
  tcBg: [number, number, number] | null;
  tcFg: [number, number, number] | null;
};

screen.resolveStyle(style: BlessedStyleLike, fallbackFg?: ColorInput, fallbackBg?: ColorInput): CellStyle
```

Guidelines:

- `attr` uses the existing packed integer format, including flags.
- `tcBg`/`tcFg` are produced only by `screen.resolveColor()`.
- `resolveStyle()` should be cached per-element-per-style-object (identity cache) and invalidated on:
  - element style change
  - screen color profile change

This unlocks:

- element default fills (padding, valign)
- borders (including per-side and addressable border colors)
- scrollbar/track
- widgets like Table/ListTable/Terminal/BigText

All of these should write cells using `CellStyle` rather than guessing.

### 4) Content SGR parsing produces (attr + tc) state

Current element rendering parses truecolor via regex and updates `truecolorBg/truecolorFg` separately from `attrCode()`.

Unify this as a single “SGR application” step:

```ts
type SgrState = {
  attr: number;
  tcBg: [number, number, number] | null;
  tcFg: [number, number, number] | null;
};

screen.applySgr(params: number[], state: SgrState): SgrState
```

Implementation notes:

- Replace regex-per-escape with a small numeric parser for `\x1b[...m`.
- Handle:
  - `0`, `39`, `49` resets
  - 16-color
  - `38;5;n`, `48;5;n`
  - `38;2;r;g;b`, `48;2;r;g;b` (conditionally preserved based on policy)

Content truecolor policy behavior should be explicit:

- If `effectiveMode !== 'truecolor'`: treat `38;2`/`48;2` as unsupported; apply `contentTruecolorFallback` and keep `tc* = null`.
- If `effectiveMode === 'truecolor'`:
  - if `allowTruecolorFromContent: true`: content SGR truecolor may set `tc*` (subject to `preferForContent` exact-match downgrade).
  - if `allowTruecolorFromContent: false`: content SGR truecolor must not set `tc*`; apply `contentTruecolorFallback`.

This reduces bugs (index advancement, nested codes) and makes behavior consistent across widgets.

### 5) Cell writes always go through a tiny helper

Avoid ad-hoc `createCell(attr, ch, ...)` decisions scattered across widgets.

Introduce a hot-path helper (inlineable):

```ts
function writeCell(
  lines: Cell[][],
  y: number,
  x: number,
  ch: string,
  style: CellStyle,
  override?: boolean,
): void
```

Responsibilities:

- compare existing cell with target (including tc)
- only allocate/write if something changed (preserve perf)
- mark line dirty only when needed

This unifies “only redraw when changed” everywhere.

### 6) Screen diffing + rendering becomes a real state machine

The current `screen.draw()` logic:

- compares only `[attr,ch]` (skips tc changes)
- emits truecolor by looking at neighboring cells
- treats “tc present” as “skip attr” (drops flags)

Replace with:

1. **Diff predicate includes truecolor**:
   - a cell is unchanged iff `attr/ch/tcBg/tcFg` equal.
2. **`olines` stores full cells**:
   - update `o[x] = line[x]` after rendering.
3. **Render state is tracked explicitly**:

```ts
type RenderState = {
  flags: number;                         // from attr
  fgMode: 'default' | 'palette' | 'rgb';
  bgMode: 'default' | 'palette' | 'rgb';
  fgPalette: number;                     // if palette
  bgPalette: number;                     // if palette
  fgRgb: [number, number, number] | null;
  bgRgb: [number, number, number] | null;
};
```

For each changed cell:

- compute desired RenderState from `(cell.attr, cell.tcFg, cell.tcBg)`
- emit minimal SGR to transition from current->desired
- write `ch`

**Important optimizations**

- Keep the existing fast-path when both current and desired are palette-only and flags-only:
  - reuse existing `codeAttr()` machinery.
- Disable BCE “erase to end of line” optimization when any truecolor is active in the region, because BCE relies on palette background state.

**Line-end resets**

Do not unconditionally append `\x1b[m` at the end of every line.

- Only reset when required:
  - if render state differs from screen default at EOL *and* next operation assumes default
  - or when emitting `cup()` to another row and you want a known baseline

Practical approach:

- reset to default at the end of `draw()` (once), not at end of each line.
- if you need to avoid background “leak” across `cup()` calls, do the reset when you detect a transition from a cell with non-default bg to a gap where nothing will be printed (rare in this renderer).

### 7) Blending, transparency, and shadows must account for truecolor

Currently `colors.blend()` operates only on packed palette attributes.

Define behavior explicitly:

- If neither side has truecolor: keep current attr blending.
- If either side has truecolor and `effectiveMode === 'truecolor'`:
  - blend in RGB space
  - also compute palette fallback in `attr` (nearest match)

Provide:

```ts
screen.blendCellStyle(over: CellStyle, under: CellStyle, alpha: number): CellStyle
```

Then:

- element `style.transparent`
- shadow
- any “dim overlay” effect

can become consistent and correct.

## Widget integration plan

### Required refactors (core)

1. `Screen` owns color profile + exposes `resolveColor/resolveStyle/applySgr`.
2. `Element`:
   - stop doing any color conversion directly (`colors.convert` / ad-hoc)
   - obtain default/fill/border/scrollbar styles via `screen.resolveStyle()`
   - parse SGR using `screen.applySgr()`
3. Widgets that directly fill/draw must use `CellStyle`:
   - borders
   - Table/ListTable
   - Terminal
   - BigText
   - canvases (char-canvas, braille-canvas)
4. `Screen.fillRegion()` should accept a `CellStyle` (or `attr + tcBg/tcFg`).
   - recommended signature:
     - `fillRegion(style: CellStyle, ch: string, xi, xl, yi, yl, override?)`

### Required refactors (contrib)

`packages/contrib` widgets should:

- accept `ColorInput` for any color option
- resolve it via `this.screen.resolveColor/resolveStyle`
- never emit raw `38;2` strings unless they intentionally bypass the cell system

## Backwards compatibility policy

This plan keeps the blessed-compatible surface area:

- Existing packed `attr` behavior remains valid.
- Users can still pass numeric colors or named colors.
- ANSI in content continues to work.

New/expanded behavior:

- RGB/hex colors become truecolor *only when supported and enabled*.
- truecolor ANSI in content will be preserved only when supported and enabled; otherwise it is gracefully quantized.

## Content intent vs style intent (and why policy splits)

Colors enter the system from two fundamentally different sources:

1. **Style intent**: colors specified via widget/element style objects and widget options (theme surfaces).
   - Examples: `style.bg`, `style.border.fg`, `Diff({ additionColor })`.
   - Typical properties: few distinct colors, stable, long runs.

2. **Content intent**: colors specified by ANSI/SGR embedded in text content.
   - Examples: `chalk`, syntax highlighters, log output, diff renderers that generate `\x1b[38;2;...m`.
   - Typical properties: many distinct colors, high transition rate, sometimes untrusted/external.

Treating them the same leads to tradeoffs that surprise users:

- A “compact” optimization that is reasonable for themes (downgrading exact-match RGB to `38;5`) can be surprising if applied to content that explicitly asked for `38;2`.
- Allowing arbitrary content to force truecolor can increase output size and reduce diff run-length efficiency.

This is why `ColorPolicy` splits preferences by source:

- `preferForStyle`: should RGB/hex from *styles* stay RGB (`fidelity`) or downgrade when identical (`compact`)?
- `preferForContent`: same question, but for RGB coming from *content* SGR (when allowed).

### Recommended defaults

These defaults are biased toward: predictable UI theming + compatibility with ANSI-heavy content.

```ts
{
  mode: 'auto',
  preferForStyle: 'compact',
  preferForContent: 'fidelity',
  allowTruecolorFromContent: true,
  contentTruecolorFallback: 'quantize',
}
```

### Decision table (content truecolor)

When parsing `38;2` / `48;2` from content:

| effectiveMode | allowTruecolorFromContent | behavior |
|---|---:|---|
| `truecolor` | true  | set `tc* = [r,g,b]` (subject to `preferForContent` exact-match downgrade) |
| `truecolor` | false | apply `contentTruecolorFallback` (`quantize` or `ignore`), `tc* = null` |
| `256`/`16`  | any   | apply `contentTruecolorFallback` (usually `quantize`), `tc* = null` |

### Decision table (exact-match downgrade)

Assume `effectiveMode === 'truecolor'` and we have an RGB triple `rgb`.

| source | prefer | if rgb exactly equals a palette entry | stored as |
|---|---|---:|---|
| style   | `compact`  | yes | palette in `attr`, `tc* = null` |
| style   | `fidelity` | yes | `tc* = rgb` (still keep palette fallback in `attr`) |
| content | `compact`  | yes | palette in `attr`, `tc* = null` |
| content | `fidelity` | yes | `tc* = rgb` |

Exact-match detection should be strict (byte-equality) to avoid threshold complexity.

## Testing strategy

The testing focus is: (1) correctness under mode switches and (2) diffing correctness and (3) output minimality.

### A) Capability + policy tests

- Unit test `detectColorCapabilities()` under mocked env and tput.
- Unit test policy resolution (`auto` -> effectiveMode).
- Ensure caches reset when env changes in tests.

### B) Cell correctness tests (buffer-level)

For each area, assert on `screen.lines[y][x]` cell fields:

- element default fill from `style.bg/style.fg`
- border (including per-side and addressable colors)
- table header/cell/border
- terminal widget default
- canvas default fills

Use an RGB that is obviously not in the 256 palette (e.g. `#2B353C`).

### C) Diffing correctness tests (tc-only changes)

Create two renders where:

- `attr` and `ch` are identical
- only `tcBg` or `tcFg` changes

Assert that:

- `screen.draw()` emits output containing `48;2;...` or `38;2;...`
- `olines` captures updated tc values

This is the single most important regression test.

### D) Output minimality tests

Not micro-optimizing strings, but basic guarantees:

- No unconditional `\x1b[m` per line.
- When a region is unchanged, output is empty.
- When only a small area changes, output contains only that area’s `cup()` and characters.

These tests can assert on the call args to `program._write` in the mock program.

### E) Mode switching tests

- Render with truecolor enabled, then switch to 256, re-render.
- Assert that the second render does not contain any `;2;` sequences.
- Assert that buffer cells no longer store `tc*` (or that they are treated as ignored based on policy).

## Phased implementation plan

This is the lowest-risk order.

1. Fix `screen.draw()` invariants:
   - compare tc in diffing
   - store tc in `olines`
   - correct EOL reset logic for `null` tc
2. Add `ColorProfile` to Screen + policy override + full repaint trigger.
3. Introduce `resolveColor/resolveStyle` and migrate:
   - element fills
   - borders
   - scrollbar/track
   - progressbar
4. Centralize SGR parsing (`applySgr`) and remove regex paths.
5. Migrate remaining widgets (Table/ListTable/Terminal/BigText/canvases).
6. Add truecolor-aware blending/shadow (optional but recommended for correctness with transparency).

## Practical “definition of done”

We can say “truecolor support is comprehensive” when:

- Every place a cell is created has an explicit `CellStyle`/`tc` decision.
- A tc-only cell change is detected and redrawn.
- Flags and truecolor work together.
- Switching screen color mode produces correct output and consistent buffers.
- Tests exist for borders + tables + content SGR + diffing.
