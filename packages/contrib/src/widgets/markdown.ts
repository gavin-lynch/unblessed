/**
 * markdown.ts - Markdown rendering widget
 *
 * Displays markdown content with terminal formatting.
 * Requires peer dependencies: marked, marked-terminal, chalk
 *
 * Based on blessed-contrib's markdown.js
 */

import { Box, type BoxOptions } from "@unblessed/core";
import { marked } from "marked";
 
// @ts-ignore - marked-terminal doesn't have type definitions
import chalk from "chalk";
import TerminalRenderer from "marked-terminal";

// Force chalk to enable colors - critical for syntax highlighting
// Chalk v5 auto-detects and may disable colors, so we force enable them
if (!process.env.NO_COLOR) {
  // Always force colors if FORCE_COLOR is set or we're in a TTY
  if (process.env.FORCE_COLOR || process.stdout.isTTY) {
     
    // @ts-ignore - chalk.level is writable in chalk v5
    if (chalk.level === 0) {
      chalk.level = 1; // Basic 16 colors
    }
  }
}

/**
 * Markdown style options
 *
 * Each property can be a chalk style string like "chalk.bold.blue"
 */
export interface MarkdownStyle {
  /** Style for code blocks */
  code?: string | ((text: string) => string);
  /** Style for blockquotes */
  blockquote?: string | ((text: string) => string);
  /** Style for HTML tags */
  html?: string | ((text: string) => string);
  /** Style for headings */
  heading?: string | ((text: string) => string);
  /** Style for first heading */
  firstHeading?: string | ((text: string) => string);
  /** Style for horizontal rules */
  hr?: string | ((text: string) => string);
  /** Style for list item bullets */
  listitem?: string | ((text: string) => string);
  /** Style for tables */
  table?: string | ((text: string) => string);
  /** Style for paragraphs */
  paragraph?: string | ((text: string) => string);
  /** Style for strong/bold text */
  strong?: string | ((text: string) => string);
  /** Style for emphasis/italic text */
  em?: string | ((text: string) => string);
  /** Style for inline code */
  codespan?: string | ((text: string) => string);
  /** Style for deleted text */
  del?: string | ((text: string) => string);
  /** Style for links */
  link?: string | ((text: string) => string);
  /** Style for link URLs */
  href?: string | ((text: string) => string);
}

/**
 * Syntax highlighting theme options for cli-highlight
 * Keys are highlight.js CSS class names, values are Chalk styles
 */
export interface HighlightTheme {
  /** Keywords (function, const, let, etc.) */
  keyword?: string | string[];
  /** Function names */
  function?: string | string[];
  /** Built-in functions (console, Math, etc.) */
  built_in?: string | string[];
  /** String literals */
  string?: string | string[];
  /** Number literals */
  number?: string | string[];
  /** Comments */
  comment?: string | string[];
  /** Default style for unhighlighted text */
  default?: string | string[];
  /** Any other highlight.js token types */
  [key: string]: string | string[] | undefined;
}

/**
 * Markdown options
 */
export interface MarkdownOptions extends BoxOptions {
  /** Initial markdown content */
  markdown?: string;
  /** Markdown style options */
  markdownStyle?: MarkdownStyle;
  /** Syntax highlighting theme options (passed to cli-highlight) */
  highlightTheme?: HighlightTheme;
}

/**
 * Markdown - Markdown rendering widget
 *
 * Renders markdown content with terminal formatting.
 * Requires optional peer dependencies: marked, marked-terminal
 *
 * @example
 * ```ts
 * const markdown = new Markdown({
 *   parent: screen,
 *   width: '80%',
 *   height: '80%',
 *   label: 'README',
 *   markdown: `
 *     # Hello World
 *
 *     This is **bold** and *italic* text.
 *
 *     - Item 1
 *     - Item 2
 *
 *     \`\`\`js
 *     console.log('code block');
 *     \`\`\`
 *   `
 * });
 * ```
 */
export class Markdown extends Box {
  override type = "markdown";
  declare options: MarkdownOptions;

  constructor(options: MarkdownOptions = {}) {
    super(options);
    this.options = options;

    // Initialize markdown rendering
    // Always set up the TerminalRenderer, even if no custom style is provided
    const markdownOptions = {
      style: options.markdownStyle,
    };

    this._evalStyles(markdownOptions);
    this._setMarkdownOptions(markdownOptions.style);

    if (options.markdown) {
      this.setMarkdown(options.markdown);
    }
  }

  /**
   * Evaluate chalk style strings into functions
   */
  private _evalStyles(options: { style?: MarkdownStyle }): void {
    if (!chalk || !options.style) return;

    const style = options.style;
    for (const key in style) {
      const st = key as keyof MarkdownStyle;
      const value = style[st];

      if (typeof value !== "string") continue;

      // Parse chalk style string like "chalk.bold.blue"
      const tokens = value.split(".");
      if (tokens[0] !== "chalk") continue;

      let result: any = chalk;
      for (let j = 1; j < tokens.length; j++) {
        result = result[tokens[j]];
      }

      (style as any)[st] = result;
    }
  }

  /**
   * Convert highlight theme strings/arrays to chalk functions
   */
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
          // Single string like "cyan" or "white" - convert to chalk function
          // Handle special case: "white" is just chalk, not chalk.white
          if (value === "white") {
            converted[key] = chalk;
          } else {
            const tokens = value.split(".");
            let result: any = chalk;
            for (let i = 0; i < tokens.length; i++) {
              if (result && typeof result === "object" && tokens[i] in result) {
                result = result[tokens[i]];
              } else {
                // Invalid chain, fallback to chalk
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
              // Invalid chain, fallback to chalk
              result = chalk;
              break;
            }
          }
          converted[key] = result;
        } else if (typeof value === "function") {
          // Already a function (chalk function), use as-is
          converted[key] = value;
        }

