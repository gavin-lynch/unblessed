import { resolve } from "path";
import { defineConfig } from "vite";
import blessedBrowser from "./dist/vite-plugin/index.js";

const aliases = {
  "@gavin-lynch/unblessed-core/data/terminfo/xterm-256color.json": resolve(
    __dirname,
    "../core/dist/data/terminfo/xterm-256color.json",
  ),
  "@gavin-lynch/unblessed-core/data/fonts/ter-u14n.json": resolve(
    __dirname,
    "../core/dist/data/fonts/ter-u14n.json",
  ),
  "@gavin-lynch/unblessed-core/data/fonts/ter-u14b.json": resolve(
    __dirname,
    "../core/dist/data/fonts/ter-u14b.json",
  ),
  "@gavin-lynch/unblessed-core": resolve(__dirname, "../core/dist/index.js"),
  "@gavin-lynch/unblessed-theme": resolve(__dirname, "../theme/dist/index.js"),
  "@gavin-lynch/unblessed-contrib": resolve(
    __dirname,
    "../contrib/dist/index.js",
  ),
};

/**
 * Vite config for Playwright E2E tests.
 * Serves fixture HTML from the package root (not example/) so paths like
 * /__tests__/e2e/fixtures/basic-box.html resolve correctly.
 */
export default defineConfig({
  root: resolve(__dirname),
  plugins: [blessedBrowser({ optimizeDeps: false })],
  server: {
    port: 8080,
    fs: {
      allow: [resolve(__dirname, "..")],
    },
  },
  resolve: {
    alias: aliases,
  },
});
