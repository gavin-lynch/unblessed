/**
 * log-list.ts - List-based log widget
 *
 * Ported from contrib log widget for compatibility.
 */

import type { ListOptions } from "../types/options.js";
import List from "./list.js";

/**
 * Log list options
 */
export interface LogListOptions extends ListOptions {
  /** Maximum number of log lines to keep (default: 30) */
  bufferLength?: number;
}

/**
 * LogList - Scrolling log display widget
 *
 * Displays log messages in a scrollable list.
 * New messages are added to the bottom and auto-scrolls.
 */
export class LogList extends List {
  override type = "log-list";
  declare options: LogListOptions;
  private logLines: string[] = [];

  constructor(options: LogListOptions = {}) {
    options.bufferLength = options.bufferLength ?? 30;

    super(options);
    this.options = options;

    // Log is not interactive by default
    this.interactive = false;
  }

  /**
   * Add a log message
   */
  log(str: string): void {
    this.logLines.push(str);

    if (this.logLines.length > this.options.bufferLength!) {
      this.logLines.shift();
    }

    this.setItems(this.logLines);
    this.scrollTo?.(this.logLines.length);
  }

  /**
   * Clear all log messages
   */
  clearLog(): void {
    this.logLines = [];
    this.setItems([]);
  }

  /**
   * Get all log lines
   */
  getLogLines(): string[] {
    return [...this.logLines];
  }
}

export default LogList;
