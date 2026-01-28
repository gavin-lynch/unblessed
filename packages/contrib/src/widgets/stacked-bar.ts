/**
 * stacked-bar.ts - Stacked bar chart widget
 *
 * Displays stacked vertical bar charts with multiple data series per bar.
 * Uses AnsiTerm canvas for character-level rendering.
 *
 * Based on blessed-contrib's stacked-bar.js
 */

import {
  Box,
  CanvasWidget,
  AnsiTermCanvas,
  type BoxOptions,
} from "@unblessed/core";
import { abbreviateNumber, toColorTag } from "../utils.js";

/**
 * Stacked bar chart data
 */
export interface StackedBarData {
  /** Category labels for each bar */
  barCategory: string[];
  /** Labels for each stack segment */
  stackedCategory: string[];
  /** Data matrix: [bar][stack] */
  data: number[][];
}

/**
 * Stacked bar chart options
 */
export interface StackedBarOptions extends BoxOptions {
  /** Width of each bar in characters (default: 6) */
  barWidth?: number;
  /** Spacing between bars in characters (default: 9) */
  barSpacing?: number;
  /** X offset for first bar (default: 5) */
  xOffset?: number;
  /** Maximum value for scaling */
  maxValue?: number;
  /** Colors for each stack segment */
  barBgColor?: (string | number | number[])[];
  /** Text color */
  barFgColor?: string | number | number[];
  /** Label color */
  labelColor?: string | number | number[];
  /** Show text labels (default: true) */
  showText?: boolean;
  /** Show legend (default: true) */
  showLegend?: boolean;
  /** Legend options */
  legend?: {
    width?: number;
  };
  /** Initial data */
  data?: StackedBarData;
}

/**
 * StackedBar - Stacked bar chart widget
 *
 * Displays stacked bar charts with:
 * - Multiple data series stacked in each bar
 * - Configurable colors per series
 * - Optional legend
 * - Value labels
 *
 * @example
 * ```ts
 * const stackedBar = new StackedBar({
 *   parent: screen,
 *   width: '60%',
 *   height: 12,
 *   label: 'Resource Usage',
 *   barWidth: 6,
 *   barBgColor: ['green', 'yellow', 'red'],
 *   data: {
 *     barCategory: ['Server 1', 'Server 2', 'Server 3'],
 *     stackedCategory: ['CPU', 'Memory', 'Disk'],
 *     data: [
 *       [20, 30, 10],  // Server 1
 *       [40, 20, 15],  // Server 2
 *       [25, 35, 20]   // Server 3
 *     ]
 *   }
 * });
 * ```
 */
export class StackedBar extends CanvasWidget {
  override type = "bar";
  declare options: StackedBarOptions;
  private legend: Box | null = null;

  constructor(options: StackedBarOptions = {}) {
    super(options, AnsiTermCanvas);

    this.options = options;
    this.options.barWidth = options.barWidth ?? 6;
    this.options.barSpacing = options.barSpacing ?? 9;

    // Ensure minimum spacing
    if (this.options.barSpacing - this.options.barWidth < 3) {
      this.options.barSpacing = this.options.barWidth + 3;
    }

    this.options.xOffset = options.xOffset ?? 5;
    this.options.showText = options.showText !== false;
    this.options.showLegend = options.showLegend !== false;
    this.options.legend = options.legend || {};

    this.on("attach", () => {
      if (this.options.data) {
        this.setData(this.options.data);
      }
    });
  }

  override calcSize(): void {
    this.canvasSize = {
      width: this.width - 2,
      height: this.height,
    };
  }

  /**
   * Get summed values for each bar
   */
  private getSummedBars(bars: number[][]): number[] {
    return bars.map((stackedValues) =>
      stackedValues.reduce((a, b) => a + b, 0),
    );
  }

  override setData(data: unknown): void {
    const bars = data as StackedBarData;

    if (!this.ctx) {
      throw new Error(
        "Canvas context does not exist. setData() must be called after the chart has been added to the screen via screen.append()",
      );
    }

    this.clear();

    const summedBars = this.getSummedBars(bars.data);
    let maxBarValue = Math.max(...summedBars);
    if (this.options.maxValue) {
      maxBarValue = Math.max(maxBarValue, this.options.maxValue);
    }

    let x = this.options.xOffset!;
    for (let i = 0; i < bars.data.length; i++) {
      this.renderBar(
        x,
        bars.data[i],
        summedBars[i],
        maxBarValue,
        bars.barCategory[i],
      );
      x += this.options.barSpacing!;
    }

    this.addLegend(bars, x);
  }

