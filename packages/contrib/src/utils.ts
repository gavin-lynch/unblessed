/**
 * utils.ts - Utility functions for contrib widgets
 *
 * Based on blessed-contrib's utils.js
 */

import type { ColorInput } from "@unblessed/core";
import {
  getColorCode as getColorCodeNew,
  toColorTag as toColorTagNew,
} from "./color-utils.js";

/**
 * Recursively merge properties of two objects
 */
export function mergeRecursive<T extends object, U extends object>(
  obj1: T | null | undefined,
  obj2: U | null | undefined,
): T & U {
  if (obj1 == null) {
    return obj2 as T & U;
  }
  if (obj2 == null) {
    return obj1 as T & U;
  }

  const result = { ...obj1 } as Record<string, unknown>;

  for (const p in obj2) {
    if (Object.prototype.hasOwnProperty.call(obj2, p)) {
      try {
        const val = obj2[p as keyof U];
        // Property in destination object set; update its value
        if (val !== null && typeof val === "object" && !Array.isArray(val)) {
          result[p] = mergeRecursive(result[p] as object | null, val as object);
        } else {
          result[p] = val;
        }
      } catch {
        // Property in destination object not set; create it and set its value
        result[p] = obj2[p as keyof U];
      }
    }
  }

  return result as T & U;
}

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
export function abbreviateNumber(value: number | string): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (numValue >= 1000) {
    const suffixes = ["", "k", "m", "b", "t"];
    const suffixNum = Math.floor(String(numValue).length / 3);
    let shortValue = "";

    for (let precision = 2; precision >= 1; precision--) {
      shortValue = parseFloat(
        (suffixNum !== 0
          ? numValue / Math.pow(1000, suffixNum)
          : numValue
        ).toPrecision(precision),
      ).toString();

      const dotLessShortValue = shortValue.replace(/[^a-zA-Z0-9]+/g, "");
      if (dotLessShortValue.length <= 2) {
        break;
      }
    }

    return shortValue + suffixes[suffixNum];
  }

  return String(numValue);
}

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

export function getInnerBoxSize(widget: {
  width: number;
  height: number;
  border?: unknown;
}): { innerWidthChars: number; innerHeightChars: number } {
  const borderSize = widget.border ? 2 : 0;
  return {
    innerWidthChars: Math.max(1, Math.floor(widget.width - borderSize)),
    innerHeightChars: Math.max(1, Math.floor(widget.height - borderSize)),
  };
}

export function truncateAnsiLines(frame: string, maxWidth: number): string {
  const ansiRegex = new RegExp("\\x1b\\[[0-9;]*[A-Za-z]", "g");
  const lines = frame.split("\n");
  const truncatedLines = lines.map((line) => {
    const visibleChars = line.replace(ansiRegex, "").length;
    if (visibleChars <= maxWidth) return line;
    let result = "";
    let visibleCount = 0;
    let i = 0;
    while (i < line.length && visibleCount < maxWidth) {
      if (line[i] === "\x1b" && line[i + 1] === "[") {
        const end = line.indexOf("m", i);
        if (end !== -1) {
          result += line.substring(i, end + 1);
          i = end + 1;
          continue;
        }
      }
      result += line[i];
      visibleCount++;
      i++;
    }
    result += "\x1b[39m\x1b[49m";
    return result;
  });
  return truncatedLines.join("\n");
}

export default {
  mergeRecursive,
  getTypeName,
  abbreviateNumber,
  getColorCode,
  toColorTag,
  getInnerBoxSize,
  truncateAnsiLines,
};
