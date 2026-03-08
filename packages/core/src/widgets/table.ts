/**
 * table.ts - table element for blessed
 */

/**
 * Modules
 */

import { stripAnsi, truncateAnsiLines } from "../lib/text-utils.js";
import type { StyleListTable, TableData, TableOptions } from "../types";
import type { ScreenColorMode } from "../types/color-policy.js";
import type { ListOptions } from "../types/options.js";
import Box from "./box.js";
import { createCell, sameTruecolor, type Cell } from "./cell.js";
import List from "./list.js";

/**
 * Table
 */

class Table extends Box {
  override type = "table";
  declare options: TableOptions;
  declare style: StyleListTable;
  pad: number;
  rows: any[][] = []; // Initialize to empty array
  _maxes!: number[]; // Set by _calculateMaxes() method
  private _dataTableMode = false;
  private _dataTableList?: List;
  private _dataTableData?: TableData;

  constructor(options: TableOptions = {}) {
    const dataTableMode = Table._isDataTableOptions(options);

    if (dataTableMode) {
      if (Array.isArray((options as any).columnSpacing)) {
        throw new Error(
          "Error: columnSpacing cannot be an array.\n" +
            "Note: From release 2.0.0 use property columnWidth instead of columnSpacing.\n" +
            "Please refer to the README or to https://github.com/yaronn/blessed-contrib/issues/39",
        );
      }

      if (!options.columnWidth) {
        throw new Error(
          "Error: A table must get columnWidth as a property. Please refer to the README.",
        );
      }

      options.columnSpacing = options.columnSpacing ?? 10;
      const isMono = options.colorMode === ("mono" as ScreenColorMode);
      if (isMono) {
        options.selectedFg = "";
        options.selectedBg = "";
        options.fg = "";
        options.bg = "";
      } else {
        options.selectedFg = options.selectedFg || "white";
        options.selectedBg = options.selectedBg || "blue";
        options.fg = options.fg || "green";
        options.bg = options.bg || "";
      }
      options.interactive = options.interactive !== false;
    } else {
      options.shrink = true;
      options.style = options.style || {};
      options.style.border = options.style.border || {};
      options.style.header = options.style.header || {};
      options.style.cell = options.style.cell || {};
      options.align = options.align || "center";

      // Regular tables do not get custom height (this would
      // require extra padding). Maybe add in the future.
      delete options.height;
    }

    super(options);

    this.pad = options.pad != null ? options.pad : 2;
    this._dataTableMode = dataTableMode;

    if (dataTableMode) {
      this._dataTableList = new List({
        top: 2,
        width: 0,
        left: 1,
        style: {
          selected: {
            fg: options.selectedFg,
            bg: options.selectedBg,
          },
          item: {
            fg: options.fg,
            bg: options.bg,
          },
        },
        keys: options.keys,
        vi: options.vi,
        mouse: options.mouse,
        tags: options.tags ?? true,
        interactive: options.interactive,
      } as ListOptions);

      this.append(this._dataTableList);

      this.on("attach", () => {
        if (Table._isTableData(this.options.data)) {
          this.setData(this.options.data);
        }
      });

      this.on("resize", () => {
        if (this._dataTableData) {
          this.setData(this._dataTableData);
        }
        this.screen.render();
      });
    } else {
      this.setData(options.rows || options.data || []);

      this.on("attach", () => {
        this.setContent("");
        this.setData(this.rows);
      });

      this.on("resize", () => {
        this.setContent("");
        this.setData(this.rows);
        this.screen.render();
      });
    }
  }

  private static _isTableData(value: unknown): value is TableData {
    return (
      !!value &&
      typeof value === "object" &&
      Array.isArray((value as TableData).headers) &&
      Array.isArray((value as TableData).data)
    );
  }

  private static _isDataTableOptions(options: TableOptions): boolean {
    if (Array.isArray(options.columnWidth)) return true;
    return Table._isTableData(options.data);
  }

