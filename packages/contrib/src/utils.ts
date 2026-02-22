/**
 * utils.ts - Utility functions for contrib widgets
 *
 * Based on blessed-contrib's utils.js
 */

import type { ColorInput } from "@unblessed/core";
import {
  abbreviateNumber as coreAbbreviateNumber,
  getInnerBoxSize as coreGetInnerBoxSize,
  mergeRecursive as coreMergeRecursive,
  truncateAnsiLines as coreTruncateAnsiLines,
} from "@unblessed/core";
import {
  getColorCode as getColorCodeNew,
  toColorTag as toColorTagNew,
} from "./color-utils.js";

/**
 * Recursively merge properties of two objects
 */
export const mergeRecursive = coreMergeRecursive;

/**
 * Get type name of a value
 */
export function getTypeName(thing: unknown): string {
  if (thing === null) return "[object Null]";
  return Object.prototype.toString.call(thing);
}

/**
 * Abbreviate a number with k/m/b/t suffix
 *
 * @example
 * abbreviateNumber(1234) // "1.2k"
 * abbreviateNumber(1234567) // "1.2m"
 */
export const abbreviateNumber = coreAbbreviateNumber;

/**
 * Get a color code from a color value
 *
 * Supports:
 * - Color names (e.g., "red", "blue")
 * - RGB arrays (e.g., [255, 0, 0]) - preserved for truecolor, clamped to integers
 * - 256-color codes (e.g., 196)
 * - Hex colors (e.g., "#ff0000")
 *
 * Note: RGB arrays are preserved for truecolor support. For 256-color fallback,
 * uses x256 for blessed-contrib compatibility.
 *
 * @deprecated This function now wraps the unified color system. Consider using
 * getColorCodeNew() directly or the unified color system from @unblessed/core.
 */
export function getColorCode(color: ColorInput): string | number | number[] {
  return getColorCodeNew(color);
}

/**
 * Convert a color to a blessed tag-compatible color string
 *
 * Note: RGB arrays use x256 library to match blessed-contrib behavior exactly.
 *
 * @deprecated This function now wraps the unified color system. Consider using
 * toColorTagNew() directly or the unified color system from @unblessed/core.
 */
export function toColorTag(color: ColorInput): string {
  return toColorTagNew(color);
}

export const getInnerBoxSize = coreGetInnerBoxSize;

export const truncateAnsiLines = coreTruncateAnsiLines;

export default {
  mergeRecursive,
  getTypeName,
  abbreviateNumber,
  getColorCode,
  toColorTag,
  getInnerBoxSize,
  truncateAnsiLines,
};
