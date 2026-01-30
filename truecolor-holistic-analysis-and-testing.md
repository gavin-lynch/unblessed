# Truecolor: Holistic Analysis & Testing Strategy

## 1. What Was Fixed (style.bg / style.fg for default/fill cells)

**Problem:** `style.bg` and `style.fg` (e.g. hex `#2B353C`) were always quantized to the 256-color xterm palette via `colors.convert()` in `sattr()`. Default/fill cells were rendered with `createCell(attr, ch, null, null)`, so they never received truecolor and appeared as the nearest 256-color match.

**Fix (implemented):**

1. **`screen.fillRegion()`**  
   Added optional parameters `truecolorBg` and `truecolorFg`. When provided, filled cells are created with `createCell(attr, ch, truecolorBg, truecolorFg)` so output uses `48;2;r;g;b` / `38;2;r;g;b` when the terminal supports truecolor.

2. **Element default fill**  
   In `element.ts` render:
   - Compute `defaultTruecolorBg` and `defaultTruecolorFg` from `this.style.bg` / `this.style.fg` using `toCellColor(style.bg, 'bg')` and `toCellColor(style.fg, 'fg')`.
   - Pass them to `this.screen.fillRegion(..., defaultTruecolorBg, defaultTruecolorFg)` for padding/valign fill.
   - When filling the rest of a line or writing content cells, use `truecolorBg ?? defaultTruecolorBg` and `truecolorFg ?? defaultTruecolorFg` so default style truecolor is used when content hasn’t set truecolor.

3. **Scrollbar and track**  
   Scrollbar/track styles now resolve truecolor via `toCellColor(this.style.scrollbar.*, …)` and `toCellColor(this.style.track.*, …)` and pass them to `fillRegion()` and `createCell()` for the scrollbar column.

4. **ProgressBar**  
   Bar fill uses `toCellColor(this.style.bar.bg, 'bg')` and `toCellColor(this.style.bar.fg, 'fg')` and passes the resulting truecolor to `fillRegion()`.

**Files touched:** `packages/core/src/widgets/screen.ts`, `packages/core/src/widgets/element.ts`, `packages/core/src/widgets/progressbar.ts`.

---

## 2. What Else Is Missing for 100% Truecolor

### 2.1 Borders (element border drawing)

**Current behavior:** Border drawing uses `getBorderColorAt()` / `getBorderAttr()` which call `this.sattr(sideStyle)`. That packs only 256-color indices. Cells are then created with `createCell(currentAttr, ch, baseCell[2], baseCell[3])`, i.e. they **keep the underlying cell’s truecolor** (content area or neighbor), not the border style’s.

**Gap:** If `style.border.fg` / `style.border.bg` or `_borderColors[]` are hex/RGB, border cells still get 256-color from `sattr` and the *background* truecolor is whatever was in `baseCell` (e.g. content or default fill). So border *foreground* (line chars) and intended border *background* are not truecolor when specified as hex.

**To fix:** When drawing border cells, resolve border style (and addressable `_borderColors`) with `toCellColor(..., 'fg')` / `toCellColor(..., 'bg')` and pass the resulting truecolor into `createCell(currentAttr, ch, borderTruecolorBg, borderTruecolorFg)` instead of `baseCell[2]` / `baseCell[3]`. Same for “gap” cells that use `dattr`: use element default truecolor (or a dedicated border default) instead of baseCell truecolor.

### 2.2 Screen default (clear / allocation)

**Current behavior:** `screen.ts` allocates/clears with `createCell(this.dattr, " ", null, null)`. `clearRegion()` calls `fillRegion(this.dattr, " ", ...)` with no truecolor, so cleared regions get `null` truecolor.

**Gap:** If the application sets a screen-level default style (e.g. background) to a hex color, that style is not currently represented as truecolor. Screen’s `dattr` is a packed attr only. So “screen default” truecolor is not implemented.

**To fix (optional):** Add optional screen-level default truecolor (e.g. from options or a setter) and pass it into `fillRegion` / `createCell` when clearing or allocating lines. Lower priority if most UIs use element-level styles.

