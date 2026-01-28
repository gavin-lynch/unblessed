/**
 * color-utils.ts - Contrib color utilities
 *
 * Wraps core color system with blessed-contrib compatibility.
 * Uses x256 for 256-color conversion to match blessed-contrib behavior.
 */

import {
  normalizeColor,
  type ColorCapabilities,
  type ColorInput,
} from "@unblessed/core";
import x256 from "x256";

/**
 * Get color code (blessed-contrib compatible)
 * Preserves RGB arrays for truecolor, uses x256 for 256-color fallback
 *
 * @param color - Color input
 * @param capabilities - Terminal capabilities (auto-detected if not provided)
 * @returns Color code: RGB array for truecolor, 256-color code for 256-color, or original format
 */
export function getColorCode(
  color: ColorInput,
  capabilities?: ColorCapabilities,
): string | number | number[] {
  const normalized = normalizeColor(color, undefined, capabilities);

  // Preserve RGB arrays for truecolor
  if (normalized.mode === "truecolor" && Array.isArray(normalized.value)) {
    return normalized.value;
  }

  // For 256-color, use x256 if input was RGB array (blessed-contrib compatibility)
  if (Array.isArray(normalized.original) && normalized.original.length === 3) {
    const [r, g, b] = normalized.original;
    if (
      typeof r === "number" &&
      typeof g === "number" &&
      typeof b === "number"
    ) {
      // Clamp to integers
      const rInt = Math.max(0, Math.min(255, Math.round(r)));
      const gInt = Math.max(0, Math.min(255, Math.round(g)));
      const bInt = Math.max(0, Math.min(255, Math.round(b)));
      // Use x256 for 256-color conversion (blessed-contrib compatibility)
      return x256(rInt, gInt, bInt);
    }
  }

  // Return normalized value
  if (typeof normalized.value === "number") {
    return normalized.value;
  }
  if (typeof normalized.value === "string") {
    return normalized.value;
  }

  return normalized.original;
}

/**
 * Convert to blessed tag format
 * Uses x256 for 256-color (blessed-contrib compatibility)
 *
 * @param color - Color input
 * @param capabilities - Terminal capabilities (auto-detected if not provided)
 * @returns Color tag string
 */
export function toColorTag(
  color: ColorInput,
  capabilities?: ColorCapabilities,
): string {
  const normalized = normalizeColor(color, undefined, capabilities);

  // For RGB arrays, use x256 for 256-color (blessed-contrib compatibility)
  if (Array.isArray(normalized.original) && normalized.original.length === 3) {
    const [r, g, b] = normalized.original;
    if (
      typeof r === "number" &&
      typeof g === "number" &&
      typeof b === "number"
    ) {
      const rInt = Math.max(0, Math.min(255, Math.round(r)));
      const gInt = Math.max(0, Math.min(255, Math.round(g)));
      const bInt = Math.max(0, Math.min(255, Math.round(b)));
      return String(x256(rInt, gInt, bInt));
    }
  }

  // For numbers, return as string
  if (typeof normalized.value === "number") {
    return String(normalized.value);
  }

  // For strings, return as-is
  if (typeof normalized.value === "string") {
    return normalized.value;
  }

  return String(normalized.original);
}
