# Color System Refactoring Plan

## Executive Summary

This document outlines a comprehensive refactoring plan to unify color handling across `@gavin-lynch/unblessed-core`, `@gavin-lynch/unblessed-contrib`, and all library utilities. The goal is to create a normalized, well-organized color system that:

1. **Unifies color handling** across core, contrib, and lib utilities
2. **Integrates with normalized cell structure** (`[attr, ch, truecolorBg, truecolorFg]`)
3. **Supports multiple color modes** (16-color, 256-color, truecolor) with automatic fallback
4. **Centralizes terminal capability detection** and color mode selection
5. **Eliminates code duplication** and inconsistent color conversion logic

## Current State Analysis

### Color Systems in Use

#### 1. **Core Color Utilities** (`packages/core/src/lib/colors.ts`)

- `colors.match(r, g, b)`: Converts RGB/hex to 256-color index
- `colors.convert(color)`: Converts color names/hex/RGB to 256-color index
- `colors.hexToRGB(hex)`: Hex to RGB array
- `colors.RGBToHex(r, g, b)`: RGB to hex string
- **Purpose**: 256-color matching for blessed compatibility
- **Limitation**: Only supports 256-color mode, no truecolor

#### 2. **Canvas Color Utilities** (`packages/core/src/lib/canvas/drawille.ts`)

- `getFgCode(color)`: Generates ANSI foreground codes (16/256/truecolor)
- `getBgCode(color)`: Generates ANSI background codes (16/256/truecolor)
- `COLOR_NAMES`: Basic 16-color name mapping
- **Purpose**: ANSI code generation for canvas output
- **Limitation**: Generates ANSI strings, doesn't integrate with normalized cells

#### 3. **Contrib Color Utilities** (`packages/contrib/src/utils.ts`)

- `getColorCode(color)`: Preserves RGB arrays for truecolor, clamps to integers
- `toColorTag(color)`: Converts to blessed tag format (uses x256)
- **Purpose**: Color handling for contrib widgets
- **Limitation**: Uses x256 for 256-color (different algorithm than colors.match)

#### 4. **External Dependencies**

- `x256` library: RGB to 256-color conversion (used by blessed-contrib)
- **Purpose**: Blessed-contrib compatibility
- **Limitation**: Different algorithm than `colors.match()`, creates inconsistency

### Current Problems

#### 1. **Multiple Color Conversion Systems**

- `colors.match()`: Core's 256-color matching (weighted distance)
- `x256()`: Contrib's 256-color matching (blessed-contrib algorithm)
- **Result**: Same RGB can produce different 256-color codes depending on which system is used

#### 2. **Inconsistent RGB Array Handling**

- **Core canvas**: Generates ANSI strings from RGB arrays
- **Contrib utils**: Preserves RGB arrays for truecolor, but uses x256 for 256-color
- **Core widgets**: Uses `colors.convert()` which converts RGB to 256-color index
- **Result**: No consistent approach to handling RGB arrays

#### 3. **No Terminal Capability Detection**

- Each system assumes its own color mode
- Canvas always generates truecolor codes (if RGB array provided)
- No centralized detection of terminal capabilities
- **Result**: Truecolor codes sent to terminals that don't support them

#### 4. **Canvas Outputs ANSI Strings**

- Canvas generates ANSI escape codes as strings
- These strings are embedded in content and parsed by `element.ts`
- **Result**: Inefficient (string parsing) and error-prone (ANSI code corruption)

#### 5. **No Unified Color Abstraction**

- Colors represented as: strings, numbers, arrays, ANSI codes
- No single type/interface for colors
- **Result**: Type confusion, conversion errors, inconsistent behavior

#### 6. **Scattered Color Logic**

- Color conversion in: `colors.ts`, `canvas/drawille.ts`, `contrib/utils.ts`, `diff.ts`
- Each has its own logic for handling different color formats
- **Result**: Code duplication, maintenance burden, bugs