  private renderBar(
    x: number,
    bar: number[],
    curBarSummedValue: number,
    maxBarValue: number,
    category: string,
  ): void {
    const BUFFER_FROM_TOP = 2;
    const BUFFER_FROM_BOTTOM =
      (this.border ? 2 : 0) + (this.options.showText ? 1 : 0);

    const c = this.ctx!;

    // Draw category label
    c.strokeStyle = "normal";
    c.fillStyle = this.options.labelColor ?? "white";
    if (this.options.showText) {
      c.fillText(category, x + 1, this.canvasSize.height - BUFFER_FROM_BOTTOM);
    }

    if (curBarSummedValue < 0) return;

    const maxBarHeight =
      this.canvasSize.height - BUFFER_FROM_TOP - BUFFER_FROM_BOTTOM;
    const currentBarHeight = Math.round(
      maxBarHeight * (curBarSummedValue / maxBarValue),
    );

    // Start painting from bottom of bar, section by section
    let y = maxBarHeight + BUFFER_FROM_TOP;
    let availableBarHeight = currentBarHeight;

    for (let i = 0; i < bar.length; i++) {
      const currStackHeight = this.renderBarSection(
        x,
        y,
        bar[i],
        curBarSummedValue,
        currentBarHeight,
        availableBarHeight,
        this.options.barBgColor?.[i] ?? "blue",
      );
      y -= currStackHeight;
      availableBarHeight -= currStackHeight;
    }
  }

  private renderBarSection(
    x: number,
    y: number,
    data: number,
    curBarSummedValue: number,
    currentBarHeight: number,
    availableBarHeight: number,
    bg: string | number | number[],
  ): number {
    const c = this.ctx!;

    const currStackHeight =
      currentBarHeight <= 0
        ? 0
        : Math.min(
            availableBarHeight,
            Math.round(currentBarHeight * (data / curBarSummedValue)),
          );

    c.strokeStyle = bg;

    if (currStackHeight > 0) {
      const calcY = y - currStackHeight;
      const calcHeight = Math.max(0, currStackHeight - 1);

      c.fillRect(x, calcY, this.options.barWidth!, calcHeight);

      // Set text background to match bar color, foreground to white
      if (this.options.showText) {
        // Set background color for text (matching bar color)
        c._canvas.fontBg = bg;
        // Set foreground color for text (white by default, or user-specified)
        c.fillStyle = this.options.barFgColor ?? "white";
        const str = abbreviateNumber(data);
        c.fillText(
          str,
          Math.floor(x + this.options.barWidth! / 2 + str.length / 2),
          calcY + Math.round(calcHeight / 2),
        );
        // Reset background after text
        c._canvas.fontBg = "normal";
      }
    }

    return currStackHeight;
  }

  private addLegend(bars: StackedBarData, x: number): void {
    if (!this.options.showLegend) return;

    if (this.legend) {
      this.remove(this.legend);
    }

    const legendWidth = this.options.legend?.width ?? 15;

    this.legend = new Box({
      height: bars.stackedCategory.length + 2,
      top: 1,
      width: legendWidth,
      left: x,
      content: "",
      tags: true,
      border: {
        type: "line",
        fg: 0, // black
      },
      style: {
        fg: "blue",
      },
    });

    let legendText = "";
    const maxChars = legendWidth - 2;

    for (let i = 0; i < bars.stackedCategory.length; i++) {
      const color = toColorTag(this.options.barBgColor?.[i] ?? "blue");
      legendText +=
        "{" +
        color +
        "-fg}" +
        bars.stackedCategory[i].substring(0, maxChars) +
        "{/" +
        color +
        "-fg}\r\n";
    }

    this.legend.setContent(legendText);
    this.append(this.legend);
  }

  /**
   * Get options prototype (for blessed-contrib compatibility)
   */
  getOptionsPrototype(): StackedBarOptions {
    return {
      barWidth: 1,
      barSpacing: 1,
      xOffset: 1,
      maxValue: 1,
      barBgColor: ["s"],
      data: {
        barCategory: ["s"],
        stackedCategory: ["s"],
        data: [[1]],
      },
    };
  }
}

export default StackedBar;
