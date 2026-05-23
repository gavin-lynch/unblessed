#!/usr/bin/env tsx
/**
 * Markdown terminal formatting example
 *
 * Demonstrates that marked-terminal actually applies terminal formatting
 * (colors, styles) vs just plain text. This shows the difference between
 * HTML output and terminal-formatted output.
 *
 * Requires: marked, marked-terminal, chalk (peer dependencies)
 */

import { Screen } from "@gavin-lynch/unblessed-node";
import chalk from "chalk";
import { Markdown } from "../src/widgets/markdown.js";

const screen = new Screen({ smartCSR: true });

const markdown = new Markdown({
  parent: screen,
  width: "100%",
  height: "100%",
  // Don't use label - it might interfere with content
  // label: "Markdown Terminal Formatting",
  // Custom styles to make formatting differences obvious
  markdownStyle: {
    firstHeading: chalk.red.bold,
    heading: chalk.yellow.bold,
    strong: chalk.cyan.bold,
    em: chalk.green.italic,
    code: chalk.magenta,
    codespan: chalk.blue,
    link: chalk.underline.cyan,
  },
  // Better syntax highlighting colors
  // Use chalk functions directly - these work better than arrays
  highlightTheme: {
    keyword: chalk.cyan.bold, // function, const, let, return - cyan bold
    built_in: chalk.yellow.bold, // console, Math, etc. - yellow bold
    string: chalk.green, // string literals - green
    number: chalk.magenta, // number literals - magenta
    comment: chalk.gray.italic, // comments - gray italic
    default: chalk.white, // default text - white
  },
});

screen.append(markdown);

// Set markdown that demonstrates various formatting
const markdownContent = `# Main Heading (should be red and bold)

## Subheading (should be yellow and bold)

This is **bold text** (should be cyan) and this is *italic text* (should be green).

Here's some \`inline code\` (should be blue) and a code block:

\`\`\`javascript
function hello() {
  console.log("This should be magenta");
}
\`\`\`

- [x] Checked checkbox
- [ ] Unchecked checkbox
- Regular list item

> This is a blockquote
> It should have special formatting

Here's a [link](https://example.com) that should be cyan and underlined.

**Without marked-terminal, you'd see HTML like:**
\`<h1>Main Heading</h1><p>This is <strong>bold</strong></p>\`

**With marked-terminal, you see terminal-formatted text with colors and styles!**`;

markdown.setMarkdown(markdownContent);

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});

screen.render();