## Proposed Solution: Unified Color System

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│              Color System Architecture                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│  Color Abstraction│          │ Terminal Detection│
│  (Unified Types)  │          │  (Capabilities)  │
└─────────┬─────────┘          └─────────┬────────┘
          │                               │
          └───────────────┬───────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  Color Conversion     │
              │  (Mode-aware)        │
              └───────────┬───────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ 16-color    │  │ 256-color   │  │ Truecolor   │
│ Conversion  │  │ Conversion  │  │ (Direct)    │
└─────────────┘  └─────────────┘  └─────────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  Normalized Cells     │
              │  [attr, ch, bg, fg]   │
              └───────────────────────┘
```

### Color Mode Policy (Per-Widget Overrides + Fallbacks)

Color Mode is a core rendering policy with per-widget overrides and deterministic
fallback rules. The screen selects an effective mode based on terminal
capabilities, and each widget can override it to `Monocolor`, `16`, `256`, or
`Truecolor`. When a widget requests a mode the terminal cannot support, the
renderer falls back in a fixed order (truecolor → 256 → 16 → mono) while
preserving the best available fidelity. This allows a single screen to render
multiple color modes simultaneously, with each widget resolved against its own
mode and downgraded only when required.

### Core Components

#### 1. **Color Type System** (`packages/core/src/lib/color-types.ts`)

```typescript
/**
 * Unified color representation
 * Supports all input formats: names, hex, 256-color codes, RGB arrays
 */
export type ColorInput =
  | string // Color name ("red") or hex ("#ff0000")
  | number // 256-color code (0-255)
  | [number, number, number]; // RGB array [r, g, b]

/**
 * Normalized color representation
 * Internal format used throughout the system
 */
export interface Color {
  /** Color mode */
  mode: "16" | "256" | "truecolor";
  /** Color value: name/index for 16/256, RGB array for truecolor */
  value: string | number | [number, number, number];
  /** Original input (for debugging/preservation) */
  original: ColorInput;
}

/**
 * Color with mode preference
 * Allows specifying preferred color mode
 */
export interface ColorWithMode extends Color {
  /** Preferred mode (may fallback if not supported) */
  preferredMode?: "16" | "256" | "truecolor";
}
```

#### 2. **Terminal Capability Detection** (`packages/core/src/lib/color-capabilities.ts`)

```typescript
/**
 * Terminal color capabilities
 */
export interface ColorCapabilities {
  /** Maximum color depth: 4 (16), 8 (256), or 24 (truecolor) */
  maxDepth: 4 | 8 | 24;
  /** Supports 16-color mode */
  supports16: boolean;
  /** Supports 256-color mode */
  supports256: boolean;
  /** Supports truecolor (24-bit RGB) */
  supportsTruecolor: boolean;
}

/**
 * Detect terminal color capabilities
 * Checks environment variables and terminal type
 */
export function detectColorCapabilities(): ColorCapabilities;

/**
 * Get optimal color mode for current terminal
 */
export function getOptimalColorMode(): "16" | "256" | "truecolor";
```

#### 3. **Unified Color Converter** (`packages/core/src/lib/color-converter.ts`)

```typescript
/**
 * Convert any color input to normalized Color object
 * Automatically selects best color mode based on terminal capabilities
 */
export function normalizeColor(
  input: ColorInput,
  preferredMode?: "16" | "256" | "truecolor",
  capabilities?: ColorCapabilities,
): Color;

/**
 * Convert color to 256-color index
 * Uses colors.match() algorithm (core's standard)
 */
export function to256Color(color: ColorInput): number;

/**
 * Convert color to RGB array [r, g, b]
 * Clamps and rounds to integers 0-255
 */
export function toRGB(color: ColorInput): [number, number, number];

/**
 * Convert color to ANSI escape code
 * Automatically uses best mode for terminal
 */
export function toAnsiCode(
  color: ColorInput,
  type: "fg" | "bg",
  capabilities?: ColorCapabilities,
): string;

