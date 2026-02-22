/**
 * diff.ts - Diff rendering widget
 */

import chalk from "chalk";
import { highlight } from "cli-highlight";
import { createTwoFilesPatch } from "diff";
import x256 from "x256";
import type { BoxOptions } from "../types/options.js";
import { Box } from "./box.js";

export interface DiffOptions extends BoxOptions {
  oldContent?: string;
  newContent?: string;
  oldFileName?: string;
  newFileName?: string;
  diffString?: string;
  contextLines?: number;
  additionColor?: string | number | number[] | ((text: string) => string);
  deletionColor?: string | number | number[] | ((text: string) => string);
  contextColor?: string | ((text: string) => string);
  headerColor?: string | ((text: string) => string);
  showLineNumbers?: boolean;
  syntaxHighlight?: boolean;
  language?: string;
  highlightTheme?: Record<
    string,
    string | string[] | ((text: string) => string)
  >;
}

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

    this._configureChalk();
    this._disableAcs();
    this.on("attach", () => this._disableAcs());

    if (this.options.diffString) {
      this.diffContent = this.options.diffString;
    } else if (this.options.oldContent && this.options.newContent) {
      this._computeDiff();
    }

    if (this.diffContent) {
      this.once("render", () => {
        if (this.diffContent && !this.content) {
          this._renderDiff();
        }
      });

      setTimeout(() => {
        if (this.diffContent && !this.content) {
          this._renderDiff();
        }
      }, 100);
    }
  }

  private _configureChalk(): void {
    const env = this.runtime.process.env ?? {};
    const stdout = this.runtime.process.stdout;
    if (!env.NO_COLOR) {
      if (env.FORCE_COLOR || stdout?.isTTY) {
        if (chalk.level === 0) {
          chalk.level = 1;
        }
      }
    }
  }

  private _disableAcs(): void {
    if (!this.screen || !this.screen.program || !this.screen.program.tput) {
      return;
    }

    const tput = this.screen.program.tput;
    tput.brokenACS = true;
    tput.unicode = true;
    if (tput.features) {
      tput.features.unicode = true;
    }

    const screenAny = this.screen as any;
    if (typeof screenAny._unicode === "boolean") {
      screenAny._unicode = true;
    }
  }

  private _computeDiff(): void {
    const oldContent = this.options.oldContent || "";
    const newContent = this.options.newContent || "";
    const oldFileName = this.options.oldFileName || "old";
    const newFileName = this.options.newFileName || "new";
    const contextLines = this.options.contextLines || 3;

    this.diffContent = createTwoFilesPatch(
      oldFileName,
      newFileName,
      oldContent,
      newContent,
      undefined,
      undefined,
      {
        context: contextLines,
      },
    );
  }

  private _renderDiff(): void {
    if (!this.diffContent) return;

    if (this.width <= 1 && this.screen && this.screen.width > 1) {
      (this as any).width = this.screen.width - 4;
      if (this.position) {
        this.position.width = this.width;
      }
    }
    if (this.height <= 1 && this.screen && this.screen.height > 1) {
      (this as any).height = this.screen.height - 4;
      if (this.position) {
        this.position.height = this.height;
      }
    }

    const hunks = this._parseDiff(this.diffContent);
    const fileName =
      this.options.newFileName || this.options.oldFileName || "file";
    const stats = this._computeStats(hunks);

    const header = this._buildHeader(fileName, stats);
    const diffLines = this._buildDiffLines(hunks);
    const allLines = [header, "", ...diffLines];
    const content = allLines.join("\n");

    let effectiveWidth = this.width;
    if (effectiveWidth <= 1) {
      if (this.lpos && this.lpos.xl > this.lpos.xi) {
        effectiveWidth = this.lpos.xl - this.lpos.xi;
      }
      if (effectiveWidth <= 1 && this.screen && this.screen.width > 1) {
        effectiveWidth = this.screen.width;
      }
      if (effectiveWidth <= 1) {
        const stdout = this.runtime.process.stdout;
        if (stdout?.columns && stdout.columns > 1) {
          effectiveWidth = stdout.columns;
        }
      }
      if (effectiveWidth <= 1) {
        effectiveWidth = 120;
      }
    }

    this.setContent(content);

    if (this.screen) {
      this.screen.render();
    }
  }

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
        continue;
      } else if (line.startsWith("@@")) {
        const match = line.match(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
        if (match) {
          oldLineNum = parseInt(match[1], 10);
          newLineNum = parseInt(match[3], 10);
        }
        hunks.push({ type: "hunk", line });
      } else if (line.startsWith("+") && !line.startsWith("+++")) {
        hunks.push({
          type: "addition",
          line: line.substring(1),
          oldLineNum: undefined,
          newLineNum: newLineNum++,
        });
      } else if (line.startsWith("-") && !line.startsWith("---")) {
        hunks.push({
          type: "deletion",
          line: line.substring(1),
          oldLineNum: oldLineNum++,
          newLineNum: undefined,
        });
      } else if (line.startsWith("\\")) {
        continue;
      } else if (line.trim() === "") {
        hunks.push({
          type: "context",
          line: "",
          oldLineNum: oldLineNum++,
          newLineNum: newLineNum++,
        });
      } else {
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

  private _buildDiffLines(
    hunks: Array<{
      type: "header" | "hunk" | "addition" | "deletion" | "context";
      line: string;
      oldLineNum?: number;
      newLineNum?: number;
    }>,
  ): string[] {
    let contentWidth = this.width;

    if (contentWidth <= 1) {
      if (this.lpos && this.lpos.xl > this.lpos.xi) {
        contentWidth = this.lpos.xl - this.lpos.xi;
      }
      if (contentWidth <= 1 && this.screen && this.screen.width > 1) {
        contentWidth = this.screen.width;
      }
      if (contentWidth <= 1) {
        const stdout = this.runtime.process.stdout;
        if (stdout?.columns && stdout.columns > 1) {
          contentWidth = stdout.columns;
        }
      }
      if (contentWidth <= 1) {
        contentWidth = 120;
      }
    }

    const borderWidth = this.border ? 2 : 0;
    const width = Math.max(80, contentWidth - borderWidth);

    const env = this.runtime.process.env ?? {};
    if (env.DEBUG_DIFF_COLORS) {
      this.runtime.process.stdout?.write?.(
        `[DEBUG DIFF] Width calculation: this.width=${this.width}, lpos=${this.lpos ? `${this.lpos.xl}-${this.lpos.xi}=${this.lpos.xl - this.lpos.xi}` : "null"}, screen.width=${this.screen?.width || "N/A"}, runtime.columns=${this.runtime.process.stdout?.columns || "N/A"}, final contentWidth=${contentWidth}, borderWidth=${borderWidth}, final width=${width}\n`,
      );
    }

    return this._buildDiffLinesWithWidth(hunks, width);
  }

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

    const language = this._detectLanguage();
    const env = this.runtime.process.env ?? {};

    for (const hunk of hunks) {
      if (hunk.type === "hunk") {
        continue;
      }

      let symbol = " ";
      let bgColorFn: ((text: string) => string) | null = null;

      if (hunk.type === "addition") {
        symbol = "+";
        bgColorFn = getAdditionBg;
      } else if (hunk.type === "deletion") {
        symbol = "-";
        bgColorFn = getDeletionBg;
      }

      let content = hunk.line || "";

      if (this.options.syntaxHighlight && language && content.trim()) {
        try {
          if (!env.NO_COLOR) {
            if (!env.FORCE_COLOR) {
              env.FORCE_COLOR = "1";
            }
            const supportsTruecolor = this._supportsTruecolor();
            const desiredLevel = supportsTruecolor ? 3 : 1;
            if (chalk.level < desiredLevel) {
              chalk.level = desiredLevel;
            }
          }
          const highlightTheme = this._getHighlightTheme();
          const highlighted = highlight(content, {
            language,
            theme: highlightTheme as any,
            ignoreIllegals: true,
          });
          const sanitized = this._sanitizeHighlightedContent(highlighted);
          const hasEsc = !!sanitized && sanitized.includes("\x1b");
          const hasBare = !!sanitized && /\[(\d+(?:;\d+)*)m/.test(sanitized);
          if (hasBare && !hasEsc) {
            const normalized = sanitized.replace(
              /\[(\d+(?:;\d+)*)m/g,
              "\x1b[$1m",
            );
            content = normalized;
          } else if (sanitized && hasEsc) {
            content = sanitized;
          }
        } catch {
          // noop
        }
      }

      const fullLine = symbol + " " + content;

      if (bgColorFn) {
        const ansiLength = this._getAnsiLength(fullLine);
        const visibleLength = fullLine.length - ansiLength;
        const paddingNeeded = Math.max(0, width - visibleLength);

        const padded = fullLine + " ".repeat(paddingNeeded);
        const withBg = bgColorFn(padded);

        if (env.DEBUG_DIFF_COLORS) {
          const bgStart = withBg.indexOf("\x1b[48;");
          const bgEnd = withBg.indexOf("\x1b[49m");
          const bgCode = withBg.substring(bgStart, bgEnd + 4);
          const contentPart = withBg.substring(bgEnd + 4);
          this.runtime.process.stdout?.write?.(
            `[DEBUG DIFF] Line type: ${hunk.type}, Symbol: ${symbol}\n` +
              `[DEBUG DIFF] this.width: ${this.width}, Calculated width: ${width}\n` +
              `[DEBUG DIFF] BG code at: ${bgStart}, Reset at: ${bgEnd}, Full length: ${withBg.length}\n` +
              `[DEBUG DIFF] Padded length: ${padded.length}, Width: ${width}, Padding: ${paddingNeeded}\n` +
              `[DEBUG DIFF] BG code: ${JSON.stringify(bgCode)}\n` +
              `[DEBUG DIFF] Content after reset: ${JSON.stringify(contentPart.substring(0, 50))}\n` +
              `[DEBUG DIFF] Full line (first 100 chars): ${JSON.stringify(withBg.substring(0, 100))}\n`,
          );
        }

        lines.push(withBg);

        if (env.DEBUG_DIFF_COLORS) {
          this.runtime.process.stdout?.write?.(
            `[DEBUG] Line with bg: ${JSON.stringify(withBg.substring(0, 100))}\n` +
              `[DEBUG] Padded length: ${padded.length}, Width: ${width}\n`,
          );
        }
      } else {
        const ansiLength = this._getAnsiLength(fullLine);
        const visibleLength = fullLine.length - ansiLength;
        const paddingNeeded = Math.max(0, width - visibleLength);
        const padded = fullLine + " ".repeat(paddingNeeded);
        lines.push(padded);
      }
    }

    return lines;
  }

  private _detectLanguage(): string | undefined {
    if (this.options.language) {
      return this.options.language;
    }

    const fileName = this.options.newFileName || this.options.oldFileName || "";
    const ext = fileName.split(".").pop()?.toLowerCase();

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
      } catch {
        // noop
      }
    }

    return converted;
  }

  private _getHighlightTheme(): Record<string, (text: string) => string> {
    const base = this._getDefaultHighlightTheme();
    if (!this.options.highlightTheme) return base;

    const converted = this._convertHighlightTheme(this.options.highlightTheme);
    return { ...base, ...(converted || {}) } as Record<
      string,
      (text: string) => string
    >;
  }

  private _getDefaultHighlightTheme(): Record<
    string,
    (text: string) => string
  > {
    const color = (r: number, g: number, b: number) => (text: string) =>
      `\x1b[38;2;${r};${g};${b}m${text}\x1b[39m`;

    return {
      keyword: color(120, 170, 255),
      built_in: color(110, 200, 220),
      type: color(110, 200, 220),
      literal: color(120, 170, 255),
      number: color(120, 200, 200),
      regexp: color(220, 120, 120),
      string: color(220, 130, 130),
      subst: (text: string) => text,
      symbol: (text: string) => text,
      class: color(120, 170, 255),
      function: color(210, 190, 120),
      title: (text: string) => text,
      params: (text: string) => text,
      comment: color(150, 150, 150),
      doctag: color(150, 150, 150),
      meta: color(150, 150, 150),
      "meta-keyword": (text: string) => text,
      "meta-string": (text: string) => text,
      section: (text: string) => text,
      tag: color(150, 150, 150),
      name: color(120, 170, 255),
      "builtin-name": (text: string) => text,
      attr: color(110, 200, 220),
      attribute: (text: string) => text,
      variable: (text: string) => text,
      bullet: (text: string) => text,
      code: (text: string) => text,
      emphasis: (text: string) => text,
      strong: (text: string) => text,
      formula: (text: string) => text,
      link: (text: string) => text,
      quote: (text: string) => text,
      "selector-tag": (text: string) => text,
      "selector-id": (text: string) => text,
      "selector-class": (text: string) => text,
      "selector-attr": (text: string) => text,
      "selector-pseudo": (text: string) => text,
      "template-tag": (text: string) => text,
      "template-variable": (text: string) => text,
      addition: color(120, 200, 140),
      deletion: color(200, 120, 120),
      default: (text: string) => text,
    };
  }

  private _getAnsiLength(str: string): number {
    const ansiRegex = new RegExp("\\x1B\\[[0-9;]*[A-Za-z]", "g");
    const matches = str.match(ansiRegex);
    return matches ? matches.join("").length : 0;
  }

  private _sanitizeHighlightedContent(text: string): string {
    if (!text) return text;

    const oscRegex = new RegExp("\\x1b\\][\\s\\S]*?(?:\\x07|\\x1b\\\\)", "g");
    const charsetRegex = new RegExp("\\x1b[\\(\\)][0-9A-Za-z]", "g");
    const singleShiftRegex = new RegExp("\\x1b[NO]", "g");
    const nonSgrEscRegex = new RegExp("\\x1b(?!\\[[0-9;]*m)", "g");
    const c0Regex = new RegExp("[\\x00-\\x08\\x0b-\\x0c\\x0e-\\x1f\\x7f]", "g");
    const c1Regex = new RegExp("[\\x80-\\x9f]", "g");

    return text
      .replace(oscRegex, "")
      .replace(charsetRegex, "")
      .replace(singleShiftRegex, "")
      .replace(nonSgrEscRegex, "")
      .replace(c0Regex, "")
      .replace(c1Regex, "");
  }

  private _supportsTruecolor(): boolean {
    const runtime = this.runtime;
    const colorDepth = runtime.process.stdout?.getColorDepth?.() || 0;
    const colorTerm = runtime.process.env?.COLORTERM || "";

    return (
      colorDepth >= 24 ||
      colorTerm.includes("truecolor") ||
      colorTerm.includes("24bit") ||
      (runtime.process.env?.TERM === "xterm-256color" && colorDepth >= 8)
    );
  }

  private _getBgColorFunction(
    color: string | number | number[] | ((text: string) => string),
  ): (text: string) => string {
    if (typeof color === "function") {
      return color;
    }

    const supportsTruecolor = this._supportsTruecolor();
    const env = this.runtime.process.env ?? {};

    if (Array.isArray(color) && color.length === 3) {
      const [r, g, b] = color;

      if (env.DEBUG_DIFF_COLORS) {
        this.runtime.process.stdout?.write?.(
          `[DEBUG] RGB [${r}, ${g}, ${b}]\n` +
            `[DEBUG] Terminal supports truecolor: ${supportsTruecolor}\n`,
        );
      }

      if (env.DEBUG_DIFF_COLORS) {
        this.runtime.process.stdout?.write?.(
          `[DEBUG] Using truecolor: \\x1b[48;2;${r};${g};${b}m\n`,
        );
      }
      return (text: string) => `\x1b[48;2;${r};${g};${b}m${text}\x1b[49m`;
    }

    if (typeof color === "number") {
      return (text: string) => `\x1b[48;5;${color}m${text}\x1b[49m`;
    }

    if (typeof color === "string") {
      switch (color.toLowerCase()) {
        case "green":
          if (this._supportsTruecolor()) {
            return (text: string) => `\x1b[48;2;40;60;40m${text}\x1b[49m`;
          }
          return (text: string) =>
            `\x1b[48;5;${x256(40, 60, 40)}m${text}\x1b[49m`;
        case "red":
          if (this._supportsTruecolor()) {
            return (text: string) => `\x1b[48;2;60;40;40m${text}\x1b[49m`;
          }
          return (text: string) =>
            `\x1b[48;5;${x256(60, 40, 40)}m${text}\x1b[49m`;
        case "cyan":
          return (text: string) => `\x1b[48;5;23m${text}\x1b[49m`;
        case "yellow":
          return (text: string) => `\x1b[48;5;58m${text}\x1b[49m`;
        case "blue":
          return (text: string) => `\x1b[48;5;17m${text}\x1b[49m`;
        case "magenta":
          return (text: string) => `\x1b[48;5;53m${text}\x1b[49m`;
        case "white":
          return (text: string) => `\x1b[48;5;235m${text}\x1b[49m`;
        case "gray":
        case "grey":
          return (text: string) => `\x1b[48;5;235m${text}\x1b[49m`;
        case "default":
        default:
          return (text: string) => text;
      }
    }

    return (text: string) => text;
  }

  private _getColorFunction(
    color: string | ((text: string) => string),
  ): (text: string) => string {
    if (typeof color === "function") {
      return color;
    }

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

  setDiff(diffString: string): void {
    this.options.diffString = diffString;
    this.diffContent = diffString;
    this._renderDiff();
  }

  setDiffContent(oldContent: string, newContent: string): void {
    this.options.oldContent = oldContent;
    this.options.newContent = newContent;
    this._computeDiff();
    if (this.diffContent) {
      this._renderDiff();
    }
  }

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

export default Diff;
