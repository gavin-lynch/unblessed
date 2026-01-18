/**
 * sparkline.ts - Sparkline widget
 *
 * Displays simple ASCII sparklines.
 *
 * Based on blessed-contrib's sparkline.js
 */

import { Box, type BoxOptions } from "@unblessed/core";

/**
 * Sparkline data
 */
export interface SparklineData {
  /** Series titles */
  titles: string[];
  /** Data arrays for each series */
  data: number[][];
}

/**
 * Sparkline options
 */
export interface SparklineOptions extends BoxOptions {
  /** Maximum buffer length (default: 30) */
  bufferLength?: number;
  /** Style options */
  style?: BoxOptions["style"] & {
    /** Title foreground color (default: 'white') */
    titleFg?: string;
  };
  /** Initial data */
  data?: SparklineData;
}

// Sparkline characters (using Unicode blocks)
const SPARKLINE_CHARS = " ▁▂▃▄▅▆▇█";

/**
 * Generate a sparkline string from data
 */
function generateSparkline(data: number[], maxWidth?: number): string {
  if (data.length === 0) return "";

  const values = maxWidth ? data.slice(0, maxWidth) : data;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .map((v) => {
      const normalized = (v - min) / range;
      const index = Math.min(
        Math.floor(normalized * (SPARKLINE_CHARS.length - 1)),
        SPARKLINE_CHARS.length - 1,
      );
      return SPARKLINE_CHARS[index];
    })
    .join("");
}

/**
 * Sparkline - ASCII sparkline widget
 *
 * Displays one or more sparklines with titles.
 * Uses Unicode block characters for simple line visualization.
 *
 * @example
 * ```ts
 * const spark = new Sparkline({
 *   parent: screen,
 *   width: '50%',
 *   height: '50%',
 *   label: 'Network Traffic',
 *   tags: true,
 *   border: { type: 'line', fg: 'cyan' },
 *   data: {
 *     titles: ['Inbound', 'Outbound'],
 *     data: [
 *       [10, 20, 30, 25, 35, 40, 30, 45],
 *       [5, 15, 25, 20, 30, 35, 25, 40]
 *     ]
 *   }
 * });
 * ```
 */
export class Sparkline extends Box {
  override type = "sparkline";
  declare options: SparklineOptions;

  constructor(options: SparklineOptions = {}) {
    options.bufferLength = options.bufferLength ?? 30;
    options.style = options.style || {};
    options.style.titleFg = options.style.titleFg || "white";
    options.tags = true; // Enable blessed tags for colors

    super(options);
    this.options = options;

    this.on("attach", () => {
      if (this.options.data) {
        this.setData(this.options.data.titles, this.options.data.data);
      }
    });
  }

  /**
   * Set sparkline data
   * @param titles - Array of series titles
   * @param datasets - Array of data arrays
   */
  setData(titles: string[], datasets: number[][]): void {
    let res = "\r\n";
    const maxWidth = this.width - 2;

    for (let i = 0; i < titles.length; i++) {
      const titleFg = this.options.style?.titleFg || "white";
      res +=
        "{bold}{" +
        titleFg +
        "-fg}" +
        titles[i] +
        ":{/" +
        titleFg +
        "-fg}{/bold}\r\n";
      res += generateSparkline(datasets[i], maxWidth) + "\r\n\r\n";
    }

    this.setContent(res);
  }

  /**
   * Get options prototype (for blessed-contrib compatibility)
   */
  getOptionsPrototype(): SparklineOptions {
    return {
      label: "Sparkline",
      tags: true,
      border: { type: "line", fg: 6 }, // cyan
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
}

export default Sparkline;
