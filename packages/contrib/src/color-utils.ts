/**
 * color-utils.ts - Contrib color utilities
 *
 * Wraps core color system for contrib widgets.
 */

import {
  resolveColor,
  type ColorCapabilities,
  type ColorInput,
} from "@gavin-lynch/unblessed-core";

export interface ColorResolveOptions {
  targetMode?: "auto" | "truecolor" | "256" | "16" | "8" | "none";
  capabilities?: ColorCapabilities;
}

/**
 * Get color code
 * Preserves RGB arrays for truecolor, uses x256 for 256-color fallback
 *
 * @param color - Color input
 * @param capabilities - Terminal capabilities (auto-detected if not provided)
 * @returns Color code: RGB array for truecolor, 256-color code for 256-color, or original format
 */
export function getColorCode(
  color: ColorInput,
  capabilities?: ColorCapabilities,
  options: ColorResolveOptions = {},
): string | number | number[] {
  const resolved = resolveColor(color, {
    ...options,
    capabilities,
  });

  if (resolved.mode === "truecolor" && Array.isArray(resolved.value)) {
    return resolved.value;
  }

  if (resolved.mode === "none") {
    return "default";
  }

  if (typeof resolved.value === "number") {
    return resolved.value;
  }

  return resolved.original;
}

/**
 * Convert to blessed tag format
 * Uses x256 for 256-color fallback
 *
 * @param color - Color input
 * @param capabilities - Terminal capabilities (auto-detected if not provided)
 * @returns Color tag string
 */
export function toColorTag(
  color: ColorInput,
  capabilities?: ColorCapabilities,
  options: ColorResolveOptions = {},
): string {
  const resolved = resolveColor(color, {
    ...options,
    capabilities,
  });

  if (resolved.mode === "none") {
    return "default";
  }

  if (resolved.mode === "truecolor" && Array.isArray(resolved.value)) {
    return String(resolved.value.join(","));
  }

  if (typeof resolved.value === "number") {
    return String(resolved.value);
  }

  return String(resolved.original);
}
