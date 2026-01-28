/**
 * color-capabilities.ts - Terminal color capability detection
 *
 * Detects terminal color support and selects optimal color mode.
 */

import { getRuntime } from "../runtime-context.js";
import type { ColorMode } from "./color-types.js";

/**
 * Terminal color capabilities
 */
export interface ColorCapabilities {
  /** Maximum color depth: 4 (16), 8 (256), or 24 (truecolor) */
  maxDepth: 4 | 8 | 24;
  /** Supports 16-color mode */
  supports16: boolean;
  /** Supports 256-color mode */
  supports256: boolean;
  /** Supports truecolor (24-bit RGB) */
  supportsTruecolor: boolean;
}

let cachedCapabilities: ColorCapabilities | null = null;

/**
 * Detect terminal color capabilities
 * Checks environment variables and terminal type
 *
 * @returns Color capabilities object
 */
export function detectColorCapabilities(): ColorCapabilities {
  // Return cached result if available
  if (cachedCapabilities) {
    return cachedCapabilities;
  }

  const runtime = getRuntime();
  const env = runtime.process.env;

  // Check COLORTERM for truecolor support
  const colorTerm = env.COLORTERM || "";
  const supportsTruecolor =
    colorTerm.includes("truecolor") ||
    colorTerm.includes("24bit") ||
    colorTerm === "24-bit";

  // Check TERM for 256-color support
  const term = env.TERM || "";
  const supports256 =
    term.includes("256") ||
    term.includes("xterm") ||
    term.includes("screen") ||
    term.includes("tmux") ||
    supportsTruecolor; // Truecolor implies 256-color

  // All terminals support 16-color (basic ANSI)
  const supports16 = true;

  // Determine max depth
  let maxDepth: 4 | 8 | 24 = 8; // Default to 256-color
  if (supportsTruecolor) {
    maxDepth = 24;
  } else if (supports256) {
    maxDepth = 8;
  } else {
    maxDepth = 4;
  }

  const capabilities: ColorCapabilities = {
    maxDepth,
    supports16,
    supports256,
    supportsTruecolor,
  };

  // Cache the result
  cachedCapabilities = capabilities;

  return capabilities;
}

/**
 * Get optimal color mode for current terminal
 * Automatically selects best supported mode
 *
 * @returns Optimal color mode
 */
export function getOptimalColorMode(): ColorMode {
  const capabilities = detectColorCapabilities();

  if (capabilities.supportsTruecolor) {
    return "truecolor";
  } else if (capabilities.supports256) {
    return "256";
  } else {
    return "16";
  }
}

/**
 * Reset cached capabilities (for testing)
 */
export function resetCapabilitiesCache(): void {
  cachedCapabilities = null;
}
