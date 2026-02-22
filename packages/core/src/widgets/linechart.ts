/**
 * linechart.ts - Line chart widget
 */

import { DrawilleCanvas } from "../lib/canvas/index.js";
import { resolveColor } from "../lib/color-converter.js";
import { abbreviateNumber } from "../lib/helpers.js";
import { truncateAnsiLines } from "../lib/text-utils.js";
import type { BoxOptions } from "../types/options.js";
import { Box } from "./box.js";
import { CanvasWidget } from "./canvas.js";

export interface LineSeriesData {
  title?: string;
  x: string[];
  y: number[];
  style?: {
    line?: string | number | number[];
  };
}

export interface LineChartOptions extends BoxOptions {
  showNthLabel?: number;
  style?: BoxOptions["style"] & {
    line?: string;
    text?: string;
    baseline?: string;
  };
  xLabelPadding?: number;
  xPadding?: number;
  numYLabels?: number;
  legend?: {
    width?: number;
  };
  showLegend?: boolean;
  wholeNumbersOnly?: boolean;
  minY?: number;
  maxY?: number;
  abbreviate?: boolean;
  chartPaddingX?: number;
  chartPaddingY?: number;
  data?: LineSeriesData | LineSeriesData[];
}

export class LineChart extends CanvasWidget {
  override type = "linechart";
  declare options: LineChartOptions;
  private legend: Box | null = null;

  constructor(options: LineChartOptions = {}) {
    options.showNthLabel = options.showNthLabel ?? 1;
    options.style = options.style || {};
    options.style.line = options.style.line || "yellow";
    options.style.text = options.style.text || "green";
    options.style.baseline = options.style.baseline || "black";
    options.xLabelPadding = options.xLabelPadding ?? 5;
    options.xPadding = options.xPadding ?? 10;
    options.numYLabels = options.numYLabels ?? 5;
    options.chartPaddingX = options.chartPaddingX ?? 12;
    options.chartPaddingY = options.chartPaddingY ?? 8;
    options.legend = options.legend || {};
    options.wholeNumbersOnly = options.wholeNumbersOnly ?? false;
    options.minY = options.minY ?? 0;

    super(options, DrawilleCanvas);
    this.options = options;
  }

  override calcSize(): void {
    const outerWidthChars = Math.max(1, Math.floor(this.width));
    const outerHeightChars = Math.max(1, Math.floor(this.height));
    const chartPaddingX = Math.max(0, this.options.chartPaddingX ?? 0);
    const chartPaddingY = Math.max(0, this.options.chartPaddingY ?? 0);
    this.canvasSize = {
      width: Math.max(2, outerWidthChars * 2 - chartPaddingX),
      height: Math.max(4, outerHeightChars * 4 - chartPaddingY),
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
    let seriesData = data as LineSeriesData | LineSeriesData[];

    if (!this.ctx) {
      throw new Error(
        "Canvas context does not exist. setData() must be called after the chart has been added to the screen via screen.append()",
      );
    }

    if (!Array.isArray(seriesData)) {
      seriesData = [seriesData];
    }

    const xLabelPadding = this.options.xLabelPadding!;
    let xPadding = this.options.xPadding!;
    const yPadding = 11;
    const yLabelPadding = 3;
    const c = this.ctx;
    const labels = seriesData[0].x;

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

    const getMaxX = (): number => {
      let maxLength = 0;
      for (const label of labels) {
        if (label !== undefined && label.length > maxLength) {
          maxLength = label.length;
        }
      }
      return maxLength;
    };

    const chartLeftPx = xPadding;

    const getXPixel = (val: number): number => {
      const n = labels.length;
      if (n <= 1) return chartLeftPx;
      return ((this.canvasSize.width - xPadding) / n) * val + xPadding + 2;
    };

    const getYPixel = (val: number, minY: number): number => {
      const plotHeight = this.canvasSize.height - yPadding;
      let res =
        this.canvasSize.height -
        yPadding -
        (plotHeight / (getMaxY() - minY)) * (val - minY);
      res -= 2;
      return res;
    };

    const drawLine = (
      values: number[],
      style: { line?: string | number | number[] } | undefined,
      minY: number,
    ): void => {
      const lineStyle = style || {};
      const lineColor = lineStyle.line || this.options.style!.line!;
      c.strokeStyle = this.resolveCompatColor(lineColor) as any;
      c.lineWidth = 1;

      c.beginPath();
      c.moveTo(getXPixel(0), getYPixel(values[0], minY));
      for (let k = 1; k < values.length; k++) {
        c.lineTo(getXPixel(k), getYPixel(values[k], minY));
      }

      c.stroke();
      c.lineWidth = 1;
    };

    this.addLegend(seriesData as LineSeriesData[]);

    c.fillStyle = this.options.style!.text!;
    c.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);

    let yLabelIncrement =
      (getMaxY() - this.options.minY!) / this.options.numYLabels!;
    if (this.options.wholeNumbersOnly) {
      yLabelIncrement = Math.floor(yLabelIncrement);
    }
    if (yLabelIncrement === 0) {
      yLabelIncrement = 1;
    }

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

    for (const series of seriesData as LineSeriesData[]) {
      drawLine(series.y, series.style, this.options.minY!);
    }

    const baselineY = this.canvasSize.height - yPadding;
    c.strokeStyle = this.options.style!.baseline!;
    c.beginPath();
    c.lineTo(xPadding, 0);
    c.lineTo(xPadding, baselineY);
    c.lineTo(this.canvasSize.width, baselineY);
    c.stroke();
    c.fillStyle = this.options.style!.text!;

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
        fg: 0,
      },
      style: {
        fg: "blue",
      },
    });

    let legendText = "";
    const maxChars = legendWidth - 2;

    for (const series of data) {
      const style = series.style || {};
      const color = this.getLegendColorTag(
        style.line || this.options.style!.line!,
      );
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

  private getLegendColorTag(color: string | number | number[]): string {
    const resolved = resolveColor(color, {
      targetMode: this.getCanvasTargetMode(),
    });
    if (resolved.mode === "none") return "default";
    if (typeof resolved.value === "number") return String(resolved.value);
    if (Array.isArray(resolved.value)) return resolved.value.join(",");
    return "default";
  }

  private resolveCompatColor(
    color: string | number | number[],
  ): string | number | number[] {
    const resolved = resolveColor(color, {
      targetMode: this.getCanvasTargetMode(),
    });

    if (resolved.mode === "none") return "normal";
    if (typeof resolved.value === "number") return resolved.value;
    if (Array.isArray(resolved.value)) return resolved.value;
    return color;
  }

  getOptionsPrototype(): LineChartOptions {
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

export default LineChart;
