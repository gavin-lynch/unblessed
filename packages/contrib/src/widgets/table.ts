/**
 * table.ts - Table widget
 *
 * Displays tabular data with headers and scrollable rows.
 *
 * Based on blessed-contrib's table.js
 */

import { Box, List, type BoxOptions, type ListOptions } from "@unblessed/core";

/**
 * Table data structure
 */
export interface TableData {
  /** Column headers */
  headers: string[];
  /** Data rows */
  data: (string | number)[][];
}

/**
 * Table options
 */
export interface TableOptions extends BoxOptions {
  /** Width of each column in characters (required) */
  columnWidth: number[];
  /** Spacing between columns (default: 10) */
  columnSpacing?: number;
  /** Selected row foreground color (default: 'white') */
  selectedFg?: string;
  /** Selected row background color (default: 'blue') */
  selectedBg?: string;
  /** Enable keyboard navigation */
  keys?: boolean;
  /** Enable vi keys */
  vi?: boolean;
  /** Enable mouse support */
  mouse?: boolean;
  /** Enable interactive selection (default: true) */
  interactive?: boolean;
  /** Initial table data */
  data?: TableData;
}

/**
 * Strip ANSI escape codes from a string
 */
function stripAnsi(str: string): string {
  const ansiRegex = new RegExp("\\x1B\\[[0-9;]*[A-Za-z]", "g");
  return str.replace(ansiRegex, "");
}

/**
 * Table - Tabular data display widget
 *
 * Displays data in a table format with headers and scrollable rows.
 * Supports keyboard navigation and row selection.
 *
 * @example
 * ```ts
 * const table = new Table({
 *   parent: screen,
 *   width: '50%',
 *   height: '50%',
 *   label: 'Active Processes',
 *   columnWidth: [20, 10, 10],
 *   columnSpacing: 2,
 *   keys: true,
 *   data: {
 *     headers: ['Name', 'PID', 'CPU'],
 *     data: [
 *       ['node', '1234', '12%'],
 *       ['nginx', '5678', '5%'],
 *       ['postgres', '9012', '8%']
 *     ]
 *   }
 * });
 * ```
 */
export class Table extends Box {
  override type = "table";
  declare options: TableOptions;
  rows: List;

  constructor(options: TableOptions) {
    // Validate options
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

    // Set defaults
    options.columnSpacing = options.columnSpacing ?? 10;
    options.selectedFg = options.selectedFg || "white";
    options.selectedBg = options.selectedBg || "blue";
    options.fg = options.fg || "green";
    options.bg = options.bg || "";
    options.interactive = options.interactive !== false;

    super(options);
    this.options = options;

    // Create internal list for rows
    this.rows = new List({
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
      tags: true,
      interactive: options.interactive,
    } as ListOptions);

    this.append(this.rows);

    this.on("attach", () => {
      if (this.options.data) {
        this.setData(this.options.data);
      }
    });
  }

  override focus(): void {
    this.rows.focus();
  }

  override render(): any {
    if (this.screen?.focused === this.rows) {
      this.rows.focus();
    }

    this.rows.width = this.width - (this.border ? 2 : 0);
    this.rows.height = this.height - 4;

    return super.render();
  }

  /**
   * Set table data
   */
  setData(table: TableData): void {
    const dataToString = (d: (string | number)[]): string => {
      let str = "";

      d.forEach((r, i) => {
        const colsize = this.options.columnWidth[i] || 10;
        const rStr = String(r);
        const strip = stripAnsi(rStr);
        const ansiLen = rStr.length - strip.length;
        let spaceLength = colsize - strip.length + this.options.columnSpacing!;

        // Truncate to column size (accounting for ANSI codes)
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
      formatted.push(str);
    });

    const header = dataToString(table.headers);
    this.setContent(`\x1b[1m${header}\x1b[22m`);
    this.rows.setItems(formatted);
  }

  /**
   * Get selected row index
   */
  getSelectedIndex(): number {
    return this.rows.selected;
  }

  /**
   * Get selected row data
   */
  getSelectedItem(): string | undefined {
    return this.rows.ritems[this.rows.selected];
  }

  /**
   * Select a row by index
   */
  select(index: number): void {
    this.rows.select(index);
  }

  /**
   * Get options prototype (for blessed-contrib compatibility)
   */
  getOptionsPrototype(): TableOptions {
    return {
      keys: true,
      fg: "white",
      interactive: false,
      label: "Active Processes",
      width: "30%",
      height: "30%",
      border: { type: "line", fg: 6 },
      columnSpacing: 10,
      columnWidth: [16, 12],
      data: {
        headers: ["col1", "col2"],
        data: [
          ["a", "b"],
          ["5", "u"],
          ["x", "16.1"],
        ],
      },
    };
  }
}

export default Table;
