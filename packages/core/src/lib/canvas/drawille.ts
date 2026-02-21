/**
 * drawille.ts - Braille-based pixel canvas
 *
 * This implements the core drawille rendering using Unicode braille characters (U+2800-U+28FF).
 * Each braille character represents a 2x4 pixel grid, providing 8x higher resolution
 * than character-based rendering.
 *
 * Based on:
 * - https://github.com/madbence/node-drawille
 * - https://github.com/yaronn/drawille-blessed-contrib
 */

import { toAnsiCode } from "../color-converter.js";
import type { ColorInput } from "../color-types.js";

/**
 * Braille dot mapping (2×4 grid)
 * Unicode braille pattern: U+2800 + bit pattern
 *
 * The dots are numbered:
 * 1 4
 * 2 5
 * 3 6
 * 7 8
 *
 * And map to bits:
 * 0x01 0x08
 * 0x02 0x10
 * 0x04 0x20
 * 0x40 0x80
 */
const BRAILLE_MAP = [
  [0x01, 0x08], // Top row (dots 1, 4)
  [0x02, 0x10], // Second row (dots 2, 5)
  [0x04, 0x20], // Third row (dots 3, 6)
  [0x40, 0x80], // Bottom row (dots 7, 8)
];

/**
 * Basic color names to ANSI codes mapping
 */
export const COLOR_NAMES: Record<string, number> = {
  black: 0,
  red: 1,
  green: 2,
  yellow: 3,
  blue: 4,
  magenta: 5,
  cyan: 6,
  white: 7,
  normal: 9,
};

/**
 * Get foreground ANSI escape code for a color
 * Supports truecolor RGB arrays [r, g, b]
 * Uses unified color converter for consistency
 *
 * @deprecated Use toAnsiCode() from color-converter.ts instead
 */
export function getFgCode(color: ColorInput): string {
  return toAnsiCode(color, "fg");
}

/**
 * Get background ANSI escape code for a color
 * Supports truecolor RGB arrays [r, g, b]
 * Uses unified color converter for consistency
 *
 * @deprecated Use toAnsiCode() from color-converter.ts instead
 */
export function getBgCode(color: ColorInput): string {
  return toAnsiCode(color, "bg");
}

/**
 * Color type - can be a color name, hex string, 256-color code, or RGB array
 * Compatible with ColorInput from unified color system
 */
export type CanvasColor = ColorInput;

// Re-export ColorInput for convenience
export type { ColorInput } from "../color-types.js";

/**
 * DrawilleCanvas - Low-level braille pixel buffer
 *
 * Provides direct pixel manipulation using Unicode braille characters.
 * Width must be a multiple of 2, height must be a multiple of 4.
 */
export class DrawilleCanvas {
  readonly width: number;
  readonly height: number;

  /** Braille pattern buffer (one byte per character cell) */
  private content: Uint8Array;

  /** Color buffer (stores fg color code per character cell) */
  private colors: (string | null)[];

  /** Text overlay buffer (for writeText) */
  private chars: (string | null)[];

  /** Current stroke color */
  color: CanvasColor = "normal";

  /** Current font foreground color */
  fontFg: CanvasColor = "normal";

  /** Current font background color */
  fontBg: CanvasColor = "normal";

  debugStats(): {
    width: number;
    height: number;
    cellCount: number;
    nonZeroCells: number;
    colorCells: number;
    textCells: number;
  } {
    let nonZeroCells = 0;
    let colorCells = 0;
    let textCells = 0;
    for (let i = 0; i < this.content.length; i++) {
      if (this.content[i] !== 0) nonZeroCells++;
      if (this.colors[i] !== null) colorCells++;
      if (this.chars[i] !== null) textCells++;
    }
    return {
      width: this.width,
      height: this.height,
      cellCount: this.content.length,
      nonZeroCells,
      colorCells,
      textCells,
    };
  }

  constructor(width: number, height: number) {
    // Ensure dimensions are valid for braille mapping
    if (width % 2 !== 0) {
      throw new Error("Width must be a multiple of 2");
    }
    if (height % 4 !== 0) {
      throw new Error("Height must be a multiple of 4");
    }

    this.width = width;
    this.height = height;

    const cellCount = (width * height) / 8;
    this.content = new Uint8Array(cellCount);
    this.colors = new Array(cellCount).fill(null);
    this.chars = new Array(cellCount).fill(null);
  }

