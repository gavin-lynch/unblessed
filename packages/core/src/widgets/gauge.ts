/**
 * gauge.ts - Gauge/progress bar widget
 */

import { AnsiTermCanvas } from "../lib/canvas/index.js";
import { resolveColor } from "../lib/color-converter.js";
import { getInnerBoxSize } from "../lib/helpers.js";
import type { BoxOptions } from "../types/options.js";
import { CanvasWidget } from "./canvas.js";

export interface GaugeStackItem {
  percent: number;
  stroke?: string | number | number[];
}

export interface GaugeOptions extends BoxOptions {
  stroke?: string | number | number[];
  fill?: string | number | number[];
  showLabel?: boolean;
  percent?: number;
  stack?: (number | GaugeStackItem)[];
  data?: number | (number | GaugeStackItem)[];
}

export class Gauge extends CanvasWidget {
  override type = "gauge";
  declare options: GaugeOptions;
  private _percent: number = 0;
  private _stack: (number | GaugeStackItem)[] | null = null;
  private static readonly BAR_MAX_HEIGHT = 3;
  private static readonly BAR_RIGHT_PADDING = 1;

  constructor(options: GaugeOptions = {}) {
    options.shrink = options.shrink ?? false;
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
    const { innerWidthChars, innerHeightChars } = getInnerBoxSize(this);
    this.canvasSize = {
      width: innerWidthChars,
      height: innerHeightChars,
    };
  }

  override setData(data: unknown): void {
    super.setData(data);
    if (Array.isArray(data) && data.length > 0) {
      this.setStack(data as (number | GaugeStackItem)[]);
    } else if (typeof data === "number") {
      this.setPercent(data);
    }
  }

  setPercent(percent: number): void {
    if (!this.ctx) {
      throw new Error(
        "Canvas context does not exist. setData() must be called after the gauge has been added to the screen via screen.append()",
      );
    }

    const c = this.ctx;

    c.strokeStyle = this.resolveCompatColor(this.options.stroke!) as any;
    c.fillStyle = this.resolveCompatColor(this.options.fill!) as any;

    c.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);

    if (percent < 1.001) {
      percent = percent * 100;
    }

    const barStartX = 1;
    const width =
      (percent / 100) *
      (this.canvasSize.width - barStartX - Gauge.BAR_RIGHT_PADDING);
    const { barTop, barHeight, labelY } = this._getBarGeometry();
    const barWidth = Math.max(0, Math.floor(width));
    c.fillRect(barStartX, barTop, barWidth, barHeight);

    if (this.options.showLabel) {
      this._renderLabel(`${Math.round(percent)}%`, barStartX, barWidth, labelY);
    }
  }

  setStack(stack: (number | GaugeStackItem)[]): void {
    const defaultColors = ["green", "magenta", "cyan", "red", "blue"];

    if (!this.ctx) {
      throw new Error(
        "Canvas context does not exist. setData() must be called after the gauge has been added to the screen via screen.append()",
      );
    }

    const c = this.ctx;
    const barStartX = 1;
    let leftStart = barStartX;
    const totalWidth = Math.max(
      0,
      this.canvasSize.width - barStartX - Gauge.BAR_RIGHT_PADDING,
    );
    let usedWidth = 0;

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

      c.strokeStyle = this.resolveCompatColor(stroke) as any;
      c.fillStyle = this.resolveCompatColor(this.options.fill!) as any;

      if (percent < 1.001) {
        percent = percent * 100;
      }

      const width = (percent / 100) * totalWidth;
      const { barTop, barHeight, labelY } = this._getBarGeometry();
      const isLast = i === stack.length - 1;
      const barWidth = isLast
        ? Math.max(0, totalWidth - usedWidth)
        : Math.max(0, Math.floor(width));
      const barStartX = Math.floor(leftStart);
      c.fillRect(barStartX, barTop, barWidth, barHeight);

      if (this.options.showLabel) {
        this._renderLabel(
          `${Math.round(percent)}%`,
          barStartX,
          barWidth,
          labelY,
        );
      }

      usedWidth += barWidth;
      leftStart = barStartX + usedWidth;
    }
  }

  getOptionsPrototype(): GaugeOptions {
    return { percent: 10 };
  }

  private _getBarGeometry(): {
    barTop: number;
    barHeight: number;
    labelY: number;
  } {
    const barHeight = Math.max(
      1,
      Math.min(Gauge.BAR_MAX_HEIGHT, this.canvasSize.height),
    );
    const barTop = 0;
    const labelInside = Math.min(
      this.canvasSize.height - 1,
      barTop + Math.floor(barHeight / 2),
    );
    const labelY = labelInside;

    return { barTop, barHeight, labelY };
  }

  private _renderLabel(
    label: string,
    barStartX: number,
    barWidth: number,
    labelY: number,
  ): void {
    if (!this.ctx || barWidth <= 0) return;
    const c = this.ctx;
    const maxLabelWidth = Math.max(0, barWidth);
    if (maxLabelWidth === 0) return;

    let text = label;
    if (text.length > maxLabelWidth) {
      text = text.slice(0, maxLabelWidth);
    }
    if (!text) return;

    const barEndX = barStartX + barWidth - 1;
    const centeredX = barStartX + Math.floor((barWidth - text.length) / 2);
    const maxStartX = barEndX - text.length + 1;
    const textX = Math.max(barStartX, Math.min(centeredX, maxStartX));

    c.fillText(text, textX, labelY);
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
}

export default Gauge;
