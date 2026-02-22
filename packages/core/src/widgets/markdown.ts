/**
 * markdown.ts - Markdown rendering widget
 */

import chalk from "chalk";
import { marked } from "marked";
import TerminalRenderer from "marked-terminal";
import type { BoxOptions } from "../types/options.js";
import { Box } from "./box.js";

export interface MarkdownStyle {
  code?: string | ((text: string) => string);
  blockquote?: string | ((text: string) => string);
  html?: string | ((text: string) => string);
  heading?: string | ((text: string) => string);
  firstHeading?: string | ((text: string) => string);
  hr?: string | ((text: string) => string);
  listitem?: string | ((text: string) => string);
  table?: string | ((text: string) => string);
  paragraph?: string | ((text: string) => string);
  strong?: string | ((text: string) => string);
  em?: string | ((text: string) => string);
  codespan?: string | ((text: string) => string);
  del?: string | ((text: string) => string);
  link?: string | ((text: string) => string);
  href?: string | ((text: string) => string);
}

export interface HighlightTheme {
  keyword?: string | string[];
  function?: string | string[];
  built_in?: string | string[];
  string?: string | string[];
  number?: string | string[];
  comment?: string | string[];
  default?: string | string[];
  [key: string]: string | string[] | undefined;
}

export interface MarkdownOptions extends BoxOptions {
  markdown?: string;
  markdownStyle?: MarkdownStyle;
  highlightTheme?: HighlightTheme;
}

export class Markdown extends Box {
  override type = "markdown";
  declare options: MarkdownOptions;

  constructor(options: MarkdownOptions = {}) {
    super(options);
    this.options = options;

    this._configureChalk();

    const markdownOptions = {
      style: options.markdownStyle,
    };

    this._evalStyles(markdownOptions);
    this._setMarkdownOptions(markdownOptions.style);

    if (options.markdown) {
      this.setMarkdown(options.markdown);
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

  private _evalStyles(options: { style?: MarkdownStyle }): void {
    if (!chalk || !options.style) return;

    const style = options.style;
    for (const key in style) {
      const st = key as keyof MarkdownStyle;
      const value = style[st];

      if (typeof value !== "string") continue;

      const tokens = value.split(".");
      if (tokens[0] !== "chalk") continue;

      let result: any = chalk;
      for (let j = 1; j < tokens.length; j++) {
        result = result[tokens[j]];
      }

      (style as any)[st] = result;
    }
  }

  private _convertHighlightTheme(
    theme?: HighlightTheme,
  ): Record<string, any> | undefined {
    if (!theme || !chalk) return undefined;

    const converted: Record<string, any> = {};

    for (const key in theme) {
      const value = theme[key];
      if (!value) continue;

      try {
        if (typeof value === "string") {
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
        } else if (typeof value === "function") {
          converted[key] = value;
        }

        const env = this.runtime.process.env ?? {};
        if (env.DEBUG_MARKDOWN) {
          if (converted[key] && typeof converted[key] === "function") {
            const testResult = converted[key]("test");
            this.runtime.process.stdout?.write?.(
              `Converted ${key} function test: ${testResult}\n` +
                `Has ANSI codes: ${testResult.includes("\x1b")}\n`,
            );
          } else {
            this.runtime.process.stdout?.write?.(
              `Warning: ${key} is not a function after conversion\n`,
            );
          }
        }
      } catch (e) {
        const env = this.runtime.process.env ?? {};
        if (env.DEBUG_MARKDOWN) {
          this.runtime.process.stdout?.write?.(
            `Failed to convert theme key "${key}": ${e instanceof Error ? e.message : String(e)}\n`,
          );
        }
      }
    }

    return converted;
  }

  private _setMarkdownOptions(style?: MarkdownStyle): void {
    const highlightTheme = this._convertHighlightTheme(
      this.options.highlightTheme,
    );

    const env = this.runtime.process.env ?? {};
    if (env.DEBUG_MARKDOWN) {
      this.runtime.process.stdout?.write?.(
        `Markdown style: ${JSON.stringify(style, null, 2)}\n` +
          `Original highlight theme: ${JSON.stringify(this.options.highlightTheme, null, 2)}\n` +
          `Converted highlight theme: ${highlightTheme ? JSON.stringify(Object.keys(highlightTheme), null, 2) : "none"}\n`,
      );
    }

    let renderer: any;
    if (highlightTheme) {
      const highlightOpts = { theme: highlightTheme };
      renderer = new TerminalRenderer(style as any, highlightOpts);
      if (env.DEBUG_MARKDOWN) {
        this.runtime.process.stdout?.write?.(
          "Created TerminalRenderer with highlightTheme\n",
        );
      }
    } else {
      renderer = new TerminalRenderer(style as any);
      if (env.DEBUG_MARKDOWN) {
        this.runtime.process.stdout?.write?.(
          "Created TerminalRenderer without highlightTheme\n",
        );
      }
    }

    marked.setOptions({
      renderer: renderer,
    });
  }

  setMarkdown(str: string): void {
    this._setMarkdownOptions(this.options.markdownStyle);

    const trimmed = str.trim();
    const rendered = marked.parse(trimmed);
    const content = typeof rendered === "string" ? rendered : String(rendered);
    this.setContent(content);
  }

  setOptions(style?: MarkdownStyle): void {
    this._setMarkdownOptions(style);
  }

  getOptionsPrototype(): MarkdownOptions {
    return {
      markdown: "string",
      markdownStyle: {},
    };
  }
}

export default Markdown;
