/**
 * line.ts - Line chart widget
 *
 * Displays line graphs with multiple data series, axis labels, and optional legend.
 * Uses braille canvas for high-resolution rendering.
 *
 * Based on blessed-contrib's line.js
 */

import {
  Box,
  CanvasWidget,
  DrawilleCanvas,
  type BoxOptions,
} from "@unblessed/core";
import { abbreviateNumber, getColorCode, toColorTag } from "../utils.js";

/**
 * Data series for line chart
 */
export interface LineSeriesData {
  /** Series title (for legend) */
  title?: string;
  /** X-axis labels */
  x: string[];
  /** Y-axis values */
  y: number[];
  /** Series style */
  style?: {
    /** Line color */
    line?: string | number | number[];
  };
}

/**
 * Line chart options
 */
export interface LineOptions extends BoxOptions {
  /** Show every Nth label (default: 1 = all labels) */
  showNthLabel?: number;
  /** Line style */
  style?: BoxOptions["style"] & {
    /** Default line color */
    line?: string;
    /** Text color for labels */
    text?: string;
    /** Baseline (axis) color */
    baseline?: string;
  };
  /** X label padding in pixels */
  xLabelPadding?: number;
  /** X padding in pixels */
  xPadding?: number;
  /** Number of Y-axis labels */
  numYLabels?: number;
  /** Legend options */
  legend?: {
    width?: number;
  };
  /** Show legend */
  showLegend?: boolean;
  /** Only show whole numbers on Y axis */
  wholeNumbersOnly?: boolean;
  /** Minimum Y value */
  minY?: number;
  /** Maximum Y value (auto-calculated if not set) */
  maxY?: number;
  /** Abbreviate large numbers */
  abbreviate?: boolean;
  /** Initial data */
  data?: LineSeriesData | LineSeriesData[];
}

/**
 * Line - Line chart widget
 *
 * Displays line graphs with support for:
 * - Multiple data series with different colors
 * - Automatic Y-axis scaling
 * - X-axis labels
 * - Optional legend
 * - High-resolution braille rendering
 *
 * @example
 * ```ts
 * const line = new Line({
 *   parent: screen,
 *   width: '80%',
 *   height: '50%',
 *   label: 'Server Load',
 *   showLegend: true,
 *   data: [
 *     {
 *       title: 'CPU',
 *       x: ['t1', 't2', 't3', 't4'],
 *       y: [5, 15, 7, 12],
 *       style: { line: 'yellow' }
 *     },
 *     {
 *       title: 'Memory',
 *       x: ['t1', 't2', 't3', 't4'],
 *       y: [10, 8, 12, 9],
 *       style: { line: 'blue' }
 *     }
 *   ]
 * });
 * ```
 */
export class Line extends CanvasWidget {
  override type = "line";
  declare options: LineOptions;
  private legend: Box | null = null;

  constructor(options: LineOptions = {}) {
    // Set defaults
    options.showNthLabel = options.showNthLabel ?? 1;
    options.style = options.style || {};
    options.style.line = options.style.line || "yellow";
    options.style.text = options.style.text || "green";
    options.style.baseline = options.style.baseline || "black";
    options.xLabelPadding = options.xLabelPadding ?? 5;
    options.xPadding = options.xPadding ?? 10;
    options.numYLabels = options.numYLabels ?? 5;
    // No default padding override (match blessed-contrib Box defaults)
    options.legend = options.legend || {};
    options.wholeNumbersOnly = options.wholeNumbersOnly ?? false;
    options.minY = options.minY ?? 0;

    super(options, DrawilleCanvas);
    this.options = options;
  }

  override calcSize(): void {
    this.canvasSize = {
      width: this.width * 2 - 12,
      height: this.height * 4 - 8,
    };
  }

