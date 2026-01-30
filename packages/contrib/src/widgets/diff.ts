/**
 * diff.ts - Diff rendering widget
 *
 * Displays unified diffs with syntax highlighting and color coding.
 * Requires peer dependency: diff (for computing diffs)
 *
 * Features:
 * - File path headers with line numbers
 * - Color-coded additions (green) and deletions (red)
 * - Line numbers
 * - Optional syntax highlighting for code diffs
 * - Supports both unified diff strings and computed diffs
 */

import { Box, type BoxOptions, getRuntime } from "@unblessed/core";
import chalk from "chalk";
import { highlight } from "cli-highlight";
import { createTwoFilesPatch } from "diff";
import x256 from "x256";

// Force chalk colors
if (!process.env.NO_COLOR) {
  if (process.env.FORCE_COLOR || process.stdout.isTTY) {
     
    // @ts-ignore
    if (chalk.level === 0) {
      chalk.level = 1;
    }
  }
}

/**
 * Diff rendering options
 */
export interface DiffOptions extends BoxOptions {
  /** Old file content (for computing diff) */
  oldContent?: string;
  /** New file content (for computing diff) */
  newContent?: string;
  /** Old file name (for header) */
  oldFileName?: string;
  /** New file name (for header) */
  newFileName?: string;
  /** Pre-formatted unified diff string (alternative to oldContent/newContent) */
  diffString?: string;
  /** Number of context lines around changes (default: 3) */
  contextLines?: number;
  /** Color for additions (default: dark desaturated green)
   * Can be: string name ("green"), RGB array [r, g, b], 256-color code number, or chalk function
   */
  additionColor?: string | number | number[] | ((text: string) => string);
  /** Color for deletions (default: dark desaturated red)
   * Can be: string name ("red"), RGB array [r, g, b], 256-color code number, or chalk function
   */
  deletionColor?: string | number | number[] | ((text: string) => string);
  /** Color for context lines (default: default terminal color) */
  contextColor?: string | ((text: string) => string);
  /** Color for file headers (default: cyan) */
  headerColor?: string | ((text: string) => string);
  /** Show line numbers (default: true) */
  showLineNumbers?: boolean;
  /** Enable syntax highlighting for code diffs */
  syntaxHighlight?: boolean;
  /** Language for syntax highlighting (auto-detected from file extension if not provided) */
  language?: string;
  /** Syntax highlighting theme (same as Markdown widget's highlightTheme) */
  highlightTheme?: Record<
    string,
    string | string[] | ((text: string) => string)
  >;
}

/**
 * Diff widget - renders unified diffs with color coding
 */
export class Diff extends Box {
  override type = "diff";
  declare options: DiffOptions;
  private diffContent: string = "";

  constructor(options: DiffOptions = {}) {
    const mergedOptions: DiffOptions = {
      contextLines: 3,
      showLineNumbers: true,
      syntaxHighlight: false,
      ...options,
    };
    super(mergedOptions);
    this.options = mergedOptions;

    // Compute or set diff content
    if (this.options.diffString) {
      this.diffContent = this.options.diffString;
    } else if (this.options.oldContent && this.options.newContent) {
      this._computeDiff();
    }

    // Render diff content when widget is ready
    if (this.diffContent) {
      // Wait for render event which fires after layout
      this.once("render", () => {
        if (this.diffContent && !this.content) {
          this._renderDiff();
        }
      });

      // Also try after a short delay in case render event already fired
      setTimeout(() => {
        if (this.diffContent && !this.content) {
          this._renderDiff();
        }
      }, 100);
    }
  }

  /**
   * Compute diff from old/new content
   */
  private _computeDiff(): void {
    const oldContent = this.options.oldContent || "";
    const newContent = this.options.newContent || "";
    const oldFileName = this.options.oldFileName || "old";
    const newFileName = this.options.newFileName || "new";
    const contextLines = this.options.contextLines || 3;

    // Create unified diff patch
    this.diffContent = createTwoFilesPatch(
      oldFileName,
      newFileName,
      oldContent,
      newContent,
      undefined, // oldHeader
      undefined, // newHeader
      {
        context: contextLines,
      },
    );
  }

