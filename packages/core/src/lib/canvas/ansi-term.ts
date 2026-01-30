/**
 * ansi-term.ts - Character-level ANSI terminal canvas
 *
 * This provides a 1:1 character canvas where each cell is a single character.
 * Used for bar charts and other visualizations that don't need sub-character resolution.
 *
 * Based on:
 * - https://github.com/yaronn/ansi-term
 */

import { toAnsiCode } from "../color-converter.js";
import { type CanvasColor } from "./drawille.js";

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

  private _canvasAnsi(color: CanvasColor, type: "fg" | "bg"): string {
    // Canvas treats "normal"/"default" as "no explicit color".
    // Reset codes are handled separately when needed.
    if (color === "normal" || color === "default") return "";
    return toAnsiCode(color, type);
  }

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
    const color = this._canvasAnsi(this.color, "bg");
    // Set background color on space character - don't reset immediately
    // The reset will happen naturally when rendering or when color changes
    this.content[coord] = color + " ";
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
    if (str.length === 0) return;

    const coord = this.getCoord(x, y);

    const bg = this._canvasAnsi(this.fontBg, "bg");
    const fg = this._canvasAnsi(this.fontFg, "fg");
    const hasColors = bg !== "" || fg !== "";
    const reset = hasColors ? "\x1b[39m\x1b[49m" : "";

    // Apply color codes at the start, write all characters, reset at the end
    for (let i = 0; i < str.length; i++) {
      if (coord + i < this.content.length) {
        const char = str[i];
        if (i === 0) {
          // First character: apply color codes
          this.content[coord + i] = fg + bg + char;
        } else if (i === str.length - 1 && hasColors) {
          // Last character: write char and reset (only if we had colors)
          this.content[coord + i] = char + reset;
        } else {
          // Middle characters: just the character
          this.content[coord + i] = char;
        }
      }
    }
  }

  /**
   * Render the canvas to a string
   */
  frame(delimiter: string = "\n"): string {
    // If the canvas is completely empty, return an empty frame.
    // This matches blessed-contrib expectations and avoids emitting stray resets.
    let hasAnyContent = false;
    for (let i = 0; i < this.content.length; i++) {
      if (this.content[i] !== null) {
        hasAnyContent = true;
        break;
      }
    }
    if (!hasAnyContent) {
      return "";
    }

    const result: string[] = [];
    const resetAll = "\x1b[39m\x1b[49m"; // Reset foreground and background

    for (let y = 0; y < this.height; y++) {
      const rowStart = y * this.width;

      for (let x = 0; x < this.width; x++) {
        const i = rowStart + x;
        const cell = this.content[i];
        const prevCell = x > 0 ? this.content[i - 1] : null;

        // Check if previous cell had color codes
        const prevHadColors = prevCell !== null && prevCell.includes("\x1b[");

        if (cell === null) {
          // Empty cell - reset if previous cell had colors
          if (prevHadColors) {
            result.push(resetAll);
          }
          result.push(" ");
          continue;
        }

        const cellHasColors = cell.includes("\x1b[");

        // Reset when transitioning from colored to non-colored
        if (prevHadColors && !cellHasColors) {
          result.push(resetAll);
        }

        result.push(cell);
      }

      // End of line - always reset colors to prevent leaking to next line
      result.push(resetAll);
      result.push(delimiter);
    }

    // Ensure terminal state is reset at the very end
    result.push(resetAll);
    result.push(delimiter);

    return result.join("");
  }
}

export default AnsiTermCanvas;
