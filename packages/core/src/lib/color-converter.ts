/**
 * color-converter.ts - Unified color conversion system
 *
 * Converts any color input format to normalized Color objects and various output formats.
 * Automatically selects optimal color mode based on terminal capabilities.
 */

import {
  detectColorCapabilities,
  getOptimalColorMode,
  type ColorCapabilities,
} from "./color-capabilities.js";
import type { Color, ColorInput, ColorMode } from "./color-types.js";
import colors from "./colors.js";

// Re-export ColorInput for convenience
export type { ColorInput } from "./color-types.js";

/**
 * Clamp and round RGB values to integers 0-255
 */
function clampRGB(r: number, g: number, b: number): [number, number, number] {
  return [
    Math.max(0, Math.min(255, Math.round(r))),
    Math.max(0, Math.min(255, Math.round(g))),
    Math.max(0, Math.min(255, Math.round(b))),
  ];
}

/**
 * Convert any color input to normalized Color object
 * Automatically selects best color mode based on terminal capabilities
 *
 * @param input - Color input (string, number, or RGB array)
 * @param preferredMode - Preferred color mode (may fallback if not supported)
 * @param capabilities - Terminal capabilities (auto-detected if not provided)
 * @returns Normalized Color object
 */
export function normalizeColor(
  input: ColorInput,
  preferredMode?: ColorMode,
  capabilities?: ColorCapabilities,
): Color {
  const caps = capabilities || detectColorCapabilities();
  const optimalMode = preferredMode || getOptimalColorMode();

  // Handle RGB arrays/tuples
  if (Array.isArray(input) && input.length === 3) {
    // Validate it's actually a 3-element array
    const arr = input as [number, number, number] | number[];
    if (arr.length !== 3) {
      // Invalid array length, fallback to default
      return {
        mode: "16",
        value: 0,
        original: input,
      };
    }
    const [r, g, b] = arr;
    if (
      typeof r === "number" &&
      typeof g === "number" &&
      typeof b === "number"
    ) {
      const rgb = clampRGB(r, g, b);

      // Use truecolor if supported and preferred
      if (
        (optimalMode === "truecolor" || preferredMode === "truecolor") &&
        caps.supportsTruecolor
      ) {
        return {
          mode: "truecolor",
          value: rgb,
          original: input,
        };
      }

      // Fallback to 256-color
      if (caps.supports256) {
        const index = colors.match(rgb);
        return {
          mode: "256",
          value: index,
          original: input,
        };
      }

      // Fallback to 16-color
      const index = colors.match(rgb);
      return {
        mode: "16",
        value: index < 16 ? index : index % 16,
        original: input,
      };
    }
  }

  // Handle hex strings
  if (typeof input === "string" && input.startsWith("#")) {
    const rgb = colors.hexToRGB(input);
    return normalizeColor(rgb, preferredMode, caps);
  }

  // Handle color names (16-color)
  if (typeof input === "string") {
    const converted = colors.convert(input);
    if (converted !== 0x1ff && converted < 16) {
      return {
        mode: "16",
        value: converted,
        original: input,
      };
    }
    // Try 256-color
    if (caps.supports256 && converted !== 0x1ff) {
      return {
        mode: "256",
        value: converted,
        original: input,
      };
    }
    // Default to 16-color
    return {
      mode: "16",
      value: 0,
      original: input,
    };
  }

  // Handle 256-color codes
  if (typeof input === "number") {
    if (input >= 0 && input < 256) {
      const mode: ColorMode = caps.supports256 ? "256" : "16";
      return {
        mode,
        value: input < 16 && mode === "16" ? input : input,
        original: input,
      };
    }
  }

  // Default fallback
  return {
    mode: "16",
    value: 0,
    original: input,
  };
}

/**
 * Convert color to 256-color index
 * Uses colors.match() algorithm (core's standard)
 *
 * @param color - Color input
 * @returns 256-color index (0-255)
 */
export function to256Color(color: ColorInput): number {
  if (Array.isArray(color) && color.length === 3) {
    const rgb = clampRGB(
      color[0] as number,
      color[1] as number,
      color[2] as number,
    );
    return colors.match(rgb);
  }
  if (typeof color === "string") {
    return colors.convert(color);
  }
  if (typeof color === "number") {
    return color >= 0 && color < 256 ? color : 0;
  }
  return 0;
}

/**
 * Convert color to RGB array [r, g, b]
 * Clamps and rounds to integers 0-255
 *
 * @param color - Color input
 * @returns RGB array [r, g, b]
 */