  /**
   * Render the diff with full-width color backgrounds and symbol gutter
   */
  private _renderDiff(): void {
    if (!this.diffContent) return;

    // CRITICAL: Ensure widget has proper width before building content
    // Otherwise content will be wrapped incorrectly
    if (this.width <= 1 && this.screen && this.screen.width > 1) {
      (this as any).width = this.screen.width - 4; // Account for border
      if (this.position) {
        this.position.width = this.width;
      }
    }
    if (this.height <= 1 && this.screen && this.screen.height > 1) {
      (this as any).height = this.screen.height - 4; // Account for border
      if (this.position) {
        this.position.height = this.height;
      }
    }

    // Parse the unified diff to extract hunks and stats
    const hunks = this._parseDiff(this.diffContent);
    const fileName =
      this.options.newFileName || this.options.oldFileName || "file";
    const stats = this._computeStats(hunks);

    // Build header
    const header = this._buildHeader(fileName, stats);

    // Build diff lines with gutter and full-width colors
    const diffLines = this._buildDiffLines(hunks);

    // Combine header and diff lines
    const allLines = [header, "", ...diffLines];
    const content = allLines.join("\n");

    // Calculate the effective width we used for content generation
    // This ensures content doesn't get re-wrapped incorrectly
    let effectiveWidth = this.width;
    if (effectiveWidth <= 1) {
      if (this.lpos && this.lpos.xl > this.lpos.xi) {
        effectiveWidth = this.lpos.xl - this.lpos.xi;
      }
      if (effectiveWidth <= 1 && this.screen && this.screen.width > 1) {
        effectiveWidth = this.screen.width;
      }
      if (effectiveWidth <= 1) {
        try {
          const runtime = getRuntime();
          if (
            runtime.process.stdout?.columns &&
            runtime.process.stdout.columns > 1
          ) {
            effectiveWidth = runtime.process.stdout.columns;
          }
        } catch (_e) {
          // Ignore
        }
      }
      if (effectiveWidth <= 1) {
        effectiveWidth = 120;
      }
    }

    this.setContent(content);

    // Trigger screen render to display the content
    if (this.screen) {
      this.screen.render();
    }
  }