/**
 * Convert color to normalized cell format
 * Returns [attr, truecolorBg, truecolorFg] for use in createCell()
 */
export function toCellColor(
  color: ColorInput,
  type: "fg" | "bg",
  capabilities?: ColorCapabilities,
): {
  attr: number; // Packed attribute (for 16/256-color)
  truecolor: [number, number, number] | null; // RGB array or null
};
```

#### 4. **Canvas Integration** (`packages/core/src/lib/canvas/color-utils.ts`)

```typescript
/**
 * Canvas-specific color utilities
 * Integrates with unified color system
 */

/**
 * Set canvas color (stroke/fill)
 * Automatically uses best color mode
 */
export function setCanvasColor(
  canvas: DrawilleCanvas | AnsiTermCanvas,
  color: ColorInput,
  type: "stroke" | "fill" | "fontFg" | "fontBg",
): void;

/**
 * Convert canvas color to normalized cell format
 * For direct cell manipulation (bypassing ANSI string generation)
 */
export function canvasColorToCell(
  color: ColorInput,
  capabilities?: ColorCapabilities,
): {
  attr: number;
  truecolorBg: [number, number, number] | null;
  truecolorFg: [number, number, number] | null;
};
```

#### 5. **Contrib Integration** (`packages/contrib/src/color-utils.ts`)

```typescript
/**
 * Contrib color utilities
 * Wraps core color system with blessed-contrib compatibility
 */

/**
 * Get color code (blessed-contrib compatible)
 * Preserves RGB arrays for truecolor, uses x256 for 256-color fallback
 */
export function getColorCode(
  color: ColorInput,
  capabilities?: ColorCapabilities,
): string | number | number[];

/**
 * Convert to blessed tag format
 * Uses x256 for 256-color (blessed-contrib compatibility)
 */