export function toRGB(color: ColorInput): [number, number, number] {
  if (Array.isArray(color) && color.length === 3) {
    return clampRGB(color[0] as number, color[1] as number, color[2] as number);
  }
  if (typeof color === "string" && color.startsWith("#")) {
    return colors.hexToRGB(color) as [number, number, number];
  }
  // For color names and numbers, convert to RGB via color palette
  // This is approximate - we'd need the actual RGB values from the palette
  // For now, return a default
  if (typeof color === "string" || typeof color === "number") {
    const index = to256Color(color);
    // Approximate RGB from 256-color index
    // This is a simplified conversion
    if (index < 16) {
      // Basic 16 colors - return approximate RGB
      const basicColors: [number, number, number][] = [
        [0, 0, 0], // black
        [128, 0, 0], // red
        [0, 128, 0], // green
        [128, 128, 0], // yellow
        [0, 0, 128], // blue
        [128, 0, 128], // magenta
        [0, 128, 128], // cyan
        [192, 192, 192], // white
        [128, 128, 128], // bright black
        [255, 0, 0], // bright red
        [0, 255, 0], // bright green
        [255, 255, 0], // bright yellow
        [0, 0, 255], // bright blue
        [255, 0, 255], // bright magenta
        [0, 255, 255], // bright cyan
        [255, 255, 255], // bright white
      ];
      return basicColors[index] || [0, 0, 0];
    }
    // For 256-color, use standard palette conversion
    // This is approximate - full conversion would require palette lookup
    const r = ((index - 16) / 36) % 6;
    const g = ((index - 16) / 6) % 6;
    const b = (index - 16) % 6;
    return [
      r === 0 ? 0 : Math.round(55 + r * 40),
      g === 0 ? 0 : Math.round(55 + g * 40),
      b === 0 ? 0 : Math.round(55 + b * 40),
    ];
  }
  return [0, 0, 0];
}

/**
 * Convert color to ANSI escape code
 * Automatically uses best mode for terminal
 *
 * @param color - Color input
 * @param type - Foreground or background
 * @param capabilities - Terminal capabilities (auto-detected if not provided)
 * @returns ANSI escape code string
 */
export function toAnsiCode(
  color: ColorInput,
  type: "fg" | "bg",
  capabilities?: ColorCapabilities,
): string {
  // Handle "normal"/"default" as explicit resets.
  if (color === ("normal" as any) || color === ("default" as any)) {
    return type === "fg" ? "\x1b[39m" : "\x1b[49m";
  }

  const normalized = normalizeColor(color, undefined, capabilities);

  // Truecolor mode
  if (normalized.mode === "truecolor" && Array.isArray(normalized.value)) {
    const [r, g, b] = normalized.value;
    return type === "fg"
      ? `\x1b[38;2;${r};${g};${b}m`
      : `\x1b[48;2;${r};${g};${b}m`;
  }

  // 256-color mode
  if (normalized.mode === "256" && typeof normalized.value === "number") {
    return type === "fg"
      ? `\x1b[38;5;${normalized.value}m`
      : `\x1b[48;5;${normalized.value}m`;
  }

  // 16-color mode
  if (normalized.mode === "16" && typeof normalized.value === "number") {
    const code = normalized.value;
    if (code < 8) {
      // Standard colors
      return type === "fg" ? `\x1b[3${code}m` : `\x1b[4${code}m`;
    } else {
      // Bright colors
      return type === "fg" ? `\x1b[9${code - 8}m` : `\x1b[10${code - 8}m`;
    }
  }

  // Default reset
  return type === "fg" ? "\x1b[39m" : "\x1b[49m";
}

/**
 * Convert color to normalized cell format
 * Returns both attr and truecolor values for use in createCell()
 *
 * @param color - Color input
 * @param type - Foreground or background
 * @param capabilities - Terminal capabilities (auto-detected if not provided)
 * @returns Object with attr (packed attribute) and truecolor (RGB array or null)
 */
export function toCellColor(
  color: ColorInput,
  type: "fg" | "bg",
  capabilities?: ColorCapabilities,
): {
  attr: number; // Packed attribute (for 16/256-color)
  truecolor: [number, number, number] | null; // RGB array or null
} {
  const normalized = normalizeColor(color, undefined, capabilities);

  // Truecolor mode
  if (normalized.mode === "truecolor" && Array.isArray(normalized.value)) {
    return {
      attr: type === "fg" ? 0x1ff << 9 : 0x1ff, // Default attr (truecolor takes precedence)
      truecolor: normalized.value,
    };
  }

  // 256-color or 16-color mode
  if (typeof normalized.value === "number") {
    const index = normalized.value;
    return {
      attr: type === "fg" ? (index & 0x1ff) << 9 : index & 0x1ff, // Pack into attr
      truecolor: null,
    };
  }

  // Default
  return {
    attr: type === "fg" ? 0x1ff << 9 : 0x1ff,
    truecolor: null,
  };
}
