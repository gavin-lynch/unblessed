/**
 * runtime-context.ts - Global runtime context for @gavin-lynch/unblessed-core
 *
 * Provides global access to the platform Runtime.
 * Runtime is stateless (just platform APIs), so safe to share globally.
 *
 * One Runtime per process:
 * - Node.js process → NodeRuntime (all screens share)
 * - Browser tab → BrowserRuntime (all screens share)
 */

import type { Runtime } from "./runtime.js";

// Re-export for convenience
export * from "./runtime.js";

let runtime: Runtime | null = null;

/**
 * Set the global runtime instance
 *
 * Called by platform packages during initialization to register their Runtime implementation.
 * Should be called once before creating any widgets.
 *
 * @internal - Platform packages handle initialization automatically.
 * Users typically don't need to call this directly.
 *
 * Example (platform package):
 *   import { setRuntime } from '@gavin-lynch/unblessed-core';
 *   const runtime = new NodeRuntime();
 *   setRuntime(runtime);
 *
 * @param rt - The Runtime implementation to use globally
 */
export function setRuntime(rt: Runtime): void {
  runtime = rt;
}

/**
 * Get the global runtime
 * Throws if runtime not initialized
 *
 * @internal - Most code should not need to access runtime directly.
 * Platform packages handle initialization via setRuntime().
 */
export function getRuntime(): Runtime {
  if (!runtime) {
    throw new Error(
      "Runtime not initialized. " +
        "Import @gavin-lynch/unblessed-node (Node.js) or @gavin-lynch/unblessed-browser (browser) before creating widgets.\n\n" +
        "Example:\n" +
        "  import { Screen } from '@gavin-lynch/unblessed-node';\n" +
        "  const screen = new Screen();",
    );
  }
  return runtime;
}