  _calculateMaxes(): number[] | undefined {
    const maxes: number[] = [];

    if (this.detached) return undefined;

    this.rows = this.rows || [];

    this.rows.forEach((row) => {
      row.forEach((cell, i) => {
        const clen = this.strWidth(cell);
        if (!maxes[i] || maxes[i] < clen) {
          maxes[i] = clen;
        }
      });
    });

    let total = maxes.reduce((total, max) => {
      return total + max;
    }, 0);
    total += maxes.length + 1;

    // XXX There might be an issue with resizing where on the first resize event
    // width appears to be less than total if it's a percentage or left/right
    // combination.
    if (this.width < total) {
      delete this.position.width;
    }

    if (this.position.width != null) {
      const missing = this.width - total;
      const w = (missing / maxes.length) | 0;
      const wr = missing % maxes.length;
      this._maxes = maxes.map((max, i) => {
        if (i === maxes.length - 1) {
          return max + w + wr;
        }
        return max + w;
      });
      return this._maxes;
    } else {
      this._maxes = maxes.map((max) => {
        return max + this.pad;
      });
      return this._maxes;
    }
  }

  /**
   * Set the rows in the table.
   * Replaces all existing rows with the provided data.
   * Each row is an array of cell strings.
   *
   * @param rows - Array of row arrays (each row is an array of cell strings)
   * @example
   * table.setData([
   *   ['Name', 'Age', 'City'],
   *   ['Alice', '30', 'NYC'],
   *   ['Bob', '25', 'SF']
   * ]);
   */
  setData(rows: any[][] | TableData): void {
    if (this._dataTableMode) {
      if (!Table._isTableData(rows)) {
        throw new Error("Data table mode requires { headers, data }.");
      }
      this._setDataTable(rows);
      return;
    }

    let text = "";
    const align = this.align;

    const rowData = Array.isArray(rows) ? rows : [];
    this.rows = rowData;

    this._calculateMaxes();

    if (!this._maxes) return;

    this.rows.forEach((row, i) => {
      const isFooter = i === this.rows.length - 1;
      row.forEach((cell, i) => {
        const width = this._maxes[i];
        let clen = this.strWidth(cell);

        if (i !== 0) {
          text += " ";
        }

        while (clen < width) {
          if (align === "center") {
            cell = " " + cell + " ";
            clen += 2;
          } else if (align === "left") {
            cell = cell + " ";
            clen += 1;
          } else if (align === "right") {
            cell = " " + cell;
            clen += 1;
          }
        }

        if (clen > width) {
          if (align === "center") {
            cell = cell.substring(1);
            clen--;
          } else if (align === "left") {
            cell = cell.slice(0, -1);
            clen--;
          } else if (align === "right") {
            cell = cell.substring(1);
            clen--;
          }
        }

        text += cell;
      });
      if (!isFooter) {
        text += "\n\n";
      }
    });

    // Temporarily remove align to let setContent handle default alignment
    const savedAlign: any = this.align;
    (this as any).align = undefined;
    this.setContent(text);
    this.align = savedAlign;
  }

  private _setDataTable(table: TableData): void {
    if (!this._dataTableList) return;
    this._dataTableData = table;

    const borderSize = this.border ? 2 : 0;
    const leftOffset =
      typeof this._dataTableList.left === "number"
        ? this._dataTableList.left
        : 0;
    const maxWidth = Math.max(0, this.width - borderSize - leftOffset);

    const dataToString = (d: (string | number)[]): string => {
      let str = "";

      d.forEach((r, i) => {
        const colsize = this.options.columnWidth?.[i] || 10;
        const rStr = String(r);
        const strip = stripAnsi(rStr);
        const ansiLen = rStr.length - strip.length;
        const isLast = i === d.length - 1;
        let spaceLength = colsize - strip.length;
        if (!isLast) {
          spaceLength += this.options.columnSpacing!;
        }

        const truncated = rStr.substring(0, colsize + ansiLen);

        if (spaceLength < 0) {
          spaceLength = 0;
        }

        const spaces = " ".repeat(spaceLength);
        str += truncated + spaces;
      });

      return str;
    };

    const formatted: string[] = [];

    table.data.forEach((d) => {
      const str = dataToString(d);
      formatted.push(maxWidth > 0 ? truncateAnsiLines(str, maxWidth) : str);
    });

    const header = dataToString(table.headers);
    const headerLine =
      maxWidth > 0 ? truncateAnsiLines(header, maxWidth) : header;
    this.setContent(`\x1b[1m${headerLine}\x1b[22m`);
    this._dataTableList.setItems(formatted);
  }

