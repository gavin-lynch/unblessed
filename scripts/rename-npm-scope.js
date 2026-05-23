#!/usr/bin/env node
/**
 * Rename @unblessed/* → @gavin-lynch/unblessed-* across the monorepo.
 * Run from repo root: node scripts/rename-npm-scope.js
 * Then: pnpm install
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

/** Old scoped name → new scoped name (order: longest suffix first avoids collisions) */
const RENAMES = [
  ["@unblessed/create-unblessed", "@gavin-lynch/create-unblessed"],
  ["@unblessed/contrib", "@gavin-lynch/unblessed-contrib"],
  ["@unblessed/browser", "@gavin-lynch/unblessed-browser"],
  ["@unblessed/blessed", "@gavin-lynch/unblessed-blessed"],
  ["@unblessed/layout", "@gavin-lynch/unblessed-layout"],
  ["@unblessed/react", "@gavin-lynch/unblessed-react"],
  ["@unblessed/theme", "@gavin-lynch/unblessed-theme"],
  ["@unblessed/perf", "@gavin-lynch/unblessed-perf"],
  ["@unblessed/core", "@gavin-lynch/unblessed-core"],
  ["@unblessed/node", "@gavin-lynch/unblessed-node"],
  ["@unblessed/vrt", "@gavin-lynch/unblessed-vrt"],
];

const EXCLUDE_DIRS = [
  "node_modules",
  ".git",
  "dist",
  ".turbo",
  ".docusaurus",
  ".playwright-mcp",
  "build",
  "coverage",
];

function shouldSkip(filePath) {
  const parts = filePath.split(path.sep);
  return EXCLUDE_DIRS.some((d) => parts.includes(d));
}

function listFiles() {
  const out = execSync(
    `git ls-files -z`,
    { cwd: root, encoding: "buffer", maxBuffer: 50 * 1024 * 1024 },
  );
  return out
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
    .map((f) => path.join(root, f))
    .filter((f) => !shouldSkip(f));
}

function applyRenames(content) {
  let result = content;
  for (const [from, to] of RENAMES) {
    result = result.split(from).join(to);
  }
  return result;
}

const PACKAGE_NAMES = {
  "packages/core/package.json": "@gavin-lynch/unblessed-core",
  "packages/node/package.json": "@gavin-lynch/unblessed-node",
  "packages/browser/package.json": "@gavin-lynch/unblessed-browser",
  "packages/layout/package.json": "@gavin-lynch/unblessed-layout",
  "packages/react/package.json": "@gavin-lynch/unblessed-react",
  "packages/vrt/package.json": "@gavin-lynch/unblessed-vrt",
  "packages/blessed/package.json": "@gavin-lynch/unblessed-blessed",
  "packages/contrib/package.json": "@gavin-lynch/unblessed-contrib",
  "packages/theme/package.json": "@gavin-lynch/unblessed-theme",
  "packages/perf/package.json": "@gavin-lynch/unblessed-perf",
  "packages/create-unblessed/package.json": "@gavin-lynch/create-unblessed",
};

let changed = 0;
for (const file of listFiles()) {
  try {
    const before = readFileSync(file, "utf8");
    let after = applyRenames(before);

    const rel = path.relative(root, file).replace(/\\/g, "/");
    if (PACKAGE_NAMES[rel]) {
      const pkg = JSON.parse(after);
      if (pkg.name) {
        pkg.name = PACKAGE_NAMES[rel];
        after = `${JSON.stringify(pkg, null, 2)}\n`;
      }
    }

    if (after !== before) {
      writeFileSync(file, after);
      changed++;
    }
  } catch {
    // binary or non-utf8 — skip
  }
}

// project.metadata.json
const metaPath = path.join(root, "project.metadata.json");
const meta = JSON.parse(readFileSync(metaPath, "utf8"));
meta.npm = {
  scope: "@gavin-lynch",
  packagePrefix: "unblessed",
};
writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`);

console.log(`\nRenamed scope in ${changed} files.`);
console.log("Next: pnpm install && pnpm build\n");
