import { resolve } from "path";
import { defineConfig } from "vite";
import blessedBrowser from "./dist/vite-plugin/index.js";

export default defineConfig({
  root: resolve(__dirname, "example"),
  plugins: [blessedBrowser()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "example/index.html"),
        tree: resolve(__dirname, "example/tree.html"),
        charm: resolve(__dirname, "example/charm.html"),
      },
    },
  },
  server: {
    port: 8080,
  },
  resolve: {
    alias: {
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
      "@gavin-lynch/unblessed-core": resolve(
        __dirname,
        "../core/dist/index.js",
      ),
      "@gavin-lynch/unblessed-theme": resolve(
        __dirname,
        "../theme/dist/index.js",
      ),
      "@gavin-lynch/unblessed-contrib": resolve(
        __dirname,
        "../contrib/dist/index.js",
      ),
    },
  },
});
