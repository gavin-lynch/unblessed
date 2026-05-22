# i18n RTL + Shaping Research & Plan

This document captures research notes and a concrete plan for handling
internationalized text rendering in terminal widgets, with a focus on
RTL (right-to-left) scripts and script shaping.

## Scope

- Language/script rendering correctness (i18n display), not translation content.
- RTL ordering, cursor behavior, alignment, truncation, and wrapping.
- Optional shaping for complex scripts when feasible.

## Current Reality (Terminal Constraints)

- Terminals do not provide bidi (bidirectional) reordering.
- Terminals do not perform complex script shaping (Arabic/Indic).
- Rendering happens in fixed-width cells; width errors cause 1-char offsets.
- Unicode combining marks and surrogate pairs are common sources of
  width and alignment bugs.

## What Needs to Work

1. Correct visual order for RTL scripts (bidi).
2. Truncation and wrapping that respect RTL direction.
3. Cursor movement and selection that align with visual order.
4. Reasonable shaping for scripts that require it (optional, if feasible).

## Research Notes

### Bidi (RTL ordering)

- We must apply a bidi algorithm before rendering text.
- The result should be a visual-order string suitable for terminal cells.
- Candidate: `bidi-js` (Unicode bidi algorithm in JS).

### Shaping (complex scripts)

- Full shaping requires a shaping engine (e.g., HarfBuzz).
- JS options:
  - `harfbuzzjs` (WASM). Requires font files and a shaping pipeline.
  - `node-harfbuzz` (native). Heavier setup and build complexity.
- Lightweight alternative for Arabic only: `arabic-reshaper` (limited).

### Width & Grapheme Handling

- We must avoid splitting grapheme clusters (emoji + ZWJ + combining marks).
- Width calculation should use updated Unicode width tables.
- Candidate: `grapheme-splitter` + improved wcwidth handling.

## Proposed Architecture (Core)

### 1) Text Preprocessing Pipeline

Add a preprocessing stage used by widgets that render text content:

1. Normalize input (optional NFC/NFKC).
2. Segment into grapheme clusters.
3. Apply bidi reordering (RTL/LTR) for display.
4. Apply optional shaping (if enabled and available).
5. Compute width using grapheme-aware width logic.
6. Perform truncation/wrapping aligned to direction.

This pipeline should live in core `text-utils` or a new dedicated module.

### 2) Direction-aware Truncation

- For RTL, truncation should preserve the rightmost visual portion.
- Ellipsis placement should follow direction (RTL ellipsis on left).
- Wrapping should respect visual order while preserving logical data.

### 3) Cursor & Selection

- Cursor movement should align with visual order when RTL is active.
- Selection ranges should be computed in visual coordinates.

## Proposed Options (Per Widget)

- `direction?: "auto" | "ltr" | "rtl"`
- `bidi?: boolean` (default true when RTL)
- `shape?: "auto" | "off" | "harfbuzz" | "arabic"`
- `graphemeAware?: boolean` (default true)

## Minimal Viable Implementation (Phase 1)

1. Add a core bidi preprocessor (bidi-js) behind a feature flag.
2. Add grapheme-aware width calculation and truncation.
3. RTL-aware truncation/wrapping in `text-utils`.
4. Integrate in text widgets that render content:
   - `Text`, `Box`, `Log`, `Table`, `List`, `Textarea`.

No shaping in Phase 1; focus on bidi + width correctness.

## Advanced Implementation (Phase 2)

1. Optional shaping integration:
   - `harfbuzzjs` with a bundled font asset or configurable font path.
2. Visual proof example in contrib:
   - `examples/rtl-proof.ts` (Arabic/Hebrew sample; shows bidi order).

## Validation / Proof

- Add a test corpus of RTL + mixed LTR/RTL strings.
- Visual examples:
  - Arabic + English mixed line.
  - Hebrew + numbers.
  - Emoji sequences with ZWJ.
  - Vietnamese diacritics (combining marks).

## Risks

- Performance cost from grapheme segmentation and bidi per render.
- Terminals differ in width handling for ambiguous characters.
- Shaping may not align with terminal cell rendering (requires careful fallback).

## Outcome

This plan delivers correct RTL ordering and width handling in core, while
keeping shaping optional and controlled so it does not destabilize the
core rendering pipeline.
