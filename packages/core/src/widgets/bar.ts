/**
 * bar.ts - Bar chart widget
 */

import { AnsiTermCanvas } from "../lib/canvas/index.js";
import { resolveColor } from "../lib/color-converter.js";
import type { ColorTargetMode } from "../lib/color-types.js";
import { getInnerBoxSize } from "../lib/helpers.js";
import type { BoxOptions } from "../types/options.js";
import { CanvasWidget } from "./canvas.js";

export interface BarData {
  titles: string[];
  data: number[];
}

export interface BarOptions extends BoxOptions {
  barWidth?: number;
  barSpacing?: number;
  xOffset?: number;
  maxHeight?: number;
  barBgColor?: string | number | number[];
  barFgColor?: string | number | number[];
  labelColor?: string | number | number[];
  showText?: boolean;
  data?: BarData;
}

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

      const barColor = this.resolveCompatColor(
        this.options.barBgColor ?? "blue",
      ) as any;
      const barWidth = this.options.barWidth! + 1;

      if (barData.data[i] > 0) {
        c.strokeStyle = barColor;
        c.fillRect(x, barY - h + 1, barWidth, h);
      } else {
        c.strokeStyle = "normal";
      }

      if (this.options.showText) {
        c._canvas.fontBg = barData.data[i] > 0 ? barColor : "normal";
        c.fillStyle = this.resolveCompatColor(
          this.options.barFgColor ?? "white",
        ) as any;
        c.fillText(barData.data[i].toString(), x + 1, valueRow);
        c._canvas.fontBg = "normal";
      }

      c.strokeStyle = "normal";
      c.fillStyle = this.resolveCompatColor(
        this.options.labelColor ?? "white",
      ) as any;
      if (this.options.showText) {
        c.fillText(barData.titles[i], x + 1, labelRow);
      }

      x += this.options.barSpacing! + 1;
    }
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
