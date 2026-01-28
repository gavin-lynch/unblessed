/**
 * ansi-term.ts - Character-level ANSI terminal canvas
 *
 * This provides a 1:1 character canvas where each cell is a single character.
 * Used for bar charts and other visualizations that don't need sub-character resolution.
 *
 * Based on:
 * - https://github.com/yaronn/ansi-term
 */

import { getBgCode, getFgCode, type CanvasColor } from "./drawille.js";

/**
 * AnsiTermCanvas - Character-level canvas
 *
 * Each "pixel" is one terminal character cell.
 * Perfect for bar charts, block-based visualizations, etc.
 */
export class AnsiTermCanvas {
  readonly width: number;
  readonly height: number;

  /** Content buffer (stores colored characters) */
  private content: (string | null)[];

  /** Current stroke/fill color */
  color: CanvasColor = "normal";

  /** Current font foreground color */
  fontFg: CanvasColor = "normal";

  /** Current font background color */
  fontBg: CanvasColor = "normal";

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.content = new Array(width * height).fill(null);
  }

  /**
   * Get the buffer coordinate for a position
   */
  private getCoord(x: number, y: number): number {
    x = Math.floor(x);
    y = Math.floor(y);
    return x + this.width * y;
  }

  /**
   * Set a "pixel" (fill a character cell with background color)
   */
  set(x: number, y: number): void {
    if (!(x >= 0 && x < this.width && y >= 0 && y < this.height)) {
      return;
    }

    const coord = this.getCoord(x, y);
    const color = getBgCode(this.color);
    this.content[coord] = color + " \x1b[49m";
  }

  /**
   * Unset (clear) a "pixel"
   */
  unset(x: number, y: number): void {
    if (!(x >= 0 && x < this.width && y >= 0 && y < this.height)) {
      return;
    }

    const coord = this.getCoord(x, y);
    this.content[coord] = null;
  }

  /**
   * Toggle a "pixel"
   */
  toggle(x: number, y: number): void {
    if (!(x >= 0 && x < this.width && y >= 0 && y < this.height)) {
      return;
    }

    const coord = this.getCoord(x, y);
    this.content[coord] = this.content[coord] === null ? " " : null;
  }

  /**
   * Clear the entire canvas
   */
  clear(): void {
    this.content.fill(null);
  }

  /**
   * Measure text width in pixel units (1:1 for character canvas)
   */
  measureText(str: string): { width: number } {
    return { width: str.length };
  }

  /**
   * Write text at the given position
   */
  writeText(str: string, x: number, y: number): void {
    const coord = this.getCoord(x, y);

    const bg = getBgCode(this.fontBg);
    const fg = getFgCode(this.fontFg);

    for (let i = 0; i < str.length; i++) {
      if (coord + i < this.content.length) {
        this.content[coord + i] = str[i];
      }
    }

    // Apply colors
    if (coord < this.content.length) {
      this.content[coord] = fg + bg + (this.content[coord] || " ");
    }
    if (coord + str.length - 1 < this.content.length) {
      this.content[coord + str.length - 1] += "\x1b[39m\x1b[49m";
    }
  }

  /**
   * Render the canvas to a string
   */
  frame(delimiter: string = "\n"): string {
    const result: string[] = [];

    for (let i = 0, j = 0; i < this.content.length; i++, j++) {
      if (j === this.width) {
        result.push(delimiter);
        j = 0;
      }

      if (this.content[i] === null) {
        result.push(" ");
      } else {
        result.push(this.content[i]!);
      }
    }

    result.push(delimiter);
    return result.join("");
  }
}

export default AnsiTermCanvas;
