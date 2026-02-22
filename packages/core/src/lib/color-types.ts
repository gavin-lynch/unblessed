/**
 * color-types.ts - Unified color type system
 *
 * Provides type definitions for color handling across the entire codebase.
 * Supports all input formats and normalized internal representation.
 */

/**
 * Color input formats - all supported ways to specify a color
 */
export type ColorInput =
  | string // Color name ("red", "blue") or hex ("#ff0000")
  | number // 256-color code (0-255)
  | [number, number, number] // RGB tuple [r, g, b]
  | number[]; // RGB array (will be validated to have 3 elements)

/**
 * Color mode - terminal color capabilities
 */
export type ColorMode = "16" | "256" | "truecolor";

/**
 * Target mode for color output.
 * - "auto" selects the best supported mode at runtime.
 * - "8" and "none" allow explicit downgrade for compatibility output.
 */
export type ColorTargetMode = "auto" | ColorMode | "8" | "none";

/**
 * Compatibility profiles for deterministic legacy output.
 */

/**
 * Normalized color representation
 * Internal format used throughout the system
 */
export interface Color {
  /** Color mode: 16-color, 256-color, or truecolor */
  mode: ColorMode;
  /** Color value: name/index for 16/256, RGB array for truecolor */
  value: string | number | [number, number, number];
  /** Original input (for debugging/preservation) */
  original: ColorInput;
}

/**
 * Color with mode preference
 * Allows specifying preferred color mode (may fallback if not supported)
 */
export interface ColorWithMode extends Color {
  /** Preferred mode (may fallback if not supported) */
  preferredMode?: ColorMode;
}