  /**
   * Set the rows in the table (alias for setData).
   * Replaces all existing rows with the provided data.
   *
   * @example
   * table.setRows([
   *   ['Header 1', 'Header 2'],
   *   ['Cell 1', 'Cell 2']
   * ]);
   */
  get setRows(): (rows: any[][]) => void {
    return this.setData;
  }

  override focus(): void {
    if (this._dataTableMode && this._dataTableList) {
      this._dataTableList.focus();
      return;
    }
    super.focus();
  }

  /**
   * Get selected row index (data-table mode).
   */
  getSelectedIndex(): number {
    return this._dataTableList?.selected ?? -1;
  }

  /**
   * Get selected row data (data-table mode).
   */
  getSelectedItem(): string | undefined {
    if (!this._dataTableList) return undefined;
    return this._dataTableList.ritems[this._dataTableList.selected];
  }

  /**
   * Select a row by index (data-table mode).
   */
  select(index: number): void {
    this._dataTableList?.select(index);
  }

  override render(): any {
    if (this._dataTableMode) {
      const borderSize = this.border ? 2 : 0;
      if (this._dataTableList) {
        const leftOffset =
          typeof this._dataTableList.left === "number"
            ? this._dataTableList.left
            : 0;
        const topOffset =
          typeof this._dataTableList.top === "number"
            ? this._dataTableList.top
            : 0;
        this._dataTableList.width = Math.max(
          0,
          this.width - borderSize - leftOffset,
        );
        this._dataTableList.height = Math.max(
          0,
          this.height - borderSize - topOffset,
        );
      }
      return super.render();
    }

    const coords = super.render();
    if (!coords) return;

    this._calculateMaxes();

    if (!this._maxes) return coords;

    const lines = this.screen.lines;
    const xi = coords.xi;
    const yi = coords.yi;
    let rx: number, ry: number, i: number;

    const dStyle = this.screen.resolveStyle(this.style, this);
    const hStyle = this.screen.resolveStyle(
      this.style.header,
      this,
      "style",
      this.style.header?.fg ?? this.style.fg,
      this.style.header?.bg ?? this.style.bg,
    );
    const cStyle = this.screen.resolveStyle(
      this.style.cell,
      this,
      "style",
      this.style.cell?.fg ?? this.style.fg,
      this.style.cell?.bg ?? this.style.bg,
    );
    const bStyle = this.screen.resolveStyle(
      this.style.border,
      this,
      "style",
      this.style.border?.fg ?? this.style.fg,
      this.style.border?.bg ?? this.style.bg,
    );

    const dattr = dStyle.attr;
    const hattr = hStyle.attr;
    const cattr = cStyle.attr;
    const battr = bStyle.attr;

    const width = coords.xl - coords.xi - this.iright;
    const height = coords.yl - coords.yi - this.ibottom;

    // Apply attributes to header cells and cells.
    for (let y = this.itop; y < height; y++) {
      if (!lines[yi + y]) break;
      for (let x = this.ileft; x < width; x++) {
        if (!lines[yi + y][xi + x]) break;
        const baseCell = lines[yi + y][xi + x] as Cell;

        // Only override default table cells (preserves tags/content SGR).
        if (
          baseCell[0] !== dattr ||
          !sameTruecolor(baseCell[2], dStyle.tcBg) ||
          !sameTruecolor(baseCell[3], dStyle.tcFg)
        ) {
          continue;
        }

        const target = y === this.itop ? hStyle : cStyle;
        if (
          baseCell[0] !== target.attr ||
          !sameTruecolor(baseCell[2], target.tcBg) ||
          !sameTruecolor(baseCell[3], target.tcFg)
        ) {
          lines[yi + y][xi + x] = createCell(
            target.attr,
            baseCell[1],
            target.tcBg,
            target.tcFg,
          );
          lines[yi + y].dirty = true;
        }
      }
    }

    if (!this.border || (this.options as any).noCellBorders) return coords;

    // Draw border with correct angles.
    const border = this.border; // Type narrowing: border is now definitely defined
    ry = 0;
    for (i = 0; i < this.rows.length + 1; i++) {
      if (!lines[yi + ry]) break;
      rx = 0;
      this._maxes.forEach((max, i) => {
        rx += max;
        if (i === 0) {
          if (!lines[yi + ry][xi + 0]) return;
          // left side
          if (ry === 0) {
            // top
            lines[yi + ry][xi + 0][0] = battr;
            lines[yi + ry][xi + 0][2] = bStyle.tcBg;
            lines[yi + ry][xi + 0][3] = bStyle.tcFg;
            // lines[yi + ry][xi + 0][1] = '\u250c'; // '┌'
          } else if (ry / 2 === this.rows.length) {
            // bottom
            lines[yi + ry][xi + 0][0] = battr;
            lines[yi + ry][xi + 0][2] = bStyle.tcBg;
            lines[yi + ry][xi + 0][3] = bStyle.tcFg;
            // lines[yi + ry][xi + 0][1] = '\u2514'; // '└'
          } else {
            // middle
            lines[yi + ry][xi + 0][0] = battr;
            lines[yi + ry][xi + 0][2] = bStyle.tcBg;
            lines[yi + ry][xi + 0][3] = bStyle.tcFg;
            lines[yi + ry][xi + 0][1] = "\u251c"; // '├'
            // XXX If we alter iwidth and ileft for no borders - nothing should be written here
            if (!border.left) {
              lines[yi + ry][xi + 0][1] = "\u2500"; // '─'
            }
          }
          lines[yi + ry].dirty = true;
        } else if (i === this._maxes.length - 1) {
          if (!lines[yi + ry][xi + rx + 1]) return;
          // right side
          if (ry === 0) {
            // top
            rx++;
            lines[yi + ry][xi + rx][0] = battr;
            lines[yi + ry][xi + rx][2] = bStyle.tcBg;
            lines[yi + ry][xi + rx][3] = bStyle.tcFg;
            // lines[yi + ry][xi + rx][1] = '\u2510'; // '┐'
          } else if (ry / 2 === this.rows.length) {
            // bottom
            rx++;
            lines[yi + ry][xi + rx][0] = battr;
            lines[yi + ry][xi + rx][2] = bStyle.tcBg;
            lines[yi + ry][xi + rx][3] = bStyle.tcFg;
            // lines[yi + ry][xi + rx][1] = '\u2518'; // '┘'
          } else {
            // middle
            rx++;
            lines[yi + ry][xi + rx][0] = battr;
            lines[yi + ry][xi + rx][2] = bStyle.tcBg;
            lines[yi + ry][xi + rx][3] = bStyle.tcFg;
            lines[yi + ry][xi + rx][1] = "\u2524"; // '┤'
            // XXX If we alter iwidth and iright for no borders - nothing should be written here
            if (!border.right) {
              lines[yi + ry][xi + rx][1] = "\u2500"; // '─'
            }
          }
          lines[yi + ry].dirty = true;
          return;
        }
        if (!lines[yi + ry][xi + rx + 1]) return;
        // center
        if (ry === 0) {
          // top
          rx++;
          lines[yi + ry][xi + rx][0] = battr;
          lines[yi + ry][xi + rx][2] = bStyle.tcBg;
          lines[yi + ry][xi + rx][3] = bStyle.tcFg;
          lines[yi + ry][xi + rx][1] = "\u252c"; // '┬'
          // XXX If we alter iheight and itop for no borders - nothing should be written here
          if (!border.top) {
            lines[yi + ry][xi + rx][1] = "\u2502"; // '│'
          }
        } else if (ry / 2 === this.rows.length) {
          // bottom
          rx++;
          lines[yi + ry][xi + rx][0] = battr;
          lines[yi + ry][xi + rx][2] = bStyle.tcBg;
          lines[yi + ry][xi + rx][3] = bStyle.tcFg;
          lines[yi + ry][xi + rx][1] = "\u2534"; // '┴'
          // XXX If we alter iheight and ibottom for no borders - nothing should be written here
          if (!border.bottom) {
            lines[yi + ry][xi + rx][1] = "\u2502"; // '│'
          }
        } else {
          // middle
          if ((this.options as any).fillCellBorders) {
            const lbg = (ry <= 2 ? hattr : cattr) & 0x1ff;
            rx++;
            lines[yi + ry][xi + rx][0] = (battr & ~0x1ff) | lbg;
            lines[yi + ry][xi + rx][2] =
              (ry <= 2 ? hStyle.tcBg : cStyle.tcBg) ?? bStyle.tcBg;
            lines[yi + ry][xi + rx][3] = bStyle.tcFg;
          } else {
            rx++;
            lines[yi + ry][xi + rx][0] = battr;
            lines[yi + ry][xi + rx][2] = bStyle.tcBg;
            lines[yi + ry][xi + rx][3] = bStyle.tcFg;
          }
          lines[yi + ry][xi + rx][1] = "\u253c"; // '┼'
          // rx++;
        }
        lines[yi + ry].dirty = true;
      });
      ry += 2;
    }

    // Draw internal borders.
    for (ry = 1; ry < this.rows.length * 2; ry++) {
      if (!lines[yi + ry]) break;
      rx = 0;
      this._maxes.slice(0, -1).forEach((max) => {
        rx += max;
        if (!lines[yi + ry][xi + rx + 1]) return;
        if (ry % 2 !== 0) {
          if ((this.options as any).fillCellBorders) {
            const lbg = (ry <= 2 ? hattr : cattr) & 0x1ff;
            rx++;
            lines[yi + ry][xi + rx][0] = (battr & ~0x1ff) | lbg;
            lines[yi + ry][xi + rx][2] =
              (ry <= 2 ? hStyle.tcBg : cStyle.tcBg) ?? bStyle.tcBg;
            lines[yi + ry][xi + rx][3] = bStyle.tcFg;
          } else {
            rx++;
            lines[yi + ry][xi + rx][0] = battr;
            lines[yi + ry][xi + rx][2] = bStyle.tcBg;
            lines[yi + ry][xi + rx][3] = bStyle.tcFg;
          }
          lines[yi + ry][xi + rx][1] = "\u2502"; // '│'
          lines[yi + ry].dirty = true;
        } else {
          rx++;
        }
      });
      rx = 1;
      this._maxes.forEach((max) => {
        while (max--) {
          if (ry % 2 === 0) {
            if (!lines[yi + ry]) break;
            if (!lines[yi + ry][xi + rx + 1]) break;
            if ((this.options as any).fillCellBorders) {
              const lbg = (ry <= 2 ? hattr : cattr) & 0x1ff;
              lines[yi + ry][xi + rx][0] = (battr & ~0x1ff) | lbg;
              lines[yi + ry][xi + rx][2] =
                (ry <= 2 ? hStyle.tcBg : cStyle.tcBg) ?? bStyle.tcBg;
              lines[yi + ry][xi + rx][3] = bStyle.tcFg;
            } else {
              lines[yi + ry][xi + rx][0] = battr;
              lines[yi + ry][xi + rx][2] = bStyle.tcBg;
              lines[yi + ry][xi + rx][3] = bStyle.tcFg;
            }
            lines[yi + ry][xi + rx][1] = "\u2500"; // '─'
            lines[yi + ry].dirty = true;
          }
          rx++;
        }
        rx++;
      });
    }

    return coords;
  }
}

/**
 * Expose
 */

export default Table;
export { Table };