  override setData(data: unknown): void {
    super.setData(data); // store for resize redraw
    let seriesData = data as LineSeriesData | LineSeriesData[];

    if (!this.ctx) {
      throw new Error(
        "Canvas context does not exist. setData() must be called after the chart has been added to the screen via screen.append()",
      );
    }

    // Compatibility with older API
    if (!Array.isArray(seriesData)) {
      seriesData = [seriesData];
    }

    const xLabelPadding = this.options.xLabelPadding!;
    let xPadding = this.options.xPadding!;
    const yPadding = 11;
    const yLabelPadding = 3;
    const c = this.ctx;
    const labels = seriesData[0].x;

    // Helper: get max Y value
    const getMaxY = (): number => {
      if (this.options.maxY) {
        return this.options.maxY;
      }

      let max = -Infinity;
      for (const series of seriesData as LineSeriesData[]) {
        if (series.y.length) {
          const current = Math.max(
            ...series.y.map((v) => parseFloat(String(v))),
          );
          if (current > max) {
            max = current;
          }
        }
      }

      return max + (max - this.options.minY!) * 0.2;
    };

    // Helper: format Y label
    const formatYLabel = (
      value: number,
      max: number,
      min: number,
      numLabels: number,
      wholeNumbersOnly: boolean,
      abbreviate: boolean,
    ): string => {
      const fixed =
        (max - min) / numLabels < 1 && value !== 0 && !wholeNumbersOnly ? 2 : 0;
      const res = value.toFixed(fixed);
      return abbreviate ? abbreviateNumber(parseFloat(res)) : res;
    };

    // Helper: get max X label padding needed
    const getMaxXLabelPadding = (
      numLabels: number,
      wholeNumbersOnly: boolean,
      abbreviate: boolean,
      min: number,
    ): number => {
      const max = getMaxY();
      return (
        formatYLabel(max, max, min, numLabels, wholeNumbersOnly, abbreviate)
          .length * 2
      );
    };

    // Adjust padding for Y labels
    const maxPadding = getMaxXLabelPadding(
      this.options.numYLabels!,
      this.options.wholeNumbersOnly!,
      this.options.abbreviate ?? false,
      this.options.minY!,
    );
    const adjustedXLabelPadding = Math.max(xLabelPadding, maxPadding);

    if (xPadding - adjustedXLabelPadding < 0) {
      xPadding = adjustedXLabelPadding;
    }

    // Helper: get max X label length
    const getMaxX = (): number => {
      let maxLength = 0;
      for (const label of labels) {
        if (label !== undefined && label.length > maxLength) {
          maxLength = label.length;
        }
      }
      return maxLength;
    };

    // Match blessed-contrib: chart left = xPadding, no top offset, same getXPixel/getYPixel
    const chartLeftPx = xPadding;

    // Helper: get X pixel position (blessed-contrib: (width - xPadding) / n * val + xPadding + 2)
    const getXPixel = (val: number): number => {
      const n = labels.length;
      if (n <= 1) return chartLeftPx;
      return ((this.canvasSize.width - xPadding) / n) * val + xPadding + 2;
    };

    // Helper: get Y pixel position (blessed-contrib: height - yPadding - (plotHeight / range) * (val - minY) - 2)
    const getYPixel = (val: number, minY: number): number => {
      const plotHeight = this.canvasSize.height - yPadding;
      let res =
        this.canvasSize.height -
        yPadding -
        (plotHeight / (getMaxY() - minY)) * (val - minY);
      res -= 2; // Separate baseline and data line (match bc)
      return res;
    };

    // Draw a line series (lineWidth 1 = single braille stroke, e.g. ⢠⠃ like blessed-contrib)
    const drawLine = (
      values: number[],
      style: { line?: string | number | number[] } | undefined,
      minY: number,
    ): void => {
      const lineStyle = style || {};
      // getColorCode preserves RGB arrays for truecolor, uses x256 for 256-color (blessed-contrib compatibility)
      const lineColor = lineStyle.line || this.options.style!.line!;
      c.strokeStyle = getColorCode(lineColor) as any;
      c.lineWidth = 1;

      c.beginPath();
      c.moveTo(getXPixel(0), getYPixel(values[0], minY));
      for (let k = 1; k < values.length; k++) {
        c.lineTo(getXPixel(k), getYPixel(values[k], minY));
      }

      c.stroke();
      c.lineWidth = 1;
    };

    // Add legend
    this.addLegend(seriesData as LineSeriesData[]);

    c.fillStyle = this.options.style!.text!;
    c.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);

