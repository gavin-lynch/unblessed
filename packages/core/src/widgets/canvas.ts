/**
 * canvas.ts - Canvas widget for blessed-contrib compatibility
 *
 * This widget provides a Canvas2D-compatible surface within a blessed Box.
 * It supports both braille (high-resolution) and character (block) rendering modes.
 *
 * Used as the base for chart widgets (Line, Bar, Map, etc.)
 *
 * Based on blessed-contrib's canvas widget:
 * https://github.com/yaronn/blessed-contrib/blob/master/lib/widget/canvas.js
 */

import {
  AnsiTermCanvas,
  Canvas,
  Canvas2DContext,
  DrawilleCanvas,
  type CanvasConstructor,
} from "../lib/canvas/index.js";
import { stripAnsi } from "../lib/text-utils.js";
import type { BoxOptions } from "../types/index.js";
import { Box } from "./box.js";

/**
 * Canvas widget options
 */
export interface CanvasWidgetOptions extends BoxOptions {
  /**
   * Initial data to set on the canvas
   */
  data?: unknown;
}

/**
 * Canvas widget size
 */
export interface CanvasSize {
  width: number;
  height: number;
}

/**
 * CanvasWidget - A Box with Canvas2D rendering capabilities
 *
 * Provides a blessed widget that wraps a Canvas2D context for drawing
 * charts, maps, and other visualizations.
 *
 * The canvas is created when the widget is attached to a screen,
 * as the actual dimensions aren't known until then.
 *
 * @example
 * ```ts
 * const canvas = new CanvasWidget({
 *   parent: screen,
 *   width: '50%',
 *   height: '50%',
 *   border: { type: 'line' }
 * });
 *
 * // After attach, you can draw:
 * canvas.on('attach', () => {
 *   const ctx = canvas.ctx;
 *   ctx.strokeStyle = 'yellow';
 *   ctx.beginPath();
 *   ctx.moveTo(0, 0);
 *   ctx.lineTo(100, 50);
 *   ctx.stroke();
 * });
 * ```
 */
export class CanvasWidget extends Box {
  override type = "canvas";

  /** The internal canvas instance */
  protected _canvas: Canvas | null = null;

  /** The 2D rendering context */
  ctx: Canvas2DContext | null = null;

  /**
   * Check if the canvas is initialized and ready for drawing
   */
  get isReady(): boolean {
    return this._canvas !== null && this.ctx !== null;
  }

  /** Calculated canvas size in pixels */
  canvasSize: CanvasSize = { width: 0, height: 0 };

  /** Last data passed to setData() so resize can redraw (subclasses set this) */
  protected _lastData: unknown = undefined;

  /** Canvas constructor to use */
  protected canvasType: CanvasConstructor;

  constructor(
    options: CanvasWidgetOptions = {},
    canvasType: CanvasConstructor = DrawilleCanvas,
  ) {
    // Set truncation mode to prevent wrapping issues with canvas content
    // This ensures content is truncated rather than wrapped
    super({
      ...options,
      textWrap: options.textWrap ?? "truncate-end",
    });
    this.canvasType = canvasType;

    // Create canvas when attached to screen (when we know actual dimensions)
    this.on("attach", () => {
      const initCanvas = () => {
        // Get resolved dimensions (getters handle percentages)
        // These will return 0 if parent doesn't have dimensions yet
        const width = this.width;
        const height = this.height;

        if (width <= 0 || height <= 0) {
          // Dimensions not ready yet - parent might not have dimensions
          // This can happen if the widget is attached before layout is calculated
          return false;
        }

        this.calcSize();

        // Ensure canvas size is valid
        if (this.canvasSize.width <= 0 || this.canvasSize.height <= 0) {
          return false;
        }

        this._canvas = new Canvas(
          this.canvasSize.width,
          this.canvasSize.height,
          this.canvasType,
        );
        this.ctx = this._canvas.getContext();

        // Set initial data if provided (options.data or last setData() for resize)
        const dataToSet =
          this._lastData ??
          (this.options as CanvasWidgetOptions).data ??
          options.data;
        if (dataToSet !== undefined && dataToSet !== null) {
          this.setData(dataToSet);
        }

        // Update content from canvas immediately after creation
        // This ensures content is available when render() is called
        if (this._canvas) {
          const frame = this._canvas.frame();
          this.content = frame;
          // Don't parse yet - that will happen in render() when position is calculated
        }

        return true;
      };

      // Try immediately
      const created = initCanvas();

      // If canvas was created, trigger screen render
      // The screen's render cycle will call render() on all widgets
      if (created && this.screen) {
        this.screen.render();
      }

      // If canvas wasn't created (dimensions not ready), listen for resize
      if (!created) {
        const resizeHandler = () => {
          if (!this._canvas) {
            const created = initCanvas();
            if (created && this.screen) {
              this.screen.render();
            }
          } else {
            // Canvas exists, recalculate size on resize
            const width = this.width;
            const height = this.height;
            if (width > 0 && height > 0) {
              this.calcSize();
              if (this.canvasSize.width > 0 && this.canvasSize.height > 0) {
                // Recreate canvas with new size
                this._canvas = new Canvas(
                  this.canvasSize.width,
                  this.canvasSize.height,
                  this.canvasType,
                );
                this.ctx = this._canvas.getContext();
                // Re-render with last data so chart survives resize (user often calls setData after append)
                const dataToSet =
                  this._lastData ??
                  (this.options as CanvasWidgetOptions).data ??
                  options.data;
                if (dataToSet !== undefined && dataToSet !== null) {
                  this.setData(dataToSet);
                }
                this.render();
                if (this.screen) {
                  this.screen.render();
                }
              }
            }
          }
        };
        this.on("resize", resizeHandler);
      } else if (this.screen) {
        // Canvas was created, render screen to display it
        this.screen.render();
      }
    });
  }

