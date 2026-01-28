# Truecolor Support Analysis

## Current Implementation Overview

### Architecture

The current truecolor implementation extends the traditional blessed/unblessed cell structure from:

```
[attr, ch]  // 2-element array
```

To:

```
[attr, ch, truecolorBg, truecolorFg]  // 4-element array
```

Where:

- `attr`: Packed integer attribute (256-color, bold, underline, etc.)
- `ch`: Character to display
- `truecolorBg`: RGB array `[r, g, b]` or `undefined` for background
- `truecolorFg`: RGB array `[r, g, b]` or `undefined` for foreground

### Current Flow

1. **Content Parsing (`element.ts`)**:
   - Parses ANSI escape codes including `\x1b[48;2;r;g;bm` and `\x1b[38;2;r;g;bm`
   - Stores truecolor state in variables during parsing
   - Stores truecolor values in cell array `[attr, ch, truecolorBg, truecolorFg]`

2. **Rendering (`screen.ts`)**:
   - Checks if cell has truecolor values (array length > 2)
   - Outputs truecolor ANSI codes when state changes
   - Skips normal attribute handling when truecolor is active

## Problems with Current Approach

### 1. **Inconsistent Cell Structure**

**Issue**: Cells can have 2 or 4 elements, creating inconsistency:

- New cells: `[attr, ch]` (2 elements)
- Cells with truecolor: `[attr, ch, truecolorBg, truecolorFg]` (4 elements)
- Cells after truecolor reset: `[attr, ch, undefined, undefined]` (4 elements)

**Impact**:

- Need to check array length before accessing `[2]` and `[3]`
- Easy to introduce bugs when assuming cell structure
- Memory overhead for cells without truecolor (storing `undefined`)

### 2. **Dual Color Systems**

**Issue**: Two parallel color systems:

- **Packed attributes** (`attr`): 256-color, stored as integer, processed by `attrCode()`
- **Truecolor** (`truecolorBg/Fg`): 24-bit RGB, stored as arrays, output directly as ANSI

**Impact**:

- Code duplication (checking both systems)
- Potential conflicts (which takes precedence?)
- Complex state management (when to reset which system?)

### 3. **ANSI Code Parsing Complexity**

**Issue**: Parsing truecolor codes in `element.ts` is complex:

- Must detect `\x1b[48;2;r;g;bm` and `\x1b[38;2;r;g;bm` patterns
- Must advance character index correctly past entire sequence
- Must handle nested ANSI codes (truecolor + syntax highlighting)
- Must preserve state across newlines

**Impact**:

- Easy to introduce character corruption (as we've seen)
- Difficult to debug parsing issues
- Performance overhead (regex matching on every escape sequence)

### 4. **Rendering Logic Fragmentation**

**Issue**: Truecolor rendering logic is scattered:

- State tracking in `element.ts` during parsing
- Output generation in `screen.ts` during rendering
- No centralized color management

**Impact**:

- Hard to maintain
- Easy to introduce bugs when changing either part
- Difficult to test in isolation

### 5. **Why It Affects Everything**

**Root Cause**: The cell structure change affects the entire rendering pipeline:

1. **Memory Layout**: Cells with different lengths break assumptions
2. **Index Access**: `line[x][2]` can be `undefined` or out of bounds
3. **State Propagation**: Truecolor state must be preserved across:
   - Newlines (fill regions)
   - Transparent cells
   - Cell updates
4. **ANSI Code Interference**: Truecolor codes are embedded in content strings, interfering with:
   - Character counting
   - Width calculations
   - Wrapping logic
   - Drawille/braille rendering (double-spacing issues)

## Architectural Considerations

### Option 1: Normalize Cell Structure (Recommended)

**Approach**: Always use 4-element arrays, normalize to consistent format:

```typescript
type Cell = [
  attr: number, // Packed 256-color attributes
  ch: string, // Character
  truecolorBg?: [r, g, b] | null, // Always present, null if no truecolor
  truecolorFg?: [r, g, b] | null, // Always present, null if no truecolor
];
```

**Benefits**:

- Consistent structure everywhere
- No length checks needed
- Clear null vs undefined semantics
- Easier to reason about

**Implementation**:

- Initialize all cells as `[attr, ch, null, null]`
- Update factory functions to always create 4-element arrays
- Update all cell access to use consistent indices

### Option 2: Unified Color System

**Approach**: Create a unified color abstraction that handles both 256-color and truecolor:

```typescript
interface Color {
  type: "256" | "truecolor";
  value: number | [number, number, number];
}

interface CellColor {
  bg?: Color;
  fg?: Color;
  // ... other attributes (bold, underline, etc.)
}
```

**Benefits**:

- Single color system
- Easy to convert between formats
- Clear precedence rules
- Can abstract away ANSI code generation

**Challenges**:

- Requires refactoring entire attribute system
- Performance overhead (object creation)
- Breaking change for existing code

### Option 3: Separate Truecolor Layer

**Approach**: Keep 256-color system as-is, add truecolor as optional overlay:

```typescript
// Existing cell structure unchanged
type Cell = [attr: number, ch: string];

// Separate truecolor map
type TruecolorMap = Map<
  [y: number, x: number],
  {
    bg?: [r, g, b];
    fg?: [r, g, b];
  }
>;
```

**Benefits**:

- No changes to existing cell structure
- Truecolor is optional enhancement
- Can be disabled for performance

**Challenges**:

- Two data structures to maintain
- Lookup overhead during rendering
- More complex state management

## Recommended Solution

### Hybrid Approach: Normalized Cells + Color Abstraction

1. **Normalize Cell Structure** (Option 1):
   - Always use 4-element arrays
   - Use `null` for "no truecolor" (not `undefined`)
   - Update all cell creation/access code

2. **Create Color Utility Layer**:

   ```typescript
   // packages/core/src/lib/color-utils.ts
   export function createColor(
     value: string | number | [number, number, number],
   ): Color;
   export function toAnsiCode(color: Color, type: "bg" | "fg"): string;
   export function mergeColors(base: Color, overlay: Color): Color;
   ```

3. **Centralize ANSI Code Generation**:

   ```typescript
   // packages/core/src/lib/ansi-codes.ts
   export function generateColorCode(color: Color, type: "bg" | "fg"): string;
   export function parseAnsiSequence(
     str: string,
     offset: number,
   ): AnsiSequence | null;
   ```

4. **Update Rendering Pipeline**:
   - Parse ANSI codes once, convert to internal color format
   - Store colors in normalized cell structure
   - Generate ANSI codes during rendering from color objects

### Implementation Plan

#### Phase 1: Normalize Cell Structure

- [ ] Update cell initialization to always create 4-element arrays
- [ ] Replace all `line[x][2]` access with safe getters
- [ ] Update newline fill logic to preserve truecolor state
- [ ] Add tests for cell structure consistency

#### Phase 2: Create Color Abstraction

- [ ] Create `Color` type and utilities
- [ ] Create ANSI code parser/generator
- [ ] Migrate truecolor parsing to use new abstraction
- [ ] Add conversion between 256-color and truecolor

#### Phase 3: Refactor Rendering

- [ ] Update `screen.ts` to use color abstraction
- [ ] Centralize ANSI code output logic
- [ ] Optimize for performance (avoid object creation in hot paths)
- [ ] Add comprehensive tests

#### Phase 4: Cleanup

- [ ] Remove duplicate color handling code
- [ ] Document color system architecture
- [ ] Update all widgets to use new color system

## Why Current Issues Occur

### Character Corruption

- **Cause**: Incorrect character index advancement when parsing ANSI codes
- **Fix**: Properly advance `ci` past entire escape sequence
- **Prevention**: Use centralized ANSI parser that handles all sequences

### Double Spacing (Drawille)

- **Cause**: Truecolor ANSI codes in content strings affect character counting
- **Fix**: Separate content from formatting (store colors separately)
- **Prevention**: Don't embed ANSI codes in content, store in cell structure

### Misalignment

- **Cause**: Inconsistent cell structure causes index errors
- **Fix**: Normalize cell structure
- **Prevention**: Always use 4-element arrays, use getters for access

### Performance Issues

- **Cause**: Regex matching on every escape sequence, array length checks
- **Fix**: Cache parsed sequences, normalize structure
- **Prevention**: Optimize hot paths, use efficient data structures

## Software Architecture Recommendations

### Where to Standardize Colors

**Current State**: Colors are handled at multiple levels:

- `colors.ts`: 256-color utilities
- `element.ts`: ANSI parsing, truecolor state tracking
- `screen.ts`: ANSI code generation, attribute packing
- Widgets: Direct ANSI code generation (Diff widget)

**Recommended**: Create a unified color system at the **core library level**:

```
packages/core/src/lib/
├── colors.ts           # Existing 256-color utilities
├── color-utils.ts      # NEW: Unified color abstraction
├── ansi-codes.ts       # NEW: ANSI parsing/generation
└── color-context.ts    # NEW: Runtime color capabilities
```

**Benefits**:

- Single source of truth for color handling
- Easy to test in isolation
- Can be used by all widgets
- Can be extended for future color systems (e.g., 16-color fallback)

### Abstraction vs Direct Access

**Recommendation**: Use abstractions for high-level code, direct access for performance-critical paths.

**High-Level (Widgets, User Code)**:

```typescript
// Use color abstraction
const color = createColor([40, 60, 40]);
widget.style.bg = color;
```

**Low-Level (Rendering Engine)**:

```typescript
// Direct access for performance
const truecolorBg = cell[2];
if (truecolorBg !== null) {
  out += `\x1b[48;2;${truecolorBg[0]};${truecolorBg[1]};${truecolorBg[2]}m`;
}
```

**Rationale**:

- Abstractions provide safety and maintainability
- Direct access provides performance
- Clear boundary between layers

## Conclusion

The current truecolor implementation works but is fragile because:

1. **Inconsistent data structures** (2 vs 4 element arrays)
2. **Dual color systems** (256-color + truecolor)
3. **Scattered logic** (parsing vs rendering)
4. **ANSI code interference** (codes in content strings)

**Recommended path forward**:

1. Normalize cell structure (always 4 elements)
2. Create color abstraction layer
3. Centralize ANSI code handling
4. Refactor rendering to use abstractions

This will make truecolor support:

- More maintainable
- Less error-prone
- Easier to extend
- Better performing

The key insight is that **truecolor isn't fundamentally different from 256-color** - it's just a different encoding. By treating colors as a unified concept and separating formatting from content, we can support both seamlessly.