  /**
   * Parse unified diff into structured hunks
   */
  private _parseDiff(diffString: string): Array<{
    type: "header" | "hunk" | "addition" | "deletion" | "context";
    line: string;
    oldLineNum?: number;
    newLineNum?: number;
  }> {
    const lines = diffString.split("\n");
    const hunks: Array<{
      type: "header" | "hunk" | "addition" | "deletion" | "context";
      line: string;
      oldLineNum?: number;
      newLineNum?: number;
    }> = [];
    let oldLineNum = 0;
    let newLineNum = 0;

    for (const line of lines) {
      if (line.startsWith("---") || line.startsWith("+++")) {
        // Skip file headers - we'll generate our own
        continue;
      } else if (line.startsWith("@@")) {
        // Hunk header - extract line numbers
        const match = line.match(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
        if (match) {
          oldLineNum = parseInt(match[1], 10);
          newLineNum = parseInt(match[3], 10);
        }
        hunks.push({ type: "hunk", line });
      } else if (line.startsWith("+") && !line.startsWith("+++")) {
        // Addition
        hunks.push({
          type: "addition",
          line: line.substring(1), // Remove the +
          oldLineNum: undefined,
          newLineNum: newLineNum++,
        });
      } else if (line.startsWith("-") && !line.startsWith("---")) {
        // Deletion
        hunks.push({
          type: "deletion",
          line: line.substring(1), // Remove the -
          oldLineNum: oldLineNum++,
          newLineNum: undefined,
        });
      } else if (line.startsWith("\\")) {
        // No newline marker - skip
        continue;
      } else if (line.trim() === "") {
        // Empty line - treat as context
        hunks.push({
          type: "context",
          line: "",
          oldLineNum: oldLineNum++,
          newLineNum: newLineNum++,
        });
      } else {
        // Context line
        hunks.push({
          type: "context",
          line,
          oldLineNum: oldLineNum++,
          newLineNum: newLineNum++,
        });
      }
    }

    return hunks;
  }

  /**
   * Compute diff statistics
   */
  private _computeStats(
    hunks: Array<{
      type: "header" | "hunk" | "addition" | "deletion" | "context";
      line: string;
    }>,
  ): { additions: number; deletions: number } {
    let additions = 0;
    let deletions = 0;

    for (const hunk of hunks) {
      if (hunk.type === "addition") additions++;
      if (hunk.type === "deletion") deletions++;
    }

    return { additions, deletions };
  }

  /**
   * Build header with file path and stats
   */
  private _buildHeader(
    fileName: string,
    stats: { additions: number; deletions: number },
  ): string {
    const getHeaderColor = this._getColorFunction(
      this.options.headerColor || "cyan",
    );
    const headerText = `${fileName} +${stats.additions} -${stats.deletions}`;
    return getHeaderColor(headerText);
  }

  /**
   * Build diff lines with gutter and full-width backgrounds
   *
   * Note: We embed truecolor/256-color ANSI codes directly in the content
   * because the Box rendering system doesn't support truecolor backgrounds
   * via the style.bg property. The codes need to be in the content string itself.
   */
  private _buildDiffLines(
    hunks: Array<{
      type: "header" | "hunk" | "addition" | "deletion" | "context";
      line: string;
      oldLineNum?: number;
      newLineNum?: number;
    }>,
  ): string[] {
    // Calculate width with multiple fallbacks
    let contentWidth = this.width;

    // If width is not set or invalid, try to calculate it
    if (contentWidth <= 1) {
      // Try to get width from position calculation
      if (this.lpos && this.lpos.xl > this.lpos.xi) {
        contentWidth = this.lpos.xl - this.lpos.xi;
      }
      // Fall back to screen width
      if (contentWidth <= 1 && this.screen && this.screen.width > 1) {
        contentWidth = this.screen.width;
      }
      // Try to get terminal width directly from runtime
      if (contentWidth <= 1) {
        try {
          const runtime = getRuntime();
          if (
            runtime.process.stdout?.columns &&
            runtime.process.stdout.columns > 1
          ) {
            contentWidth = runtime.process.stdout.columns;
          }
        } catch (_e) {
          // Ignore errors
        }
      }
      // Final fallback - use a reasonable default
      if (contentWidth <= 1) {
        contentWidth = 120; // Use a wider default for better display
      }
    }

    // Account for borders (left + right = 2 chars) if border is enabled
    const borderWidth = this.border ? 2 : 0;
    const width = Math.max(80, contentWidth - borderWidth); // Ensure minimum width of 80

    if (process.env.DEBUG_DIFF_COLORS) {
      console.log(
        `[DEBUG DIFF] Width calculation: this.width=${this.width}, lpos=${this.lpos ? `${this.lpos.xl}-${this.lpos.xi}=${this.lpos.xl - this.lpos.xi}` : "null"}, screen.width=${this.screen?.width || "N/A"}, runtime.columns=${getRuntime().process.stdout?.columns || "N/A"}, final contentWidth=${contentWidth}, borderWidth=${borderWidth}, final width=${width}`,
      );
    }

    return this._buildDiffLinesWithWidth(hunks, width);
  }

  /**
   * Internal method to build diff lines with a specific width
   */
  private _buildDiffLinesWithWidth(
    hunks: Array<{
      type: "header" | "hunk" | "addition" | "deletion" | "context";
      line: string;
      oldLineNum?: number;
      newLineNum?: number;
    }>,
    width: number,
  ): string[] {
    const lines: string[] = [];
    const getAdditionBg = this._getBgColorFunction(
      this.options.additionColor || "green",
    );
    const getDeletionBg = this._getBgColorFunction(
      this.options.deletionColor || "red",
    );

    // Get language for syntax highlighting
    const language = this._detectLanguage();

    for (const hunk of hunks) {
      if (hunk.type === "hunk") {
        // Skip hunk headers for now (or show them differently)
        continue;
      }

      // Determine symbol and color
      let symbol = " ";
      let bgColorFn: ((text: string) => string) | null = null;

      if (hunk.type === "addition") {
        symbol = "+";
        bgColorFn = getAdditionBg;
      } else if (hunk.type === "deletion") {
        symbol = "-";
        bgColorFn = getDeletionBg;
      }

      // Get the content line
      let content = hunk.line || "";

      // Apply syntax highlighting if enabled and language detected
      if (this.options.syntaxHighlight && language && content.trim()) {
        try {
          const highlightTheme = this._convertHighlightTheme(
            this.options.highlightTheme,
          );
          const highlighted = highlight(content, {
            language,
             
            theme: highlightTheme as any,
            ignoreIllegals: true,
          });
          content = highlighted;
        } catch (_e) {
          // If highlighting fails, use original content
          // (e.g., language not supported)
        }
      }

      // Build the line: symbol + content
      const fullLine = symbol + " " + content;

      // Apply background color to fill entire width
      // The background ANSI code must wrap the entire line including padding
      if (bgColorFn) {
        // Calculate padding needed (account for symbol + space + content)
        const ansiLength = this._getAnsiLength(fullLine);
        const visibleLength = fullLine.length - ansiLength;
        const paddingNeeded = Math.max(0, width - visibleLength);

        // Build the full line with padding
        const padded = fullLine + " ".repeat(paddingNeeded);

        // CRITICAL: The background ANSI code must be applied to the ENTIRE string
        // including all padding spaces. The format is:
        // \x1b[48;2;r;g;bm<all content including spaces>\x1b[49m
        //
        // However, the rendering system processes characters individually.
        // To ensure the background persists across ALL characters (including padding),
        // we need to ensure the background code is at the start and the reset is at the end.
        // The background should persist across all characters in between.
        const withBg = bgColorFn(padded);

        // Verify the background code wraps everything
        // The background should start with \x1b[48;2; or \x1b[48;5; and end with \x1b[49m
        if (process.env.DEBUG_DIFF_COLORS) {
          const bgStart = withBg.indexOf("\x1b[48;");
          const bgEnd = withBg.indexOf("\x1b[49m");
          const bgCode = withBg.substring(bgStart, bgEnd + 4);
          const contentPart = withBg.substring(bgEnd + 4);
          console.log(
            `[DEBUG DIFF] Line type: ${hunk.type}, Symbol: ${symbol}`,
          );
          console.log(
            `[DEBUG DIFF] this.width: ${this.width}, Calculated width: ${width}`,
          );
          console.log(
            `[DEBUG DIFF] BG code at: ${bgStart}, Reset at: ${bgEnd}, Full length: ${withBg.length}`,
          );
          console.log(
            `[DEBUG DIFF] Padded length: ${padded.length}, Width: ${width}, Padding: ${paddingNeeded}`,
          );
          console.log(`[DEBUG DIFF] BG code: ${JSON.stringify(bgCode)}`);
          console.log(
            `[DEBUG DIFF] Content after reset: ${JSON.stringify(contentPart.substring(0, 50))}`,
          );
          console.log(
            `[DEBUG DIFF] Full line (first 100 chars): ${JSON.stringify(withBg.substring(0, 100))}`,
          );
        }

        lines.push(withBg);

        if (process.env.DEBUG_DIFF_COLORS) {
          console.log(
            `[DEBUG] Line with bg: ${JSON.stringify(withBg.substring(0, 100))}`,
          );
          console.log(
            `[DEBUG] Padded length: ${padded.length}, Width: ${width}`,
          );
        }
      } else {
        // Context line - no background, just pad
        const ansiLength = this._getAnsiLength(fullLine);
        const visibleLength = fullLine.length - ansiLength;
        const paddingNeeded = Math.max(0, width - visibleLength);
        const padded = fullLine + " ".repeat(paddingNeeded);
        lines.push(padded);
      }
    }

    return lines;
  }

  /**
   * Detect language from file name extension
   */
  private _detectLanguage(): string | undefined {
    if (this.options.language) {
      return this.options.language;
    }

    const fileName = this.options.newFileName || this.options.oldFileName || "";
    const ext = fileName.split(".").pop()?.toLowerCase();

    // Map common extensions to highlight.js language names
    const extensionMap: Record<string, string> = {
      js: "javascript",
      ts: "typescript",
      jsx: "javascript",
      tsx: "typescript",
      py: "python",
      rb: "ruby",
      java: "java",
      c: "c",
      cpp: "cpp",
      h: "c",
      hpp: "cpp",
      cs: "csharp",
      go: "go",
      rs: "rust",
      php: "php",
      swift: "swift",
      kt: "kotlin",
      scala: "scala",
      sh: "bash",
      bash: "bash",
      zsh: "bash",
      fish: "bash",
      sql: "sql",
      html: "html",
      htm: "html",
      css: "css",
      scss: "scss",
      sass: "sass",
      less: "less",
      json: "json",
      yaml: "yaml",
      yml: "yaml",
      xml: "xml",
      md: "markdown",
      markdown: "markdown",
      diff: "diff",
      patch: "diff",
    };

    return ext ? extensionMap[ext] : undefined;
  }

  /**
   * Convert highlight theme to cli-highlight format
   */
  private _convertHighlightTheme(
    theme?: Record<string, string | string[] | ((text: string) => string)>,
  ): Record<string, (text: string) => string> | undefined {
    if (!theme) return undefined;

    const converted: Record<string, (text: string) => string> = {};

    for (const key in theme) {
      const value = theme[key];
      if (!value) continue;

      try {
        if (typeof value === "function") {
          converted[key] = value;
        } else if (typeof value === "string") {
          // Single string like "cyan" or "white"
          if (value === "white") {
            converted[key] = chalk;
          } else {
            const tokens = value.split(".");
            let result: any = chalk;
            for (let i = 0; i < tokens.length; i++) {
              if (result && typeof result === "object" && tokens[i] in result) {
                result = result[tokens[i]];
              } else {
                result = chalk;
                break;
              }
            }
            converted[key] = result;
          }
        } else if (Array.isArray(value)) {
          // Array like ["cyan", "bold"] - chain chalk functions
          let result: any = chalk;
          for (let i = 0; i < value.length; i++) {
            if (result && typeof result === "object" && value[i] in result) {
              result = result[value[i]];
            } else {
              result = chalk;
              break;
            }
          }
          converted[key] = result;
        }
      } catch (_e) {
        // Skip invalid theme entries
      }
    }

    return converted;
  }

  /**
   * Get length of ANSI escape codes in a string
   */
  private _getAnsiLength(str: string): number {
     
    const ansiRegex = /\x1B\[[0-9;]*[A-Za-z]/g;
    const matches = str.match(ansiRegex);
    return matches ? matches.join("").length : 0;
  }

  /**
   * Check if terminal supports truecolor (24-bit RGB)
   */
  private _supportsTruecolor(): boolean {
    const runtime = getRuntime();
    const colorDepth = runtime.process.stdout?.getColorDepth?.() || 0;
    const colorTerm = process.env.COLORTERM || "";

    // Check multiple indicators of truecolor support
    return (
      colorDepth >= 24 || // 24-bit color depth
      colorTerm.includes("truecolor") ||
      colorTerm.includes("24bit") ||
      (process.env.TERM === "xterm-256color" && colorDepth >= 8) // Many terminals with 256-color also support truecolor
    );
  }

  /**
   * Get background color function
   */
  private _getBgColorFunction(
    color: string | number | number[] | ((text: string) => string),
  ): (text: string) => string {
    if (typeof color === "function") {
      // If it's already a function, use it directly
      return color;
    }

    const supportsTruecolor = this._supportsTruecolor();

    // Handle RGB array
    if (Array.isArray(color) && color.length === 3) {
      const [r, g, b] = color;

      if (process.env.DEBUG_DIFF_COLORS) {
        console.log(`[DEBUG] RGB [${r}, ${g}, ${b}]`);
        console.log(
          `[DEBUG] Terminal supports truecolor: ${supportsTruecolor}`,
        );
      }

      // Use truecolor (24-bit RGB) - the codes will be preserved in content
      // and output directly during screen rendering
      if (process.env.DEBUG_DIFF_COLORS) {
        console.log(`[DEBUG] Using truecolor: \\x1b[48;2;${r};${g};${b}m`);
      }
      // Format: \x1b[48;2;r;g;bm<all text including spaces>\x1b[49m
      // The background should persist across all characters until reset
      return (text: string) => `\x1b[48;2;${r};${g};${b}m${text}\x1b[49m`;
    }

    // Handle 256-color code number
    if (typeof color === "number") {
      return (text: string) => `\x1b[48;5;${color}m${text}\x1b[49m`;
    }

    // Handle string color names - use dark, desaturated defaults
    if (typeof color === "string") {
      switch (color.toLowerCase()) {
        case "green":
          // Dark, desaturated green - use truecolor RGB [40, 60, 40]
          // This matches the colors from the demo that looked correct
          if (this._supportsTruecolor()) {
            return (text: string) => `\x1b[48;2;40;60;40m${text}\x1b[49m`;
          } else {
            // Fallback to 256-color
            return (text: string) =>
              `\x1b[48;5;${x256(40, 60, 40)}m${text}\x1b[49m`;
          }
        case "red":
          // Dark, desaturated red - use truecolor RGB [60, 40, 40]
          // This matches the colors from the demo that looked correct
          if (this._supportsTruecolor()) {
            return (text: string) => `\x1b[48;2;60;40;40m${text}\x1b[49m`;
          } else {
            // Fallback to 256-color
            return (text: string) =>
              `\x1b[48;5;${x256(60, 40, 40)}m${text}\x1b[49m`;
          }
        case "cyan":
          return (text: string) => `\x1b[48;5;23m${text}\x1b[49m`; // Dark cyan
        case "yellow":
          return (text: string) => `\x1b[48;5;58m${text}\x1b[49m`; // Dark yellow
        case "blue":
          return (text: string) => `\x1b[48;5;17m${text}\x1b[49m`; // Dark blue
        case "magenta":
          return (text: string) => `\x1b[48;5;53m${text}\x1b[49m`; // Dark magenta
        case "white":
          return (text: string) => `\x1b[48;5;235m${text}\x1b[49m`; // Dark gray instead
        case "gray":
        case "grey":
          return (text: string) => `\x1b[48;5;235m${text}\x1b[49m`; // Dark gray
        case "default":
        default:
          return (text: string) => text;
      }
    }

    return (text: string) => text;
  }

  /**
   * Get color function from string or function (for headers)
   */
  private _getColorFunction(
    color: string | ((text: string) => string),
  ): (text: string) => string {
    if (typeof color === "function") {
      return color;
    }

    // Map string colors to chalk functions
    switch (color.toLowerCase()) {
      case "green":
        return chalk.green;
      case "red":
        return chalk.red;
      case "cyan":
        return chalk.cyan;
      case "yellow":
        return chalk.yellow;
      case "blue":
        return chalk.blue;
      case "magenta":
        return chalk.magenta;
      case "white":
        return chalk.white;
      case "gray":
      case "grey":
        return chalk.gray;
      case "default":
      default:
        return (text: string) => text;
    }
  }

  /**
   * Set diff content from a unified diff string
   */
  setDiff(diffString: string): void {
    this.options.diffString = diffString;
    this.diffContent = diffString;
    this._renderDiff();
  }

  /**
   * Set diff from old/new content
   */
  setDiffContent(oldContent: string, newContent: string): void {
    this.options.oldContent = oldContent;
    this.options.newContent = newContent;
    this._computeDiff();
    if (this.diffContent) {
      this._renderDiff();
    }
  }

  /**
   * Update file names
   */
  setFileNames(oldFileName: string, newFileName: string): void {
    this.options.oldFileName = oldFileName;
    this.options.newFileName = newFileName;
    if (this.options.oldContent && this.options.newContent) {
      this._computeDiff();
      if (this.diffContent) {
        this._renderDiff();
      }
    }
  }
}
