#!/usr/bin/env node

/**
 * Publish all packages to npm in dependency order (@gavin-lynch scope).
 *
 * Called by semantic-release during the publish step.
 */

import { execSync } from "child_process";
import { readFileSync } from "fs";

/** npm package name → packages/ directory */
const PUBLISH_ORDER = [
  { name: "@gavin-lynch/unblessed-core", dir: "core" },
  { name: "@gavin-lynch/unblessed-theme", dir: "theme" },
  { name: "@gavin-lynch/unblessed-node", dir: "node" },
  { name: "@gavin-lynch/unblessed-browser", dir: "browser" },
  { name: "@gavin-lynch/unblessed-layout", dir: "layout" },
  { name: "@gavin-lynch/unblessed-contrib", dir: "contrib" },
  { name: "@gavin-lynch/unblessed-react", dir: "react" },
  { name: "@gavin-lynch/unblessed-vrt", dir: "vrt" },
  { name: "@gavin-lynch/unblessed-blessed", dir: "blessed" },
  { name: "@gavin-lynch/unblessed-perf", dir: "perf" },
  { name: "@gavin-lynch/create-unblessed", dir: "create-unblessed" },
];

console.log("\n📦 Publishing @gavin-lynch packages to npm...\n");

let successCount = 0;
let skipCount = 0;

for (const { name, dir } of PUBLISH_ORDER) {
  try {
    const pkgPath = `packages/${dir}/package.json`;
    let pkg;

    try {
      pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    } catch {
      console.log(`  ⏭️  ${name}: package.json not found, skipping`);
      skipCount++;
      continue;
    }

    if (pkg.private) {
      console.log(`  ⏭️  ${name}: private package, skipping`);
      skipCount++;
      continue;
    }

    console.log(`  📤 Publishing ${name}@${pkg.version}...`);

    execSync(
      [
        "pnpm",
        "publish",
        "--filter",
        name,
        "--provenance",
        "--access",
        "public",
        "--no-git-checks",
      ].join(" "),
      {
        stdio: "inherit",
        cwd: process.cwd(),
        env: {
          ...process.env,
          NODE_AUTH_TOKEN: process.env.NPM_TOKEN || process.env.NODE_AUTH_TOKEN,
        },
      },
    );

    console.log(`  ✅ ${name}@${pkg.version} published successfully\n`);
    successCount++;
  } catch (error) {
    console.error(`\n  ❌ Failed to publish ${name}:`);
    console.error(`     ${error.message}\n`);
    process.exit(1);
  }
}

console.log(`\n✨ Publishing complete!`);
console.log(`   Published: ${successCount} packages`);
if (skipCount > 0) {
  console.log(`   Skipped: ${skipCount} packages`);
}
console.log("");

process.exit(0);
