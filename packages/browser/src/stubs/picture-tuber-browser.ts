/**
 * Browser stub for the Node/stream-based {@link https://www.npmjs.com/package/picture-tuber picture-tuber} package.
 *
 * `@gavin-lynch/unblessed-core` statically imports `picture-tuber` for the Picture widget. The real package uses
 * `charm`, Node `stream.Stream`, PNG decoders (`fs`/zlib variants), etc., which breaks Vite's browser graph.
 *
 * This factory matches the callable default export Picture expects; it rejects on `end()` so the widget falls
 * back to its built-in ASCII placeholder (`Picture.setImage` catch block).
 */

import EventEmitter from "events";

/** Minimal Writable-like façade used only when someone instantiates Picture in the browser. */
export default function pictureTuberBrowserStub(_opts?: { cols?: number }) {
  const emitter = new EventEmitter();
  Object.assign(emitter, {
    write(): void {},
    end(): void {
      queueMicrotask(() => {
        emitter.emit(
          "error",
          new Error(
            "picture-tuber is unavailable in browser builds (stub module)",
          ),
        );
      });
    },
  });

  return emitter;
}
