import { cp } from "fs/promises";
import { defineConfig } from "tsup";

export default defineConfig([
  // Main tui-browser bundle for browser
  {
    // Entry point
    entry: {
      index: "src/index.ts",
      "stubs/marked-terminal-browser": "src/stubs/marked-terminal-browser.ts",
      "stubs/picture-tuber-browser": "src/stubs/picture-tuber-browser.ts",
    },

    // Output formats - browser-friendly
    format: ["esm", "cjs"],

    // Output directory
    outDir: "dist",

    // Platform and target
    platform: "browser",
    target: "es2020",

    // Build options
    bundle: true,
    splitting: false,
    treeshake: false,
    clean: true,
    sourcemap: true,
    dts: true,
    minify: false, // Disable for debugging

    // Define environment variables
    define: {
      "process.env.NODE_ENV": '"production"',
      "process.platform": '"browser"',
      "process.env.TERM": '"xterm-256color"',
      global: "globalThis",
    },

    external: ["xterm"],

    // No Node.js shims (we're targeting browser)
    shims: false,

    // esbuild options for browser optimizations
    esbuildOptions(options) {
      // Prefer ESM builds
      options.mainFields = ["module", "browser", "main"];
      options.conditions = ["import", "module", "browser", "default"];

      // Replace Node.js built-ins with browser polyfills
      options.alias = {
        child_process: "./src/polyfills/empty.ts",
        fs: "./src/polyfills/fs.ts",
        module: "./src/polyfills/module.ts",
        net: "./src/polyfills/empty.ts",
        pngjs: "./src/polyfills/pngjs.ts",
        tty: "./src/polyfills/tty.ts",
        url: "./src/polyfills/url.ts",
        zlib: "./src/polyfills/empty.ts",
        path: "path-browserify",
        stream: "stream-browserify",
        util: "util",
        events: "events",
        buffer: "buffer",
        process: "process",
        string_decoder: "string_decoder",
        assert: "assert",
      };
    },

    onSuccess: async () => {
      console.log("✅ @gavin-lynch/unblessed-browser build complete");
      console.log("📦 Output: dist/index.js (ESM)");
      console.log("📦 Output: dist/index.cjs (CJS)");
    },
  },

  // Vite plugin for Node.js
  {
    entry: {
      "vite-plugin/index": "src/vite-plugin/index.ts",
    },

    format: ["esm"],
    outDir: "dist",
    platform: "node",
    target: "node18",

    bundle: true,
    splitting: true,
    treeshake: true,
    sourcemap: true,
    dts: true,
    minify: true,

    // External Vite
    external: ["vite", "path", "url"],

    onSuccess: async () => {
      await cp("../core/data", "dist/data", { recursive: true });
      console.log("✅ Copied ../core/data/ to dist/data/");
      console.log("✅ @gavin-lynch/unblessed-browser build complete");
      console.log("📦 Output: dist/index.js (ESM)");
      console.log("📦 Output: dist/index.cjs (CJS)");
      console.log("📦 Output: dist/index.cjs (CJS)");
    },
  },
]);