  /**
   * Get the character cell coordinate for a pixel position
   */
  private getCoord(x: number, y: number): number {
    x = Math.floor(x);
    y = Math.floor(y);
    const nx = Math.floor(x / 2);
    const ny = Math.floor(y / 4);
    return nx + (this.width / 2) * ny;
  }

  /**
   * Set a pixel at the given position.
   * Uses colorOverride for this pixel when provided (so stroke() can freeze color at stroke time);
   * otherwise uses this.color (current stroke/fill style).
   */
  set(x: number, y: number, colorOverride?: ColorInput): void {
    if (!(x >= 0 && x < this.width && y >= 0 && y < this.height)) {
      return;
    }

    const coord = this.getCoord(x, y);
    const mask = BRAILLE_MAP[Math.floor(y) % 4][Math.floor(x) % 2];

    this.content[coord] |= mask;
    const color = colorOverride !== undefined ? colorOverride : this.color;
    this.colors[coord] = toAnsiCode(color, "fg");
    this.chars[coord] = null;
  }

  /**
   * Unset (clear) a pixel at the given position
   */
  unset(x: number, y: number): void {
    if (!(x >= 0 && x < this.width && y >= 0 && y < this.height)) {
      return;
    }

    const coord = this.getCoord(x, y);
    const mask = BRAILLE_MAP[Math.floor(y) % 4][Math.floor(x) % 2];

    this.content[coord] &= ~mask;
    this.colors[coord] = null;
    this.chars[coord] = null;
  }

  /**
   * Toggle a pixel at the given position
   */
  toggle(x: number, y: number): void {
    if (!(x >= 0 && x < this.width && y >= 0 && y < this.height)) {
      return;
    }

    const coord = this.getCoord(x, y);
    const mask = BRAILLE_MAP[Math.floor(y) % 4][Math.floor(x) % 2];

    this.content[coord] ^= mask;
    this.colors[coord] = null;
    this.chars[coord] = null;
  }

  /**
   * Clear the entire canvas
   */
  clear(): void {
    this.content.fill(0);
    this.colors.fill(null);
    this.chars.fill(null);
  }

  /**
   * Measure text width in pixel units
   */
  measureText(str: string): { width: number } {
    return { width: str.length * 2 + 2 };
  }

  /**
   * Write text at the given pixel position
   * Text is rendered at character cell granularity
   */
  writeText(str: string, x: number, y: number): void {
    const coord = this.getCoord(x, y);

    const bg = toAnsiCode(this.fontBg, "bg");
    const fg = toAnsiCode(this.fontFg, "fg");

    for (let i = 0; i < str.length; i++) {
      if (coord + i < this.chars.length) {
        this.chars[coord + i] = str[i];
      }
    }

    // Apply colors to first and last character
    if (coord < this.chars.length) {
      this.chars[coord] = fg + bg + (this.chars[coord] || " ");
    }
    if (coord + str.length - 1 < this.chars.length) {
      this.chars[coord + str.length - 1] += "\x1b[39m\x1b[49m";
    }
  }

  /**
   * Render the canvas to a string with ANSI escape codes
   */
  frame(delimiter: string = "\n"): string {
    const result: string[] = [];
    const charsPerRow = this.width / 2;

    for (let i = 0, j = 0; i < this.content.length; i++, j++) {
      if (j === charsPerRow) {
        result.push(delimiter);
        j = 0;
      }

      // Text overlay takes priority
      if (this.chars[i]) {
        result.push(this.chars[i]!);
      } else if (this.content[i] === 0) {
        result.push(" ");
      } else {
        // Render braille character with color
        const colorCode = this.colors[i] || "";
        result.push(
          colorCode +
            String.fromCharCode(0x2800 + this.content[i]) +
            "\x1b[39m",
        );
      }
    }

    result.push(delimiter);
    return result.join("");
  }
}

export default DrawilleCanvas;
