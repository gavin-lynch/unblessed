/**
 * utils.ts - Utility functions for contrib widgets
 *
 * Based on blessed-contrib's utils.js
 */

import { colors } from "@unblessed/core";

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
          result[p] = mergeRecursive(
            result[p] as object | null,
            val as object,
          );
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
 * - RGB arrays (e.g., [255, 0, 0])
 * - 256-color codes (e.g., 196)
 * - Hex colors (e.g., "#ff0000")
 */
export function getColorCode(color: string | number | number[]): string | number {
  if (Array.isArray(color) && color.length === 3) {
    return colors.match(color);
  }
  if (typeof color === "string" && color.startsWith("#")) {
    return colors.match(color);
  }
  if (typeof color === "number") {
    return color;
  }
  return color as string;
}

/**
 * Convert a color to a blessed tag-compatible color string
 */
export function toColorTag(color: string | number | number[]): string {
  if (Array.isArray(color) && color.length === 3) {
    return String(colors.match(color));
  }
  if (typeof color === "number") {
    return String(color);
  }
  return String(color);
}

export default {
  mergeRecursive,
  getTypeName,
  abbreviateNumber,
  getColorCode,
  toColorTag,
};
