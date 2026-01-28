/**
 * donut.ts - Donut/pie chart widget
 *
 * Displays donut-shaped percentage charts.
 * Uses braille canvas for high-resolution rendering.
 *
 * Based on blessed-contrib's donut.js
 */

import { CanvasWidget, DrawilleCanvas, type BoxOptions } from "@unblessed/core";

/**
 * Donut chart data item
 */
export interface DonutData {
  /** Section label */
  label: string;
  /** Percentage (0-100 or 0-1) */
  percent: number | string;
  /** Section color */
  color?: string | number | number[];
  /** Alternative number to display instead of percent */
  percentAltNumber?: number;
}

/**
 * Donut chart options
 */
export interface DonutOptions extends BoxOptions {
  /** Stroke color (default: 'magenta') */
  stroke?: string | number | number[];
  /** Fill/text color (default: 'white') */
  fill?: string | number | number[];
  /** Donut radius in pixels (default: 14) */
  radius?: number;
  /** Width of the arc (default: 4) */
  arcWidth?: number;
  /** Spacing between donuts (default: 2) */
  spacing?: number;
  /** Y padding (default: 2) */
  yPadding?: number;
  /** Color for remaining portion (default: 'black') */
  remainColor?: string | number | number[];
  /** Initial data */
  data?: DonutData[];
}

const PI = 3.141592635;
const cos = Math.cos;
const sin = Math.sin;

/**
 * Donut - Donut/pie chart widget
 *
 * Displays one or more donut charts showing percentages with:
 * - Customizable colors per segment
 * - Labels below each donut
 * - Percentage or custom value display
 *
 * @example
 * ```ts
 * const donut = new Donut({
 *   parent: screen,
 *   width: 30,
 *   height: 15,
 *   label: 'Disk Usage',
 *   data: [
 *     { label: 'SSD', percent: 75, color: 'green' },
 *     { label: 'HDD', percent: 45, color: 'blue' },
 *     { label: 'NAS', percent: 90, color: 'red' }
 *   ]
 * });
 * ```
 */
export class Donut extends CanvasWidget {
  override type = "donut";
  declare options: DonutOptions;
  /** Current donut data */
  currentData: DonutData[] = [];

  constructor(options: DonutOptions = {}) {
    super(options, DrawilleCanvas);

    this.options = options;
    this.options.stroke = options.stroke ?? "magenta";
    this.options.fill = options.fill ?? "white";
    this.options.radius = options.radius ?? 14;
    this.options.arcWidth = options.arcWidth ?? 4;
    this.options.spacing = options.spacing ?? 2;
    this.options.yPadding = options.yPadding ?? 2;
    this.options.remainColor = options.remainColor ?? "black";
    this.options.data = options.data ?? [];

    this.on("attach", () => {
      this.setData(this.options.data!);
    });
  }

  override calcSize(): void {
    let width = Math.round(this.width * 2 - 5);
    let height = this.height * 4 - 12;

    // Ensure width is even for braille
    if (width % 2 === 1) {
      width--;
    }

    // Ensure height aligns with braille
    if (height % 4 !== 1) {
      height += height % 4;
    }

    this.canvasSize = { width, height };
  }

  override setData(data: unknown): void {
    this.update(data as DonutData[]);
  }

  /**
   * Update the donut chart
   */
  update(data: DonutData[]): void {
    if (!this.ctx) {
      throw new Error(
        "Canvas context does not exist. setData() must be called after the chart has been added to the screen via screen.append()",
      );
    }

    const c = this.ctx;
    c.save();
    c.translate(0, -this.options.yPadding!);

    c.strokeStyle = this.options.stroke! as any;
    c.fillStyle = this.options.fill! as any;

    c.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);

    const cheight = this.canvasSize.height;
    const cwidth = this.canvasSize.width;
    const radius = this.options.radius!;
    const arcWidth = this.options.arcWidth!;
    const remainColor = this.options.remainColor!;

    // Draw a ring/arc
    const makeRound = (
      percent: number,
      r: number,
      width: number,
      cx: number,
      cy: number,
      color: string | number | number[],
    ): void => {
      let s = 0;
      const points = 370;
      c.strokeStyle = color as any;

      while (s < r) {
        if (s < r - width) {
          s++;
          continue;
        }

        const slice = (2 * PI) / points;
        c.beginPath();
        const p = parseFloat(String(percent * 360));

        for (let i = 0; i <= points; i++) {
          if (i > p) continue;
          const si = i - 90;
          const a = slice * si;
          c.lineTo(Math.round(cx + s * cos(a)), Math.round(cy + s * sin(a)));
        }

        c.stroke();
        c.closePath();
        s++;
      }
    };

    const middle = cheight / 2;
    const donuts = data.length;
    const spacing = (cwidth - donuts * radius * 2) / (donuts + 1);

    // Draw a single donut
    const drawDonut = (
      label: string,
      percent: number,
      r: number,
      width: number,
      cxx: number,
      mid: number,
      color: string | number | number[],
      percentAltNumber?: number,
    ): void => {
      // Draw background ring
      makeRound(100, r, width, cxx, mid, remainColor);
      // Draw filled portion
      makeRound(percent, r, width, cxx, mid, color);

      // Draw percentage text
      const ptext = percentAltNumber
        ? percentAltNumber.toFixed(0)
        : parseFloat(String(percent * 100)).toFixed(0) + "%";
      c.fillText(
        ptext,
        cxx -
          Math.round(parseFloat(String(c.measureText(ptext).width)) / 2) +
          3,
        mid,
      );

      // Draw label
      c.fillText(
        label,
        cxx -
          Math.round(parseFloat(String(c.measureText(label).width)) / 2) +
          3,
        mid + r + 5,
      );
    };

    // Process a single donut item
    const makeDonut = (stat: DonutData, which: number): void => {
      const left = radius + spacing * which + radius * 2 * (which - 1);

      let percent = stat.percent;
      if (typeof percent === "string") {
        percent = parseFloat(percent);
      }
      if (percent > 1.001) {
        percent = parseFloat((percent / 100).toFixed(2));
      }

      const label = stat.label;
      const percentAltNumber = stat.percentAltNumber;
      const color = stat.color ?? "green";
      const cxx = left;

      drawDonut(
        label,
        percent,
        radius,
        arcWidth,
        cxx,
        middle,
        color,
        percentAltNumber,
      );
    };

    // Draw all donuts
    if (data.length) {
      for (let l = 0; l < data.length; l++) {
        makeDonut(data[l], l + 1);
      }
    }

    this.currentData = data;

    c.strokeStyle = "magenta";
    c.restore();
  }

  /**
   * Get options prototype (for blessed-contrib compatibility)
   */
  getOptionsPrototype(): DonutOptions {
    return {
      spacing: 1,
      yPadding: 1,
      radius: 1,
      arcWidth: 1,
      data: [
        { color: "red", percent: "50", label: "a" },
        { color: "blue", percent: "20", label: "b" },
        { color: "yellow", percent: "80", label: "c" },
      ],
    };
  }
}

export default Donut;
