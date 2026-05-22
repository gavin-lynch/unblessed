#!/usr/bin/env node
/**
 * Sync repository, author, and homepage fields from project.metadata.json
 * into root and publishable package.json files.
 */

import { readFileSync, writeFileSync } from "fs";
import { globSync } from "glob";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const meta = JSON.parse(
  readFileSync(path.join(root, "project.metadata.json"), "utf8"),
);

const github = `https://github.com/${meta.github.owner}/${meta.github.repo}`;
const githubGit = `${github}.git`;
const issues = `${github}/issues`;
const branch = meta.github.defaultBranch;

function packageDirectory(pkgPath) {
  const rel = path.relative(root, path.dirname(pkgPath)).replace(/\\/g, "/");
  return rel === "." ? undefined : rel;
}

function updatePackageJson(pkgPath) {
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  const dir = packageDirectory(pkgPath);

  pkg.author = meta.author;
  pkg.repository = {
    type: "git",
    url: githubGit,
    ...(dir ? { directory: dir } : {}),
  };
  pkg.bugs = { url: issues };
  pkg.homepage = dir
    ? `${github}/tree/${branch}/${dir}`
    : github;

  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log(`  ✓ ${path.relative(root, pkgPath)}`);
}

const targets = [
  path.join(root, "package.json"),
  ...globSync("packages/*/package.json", { cwd: root, absolute: true }),
];

console.log("\nSyncing project metadata...\n");
for (const pkgPath of targets) {
  updatePackageJson(pkgPath);
}
console.log("\nDone.\n");
