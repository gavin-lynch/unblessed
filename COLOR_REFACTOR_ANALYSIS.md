# Color Refactor Analysis

This document proposes an in-depth, holistic color refactor for `packages/core` so all color modes are handled consistently, with explicit upgrade/downgrade paths and deterministic legacy output for compatibility layers (`packages/blessed` and `packages/contrib`).

## Goals

- Single unified color pipeline for all inputs and output modes.
- Deterministic downgrade paths that preserve legacy control sequences.
- Explicit opt-in for non-truecolor output in compat layers.
- No leaking of platform-specific code into core; use runtime injection only.

## Constraints

- Core must remain platform-agnostic.
- Compatibility layers must be able to force legacy output that exactly matches control sequences (including the absence of truecolor escapes).
- Color conversions must be deterministic across platforms and terminals.

## Current State (High-Level)

- Core has a unified color system in `packages/core/src/lib/color-converter.ts`.
- Contrib uses `x256` to match blessed-contrib behavior in `packages/contrib/src/color-utils.ts`.

## Proposed Architecture

### 1) Core Color Pipeline (Single Source of Truth)

Create a central pipeline in core with these stages:

1. **Parse**: Accept any input shape and normalize it to a canonical internal representation.
2. **Resolve**: Resolve names/aliases to RGB or palette indices.
3. **Target Mode**: Select a requested output mode (truecolor, 256, 16, 8, or none).
4. **Transform**: Convert canonical color to target mode using deterministic mapping.
5. **Encode**: Emit control sequence tokens or tags according to target output style.

Recommended type shapes (conceptual):

- `ColorInput` (current) remains as-is.
- `NormalizedColor` holds:
  - `original`: original input
  - `rgb`: resolved RGB if available
  - `index256`: resolved 256 index if available
  - `index16`: resolved 16/8 index if available
  - `modeHint`: inferred/explicit source mode
- `ColorOutput` includes:
  - `mode`: `"truecolor" | "256" | "16" | "8" | "none"`
  - `value`: rgb array or index
  - `escape`: prebuilt control sequence (optional)

### 2) Explicit Output Mode Selection

Expose a single function in core that takes a `targetMode` and an optional `compatProfile`:

- `targetMode` determines truecolor vs downgraded modes.
- `compatProfile` determines legacy matching behavior, such as:
  - forcing 256-index conversion using blessed-contrib style
  - ensuring no truecolor escapes are generated

This allows compatibility layers to request deterministic legacy output while core remains the source of truth.

### 3) Deterministic Downgrade Strategy

Define explicit downgrade order:

- truecolor -> 256 -> 16 -> 8 -> none

For each step:

- Use a fixed mapping function with a stable palette.
- Ensure rounding and clamping are consistent across platforms.
- Avoid runtime-specific branches in core.

### 4) Encoding Strategy

Core should provide a unified encoder that yields:

- raw RGB truecolor escapes (when `targetMode` is truecolor)
- 256/16/8 index escapes for downgraded modes
- empty/no escapes for `none`

Compatibility layers should be able to request a legacy encoding profile that avoids truecolor sequences entirely.

## Compatibility Layer Behavior

### Blessed Compatibility

- `packages/blessed` should request a legacy profile when needed:
  - force 256 index even when truecolor is available
  - ensure control sequences match original blessed output

### Contrib Compatibility

- `packages/contrib` should continue to use compatibility-specific conversion if required for perfect parity.
- Prefer routing through core with a `compatProfile` that matches blessed-contrib outputs.
- Only keep `x256` in contrib if core cannot guarantee identical mapping.

## Migration Plan

### Phase 1: Formalize Core API

- Add explicit `targetMode` and `compatProfile` support to core color conversion.
- Centralize encoding in core (including truecolor and downgraded escapes).
- Add deterministic mapping utilities in core for all downgrade steps.

### Phase 2: Update Contrib and Blessed

- Replace direct usage of `x256` with core’s compat profile if parity is confirmed.
- Keep a fallback path to `x256` in contrib until parity is verified.
- Ensure the compat layers can request "no-truecolor" output.

### Phase 3: Verification and Parity

- Create snapshot tests in contrib/blessed for known outputs.
- Ensure control sequences match existing blessed/blessed-contrib outputs.
- Validate both truecolor-capable and limited terminals.

## Testing Strategy

- Add golden output tests for color conversion and escapes.
- Verify downgrade paths with deterministic inputs.
- Include mixed inputs (names, hex, RGB arrays, 256 indices, 16/8 indices).
- Ensure escape sequences match legacy output exactly for compat profiles.

## Risks and Mitigations

- **Risk:** Color mapping drift in compat output.
  - **Mitigation:** keep contrib `x256` in place until parity is demonstrated.

- **Risk:** Terminal capability detection causes inconsistent output.
  - **Mitigation:** require explicit `targetMode` and ignore auto-detection in compat profiles.

- **Risk:** Increased complexity in core color API.
  - **Mitigation:** keep the API single-entry and well-documented; hide internal steps.

## File References

- `packages/core/src/lib/color-converter.ts`
- `packages/core/src/lib/colors.ts`
- `packages/contrib/src/color-utils.ts`
- `packages/contrib/src/utils.ts`
- `packages/blessed/src/blessed.ts`