    // Calculate Y label increment
    let yLabelIncrement =
      (getMaxY() - this.options.minY!) / this.options.numYLabels!;
    if (this.options.wholeNumbersOnly) {
      yLabelIncrement = Math.floor(yLabelIncrement);
    }
    if (yLabelIncrement === 0) {
      yLabelIncrement = 1;
    }

    // Draw Y axis labels (blessed-contrib: xPadding - xLabelPadding)
    const maxY = getMaxY();
    for (let i = this.options.minY!; i < maxY; i += yLabelIncrement) {
      c.fillText(
        formatYLabel(
          i,
          maxY,
          this.options.minY!,
          this.options.numYLabels!,
          this.options.wholeNumbersOnly!,
          this.options.abbreviate ?? false,
        ),
        xPadding - adjustedXLabelPadding,
        getYPixel(i, this.options.minY!),
      );
    }

    // Draw data lines
    for (const series of seriesData as LineSeriesData[]) {
      drawLine(series.y, series.style, this.options.minY!);
    }

    // Draw axes (blessed-contrib: xPadding,0 -> xPadding,height-yPadding -> width,height-yPadding)
    const baselineY = this.canvasSize.height - yPadding;
    c.strokeStyle = this.options.style!.baseline!;
    c.beginPath();
    c.lineTo(xPadding, 0);
    c.lineTo(xPadding, baselineY);
    c.lineTo(this.canvasSize.width, baselineY);
    c.stroke();
    c.fillStyle = this.options.style!.text!;

    // Draw X axis labels (blessed-contrib: height - yPadding + yLabelPadding = height - 8)
    const xLabelY = this.canvasSize.height - yPadding + yLabelPadding;
    const charsAvailable = (this.canvasSize.width - xPadding) / 2;
    const maxLabelsPossible = charsAvailable / (getMaxX() + 2);
    const pointsPerMaxLabel = Math.ceil(
      (seriesData as LineSeriesData[])[0].y.length / maxLabelsPossible,
    );
    let showNthLabel = this.options.showNthLabel!;
    if (showNthLabel < pointsPerMaxLabel) {
      showNthLabel = pointsPerMaxLabel;
    }

    for (let i = 0; i < labels.length; i += showNthLabel) {
      const x = Math.floor(getXPixel(i));
      if (x + labels[i].length * 2 <= this.canvasSize.width) {
        c.fillText(labels[i], x, xLabelY);
      }
    }
  }

  private addLegend(data: LineSeriesData[]): void {
    if (!this.options.showLegend) return;

    if (this.legend) {
      this.remove(this.legend);
    }

    const legendWidth = this.options.legend?.width ?? 15;

    this.legend = new Box({
      height: data.length + 2,
      top: 1,
      width: legendWidth,
      left: this.width - legendWidth - 3,
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

    for (const series of data) {
      const style = series.style || {};
      const color = toColorTag(style.line || this.options.style!.line!);
      const title = series.title || "";
      legendText +=
        "{" +
        color +
        "-fg}" +
        title.substring(0, maxChars) +
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
  getOptionsPrototype(): LineOptions {
    return {
      width: 80,
      height: 30,
      left: 15,
      top: 12,
      xPadding: 5,
      label: "Title",
      showLegend: true,
      legend: { width: 12 },
      data: [
        {
          title: "us-east",
          x: ["t1", "t2", "t3", "t4"],
          y: [5, 1, 7, 5],
          style: { line: "red" },
        },
        {
          title: "us-west",
          x: ["t1", "t2", "t3", "t4"],
          y: [2, 4, 9, 8],
          style: { line: "yellow" },
        },
        {
          title: "eu-north-with-some-long-string",
          x: ["t1", "t2", "t3", "t4"],
          y: [22, 7, 12, 1],
          style: { line: "blue" },
        },
      ],
    };
  }
}

export default Line;
