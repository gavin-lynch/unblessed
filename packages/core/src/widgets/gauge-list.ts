/**
 * gauge-list.ts - Multiple gauges in a list
 */

import { AnsiTermCanvas } from "../lib/canvas/index.js";
import { resolveColor } from "../lib/color-converter.js";
import { getInnerBoxSize } from "../lib/helpers.js";
import type { BoxOptions } from "../types/options.js";
import { CanvasWidget } from "./canvas.js";

export interface GaugeListStackItem {
  percent: number;
  stroke?: string | number | number[];
}

export interface GaugeListItem {
  stack: (number | GaugeListStackItem)[];
  showLabel?: boolean;
}

export interface GaugeListOptions extends BoxOptions {
  stroke?: string | number | number[];
  fill?: string | number | number[];
  showLabel?: boolean;
  gaugeSpacing?: number;
  gaugeHeight?: number;
  gauges?: GaugeListItem[];
}

export class GaugeList extends CanvasWidget {
  override type = "gauge";
  declare options: GaugeListOptions;
  gauges: GaugeListItem[] = [];
  private static readonly INDEX_PADDING = 3;
  private static readonly BAR_RIGHT_PADDING = 5;
  private static readonly BAR_HEIGHT_OFFSET = 1;
  private static readonly LABEL_Y = 3;

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
    const { innerWidthChars, innerHeightChars } = getInnerBoxSize(this);
    this.canvasSize = {
      width: innerWidthChars,
      height: innerHeightChars,
    };
  }

  override setData(data: unknown): void {
    super.setData(data);
  }

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

  private setSingleGauge(gauge: GaugeListItem, offset: number): void {
    const colors = ["green", "magenta", "cyan", "red", "blue"];
    const stack = gauge.stack;
    const c = this.ctx!;

    let leftStart = GaugeList.INDEX_PADDING;
    const gaugeHeight = this.options.gaugeHeight!;
    const gaugeSpacing = this.options.gaugeSpacing!;
    const yOffset = offset * (gaugeHeight + gaugeSpacing);

    c.strokeStyle = "normal";
    c.fillStyle = this.resolveCompatColor("white") as any;
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

      c.strokeStyle = this.resolveCompatColor(strokeColor) as any;
      c.fillStyle = this.resolveCompatColor(this.options.fill!) as any;

      const width =
        (percent / 100) * (this.canvasSize.width - GaugeList.BAR_RIGHT_PADDING);

      c.fillRect(
        leftStart,
        yOffset,
        width,
        gaugeHeight - GaugeList.BAR_HEIGHT_OFFSET,
      );

      const textLeft = width / 2 - 1;
      const textX = leftStart + textLeft;

      if (leftStart + width < textX) {
        c.strokeStyle = "normal";
      }

      if (gauge.showLabel) {
        c.fillText(percent + "%", textX, GaugeList.LABEL_Y);
      }

      leftStart += width;
    }
  }

  getOptionsPrototype(): GaugeListOptions {
    return { gauges: [{ stack: [50] }] };
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

export default GaugeList;
