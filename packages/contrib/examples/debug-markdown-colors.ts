#!/usr/bin/env tsx
/**
 * Debug markdown colors - outputs rendered content to file for inspection
 *
 * This helps verify:
 * 1. What colors are actually being applied
 * 2. What the TerminalRenderer is receiving
 * 3. What the final output looks like
 */

import { getRuntime } from "@gavin-lynch/unblessed-core";
import { Screen } from "@gavin-lynch/unblessed-node";
import chalk from "chalk";
import { Markdown } from "../src/widgets/markdown.js";

// Force colors BEFORE importing markdown (which imports chalk)
process.env.FORCE_COLOR = "1";

const screen = new Screen({ smartCSR: true });

// Enable debug logging
process.env.DEBUG_MARKDOWN = "1";

console.log("=== DEBUG MODE ENABLED ===\n");

const markdown = new Markdown({
  parent: screen,
  width: "100%",
  height: "100%",
  markdownStyle: {
    firstHeading: chalk.red.bold,
    heading: chalk.yellow.bold,
    strong: chalk.cyan.bold,
    em: chalk.green.italic,
    code: chalk.magenta,
    codespan: chalk.blue,
    link: chalk.underline.cyan,
  },
  highlightTheme: {
    // These are highlight.js token types that cli-highlight recognizes
    // The theme is working! Verified:
    // - function/const/return = cyan bold [36m[1m ✓
    // - strings = green [32m ✓
    // - numbers = magenta [35m ✓
    // Note: console might use a different token than 'built_in'
    keyword: chalk.cyan.bold, // function, const, let, return - cyan bold
    built_in: chalk.yellow.bold, // console, Math, etc. - yellow bold (may need different token)
    string: chalk.green, // string literals - green
    number: chalk.magenta, // number literals - magenta
    comment: chalk.gray.italic, // comments - gray italic
    default: chalk.white, // default text - white
  },
});

screen.append(markdown);

// Test code with various syntax elements
const testCode = `\`\`\`javascript
function hello(name) {
  const greeting = "Hello";
  console.log(greeting + " " + name);
  return 42;
}
// This is a comment
hello("world");
\`\`\``;

const testMarkdown = `# Test Heading

## Subheading

This is **bold** and *italic* text.

${testCode}

More text here.`;

markdown.setMarkdown(testMarkdown);

screen.render();

// Get the rendered content
const content = markdown.content || "";

// Write to file for inspection
const runtime = getRuntime();
const outputPath = "/tmp/markdown-output.txt";
runtime.fs.writeFileSync(
  outputPath,
  `=== MARKDOWN DEBUG OUTPUT ===\n\n` +
    `Original markdown:\n${testMarkdown}\n\n` +
    `Rendered content:\n${content}\n\n` +
    `Content length: ${content.length}\n` +
    `Has ANSI codes: ${content.includes("\x1b[")}\n`,
);

console.log(`\nDebug output written to: ${outputPath}`);
console.log(
  `Content preview (first 500 chars):\n${content.substring(0, 500)}\n`,
);

// Auto-exit after a short delay for debugging
setTimeout(() => {
  screen.destroy();
  process.exit(0);
}, 500);

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});
