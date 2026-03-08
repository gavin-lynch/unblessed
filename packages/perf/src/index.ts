/**
 * @unblessed/perf - Performance instrumentation for @unblessed rendering
 */

export {
  RenderPerfObserver,
  installRenderPerfObserver,
  removeRenderObserver,
} from "./observer.js";
export type { RenderPerfObserverOptions, RenderPerfStats } from "./observer.js";
export { createPerfOverlay } from "./overlay.js";
export type { PerfOverlayHandle, PerfOverlayOptions } from "./overlay.js";
