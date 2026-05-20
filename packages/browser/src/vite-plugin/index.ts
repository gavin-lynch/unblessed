/**
 * Vite plugin for @unblessed/browser
 *
 * Optional plugin that provides optimized build configuration for @unblessed/browser in Vite projects.
 *
 * NOTE: This plugin is now OPTIONAL and provides minimal optimizations.
 * @unblessed/browser works fine without it since BrowserRuntime handles all polyfills.
 *
 * Usage:
 * ```ts
 * // vite.config.ts
 * import blessedBrowser from '@unblessed/browser/vite-plugin';
 *
 * export default defineConfig({
 *   plugins: [blessedBrowser()]
 * });
 * ```
 */

import path from "path";
import { fileURLToPath } from "url";
import type { Plugin, UserConfig } from "vite";

const vitePluginDir = path.dirname(fileURLToPath(import.meta.url));
const browserStubPath = (...segments: string[]) =>
  path.join(vitePluginDir, "..", "stubs", ...segments);

/** Resolves beside compiled `dist/vite-plugin/` → `dist/stubs/…`. */
export const MARKED_TERMINAL_BROWSER_STUB = browserStubPath(
  "marked-terminal-browser.js",
);
export const PICTURE_TUBER_BROWSER_STUB = browserStubPath(
  "picture-tuber-browser.js",
);

export interface BlessedBrowserPluginOptions {
  /**
   * Whether to optimize dependencies
   * @default true
   */
  optimizeDeps?: boolean;
}

export default function blessedBrowserPlugin(
  options: BlessedBrowserPluginOptions = {},
): Plugin {
  const { optimizeDeps = true } = options;

  return {
    name: "vite-plugin-unblessed-browser",

    config(): UserConfig {
      const optimizeDepsConfig = optimizeDeps
        ? {
            include: [
              "@unblessed/core",
              "@unblessed/contrib",
              "@unblessed/react",
              "react",
              "buffer",
              "events",
              "path-browserify",
            ],
            esbuildOptions: {
              define: {
                global: "globalThis",
              },
            },
          }
        : undefined;

      return {
        resolve: {
          alias: {
            // Core statically imports marked-terminal for the Markdown widget; the real package
            // is Node-only (supports-color/hyperlinks, tty…). Alias to a noop for browser demos.
            "marked-terminal": MARKED_TERMINAL_BROWSER_STUB,
            // Core statically imports picture-tuber for the Picture widget; it pulls charm + Node stream/png stack.
            "picture-tuber": PICTURE_TUBER_BROWSER_STUB,
          },
        },
        optimizeDeps: optimizeDepsConfig,
      };
    },
  };
}

// Named export for convenience
export { blessedBrowserPlugin };
