/**
 * donut.ts - Donut/pie chart widget
 *
 * Displays donut-shaped percentage charts.
 * Uses braille canvas for high-resolution rendering.
 *
 * Based on blessed-contrib's donut.js
 */

import { CanvasWidget, DrawilleCanvas, type BoxOptions } from "@unblessed/core";
import { getColorCode, truncateAnsiLines } from "../utils.js";

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
  /** Dimmer factor for remaining portion when color is RGB (0-1) */
  remainOpacity?: number;
  /** Pixel brush size for arc drawing (default: 1) */
  brushSize?: number;
  /** Number of segments for arc smoothing (default: 370) */
  points?: number;
  /** Start angle in degrees (default: -90) */
  startAngle?: number;
  /** Horizontal offset for value text (default: 3) */
  valueOffsetX?: number;
  /** Vertical offset for value text (default: 0) */
  valueOffsetY?: number;
  /** Horizontal offset for label text (default: 3) */
  labelOffsetX?: number;
  /** Vertical offset for label text (default: 5) */
  labelOffsetY?: number;
  /** Horizontal chart padding in braille pixels (default: 5) */
  chartPaddingX?: number;
  /** Vertical chart padding in braille pixels (default: 12) */
  chartPaddingY?: number;
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
    this.options.remainOpacity = options.remainOpacity;
    this.options.brushSize = options.brushSize ?? 1;
    this.options.points = options.points ?? 370;
    this.options.startAngle = options.startAngle ?? -90;
    this.options.valueOffsetX = options.valueOffsetX ?? 3;
    this.options.valueOffsetY = options.valueOffsetY ?? 0;
    this.options.labelOffsetX = options.labelOffsetX ?? 3;
    this.options.labelOffsetY = options.labelOffsetY ?? 5;
    this.options.chartPaddingX = options.chartPaddingX ?? 5;
    this.options.chartPaddingY = options.chartPaddingY ?? 12;
    this.options.data = options.data ?? [];

    this.on("attach", () => {
      this.setData(this.options.data!);
    });
  }

  override calcSize(): void {
    const outerWidthChars = Math.max(1, Math.floor(this.width));
    const outerHeightChars = Math.max(1, Math.floor(this.height));
    const donutPaddingX = Math.max(0, this.options.chartPaddingX ?? 0);
    const donutPaddingY = Math.max(0, this.options.chartPaddingY ?? 0);
    let width = Math.round(outerWidthChars * 2 - donutPaddingX);
    let height = outerHeightChars * 4 - donutPaddingY;

    if (width % 2 === 1) width--;
    if (height % 4 !== 1) height += height % 4;

    this.canvasSize = {
      width: Math.max(2, width),
      height: Math.max(4, height),
    };
  }

  protected override getFrameFromCanvas(): string {
    if (!this._canvas) return "";
    const frame = this._canvas.frame();
    const availableWidth = Math.max(
      1,
      Math.floor(this.width - (this.border ? 2 : 0)),
    );
    return truncateAnsiLines(frame, availableWidth);
  }

  override setData(data: unknown): void {
    super.setData(data);
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
    // Keep the context in identity space.
    // We handle yPadding by shifting draw coordinates, and we draw arcs by
    // setting pixels directly (avoids gaps and keeps animation smooth).
    c.resetTransform();

    c.strokeStyle = getColorCode(this.options.stroke!) as any;
    c.fillStyle = getColorCode(this.options.fill!) as any;

    c.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);

    const cheight = this.canvasSize.height;
    const cwidth = this.canvasSize.width;
    const radius = this.options.radius!;
    const arcWidth = this.options.arcWidth!;
    const remainColor = this.options.remainColor!;
    const brushSize = Math.max(1, Math.round(this.options.brushSize ?? 1));
    const points = Math.max(4, Math.round(this.options.points ?? 370));
    const startAngle = this.options.startAngle ?? -90;
    const valueOffsetX = this.options.valueOffsetX ?? 3;
    const valueOffsetY = this.options.valueOffsetY ?? 0;
    const labelOffsetX = this.options.labelOffsetX ?? 3;
    const labelOffsetY = this.options.labelOffsetY ?? 5;

    const applyOpacity = (
      color: string | number | number[],
      opacity?: number,
    ): string | number | number[] => {
      if (opacity === undefined) return color;
      if (!Array.isArray(color)) return color;
      const [r, g, b] = color;
      const alpha = Math.max(0, Math.min(1, opacity));
      return [
        Math.round(r * alpha),
        Math.round(g * alpha),
        Math.round(b * alpha),
      ];
    };

    const remainColorAdjusted = applyOpacity(
      remainColor,
      this.options.remainOpacity,
    );

    const yOffset = this.options.yPadding ?? 0;

    // Draw a ring/arc (concentric stroked arcs so the ring appears filled with color)
    // Arc extent: percent 0-1 maps to 0..points; percent >= 1 (e.g. 100 for bg) = full circle
    // Colors: getColorCode supports truecolor (RGB [r,g,b]), 256-color, and names (blessed-contrib uses x256 only)
    const makeRound = (
      percent: number,
      r: number,
      width: number,
      cx: number,
      cy: number,
      color: string | number | number[],
    ): void => {
      const canvas = c._canvas as any;
      if (!canvas || typeof canvas.set !== "function") return;

      const slice = (2 * PI) / points;
      const p =
        percent >= 1 ? points : Math.max(0, Math.min(points, percent * points));

      const plotLine = (x0: number, y0: number, x1: number, y1: number) => {
        let x = Math.floor(x0);
        let y = Math.floor(y0);
        const ex = Math.floor(x1);
        const ey = Math.floor(y1);
        const dx = Math.abs(ex - x);
        const dy = Math.abs(ey - y);
        const sx = x < ex ? 1 : -1;
        const sy = y < ey ? 1 : -1;
        let err = dx - dy;
        for (;;) {
          if (brushSize === 1) {
            canvas.set(x, y, color);
          } else {
            for (let by = 0; by < brushSize; by++) {
              for (let bx = 0; bx < brushSize; bx++) {
                canvas.set(x + bx, y + by, color);
              }
            }
          }
          if (x === ex && y === ey) break;
          const e2 = 2 * err;
          if (e2 > -dy) {
            err -= dy;
            x += sx;
          }
          if (e2 < dx) {
            err += dx;
            y += sy;
          }
        }
      };

      for (let s = Math.max(0, Math.floor(r - width)); s < Math.floor(r); s++) {
        if (p <= 0) continue;
        // Start at configured angle.
        let prevX = Math.round(cx + s * cos(slice * (0 + startAngle)));
        let prevY = Math.round(cy + s * sin(slice * (0 + startAngle)));
        for (let i = 1; i <= Math.floor(p); i++) {
          const a = slice * (i + startAngle);
          const x = Math.round(cx + s * cos(a));
          const y = Math.round(cy + s * sin(a));
          plotLine(prevX, prevY, x, y);
          prevX = x;
          prevY = y;
        }
        // Fractional tail for smooth animation.
        if (p < points && p !== Math.floor(p)) {
          const a = slice * (p + startAngle);
          const x = Math.round(cx + s * cos(a));
          const y = Math.round(cy + s * sin(a));
          plotLine(prevX, prevY, x, y);
        }
      }
    };

    const middle = cheight / 2 - yOffset;
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
      // Draw background ring (full circle in remainColor)
      makeRound(1, r, width, cxx, mid, remainColorAdjusted);
      // Draw filled portion (arc 0..percent in segment color)
      makeRound(percent, r, width, cxx, mid, color);

      // Draw percentage text (always use fill color so segment color doesn't bleed into label)
      c.fillStyle = getColorCode(this.options.fill!) as any;
      const ptext = percentAltNumber
        ? percentAltNumber.toFixed(0)
        : parseFloat(String(percent * 100)).toFixed(0) + "%";
      c.fillText(
        ptext,
        cxx -
          Math.round(parseFloat(String(c.measureText(ptext).width)) / 2) +
          valueOffsetX,
        mid + valueOffsetY,
      );

      // Draw label (always use fill color so segment color doesn't bleed into label)
      c.fillStyle = getColorCode(this.options.fill!) as any;
      c.fillText(
        label,
        cxx -
          Math.round(parseFloat(String(c.measureText(label).width)) / 2) +
          labelOffsetX,
        mid + r + labelOffsetY,
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

    c.strokeStyle = getColorCode(this.options.stroke!) as any;
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