export function toColorTag(
  color: ColorInput,
  capabilities?: ColorCapabilities,
): string;
```

## Implementation Plan

### Phase 1: Core Color Infrastructure

**Goal**: Create unified color system in core

#### 1.1 Create Color Type System

- [ ] Create `packages/core/src/lib/color-types.ts`
- [ ] Define `ColorInput`, `Color`, `ColorWithMode` types
- [ ] Export types from `packages/core/src/index.ts`

#### 1.2 Terminal Capability Detection

- [ ] Create `packages/core/src/lib/color-capabilities.ts`
- [ ] Implement `detectColorCapabilities()`:
  - Check `COLORTERM` environment variable
  - Check `TERM` environment variable
  - Check terminal type from runtime
  - Default to 256-color if uncertain
- [ ] Implement `getOptimalColorMode()`
- [ ] Add tests for capability detection

#### 1.3 Unified Color Converter

- [ ] Create `packages/core/src/lib/color-converter.ts`
- [ ] Implement `normalizeColor()`:
  - Parse all input formats (string, number, array)
  - Select best color mode based on capabilities
  - Clamp RGB values to integers 0-255
- [ ] Implement `to256Color()`:
  - Use existing `colors.match()` algorithm
  - Support all input formats
- [ ] Implement `toRGB()`:
  - Convert any input to RGB array
  - Clamp and round to integers
- [ ] Implement `toAnsiCode()`:
  - Generate ANSI codes for all modes
  - Use optimal mode for terminal
- [ ] Implement `toCellColor()`:
  - Convert to normalized cell format
  - Returns both attr and truecolor values
- [ ] Add comprehensive tests

#### 1.4 Update Core Exports

- [ ] Export new color utilities from `packages/core/src/index.ts`
- [ ] Update documentation

### Phase 2: Canvas System Refactoring

**Goal**: Integrate canvas with unified color system

#### 2.1 Canvas Color Utilities

- [ ] Create `packages/core/src/lib/canvas/color-utils.ts`
- [ ] Implement `setCanvasColor()`:
  - Uses unified color converter
  - Sets canvas color properties
- [ ] Implement `canvasColorToCell()`:
  - Converts canvas colors to cell format
  - For direct cell manipulation

#### 2.2 Update Canvas Classes

- [ ] Update `DrawilleCanvas`:
  - Replace `getFgCode()`/`getBgCode()` with unified converter
  - Store colors as `Color` objects instead of ANSI strings
  - Generate ANSI codes on-demand during `frame()`
- [ ] Update `AnsiTermCanvas`:
  - Same changes as DrawilleCanvas
- [ ] Update `Canvas2DContext`:
  - Use unified color system for `strokeStyle`, `fillStyle`, etc.

#### 2.3 Canvas Output Optimization

- [ ] **Future enhancement**: Consider direct cell manipulation
  - Instead of generating ANSI strings, write directly to normalized cells
  - Would require canvas to know about screen/cell structure
  - **Phase 2.3 is optional** - can be deferred

### Phase 3: Contrib Integration

**Goal**: Refactor contrib to use unified color system

#### 3.1 Contrib Color Utilities

- [ ] Create `packages/contrib/src/color-utils.ts`
- [ ] Implement `getColorCode()`:
  - Wraps core `toCellColor()` or `normalizeColor()`
  - Preserves RGB arrays for truecolor
  - Uses x256 for 256-color fallback (blessed-contrib compatibility)
- [ ] Implement `toColorTag()`:
  - Uses x256 for 256-color (blessed-contrib compatibility)
  - Supports truecolor when available

#### 3.2 Update Contrib Widgets

- [ ] Update `line.ts`:
  - Use unified color system
  - Remove direct `getColorCode()` calls
- [ ] Update `bar.ts`:
  - Use unified color system
- [ ] Update `stacked-bar.ts`:
  - Use unified color system
- [ ] Update `diff.ts`:
  - Use unified color system
  - Remove direct ANSI code generation
- [ ] Update all other contrib widgets:
  - Replace color handling with unified system

#### 3.3 Remove Duplicate Code

- [ ] Remove old `getColorCode()` from `utils.ts` (or keep as deprecated wrapper)
- [ ] Remove old `toColorTag()` from `utils.ts` (or keep as deprecated wrapper)
- [ ] Update all imports

### Phase 4: Core Widget Integration

**Goal**: Integrate core widgets with unified color system

#### 4.1 Element Color Handling

- [ ] Update `element.ts`:
  - Use `toCellColor()` when setting colors
  - Store colors in normalized cell format
  - Remove direct `colors.convert()` calls where possible

#### 4.2 Screen Color Handling

- [ ] Update `screen.ts`:
  - Use unified color system for cursor colors
  - Use `toCellColor()` for attribute generation

#### 4.3 Border Colors

- [ ] Update `border-colors.ts`:
  - Use unified color converter
  - Support truecolor borders

### Phase 5: Cleanup and Documentation

**Goal**: Remove old code, document new system

#### 5.1 Deprecation

- [ ] Mark old color functions as deprecated:
  - `colors.match()` → Use `to256Color()` instead
  - `colors.convert()` → Use `normalizeColor()` instead
  - `getFgCode()`/`getBgCode()` → Use `toAnsiCode()` instead
- [ ] Add deprecation warnings with migration paths

#### 5.2 Documentation

- [ ] Create `packages/core/COLOR_SYSTEM.md`:
  - Document unified color system
  - Provide migration guide
  - Show examples for all use cases
- [ ] Update `packages/contrib/README.md`:
  - Document color handling in contrib
  - Show examples
- [ ] Update API documentation

#### 5.3 Testing

- [ ] Add comprehensive tests for:
  - Color normalization
  - Terminal capability detection
  - Color mode selection
  - ANSI code generation
  - Cell color conversion
- [ ] Test all color input formats
- [ ] Test fallback behavior

## Migration Strategy

### Backward Compatibility

**Critical**: Maintain backward compatibility during migration

1. **Keep old functions**: Don't remove, mark as deprecated
2. **Wrapper functions**: New functions can call old ones internally
3. **Gradual migration**: Update code incrementally
4. **Feature flags**: Optional flag to use new system

### Migration Path

#### For Core Code

```typescript
// Old
const color = colors.convert("red");
const attr = (colors.convert(fg) << 9) | colors.convert(bg);

