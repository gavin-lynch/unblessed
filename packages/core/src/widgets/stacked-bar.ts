/**
 * stacked-bar.ts - Stacked bar chart widget
 */

import { AnsiTermCanvas } from "../lib/canvas/index.js";
import { resolveColor } from "../lib/color-converter.js";
import type { ColorTargetMode } from "../lib/color-types.js";
import { abbreviateNumber, getInnerBoxSize } from "../lib/helpers.js";
import type { BoxOptions } from "../types/options.js";
import { Box } from "./box.js";
import { CanvasWidget } from "./canvas.js";

export interface StackedBarData {
  barCategory: string[];
  stackedCategory: string[];
  data: number[][];
}

export interface StackedBarOptions extends BoxOptions {
  barWidth?: number;
  barSpacing?: number;
  xOffset?: number;
  maxValue?: number;
  barBgColor?: (string | number | number[])[];
  barFgColor?: string | number | number[];
  labelColor?: string | number | number[];
  showText?: boolean;
  showLegend?: boolean;
  legend?: {
    width?: number;
  };
  data?: StackedBarData;
}

export class StackedBar extends CanvasWidget {
  override type = "stacked-bar";
  declare options: StackedBarOptions;
  private static readonly BAR_TOP_PADDING = 2;
  private static readonly BORDER_PADDING = 2;
  private static readonly LABEL_PADDING = 1;
  private legend: Box | null = null;

  constructor(options: StackedBarOptions = {}) {
    super(options, AnsiTermCanvas);

    this.options = options;
    this.options.barWidth = options.barWidth ?? 6;
    this.options.barSpacing = options.barSpacing ?? 9;

    if (this.options.barSpacing - this.options.barWidth < 1) {
      this.options.barSpacing = this.options.barWidth + 1;
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
    const { innerWidthChars, innerHeightChars } = getInnerBoxSize(this);
    this.canvasSize = {
      width: innerWidthChars,
      height: innerHeightChars,
    };
  }

  private getSummedBars(bars: number[][]): number[] {
    return bars.map((stackedValues) =>
      stackedValues.reduce((a, b) => a + b, 0),
    );
  }

  override setData(data: unknown): void {
    super.setData(data);
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
      x += this.options.barSpacing! + 1;
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
    const bufferFromTop = StackedBar.BAR_TOP_PADDING;
    const borderPadding = this.border ? StackedBar.BORDER_PADDING : 0;
    const labelPadding = this.options.showText ? StackedBar.LABEL_PADDING : 0;
    const bufferFromBottom = borderPadding + labelPadding;

    const c = this.ctx!;

    c.strokeStyle = "normal" as any;
    c.fillStyle = this.resolveCompatColor(
      this.options.labelColor ?? "white",
    ) as any;
    if (this.options.showText) {
      c.fillText(category, x + 1, this.canvasSize.height - bufferFromBottom);
    }

    if (curBarSummedValue < 0) return;

    const maxBarHeight =
      this.canvasSize.height - bufferFromTop - bufferFromBottom;
    const currentBarHeight = Math.round(
      maxBarHeight * (curBarSummedValue / maxBarValue),
    );

    const barBottom = this.canvasSize.height - bufferFromBottom - 1;
    let y = barBottom;
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
    const barWidth = this.options.barWidth! + 1;

    const currStackHeight =
      currentBarHeight <= 0
        ? 0
        : Math.min(
            availableBarHeight,
            Math.round(currentBarHeight * (data / curBarSummedValue)),
          );

    const barColor = this.resolveCompatColor(bg);
    c.strokeStyle = barColor as any;

    if (currStackHeight > 0) {
      const calcY = y - currStackHeight + 1;
      const calcHeight = currStackHeight;

      c.fillRect(x, calcY, barWidth, calcHeight);

      if (this.options.showText) {
        c._canvas.fontBg = barColor as any;
        c.fillStyle = this.resolveCompatColor(
          this.options.barFgColor ?? "white",
        ) as any;
        const str = abbreviateNumber(data);
        const textY = calcY + Math.ceil((calcHeight - 1) / 2);
        c.fillText(
          str,
          Math.floor(x + barWidth / 2 + str.length / 2) - 1,
          textY,
        );
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
        fg: 0,
      },
      style: {
        fg: "blue",
      },
    });

    let legendText = "";
    const maxChars = legendWidth - 2;

    for (let i = 0; i < bars.stackedCategory.length; i++) {
      const color = this.getLegendColorTag(
        this.options.barBgColor?.[i] ?? "blue",
      );
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

  protected override getCanvasTargetMode(): ColorTargetMode {
    return super.getCanvasTargetMode();
  }
}

export default StackedBar;
