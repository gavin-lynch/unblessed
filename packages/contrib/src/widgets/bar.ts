/**
 * bar.ts - Bar chart widget
 *
 * Displays vertical bar charts with labels.
 * Uses AnsiTerm canvas for character-level rendering.
 *
 * Based on blessed-contrib's bar.js
 */

import { AnsiTermCanvas, CanvasWidget, type BoxOptions } from "@unblessed/core";
import { getInnerBoxSize } from "../utils.js";

/**
 * Bar chart data
 */
export interface BarData {
  /** Bar labels */
  titles: string[];
  /** Bar values */
  data: number[];
}

/**
 * Bar chart options
 */
export interface BarOptions extends BoxOptions {
  /** Width of each bar in characters (default: 6) */
  barWidth?: number;
  /** Spacing between bars in characters (default: 9) */
  barSpacing?: number;
  /** X offset for first bar (default: 5) */
  xOffset?: number;
  /** Maximum height for scaling (auto if not set) */
  maxHeight?: number;
  /** Bar background color */
  barBgColor?: string | number | number[];
  /** Bar foreground (text) color */
  barFgColor?: string | number | number[];
  /** Label color */
  labelColor?: string | number | number[];
  /** Show text labels on bars (default: true) */
  showText?: boolean;
  /** Initial data */
  data?: BarData;
}

/**
 * Bar - Vertical bar chart widget
 *
 * Displays a bar chart with:
 * - Configurable bar width and spacing
 * - Optional value labels on bars
 * - Customizable colors
 *
 * @example
 * ```ts
 * const bar = new Bar({
 *   parent: screen,
 *   width: '50%',
 *   height: 10,
 *   label: 'Server Load',
 *   barWidth: 4,
 *   barSpacing: 6,
 *   maxHeight: 100,
 *   data: {
 *     titles: ['Server 1', 'Server 2', 'Server 3'],
 *     data: [45, 78, 32]
 *   }
 * });
 * ```
 */
export class Bar extends CanvasWidget {
  override type = "bar";
  declare options: BarOptions;
  private static readonly LABEL_ROWS_WITH_TEXT = 2;
  private static readonly LABEL_ROWS_NO_TEXT = 1;

  constructor(options: BarOptions = {}) {
    super(options, AnsiTermCanvas);

    this.options = options;
    this.options.barWidth = options.barWidth ?? 6;
    this.options.barSpacing = options.barSpacing ?? 1;

    // Ensure minimum spacing between bars (allow 1-column gaps)
    /*
    if (this.options.barSpacing - this.options.barWidth < 1) {
      this.options.barSpacing = this.options.barWidth + 1;
    }
    */

    this.options.xOffset = options.xOffset ?? 5;
    this.options.showText = options.showText !== false;

    this.on("attach", () => {
      if (this.options.data) {
        this.setData(this.options.data);
      }
    });
  }

  override calcSize(): void {
    const { innerWidthChars, innerHeightChars } = getInnerBoxSize(this);
    this.canvasSize = {
      width: innerWidthChars,
      height: innerHeightChars,
    };
  }

  override setData(data: unknown): void {
    super.setData(data);
    const barData = data as BarData;

    if (!this.ctx) {
      throw new Error(
        "Canvas context does not exist. setData() must be called after the chart has been added to the screen via screen.append()",
      );
    }

    this.clear();

    const c = this.ctx;
    const max = Math.max(
      Math.max(...barData.data),
      this.options.maxHeight ?? 0,
    );
    let x = this.options.xOffset!;
    const labelRows = this.options.showText
      ? Bar.LABEL_ROWS_WITH_TEXT
      : Bar.LABEL_ROWS_NO_TEXT;
    const barY = this.canvasSize.height - labelRows;
    const valueRow = barY;
    const labelRow = barY + 1;

    for (let i = 0; i < barData.data.length; i++) {
      const h = Math.round(barY * (barData.data[i] / max));

      const barColor = (this.options.barBgColor ?? "blue") as any;
      const barWidth = this.options.barWidth! + 1;

      if (barData.data[i] > 0) {
        // Set strokeStyle which sets the canvas color for fillRect
        c.strokeStyle = barColor;
        // Fill the rectangle - fillRect uses _canvas.set() which uses getBgCode(this.color)
        c.fillRect(x, barY - h + 1, barWidth, h);
      } else {
        c.strokeStyle = "normal";
      }

      // Set text background to match bar color, foreground to white
      if (this.options.showText) {
        c._canvas.fontBg = barColor;
        c.fillStyle = (this.options.barFgColor ?? "white") as any;
        c.fillText(barData.data[i].toString(), x + 1, valueRow);
        c._canvas.fontBg = "normal";
      }

      c.strokeStyle = "normal";
      c.fillStyle = (this.options.labelColor ?? "white") as any;
      if (this.options.showText) {
        c.fillText(barData.titles[i], x + 1, labelRow);
      }

      x += this.options.barSpacing! + 1;
    }
  }

  /**
   * Get options prototype (for blessed-contrib compatibility)
   */
  getOptionsPrototype(): BarOptions {
    return {
      barWidth: 1,
      barSpacing: 1,
      xOffset: 1,
      maxHeight: 1,
      data: {
        titles: ["s"],
        data: [1],
      },
    };
  }
}

export default Bar;
