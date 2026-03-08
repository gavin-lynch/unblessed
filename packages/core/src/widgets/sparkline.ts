/**
 * sparkline.ts - Sparkline widget
 *
 * Displays simple Unicode sparklines.
 */

import { resolveColor } from "../lib/color-converter.js";
import { getInnerBoxSize } from "../lib/helpers.js";
import type { BoxOptions } from "../types/options.js";
import { Box } from "./box.js";

export interface SparklineData {
  titles: string[];
  data: number[][];
}

export interface SparklineOptions extends BoxOptions {
  bufferLength?: number;
  style?: BoxOptions["style"] & {
    titleFg?: string;
  };
  data?: SparklineData;
}

const SPARKLINE_CHARS = "▁▂▃▄▅▆▇█";

function generateSparkline(data: number[], maxWidth?: number): string {
  if (data.length === 0) return "";

  const values = maxWidth ? data.slice(0, maxWidth) : data;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const f = Math.floor(((max - min) << 8) / (SPARKLINE_CHARS.length - 1)) || 1;

  return values
    .map((v) => {
      const index = Math.floor(((v - min) << 8) / f);
      const clampedIndex = Math.min(
        Math.max(0, index),
        SPARKLINE_CHARS.length - 1,
      );
      return SPARKLINE_CHARS[clampedIndex];
    })
    .join("");
}

export class Sparkline extends Box {
  override type = "sparkline";
  declare options: SparklineOptions;

  constructor(options: SparklineOptions = {}) {
    options.bufferLength = options.bufferLength ?? 30;
    options.style = options.style || {};
    options.style.titleFg = options.style.titleFg || "white";
    options.tags = true;

    super(options);
    this.options = options;

    this.on("attach", () => {
      if (this.options.data) {
        this.setData(this.options.data.titles, this.options.data.data);
      }
    });
  }

  setData(titles: string[], datasets: number[][]): void {
    let res = "\r\n";
    const { innerWidthChars } = getInnerBoxSize(this);
    const maxWidth = innerWidthChars;

    for (let i = 0; i < titles.length; i++) {
      const titleFg = this.options.style?.titleFg || "white";
      const titleTag = this._resolveTitleTag(titleFg);
      res +=
        "{bold}{" +
        titleTag +
        "-fg}" +
        titles[i] +
        ":{/" +
        titleTag +
        "-fg}{/bold}\r\n";
      res += generateSparkline(datasets[i], maxWidth) + "\r\n\r\n";
    }

    this.setContent(res);
  }

  getOptionsPrototype(): SparklineOptions {
    return {
      label: "Sparkline",
      tags: true,
      border: { type: "line", fg: 6 },
      width: "50%",
      height: "50%",
      style: { fg: "blue" },
      data: {
        titles: ["Sparkline1", "Sparkline2"],
        data: [
          [10, 20, 30, 20, 50, 70, 60, 30, 35, 38],
          [40, 10, 40, 50, 20, 30, 20, 20, 19, 40],
        ],
      },
    };
  }

  private _resolveTitleTag(color: string): string {
    const mode = this.screen?.getEffectiveColorMode?.() ?? "auto";
    const resolved = resolveColor(color, { targetMode: mode });
    if (resolved.mode === "none") return "default";
    if (typeof resolved.value === "number") return String(resolved.value);
    if (Array.isArray(resolved.value)) return resolved.value.join(",");
    return color;
  }
}

export default Sparkline;