// New
const color = normalizeColor("red");
const cellColor = toCellColor("red", "fg");
const attr = cellColor.attr;
const truecolorFg = cellColor.truecolor;
```

#### For Canvas Code

```typescript
// Old
canvas.color = [255, 0, 0];
const code = getFgCode(canvas.color);

// New
setCanvasColor(canvas, [255, 0, 0], "stroke");
// Or
const color = normalizeColor([255, 0, 0]);
canvas.color = color.value; // RGB array preserved
```

#### For Contrib Code

```typescript
// Old
const colorCode = getColorCode(style.line);
c.strokeStyle = colorCode;

// New
const colorCode = getColorCode(style.line); // Now uses unified system
c.strokeStyle = colorCode;
```

## Benefits

### 1. **Consistency**

- Single source of truth for color handling
- Consistent behavior across all packages
- Predictable color mode selection

### 2. **Maintainability**

- Centralized color logic
- Easier to fix bugs
- Easier to add features

### 3. **Performance**

- Terminal capability detection cached
- Optimal color mode selection
- Reduced string parsing (when using cells directly)

### 4. **Extensibility**

- Easy to add new color modes (e.g., 16-color fallback)
- Easy to add new color formats
- Easy to add new terminal types

### 5. **Type Safety**

- Strong TypeScript types
- Clear interfaces
- Compile-time error checking

## Implementation Timeline

### Phase 1: Core Infrastructure (Week 1-2)

- Create color type system
- Implement terminal detection
- Implement unified converter
- Add tests

### Phase 2: Canvas Integration (Week 2-3)

- Update canvas color utilities
- Refactor canvas classes
- Update tests

### Phase 3: Contrib Integration (Week 3-4)

- Create contrib color utilities
- Update all contrib widgets
- Update tests

### Phase 4: Core Widget Integration (Week 4-5)

- Update element/screen color handling
- Update border colors
- Update tests

### Phase 5: Cleanup (Week 5-6)

- Deprecate old functions
- Write documentation
- Final testing

## Risk Assessment

### Low Risk

- ✅ Adding new functions (doesn't break existing code)
- ✅ Terminal capability detection (read-only)
- ✅ Type system (compile-time only)

### Medium Risk

- ⚠️ Canvas refactoring (may affect rendering)
- ⚠️ Contrib widget updates (may affect behavior)
- ⚠️ Color mode selection (may change colors)

### Mitigation

- Comprehensive testing at each phase
- Backward compatibility wrappers
- Feature flags for gradual rollout
- Extensive documentation

## Success Criteria

1. ✅ All color handling uses unified system
2. ✅ Terminal capabilities detected automatically
3. ✅ Optimal color mode selected for terminal
4. ✅ No code duplication
5. ✅ All tests passing
6. ✅ Backward compatibility maintained
7. ✅ Documentation complete
8. ✅ Performance maintained or improved

## Future Enhancements

### 1. **Direct Cell Manipulation for Canvas**

- Canvas writes directly to normalized cells
- Bypasses ANSI string generation
- Better performance

### 2. **Color Theme System**

- Centralized color themes
- Runtime theme switching
- Theme-aware color selection

### 3. **Color Palette Management**

- Custom color palettes
- Palette optimization
- Palette export/import

### 4. **Advanced Terminal Detection**

- Probe terminal capabilities
- Test color support
- Cache results

## Conclusion

This refactoring will create a unified, maintainable, and extensible color system that integrates seamlessly with the normalized cell structure. The phased approach ensures minimal disruption while providing clear migration paths.

The key insight is that **all color formats are just different representations of the same concept**. By normalizing colors to a unified type and providing conversion utilities, we can support all formats while maintaining consistency and performance.