### 2.3 Table / ListTable (header, cell, border styles)

**Current behavior:** `table.ts` uses `sattr(this.style.header)`, `sattr(this.style.cell)`, `sattr(this.style.border)` and writes cells; listtable uses `sattr(this.style.border)`. These only produce packed attr; no truecolor is passed to the cells they draw.

**Gap:** Table/listtable header, cell, and border colors specified as hex/RGB will be quantized to 256-color and will not render as truecolor.

**To fix:** Resolve header/cell/border fg/bg with `toCellColor()` and pass the resulting truecolor into whatever creates the table cells (e.g. fillRegion or createCell), similar to element and progressbar.

### 2.4 Terminal widget

**Current behavior:** `terminal.ts` sets `this.dattr = this.sattr(this.style)` and uses it when creating/updating line cells. It only mutates `line[x][0]` (attr), not truecolor slots.

**Gap:** If terminal’s style uses hex/RGB, the terminal’s default attribute is 256-color only; any cells created with that dattr would have no truecolor unless set elsewhere.

**To fix:** Resolve terminal style with `toCellColor()` and store default truecolor; when creating/updating cells use that truecolor in createCell.

### 2.5 BigText

**Current behavior:** Uses `dattr = this.sattr(this.style)` and draws with that attr. Any cell creation would need to pass truecolor derived from the same style.

**Gap:** BigText style (hex/RGB) is 256-color only.

**To fix:** Compute default truecolor from style and pass it into the drawing path (e.g. createCell or equivalent).

### 2.6 Char-canvas / Braille-canvas

**Current behavior:** Char-canvas already accepts and stores truecolor in `setCell(..., truecolorBg, truecolorFg)` and preserves it when drawing to the screen. Braille-canvas uses `sattr(this.style)` for default attr and createCell with existing cell data.

**Gap:** When char/braille canvas *default* style (e.g. for empty cells or padding) is used, it goes through `sattr()` only, so default fill would be 256-color. If they have an explicit “fill with default style” path, that path would need truecolor from `toCellColor(style.bg/fg)`.

**To fix:** Any path that fills with “default” style should resolve truecolor and pass it into createCell, similar to element.

### 2.7 Shadow

**Current behavior:** Shadow only does `lines[y][x][0] = colors.blend(lines[y][x][0])` (attr blend). It does not create new cells or set truecolor.

**Gap:** Shadow doesn’t set truecolor; it only dims the packed attr. So truecolor cells keep their RGB; shadow just affects non-truecolor attribute. If we wanted “shadow” to dim truecolor, we’d need to darken RGB – not implemented.

**To fix (optional):** For a “truecolor shadow” effect, we could blend or darken `cell[2]`/`cell[3]` when drawing shadow cells. Lower priority.

---

## 3. Summary Table

| Area                    | Truecolor from style? | Notes                                           |
|-------------------------|------------------------|-------------------------------------------------|
| Element fill/padding    | Yes (fixed)            | defaultTruecolorBg/Fg from style.bg/fg          |
| Element scrollbar/track | Yes (fixed)            | toCellColor(style.scrollbar/track)              |
| ProgressBar bar         | Yes (fixed)            | toCellColor(style.bar)                          |
| Content ANSI            | Yes (existing)         | Parsed 48;2/38;2 in content                     |
| Borders                 | No                     | Uses sattr + baseCell truecolor                |
| Screen clear/default    | No                     | fillRegion(dattr, …, null, null)                |
| Table/ListTable         | No                     | sattr(style.header/cell/border) only            |
| Terminal                | No                     | dattr from sattr only                          |
| BigText                 | No                     | dattr from sattr only                           |
| Char/braille default    | Partial                | setCell can truecolor; default fill may not     |
| Shadow                  | N/A                    | Only blends attr; optional RGB darken           |

---

## 4. How to Test Each Piece for Verifiable Truecolor

### 4.1 Principles