        // Verify the conversion worked
        if (converted[key] && typeof converted[key] === "function") {
          const testResult = converted[key]("test");
          if (process.env.DEBUG_MARKDOWN && key === "keyword") {
            console.log(`Converted ${key} function test:`, testResult);
            console.log(`Has ANSI codes:`, testResult.includes("\x1b"));
          }
        } else if (process.env.DEBUG_MARKDOWN) {
          console.log(`Warning: ${key} is not a function after conversion`);
        }
      } catch (e) {
        // If conversion fails, skip this key
        if (process.env.DEBUG_MARKDOWN) {
          console.log(
            `Failed to convert theme key "${key}":`,
            e instanceof Error ? e.message : String(e),
          );
        }
      }
    }

    return converted;
  }

  /**
   * Set marked options with terminal renderer
   */
  private _setMarkdownOptions(style?: MarkdownStyle): void {
    // Create a new TerminalRenderer instance with the style and highlight theme
    // TerminalRenderer accepts (options, highlightOptions) as parameters
    // highlightOptions are passed to cli-highlight and need to be chalk functions
    const highlightTheme = this._convertHighlightTheme(
      this.options.highlightTheme,
    );

    // Debug: log what we're passing
    if (process.env.DEBUG_MARKDOWN) {
      console.log("Markdown style:", JSON.stringify(style, null, 2));
      console.log(
        "Original highlight theme:",
        JSON.stringify(this.options.highlightTheme, null, 2),
      );
      console.log(
        "Converted highlight theme:",
        highlightTheme
          ? JSON.stringify(Object.keys(highlightTheme), null, 2)
          : "none",
      );
      if (highlightTheme) {
        console.log(
          "Sample converted value (keyword):",
          typeof highlightTheme.keyword,
          highlightTheme.keyword ? "function" : "undefined",
        );
        // Try to call it to see if it's a chalk function
        if (
          highlightTheme.keyword &&
          typeof highlightTheme.keyword === "function"
        ) {
          try {
            const test = highlightTheme.keyword("test");
            const hasAnsi = test.includes("\x1b[");
            console.log(
              "Keyword function test result:",
              test.substring(0, 100),
            );
            console.log("Keyword function returns ANSI codes:", hasAnsi);
            if (!hasAnsi) {
              console.log(
                "WARNING: Chalk function not working! Testing chalk directly...",
              );
              const directTest = chalk.cyan.bold("test");
              console.log(
                "Direct chalk.cyan.bold test:",
                directTest.substring(0, 100),
              );
              console.log(
                "Direct chalk has ANSI:",
                directTest.includes("\x1b["),
              );
            }
          } catch (e) {
            console.log(
              "Keyword function error:",
              e instanceof Error ? e.message : String(e),
            );
          }
        }
      }
      console.log(
        "TerminalRenderer constructor:",
        TerminalRenderer.length,
        "parameters",
      );
    }

    // Create renderer - if highlightTheme is provided, pass it as second arg
    // According to marked-terminal source, it passes highlightOptions directly to cli-highlight
    // cli-highlight expects theme keys to be highlight.js token types
    let renderer: any;
    if (highlightTheme) {
      // Verify theme functions work before passing
      if (process.env.DEBUG_MARKDOWN) {
        const sampleKeys = Object.keys(highlightTheme).slice(0, 3);
        for (const key of sampleKeys) {
          const fn = highlightTheme[key];
          if (typeof fn === "function") {
            const test = fn("test");
            console.log(
              `Theme ${key} function:`,
              test.substring(0, 50),
              "ANSI:",
              test.includes("\x1b["),
            );
          }
        }
      }

      // Pass highlightTheme as second parameter to TerminalRenderer
      // Looking at marked-terminal source: it stores as this.highlightOptions
      // and passes to cli-highlight as: highlightCli(code, { language, ...hightlightOpts })
      // Pass highlightTheme - cli-highlight expects theme nested under 'theme' key
      // Wrapping in { theme: {...} } is required for cli-highlight to use the custom theme
      const highlightOpts = { theme: highlightTheme };
      renderer = new TerminalRenderer(style as any, highlightOpts);

      if (process.env.DEBUG_MARKDOWN) {
        console.log(
          "Created TerminalRenderer with highlightTheme (wrapped in { theme: {...} })",
        );
        console.log("Theme keys:", Object.keys(highlightTheme));
      }
    } else {
      renderer = new TerminalRenderer(style as any);
      if (process.env.DEBUG_MARKDOWN) {
        console.log("Created TerminalRenderer without highlightTheme");
      }
    }

    // Set the renderer as the default for marked
    marked.setOptions({
      renderer: renderer,
    });
  }

  /**
   * Set markdown content
   * @param str - Markdown string to render
   */
  setMarkdown(str: string): void {
    // Ensure TerminalRenderer is set before parsing
    // This is critical - without it, marked will use the default HTML renderer
    this._setMarkdownOptions(this.options.markdownStyle);

    // Trim the input to remove leading/trailing whitespace
    const trimmed = str.trim();
    const rendered = marked.parse(trimmed);
    // marked.parse() can return a string or Promise<string> depending on version
    const content = typeof rendered === "string" ? rendered : String(rendered);
    this.setContent(content);
  }

  /**
   * Set markdown options (for blessed-contrib compatibility)
   * @param style - Style options for marked-terminal
   */
  setOptions(style?: MarkdownStyle): void {
    this._setMarkdownOptions(style);
  }

  /**
   * Get options prototype (for blessed-contrib compatibility)
   */
  getOptionsPrototype(): MarkdownOptions {
    return {
      markdown: "string",
      markdownStyle: {},
    };
  }
}

export default Markdown;
