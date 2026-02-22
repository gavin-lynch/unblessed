/**
 * grid.ts - Grid layout for dashboards
 *
 * Provides a grid-based layout system for arranging widgets.
 * Based on blessed-contrib's grid.js.
 */

import { mergeRecursive } from "../lib/helpers.js";
import type { BoxOptions } from "../types/options.js";
import type { Element } from "../widgets/element.js";
import type Screen from "../widgets/screen.js";

export interface GridOptions {
  screen: Screen;
  rows: number;
  cols: number;
  dashboardMargin?: number;
  hideBorder?: boolean;
  color?: number;
}

export type WidgetConstructor<T extends BoxOptions = BoxOptions> = (
  options: T,
) => Element;

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

    this.cellWidth =
      (100 - this.options.dashboardMargin * 2) / this.options.cols;
    this.cellHeight =
      (100 - this.options.dashboardMargin * 2) / this.options.rows;
  }

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

    const options = mergeRecursive({} as T, opts ?? ({} as T));
    options.top = top + "%";
    options.left = left + "%";
    options.width = this.cellWidth * colSpan + "%";
    options.height = this.cellHeight * rowSpan + "%";

    if (!this.options.hideBorder) {
      options.border = { type: "line", fg: this.options.color ?? 6 };
    }

    const instance = obj(options);
    this.options.screen.append(instance);
    return instance;
  }
}

export default Grid;