- **Capabilities:** Force truecolor capability (e.g. in tests set `COLORTERM=truecolor` or mock `detectColorCapabilities()` / `getOptimalColorMode()` so that `normalizeColor`/`toCellColor` return truecolor for hex/RGB).
- **Assert on output or cell buffer:** Either (a) assert on the final string sent to the terminal (e.g. contains `\x1b[48;2;R;G;Bm` with expected R,G,B), or (b) assert on the screen’s `lines` (cell array) that `cell[2]`/`cell[3]` are the expected `[r,g,b]` for the given style color.
- **Use a known hex:** Pick a hex that is *not* in the 256-color palette (e.g. `#2B353C`), so 256-color would give a different index and we can distinguish truecolor vs 256-color.

### 4.2 Test Ideas by Area

**Element default fill (style.bg / style.fg)**

- Set `COLORTERM=truecolor` (or mock capabilities).
- Create a Box with `style: { bg: '#2B353C', fg: '#AABBCC' }`, no content, no border.
- Render and read `screen.lines` for a cell in the box interior.
- Assert `cell[2] === [43, 53, 60]` and `cell[3] === [170, 187, 204]` (or equivalent for the chosen fg hex).
- Optional: drive screen output (e.g. `screen.render()` path that produces the ANSI string) and assert the string contains `\x1b[48;2;43;53;60m` and `\x1b[38;2;170;187;204m`.

**Scrollbar / track**

- Enable scrollbar and track with custom hex colors (e.g. `scrollbar: { bg: '#111111', fg: '#eeeeee' }`).
- Render a scrollable element that shows the scrollbar.
- For the scrollbar column cells, assert `cell[2]`/`cell[3]` match the RGB for those hex values, or assert output contains the corresponding 48;2/38;2 codes.

**ProgressBar**

- Create a ProgressBar with `style.bar = { bg: '#112233', fg: '#aabbcc' }`.
- Render and check the bar region cells for truecolor `[17,34,51]` and `[170,187,204]` (or assert on output).

**Content ANSI (existing)**

- Set content to a string that includes `\x1b[48;2;1;2;3m` and `\x1b[38;2;4;5;6m`.
- Render and assert the affected cell has `cell[2] === [1,2,3]` and `cell[3] === [4,5,6]`.
- Ensures we don’t regress content-based truecolor.

**Borders (after implementing border truecolor)**

- Create a box with border and `style.border = { fg: '#ff0000', bg: '#00ff00' }`.
- Render and assert border cells have `cell[2]`/`cell[3]` equal to the RGB for those hex values.

**Table / ListTable (after implementing)**

- Set header/cell/border styles to hex colors, render, and assert the corresponding cells have the expected truecolor arrays.

### 4.3 Shared Test Setup

- Use a test helper that:
  - Sets `process.env.COLORTERM = 'truecolor'` (or mocks `detectColorCapabilities` / `getOptimalColorMode` to return truecolor).
  - Builds a Screen (and optionally Program) with known size.
  - Returns the screen (and possibly a way to get the last output string) so tests can assert on `screen.lines` or on the rendered ANSI.

### 4.4 Snapshot / Visual Tests (optional)

- Run a “truecolor demo” (e.g. existing theme demos) in a headless terminal that records ANSI.
- Snapshot the output and allow a small tolerance or only check for presence of 48;2/38;2 with expected RGB for key elements. This catches regressions where truecolor is dropped or quantized.

---

## 5. Recommendation

- **Done:** Default/fill cells (element + scrollbar/track + progress bar) now use truecolor when style.bg/style.fg (or bar/scrollbar/track) are hex/RGB and capabilities support truecolor.
- **Next for 100%:** Implement border truecolor (resolve border style and _borderColors with toCellColor and pass into border createCell calls), then table/listtable, then terminal/bigtext and screen default as needed.
- **Testing:** Add unit tests that force truecolor capabilities and assert on `screen.lines` cell[2]/cell[3] (and optionally on rendered ANSI) for: element fill, scrollbar/track, progress bar, and content ANSI. Repeat the same pattern for borders and tables once those are implemented.
