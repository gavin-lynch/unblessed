/**
 * canvas/index.ts - Canvas rendering system
 *
 * Provides terminal-based canvas rendering with two modes:
 * - Drawille (braille characters) - 2x4 pixels per character for high resolution
 * - AnsiTerm (character blocks) - 1x1 for solid filled areas
 *
 * Based on blessed-contrib's canvas system which uses:
 * - https://github.com/madbence/node-drawille
 * - https://github.com/madbence/node-drawille-canvas
 */

export { AnsiTermCanvas } from "./ansi-term.js";
export * from "./color-utils.js";
export { Canvas2DContext } from "./context2d.js";
export type { CanvasConstructor, InnerCanvas } from "./context2d.js";
export {
  COLOR_NAMES,
  DrawilleCanvas,
  getBgCode,
  getFgCode,
} from "./drawille.js";
export type { CanvasColor } from "./drawille.js";

import { Canvas2DContext, type CanvasConstructor } from "./context2d.js";
import { DrawilleCanvas } from "./drawille.js";

/**
 * Canvas - Terminal canvas with HTML5 Canvas-like API
 *
 * Wraps either a DrawilleCanvas (braille-based) or AnsiTermCanvas (character-based)
 * with a Canvas2D-compatible context.
 *
 * @example
 * ```ts
 * // Create a braille canvas (default, high resolution)
 * const canvas = new Canvas(80, 48);
 * const ctx = canvas.getContext();
 *
 * ctx.strokeStyle = 'yellow';
 * ctx.beginPath();
 * ctx.moveTo(0, 0);
 * ctx.lineTo(80, 48);
 * ctx.stroke();
 *
 * console.log(canvas.frame());
 * ```
 *
 * @example
 * ```ts
 * // Create a character canvas (for bar charts)
 * import { AnsiTermCanvas } from '@unblessed/core';
 *
 * const canvas = new Canvas(40, 12, AnsiTermCanvas);
 * const ctx = canvas.getContext();
 *
 * ctx.strokeStyle = 'blue';
 * ctx.fillRect(5, 2, 10, 8);
 *
 * console.log(canvas.frame());
 * ```
 */
export class Canvas {
  private _ctx: Canvas2DContext | null = null;
  private _width: number;
  private _height: number;
  private _CanvasClass: CanvasConstructor;

  /**
   * Create a new canvas
   *
   * @param width - Canvas width in pixels (must be multiple of 2 for DrawilleCanvas)
   * @param height - Canvas height in pixels (must be multiple of 4 for DrawilleCanvas)
   * @param CanvasClass - Canvas implementation to use (default: DrawilleCanvas)
   */
  constructor(
    width: number,
    height: number,
    CanvasClass: CanvasConstructor = DrawilleCanvas,
  ) {
    this._width = width;
    this._height = height;
    this._CanvasClass = CanvasClass;
  }

  /**
   * Get the canvas width
   */
  get width(): number {
    return this._width;
  }

  /**
   * Get the canvas height
   */
  get height(): number {
    return this._height;
  }

  /**
   * Get the 2D rendering context
   *
   * Creates the context lazily on first access.
   * Subsequent calls return the same context instance.
   */
  getContext(): Canvas2DContext {
    if (!this._ctx) {
      this._ctx = new Canvas2DContext(
        this._width,
        this._height,
        this._CanvasClass,
      );
    }
    return this._ctx;
  }

  /**
   * Render the canvas to a string with ANSI escape codes
   *
   * @param delimiter - Line delimiter (default: '\n')
   */
  frame(delimiter: string = "\n"): string {
    if (!this._ctx) {
      return "";
    }
    return this._ctx._canvas.frame(delimiter);
  }

  /**
   * Clear the canvas
   */
  clear(): void {
    if (this._ctx) {
      this._ctx._canvas.clear();
    }
  }
}

export default Canvas;
