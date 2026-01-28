/**
 * cell.ts - Normalized cell structure and utilities
 */

/**
 * Normalized cell structure: [attr, ch, truecolorBg, truecolorFg]
 * Always 4 elements, with null for "no truecolor" (not undefined)
 */
export type Cell = [
  attr: number,
  ch: string,
  truecolorBg: [number, number, number] | null,
  truecolorFg: [number, number, number] | null,
];

/**
 * Create a normalized cell with consistent 4-element structure.
 * @param attr - Packed attribute integer
 * @param ch - Character to display
 * @param truecolorBg - Truecolor background RGB [r, g, b] or null
 * @param truecolorFg - Truecolor foreground RGB [r, g, b] or null
 * @returns Normalized 4-element cell array
 */
export function createCell(
  attr: number,
  ch: string,
  truecolorBg: [number, number, number] | null = null,
  truecolorFg: [number, number, number] | null = null,
): Cell {
  return [attr, ch, truecolorBg, truecolorFg];
}
