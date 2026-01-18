/**
 * markdown.ts - Markdown rendering widget
 *
 * Displays markdown content with terminal formatting.
 * Requires optional peer dependencies: marked, marked-terminal
 *
 * Based on blessed-contrib's markdown.js
 */

import { Box, type BoxOptions } from "@unblessed/core";

// Dynamic imports for optional dependencies (use any for optional deps)
let marked: any = null;
let TerminalRenderer: any = null;
let chalk: any = null;

// Helper to dynamically import a module by name
async function tryImport(moduleName: string): Promise<any> {
  try {
    // Using Function constructor to avoid static analysis
    const importFn = new Function("m", "return import(m)");
    return await importFn(moduleName);
  } catch {
    return null;
  }
}

// Try to load optional dependencies
async function loadDependencies(): Promise<boolean> {
  try {
    if (!marked) {
      const markedMod = await tryImport("marked");
      if (markedMod) marked = markedMod;
    }
    if (!TerminalRenderer) {
      const markedTerminal = await tryImport("marked-terminal");
      if (markedTerminal) TerminalRenderer = markedTerminal.default || markedTerminal;
    }
    if (!chalk) {
      const chalkModule = await tryImport("chalk");
      if (chalkModule) chalk = chalkModule.default || chalkModule;
    }
    return !!(marked && TerminalRenderer);
  } catch {
    return false;
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
 * Markdown options
 */
export interface MarkdownOptions extends BoxOptions {
  /** Initial markdown content */
  markdown?: string;
  /** Markdown style options */
  markdownStyle?: MarkdownStyle;
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
  private _dependenciesLoaded = false;
  private _pendingMarkdown: string | null = null;

  constructor(options: MarkdownOptions = {}) {
    super(options);
    this.options = options;

    // Initialize markdown rendering
    this._initMarkdown(options);
  }

  private async _initMarkdown(options: MarkdownOptions): Promise<void> {
    this._dependenciesLoaded = await loadDependencies();

    if (this._dependenciesLoaded && options.markdownStyle) {
      this._evalStyles(options.markdownStyle);
      this._setMarkdownOptions(options.markdownStyle);
    }

    if (options.markdown) {
      await this.setMarkdown(options.markdown);
    }

    // Process any pending markdown
    if (this._pendingMarkdown) {
      await this.setMarkdown(this._pendingMarkdown);
      this._pendingMarkdown = null;
    }
  }

  /**
   * Evaluate chalk style strings into functions
   */
  private _evalStyles(style: MarkdownStyle): void {
    if (!chalk) return;

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
   * Set marked options with terminal renderer
   */
  private _setMarkdownOptions(style?: MarkdownStyle): void {
    if (!marked || !TerminalRenderer) return;

    marked.setOptions({
      renderer: new TerminalRenderer(style as any),
    });
  }

  /**
   * Set markdown content
   * @param str - Markdown string to render
   */
  async setMarkdown(str: string): Promise<void> {
    if (!this._dependenciesLoaded) {
      // Dependencies not loaded yet, queue the markdown
      this._pendingMarkdown = str;

      // Try loading again
      this._dependenciesLoaded = await loadDependencies();

      if (!this._dependenciesLoaded) {
        // Fallback: display raw markdown
        this.setContent(str);
        return;
      }
    }

    if (!marked) {
      this.setContent(str);
      return;
    }

    const rendered = await marked.parse(str);
    this.setContent(rendered);
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
