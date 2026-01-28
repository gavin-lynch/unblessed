/**
 * grid.ts - Grid layout for dashboards
 *
 * Provides a grid-based layout system for arranging widgets.
 *
 * Based on blessed-contrib's grid.js
 */

import type { BoxOptions, Element, Screen } from "@unblessed/core";
import { mergeRecursive } from "../utils.js";

/**
 * Grid options
 */
export interface GridOptions {
  /** Screen to attach widgets to */
  screen: Screen;
  /** Number of rows in the grid */
  rows: number;
  /** Number of columns in the grid */
  cols: number;
  /** Dashboard margin in percent (default: 0) */
  dashboardMargin?: number;
  /** Hide borders on widgets (default: false) */
  hideBorder?: boolean;
  /** Default border color (0=black, 1=red, 2=green, 3=yellow, 4=blue, 5=magenta, 6=cyan, 7=white) */
  color?: number;
}

/**
 * Widget constructor type
 */
export type WidgetConstructor<T extends BoxOptions = BoxOptions> = (
  options: T,
) => Element;

/**
 * Grid - Grid-based layout for dashboards
 *
 * Arranges widgets in a grid layout with automatic positioning and sizing.
 * Each cell in the grid is sized based on the total rows and columns.
 *
 * @example
 * ```ts
 * const grid = new Grid({
 *   screen: screen,
 *   rows: 12,
 *   cols: 12
 * });
 *
 * // Add a line chart spanning 6 rows and 6 cols, starting at row 0, col 0
 * const line = grid.set(0, 0, 6, 6, Line, {
 *   label: 'Network Traffic',
 *   data: [...]
 * });
 *
 * // Add a bar chart at row 0, col 6, spanning 6x6
 * const bar = grid.set(0, 6, 6, 6, Bar, {
 *   label: 'Server Load',
 *   data: {...}
 * });
 *
 * // Add a gauge at row 6, col 0, spanning 6x12
 * const gauge = grid.set(6, 0, 6, 12, Gauge, {
 *   label: 'Memory',
 *   percent: 75
 * });
 * ```
 */
export class Grid {
  private options: GridOptions;
  private cellWidth: number;
  private cellHeight: number;

  constructor(options: GridOptions) {
    if (!options.screen) {
      throw new Error(
        "Error: A screen property must be specified in the grid options.\n" +
          "Note: Release 2.0.0 has breaking changes. Please refer to the README or to https://github.com/yaronn/blessed-contrib/issues/39",
      );
    }

    this.options = options;
    this.options.dashboardMargin = options.dashboardMargin ?? 0;

    // Calculate cell dimensions as percentages
    this.cellWidth =
      (100 - this.options.dashboardMargin * 2) / this.options.cols;
    this.cellHeight =
      (100 - this.options.dashboardMargin * 2) / this.options.rows;
  }

  /**
   * Set a widget at a specific grid position
   *
   * @param row - Starting row (0-based)
   * @param col - Starting column (0-based)
   * @param rowSpan - Number of rows to span
   * @param colSpan - Number of columns to span
   * @param obj - Widget constructor function
   * @param opts - Widget options
   * @returns The created widget instance
   *
   * @example
   * ```ts
   * const widget = grid.set(0, 0, 4, 6, Line, { label: 'Chart' });
   * ```
   */
  set<T extends BoxOptions>(
    row: number,
    col: number,
    rowSpan: number,
    colSpan: number,
    obj: WidgetConstructor<T>,
    opts?: T,
  ): Element {
    if (obj instanceof Grid) {
      throw new Error(
        "Error: A Grid is not allowed to be nested inside another grid.\n" +
          "Note: Release 2.0.0 has breaking changes. Please refer to the README or to https://github.com/yaronn/blessed-contrib/issues/39",
      );
    }

    const top = row * this.cellHeight + (this.options.dashboardMargin ?? 0);
    const left = col * this.cellWidth + (this.options.dashboardMargin ?? 0);

    // Merge options
    const options = mergeRecursive({} as T, opts ?? ({} as T));
    options.top = top + "%";
    options.left = left + "%";
    options.width = this.cellWidth * colSpan + "%";
    options.height = this.cellHeight * rowSpan + "%";

    // Add border unless hidden
    if (!this.options.hideBorder) {
      options.border = { type: "line", fg: this.options.color ?? 6 }; // 6 = cyan
    }

    // Create widget instance
    const instance = obj(options);

    // Append to screen
    this.options.screen.append(instance);

    return instance;
  }
}

export default Grid;
