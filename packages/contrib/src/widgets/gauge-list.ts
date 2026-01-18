/**
 * gauge-list.ts - Multiple gauges in a list
 *
 * Displays multiple horizontal progress gauges vertically stacked.
 * Uses AnsiTerm canvas for character-level rendering.
 *
 * Based on blessed-contrib's gauge-list.js
 */

import {
  CanvasWidget,
  AnsiTermCanvas,
  type BoxOptions,
} from "@unblessed/core";

/**
 * Stack item for a gauge
 */
export interface GaugeListStackItem {
  /** Percentage value (0-100) */
  percent: number;
  /** Stack color */
  stroke?: string | number | number[];
}

/**
 * Single gauge configuration
 */
export interface GaugeListItem {
  /** Stack segments */
  stack: (number | GaugeListStackItem)[];
  /** Show percentage label (default: false) */
  showLabel?: boolean;
}

/**
 * GaugeList options
 */
export interface GaugeListOptions extends BoxOptions {
  /** Stroke color (default: 'magenta') */
  stroke?: string | number | number[];
  /** Fill/text color (default: 'white') */
  fill?: string | number | number[];
  /** Show labels (default: true) */
  showLabel?: boolean;
  /** Spacing between gauges (default: 0) */
  gaugeSpacing?: number;
  /** Height of each gauge in characters (default: 1) */
  gaugeHeight?: number;
  /** Initial gauges configuration */
  gauges?: GaugeListItem[];
}

/**
 * GaugeList - Multiple horizontal gauges widget
 *
 * Displays multiple horizontal progress bars stacked vertically.
 * Each gauge can have multiple stacked segments with different colors.
 *
 * @example
 * ```ts
 * const gaugeList = new GaugeList({
 *   parent: screen,
 *   width: '50%',
 *   height: 10,
 *   label: 'Resource Usage',
 *   gaugeSpacing: 1,
 *   gaugeHeight: 2,
 *   gauges: [
 *     { stack: [{ percent: 30, stroke: 'green' }, { percent: 70, stroke: 'red' }] },
 *     { stack: [{ percent: 50, stroke: 'blue' }, { percent: 30, stroke: 'yellow' }] },
 *     { stack: [80] }
 *   ]
 * });
 * ```
 */
export class GaugeList extends CanvasWidget {
  override type = "gauge";
  declare options: GaugeListOptions;
  gauges: GaugeListItem[] = [];

  constructor(options: GaugeListOptions = {}) {
    super(options, AnsiTermCanvas);

    this.options = options;
    this.options.stroke = options.stroke ?? "magenta";
    this.options.fill = options.fill ?? "white";
    this.options.showLabel = options.showLabel !== false;
    this.options.gaugeSpacing = options.gaugeSpacing ?? 0;
    this.options.gaugeHeight = options.gaugeHeight ?? 1;

    this.on("attach", () => {
      this.gauges = this.options.gauges ?? [];
      this.setGauges(this.gauges);
    });
  }

  override calcSize(): void {
    this.canvasSize = {
      width: this.width - 2,
      height: this.height,
    };
  }

  override setData(_data: unknown): void {
    // Not used - use setGauges instead
  }

  /**
   * Set all gauges
   */
  setGauges(gauges: GaugeListItem[]): void {
    if (!this.ctx) {
      throw new Error(
        "Canvas context does not exist. setGauges() must be called after the widget has been added to the screen via screen.append()",
      );
    }

    this.gauges = gauges;
    const c = this.ctx;
    c.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);

    for (let i = 0; i < gauges.length; i++) {
      this.setSingleGauge(gauges[i], i);
    }
  }

  /**
   * Render a single gauge at an offset
   */
  private setSingleGauge(gauge: GaugeListItem, offset: number): void {
    const colors = ["green", "magenta", "cyan", "red", "blue"];
    const stack = gauge.stack;
    const c = this.ctx!;

    let leftStart = 3;
    const gaugeHeight = this.options.gaugeHeight!;
    const gaugeSpacing = this.options.gaugeSpacing!;
    const yOffset = offset * (gaugeHeight + gaugeSpacing);

    // Draw index number
    c.strokeStyle = "normal";
    c.fillStyle = "white";
    c.fillText(offset.toString(), 0, yOffset);

    for (let i = 0; i < stack.length; i++) {
      const currentStack = stack[i];

      let percent: number;
      if (typeof currentStack === "object" && currentStack !== null) {
        percent = currentStack.percent;
      } else {
        percent = currentStack;
      }

      const strokeColor =
        typeof currentStack === "object" && currentStack.stroke
          ? currentStack.stroke
          : colors[i % colors.length];

      c.strokeStyle = strokeColor;
      c.fillStyle = this.options.fill!;

      const width = (percent / 100) * (this.canvasSize.width - 5);

      c.fillRect(leftStart, yOffset, width, gaugeHeight - 1);

      const textLeft = width / 2 - 1;
      const textX = leftStart + textLeft;

      if (leftStart + width < textX) {
        c.strokeStyle = "normal";
      }

      if (gauge.showLabel) {
        c.fillText(percent + "%", textX, 3);
      }

      leftStart += width;
    }
  }

  /**
   * Get options prototype (for blessed-contrib compatibility)
   */
  getOptionsPrototype(): GaugeListOptions {
    return { gauges: [{ stack: [50] }] };
  }
}

export default GaugeList;
