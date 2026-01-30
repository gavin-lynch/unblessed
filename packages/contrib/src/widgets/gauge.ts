/**
 * gauge.ts - Gauge/progress bar widget
 *
 * Displays a horizontal progress gauge with percentage.
 * Supports both single value and stacked values.
 *
 * Based on blessed-contrib's gauge.js
 */

import { AnsiTermCanvas, CanvasWidget, type BoxOptions } from "@unblessed/core";

/**
 * Stack item for stacked gauge
 */
export interface GaugeStackItem {
  /** Percentage value (0-100 or 0-1) */
  percent: number;
  /** Stack color */
  stroke?: string | number | number[];
}

/**
 * Gauge options
 */
export interface GaugeOptions extends BoxOptions {
  /** Stroke/fill color for the gauge (default: 'magenta') */
  stroke?: string | number | number[];
  /** Text color (default: 'white') */
  fill?: string | number | number[];
  /** Show percentage label (default: true) */
  showLabel?: boolean;
  /** Initial percentage (0-100 or 0-1) */
  percent?: number;
  /** Initial stack data */
  stack?: (number | GaugeStackItem)[];
  /** Initial data (alias for percent/stack) */
  data?: number | (number | GaugeStackItem)[];
}

/**
 * Gauge - Horizontal progress gauge widget
 *
 * Displays a horizontal progress bar with:
 * - Single percentage value
 * - Or stacked segments with different colors
 * - Optional percentage label
 *
 * @example
 * ```ts
 * // Simple gauge
 * const gauge = new Gauge({
 *   parent: screen,
 *   width: '50%',
 *   height: 5,
 *   label: 'Progress',
 *   percent: 75
 * });
 *
 * // Stacked gauge
 * const stackedGauge = new Gauge({
 *   parent: screen,
 *   width: '50%',
 *   height: 5,
 *   label: 'Resource Usage',
 *   stack: [
 *     { percent: 30, stroke: 'green' },
 *     { percent: 50, stroke: 'yellow' },
 *     { percent: 20, stroke: 'red' }
 *   ]
 * });
 * ```
 */
export class Gauge extends CanvasWidget {
  override type = "gauge";
  declare options: GaugeOptions;
  private _percent: number = 0;
  private _stack: (number | GaugeStackItem)[] | null = null;

  constructor(options: GaugeOptions = {}) {
    super(options, AnsiTermCanvas);

    this.options = options;
    this.options.stroke = options.stroke ?? "magenta";
    this.options.fill = options.fill ?? "white";
    this.options.data = options.data ?? [];
    this.options.showLabel = options.showLabel !== false;

    this.on("attach", () => {
      if (this.options.stack) {
        this._stack = this.options.stack;
        this.setStack(this._stack);
      } else {
        this._percent = this.options.percent ?? 0;
        this.setPercent(this._percent);
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
   * Set gauge data (can be percent or stack)
   */
  override setData(data: unknown): void {
    super.setData(data);
    if (Array.isArray(data) && data.length > 0) {
      this.setStack(data as (number | GaugeStackItem)[]);
    } else if (typeof data === "number") {
      this.setPercent(data);
    }
  }

  /**
   * Set single percentage value
   * @param percent - Value from 0-100 or 0-1
   */
  setPercent(percent: number): void {
    if (!this.ctx) {
      throw new Error(
        "Canvas context does not exist. setData() must be called after the gauge has been added to the screen via screen.append()",
      );
    }

    const c = this.ctx;

    c.strokeStyle = this.options.stroke!;
    c.fillStyle = this.options.fill!;

    c.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);

    // Normalize to 0-100 range
    if (percent < 1.001) {
      percent = percent * 100;
    }

    const width = (percent / 100) * (this.canvasSize.width - 3);
    c.fillRect(1, 2, width, 2);

    const textX = 7;
    if (width < textX) {
      c.strokeStyle = "normal";
    }

    if (this.options.showLabel) {
      c.fillText(Math.round(percent) + "%", textX, 3);
    }
  }

  /**
   * Set stacked values
   * @param stack - Array of percentages or stack items
   */
  setStack(stack: (number | GaugeStackItem)[]): void {
    const defaultColors = ["green", "magenta", "cyan", "red", "blue"];

    if (!this.ctx) {
      throw new Error(
        "Canvas context does not exist. setData() must be called after the gauge has been added to the screen via screen.append()",
      );
    }

    const c = this.ctx;
    let leftStart = 1;

    c.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);

    for (let i = 0; i < stack.length; i++) {
      const currentStack = stack[i];

      let percent: number;
      let stroke: string | number | number[];

      if (typeof currentStack === "object" && currentStack !== null) {
        percent = currentStack.percent;
        stroke = currentStack.stroke ?? defaultColors[i % defaultColors.length];
      } else {
        percent = currentStack;
        stroke = defaultColors[i % defaultColors.length];
      }

      c.strokeStyle = stroke;
      c.fillStyle = this.options.fill!;

      // Normalize to 0-100 range
      if (percent < 1.001) {
        percent = percent * 100;
      }

      const width = (percent / 100) * (this.canvasSize.width - 3);
      c.fillRect(leftStart, 2, width, 2);

      const textX = leftStart + width / 2 - 1;

      if (leftStart + width < textX) {
        c.strokeStyle = "normal";
      }

      if (this.options.showLabel) {
        c.fillText(percent + "%", textX, 3);
      }

      leftStart += width;
    }
  }

  /**
   * Get options prototype (for blessed-contrib compatibility)
   */
  getOptionsPrototype(): GaugeOptions {
    return { percent: 10 };
  }
}

export default Gauge;
