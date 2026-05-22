#!/usr/bin/env node

/**
 * Post-processing script to fix MDX issues in TypeDoc-generated markdown files.
 *
 * MDX interprets `{...}` as JavaScript expressions. This script escapes curly
 * braces in prose sections while leaving fenced code blocks unchanged.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.join(__dirname, "../docs/api/generated");

/**
 * Escape `{` and `}` outside fenced code blocks for MDX compatibility.
 */
function escapeBracesOutsideCodeBlocks(content) {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return parts
    .map((part) => {
      if (part.startsWith("```")) {
        return part;
      }

      return part.replace(/(?<!\\)\{/g, "\\{").replace(/(?<!\\)\}/g, "\\}");
    })
    .join("");
}

function fixMdxInFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const newContent = escapeBracesOutsideCodeBlocks(content);

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, "utf8");
    console.log(`✓ Fixed: ${path.relative(DOCS_DIR, filePath)}`);
    return true;
  }

  return false;
}

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let fixedCount = 0;

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      fixedCount += processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      if (fixMdxInFile(fullPath)) {
        fixedCount++;
      }
    }
  }

  return fixedCount;
}

console.log("🔧 Fixing MDX issues in generated documentation...\n");

if (!fs.existsSync(DOCS_DIR)) {
  console.error(`❌ Directory not found: ${DOCS_DIR}`);
  console.error('   Run "pnpm build:api" first to generate documentation.');
  process.exit(1);
}

const fixedCount = processDirectory(DOCS_DIR);

console.log(`\n✨ Done! Fixed ${fixedCount} file(s).`);