  /**
   * Calculate the canvas size based on widget dimensions
   *
   * Override this in subclasses to adjust the canvas size calculation.
   * By default, uses braille resolution (width*2 - padding, height*4)
   */
  calcSize(): void {
    // Get available content width (accounting for borders/padding)
    // This ensures the canvas content fits within the widget's visible area
    const availableWidth = this.width - this.iwidth;
    const availableHeight = this.height - this.iheight;

    // For braille canvas: each character cell is 2x4 pixels
    // Each braille character takes 1 character cell
    // Be conservative: subtract 1 to ensure we never overflow the border
    // This accounts for any rounding issues or ANSI code width calculations
    const maxBrailleChars = Math.max(1, Math.floor(availableWidth) - 1);

    // Calculate pixel dimensions: each braille char = 2 pixels wide, 4 pixels tall
    // Ensure dimensions are multiples of 2 (width) and 4 (height) for valid braille
    const rawWidth = maxBrailleChars * 2;
    const rawHeight = Math.max(1, Math.floor(availableHeight)) * 4;

    // Ensure dimensions are valid for braille (multiples of 2 and 4)
    // and are at least the minimum size
    this.canvasSize = {
      width: Math.max(2, Math.floor(rawWidth / 2) * 2),
      height: Math.max(4, Math.floor(rawHeight / 4) * 4),
    };
  }

  /**
   * Set data on the canvas
   *
   * Override this in subclasses to handle specific data formats.
   */
  setData(data: unknown): void {
    this._lastData = data;
    // Subclasses override to actually draw
  }

  /**
   * Clear the canvas
   */
  clear(): void {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);
    }
  }

  /**
   * Render the canvas widget
   *
   * Converts the canvas buffer to content and renders as a Box.
   */
  override render(): any {
    this.setContent(this.getFrameFromCanvas(), true, false);
    return super.render();
  }


  /**
   * Return the frame string to use as content. Subclasses (e.g. Line) can override
   * to prepend a blank line so the box label gets its own row above the chart.
   */
  protected getFrameFromCanvas(): string {
    if (!this._canvas) return "";
    let frame = this._canvas.frame();
    const availableWidth = Math.max(1, this.width - this.iwidth - 2);
    if (availableWidth > 0) {
      const lines = frame.split("\n");
      const truncatedLines = lines.map((line) => {
        const visibleChars = stripAnsi(line).length;
        if (visibleChars <= availableWidth) return line;
        let result = "";
        let visibleCount = 0;
        let i = 0;
        while (i < line.length && visibleCount < availableWidth) {
          if (line[i] === "\x1b" && line[i + 1] === "[") {
            const end = line.indexOf("m", i);
            if (end !== -1) {
              result += line.substring(i, end + 1);
              i = end + 1;
              continue;
            }
          }
          result += line[i];
          visibleCount++;
          i++;
        }
        result += "\x1b[39m\x1b[49m";
        return result;
      });
      frame = truncatedLines.join("\n");
    }
    return frame;
  }

}

/**
 * Create a CanvasWidget with DrawilleCanvas (braille, high-resolution)
 *
 * @example
 * ```ts
 * const canvas = createBrailleCanvas({
 *   parent: screen,
 *   width: 80,
 *   height: 24
 * });
 * ```
 */
export function createBrailleCanvas(
  options: CanvasWidgetOptions = {},
): CanvasWidget {
  return new CanvasWidget(options, DrawilleCanvas);
}

/**
 * Create a CanvasWidget with AnsiTermCanvas (character blocks)
 *
 * @example
 * ```ts
 * const canvas = createCharCanvas({
 *   parent: screen,
 *   width: 40,
 *   height: 12
 * });
 * ```
 */
export function createCharCanvas(
  options: CanvasWidgetOptions = {},
): CanvasWidget {
  return new CanvasWidget(options, AnsiTermCanvas);
}

// Export AnsiTermCanvas for use as canvasType
export { AnsiTermCanvas, DrawilleCanvas };

export default CanvasWidget;
