/**
 * log.ts - Log/console widget
 *
 * A scrolling log display widget for showing messages.
 *
 * Based on blessed-contrib's log.js
 */

import { List, type ListOptions } from "@unblessed/core";

/**
 * Log options
 */
export interface LogOptions extends ListOptions {
  /** Maximum number of log lines to keep (default: 30) */
  bufferLength?: number;
}

/**
 * Log - Scrolling log display widget
 *
 * Displays log messages in a scrollable list.
 * New messages are added to the bottom and auto-scrolls.
 *
 * @example
 * ```ts
 * const log = new Log({
 *   parent: screen,
 *   width: '50%',
 *   height: '50%',
 *   label: 'Server Log',
 *   tags: true,
 *   border: { type: 'line' },
 *   bufferLength: 50
 * });
 *
 * log.log('Server started');
 * log.log('{green-fg}Connected{/green-fg}');
 * log.log('{red-fg}Error: Connection failed{/red-fg}');
 * ```
 */
export class Log extends List {
  override type = "log";
  declare options: LogOptions;
  private logLines: string[] = [];

  constructor(options: LogOptions = {}) {
    options.bufferLength = options.bufferLength ?? 30;

    super(options);
    this.options = options;

    // Log is not interactive by default
    this.interactive = false;
  }

  /**
   * Add a log message
   * @param str - Message to log (can include blessed tags if tags: true)
   */
  log(str: string): void {
    this.logLines.push(str);

    // Remove oldest message if over buffer limit
    if (this.logLines.length > this.options.bufferLength!) {
      this.logLines.shift();
    }

    // Update display
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

export default Log;
