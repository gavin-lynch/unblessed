import type { ConfigureWebpackUtils, Plugin } from "@docusaurus/types";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Docusaurus client bundle imports `@gavin-lynch/unblessed-browser`, which re-exports all of
 * `@gavin-lynch/unblessed-core`. Some widgets pull Node-only transitive deps (markdown/picture/etc.).
 * Rspack/webpack must be able to resolve those modules for the client build.
 */
export default function browserPolyfillsPlugin(): Plugin {
  const shimsDir = path.join(__dirname, "shims");
  const emptyShim = path.join(shimsDir, "empty.cjs");
  const supportsColorShim = path.join(shimsDir, "supports-color.cjs");
  const supportsColorsShim = path.join(shimsDir, "supports-colors.cjs");
  const cliHighlightShim = path.join(shimsDir, "cli-highlight.cjs");
  const markedTerminalShim = path.join(shimsDir, "marked-terminal.cjs");
  const pictureTuberShim = path.join(shimsDir, "picture-tuber.cjs");
  const osShim = path.join(shimsDir, "os.cjs");
  const ttyShim = path.join(shimsDir, "tty.cjs");

  return {
    name: "docusaurus-browser-polyfills",
    configureWebpack(_config, isServer, utils: ConfigureWebpackUtils) {
      if (isServer) {
        return {};
      }

      const Bundler = utils.currentBundler.instance;

      const processBrowserPath = path.join(
        path.dirname(require.resolve("process/package.json")),
        "browser.js",
      );

      return {
        resolve: {
          fallback: {
            assert: require.resolve("assert/"),
            buffer: require.resolve("buffer/"),
            path: require.resolve("path-browserify"),
            stream: require.resolve("stream-browserify"),
            util: require.resolve("util/"),
            process: processBrowserPath,
            fs: emptyShim,
            zlib: emptyShim,
            os: osShim,
            tty: ttyShim,
          },
          alias: {
            "node:process": processBrowserPath,
            "node:os": osShim,
            "node:tty": ttyShim,
            "supports-color": supportsColorShim,
            "cli-highlight": cliHighlightShim,
            "marked-terminal": markedTerminalShim,
            "picture-tuber": pictureTuberShim,
            "chalk/source/vendor/supports-color/index.js": supportsColorShim,
          },
        },
        plugins: [
          new Bundler.NormalModuleReplacementPlugin(
            /^node:process$/,
            processBrowserPath,
          ),
          new Bundler.NormalModuleReplacementPlugin(
            /[/\\]@colors[/\\]colors[/\\]lib[/\\]system[/\\]supports-colors\.js$/,
            supportsColorsShim,
          ),
          new Bundler.ProvidePlugin({
            process: processBrowserPath,
            Buffer: ["buffer", "Buffer"],
          }),
        ],
      };
    },
  };
}
