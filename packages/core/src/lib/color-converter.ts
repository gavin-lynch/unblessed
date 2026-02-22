/**
 * color-converter.ts - Unified color conversion system
 *
 * Converts any color input format to normalized Color objects and various output formats.
 * Automatically selects optimal color mode based on terminal capabilities.
 */

import {
  detectColorCapabilities,
  type ColorCapabilities,
} from "./color-capabilities.js";
import type {
  Color,
  ColorInput,
  ColorMode,
  ColorTargetMode,
} from "./color-types.js";
import colors from "./colors.js";

// Re-export ColorInput for convenience
export type { ColorInput } from "./color-types.js";

export interface ColorResolveOptions {
  targetMode?: ColorTargetMode;
  capabilities?: ColorCapabilities;
}

export interface ResolvedColor {
  mode: ColorMode | "8" | "none";
  value: number | [number, number, number] | null;
  original: ColorInput;
  paletteIndex?: number;
}

const PALETTE_CACHE_LIMIT = 512;
const paletteIndexCache = new Map<string, number>();

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

function resolveTargetMode(
  targetMode: ColorTargetMode | undefined,
  capabilities: ColorCapabilities,
): ColorMode | "8" | "none" {
  if (targetMode === "none" || targetMode === "8") return targetMode;
  if (targetMode && targetMode !== "auto") return targetMode;

  if (capabilities.supportsTruecolor) return "truecolor";
  if (capabilities.supports256) return "256";
  return "16";
}

function resolveRgbFromInput(
  input: ColorInput,
): [number, number, number] | null {
  if (Array.isArray(input) && input.length === 3) {
    return clampRGB(input[0] as number, input[1] as number, input[2] as number);
  }

  if (typeof input === "string") {
    if (input.startsWith("#")) {
      const rgb = colors.hexToRGB(input);
      return clampRGB(rgb[0] as number, rgb[1] as number, rgb[2] as number);
    }

    const idx = colors.convert(input);
    if (idx !== 0x1ff) {
      const rgb = colors.vcolors[idx] as [number, number, number] | undefined;
      if (rgb) return clampRGB(rgb[0], rgb[1], rgb[2]);
    }
  }

  if (typeof input === "number") {
    if (input >= 0 && input < colors.vcolors.length) {
      const rgb = colors.vcolors[input] as [number, number, number] | undefined;
      if (rgb) return clampRGB(rgb[0], rgb[1], rgb[2]);
    }
  }

  return null;
}

function resolvePaletteIndex(input: ColorInput): number | null {
  if (typeof input === "number") {
    return input >= 0 && input < 256 ? input : null;
  }

  if (typeof input === "string") {
    if (input.startsWith("#")) {
      const rgb = resolveRgbFromInput(input);
      if (!rgb) return null;
      const key = `${rgb[0]},${rgb[1]},${rgb[2]}`;
      const cached = paletteIndexCache.get(key);
      if (cached != null) return cached;
      const idx = colors.match(rgb);
      paletteIndexCache.set(key, idx);
      if (paletteIndexCache.size > PALETTE_CACHE_LIMIT) {
        paletteIndexCache.clear();
      }
      return idx;
    }

    const idx = colors.convert(input);
    return idx !== 0x1ff ? idx : null;
  }

  if (Array.isArray(input) && input.length === 3) {
    const rgb = resolveRgbFromInput(input);
    if (!rgb) return null;
    const key = `${rgb[0]},${rgb[1]},${rgb[2]}`;
    const cached = paletteIndexCache.get(key);
    if (cached != null) return cached;
    const idx = colors.match(rgb);
    paletteIndexCache.set(key, idx);
    if (paletteIndexCache.size > PALETTE_CACHE_LIMIT) {
      paletteIndexCache.clear();
    }
    return idx;
  }

  return null;
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
  const optimalMode =
    preferredMode ||
    (caps.supportsTruecolor ? "truecolor" : caps.supports256 ? "256" : "16");

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
 * Resolve a color input into an explicit output mode.
 * Supports explicit downgrade and compatibility profiles.
 */
export function resolveColor(
  input: ColorInput,
  options: ColorResolveOptions = {},
): ResolvedColor {
  if (
    input === ("default" as any) ||
    input === ("normal" as any) ||
    input === ("bg" as any) ||
    input === ("fg" as any)
  ) {
    return { mode: "none", value: null, original: input };
  }

  const caps = options.capabilities || detectColorCapabilities();
  const target = resolveTargetMode(options.targetMode, caps);

  if (target === "none") {
    return { mode: "none", value: null, original: input };
  }

  if (target === "truecolor") {
    const rgb = resolveRgbFromInput(input);
    if (rgb) {
      return { mode: "truecolor", value: rgb, original: input };
    }

    const idx = resolvePaletteIndex(input);
    if (idx != null) {
      const paletteRgb = colors.vcolors[idx] as
        | [number, number, number]
        | undefined;
      if (paletteRgb) {
        return {
          mode: "truecolor",
          value: clampRGB(paletteRgb[0], paletteRgb[1], paletteRgb[2]),
          original: input,
          paletteIndex: idx,
        };
      }
    }

    return { mode: "16", value: 0, original: input };
  }

  const index = resolvePaletteIndex(input);
  const safeIndex = index ?? 0;

  if (target === "256") {
    return { mode: "256", value: safeIndex, original: input };
  }

  if (target === "8") {
    const reduced = colors.reduce(safeIndex, 8);
    return { mode: "8", value: reduced, original: input };
  }

  const reduced = colors.reduce(safeIndex, 16);
  return { mode: "16", value: reduced, original: input };
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
  const rgb = resolveRgbFromInput(color);
  if (rgb) return rgb;
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
  options?: ColorCapabilities | ColorResolveOptions,
): string {
  // Handle "normal"/"default" as explicit resets.
  if (color === ("normal" as any) || color === ("default" as any)) {
    return type === "fg" ? "\x1b[39m" : "\x1b[49m";
  }

  const resolved = resolveColor(color, normalizeOptions(options));

  // Truecolor mode
  if (resolved.mode === "truecolor" && Array.isArray(resolved.value)) {
    const [r, g, b] = resolved.value;
    return type === "fg"
      ? `\x1b[38;2;${r};${g};${b}m`
      : `\x1b[48;2;${r};${g};${b}m`;
  }

  // 256-color mode
  if (resolved.mode === "256" && typeof resolved.value === "number") {
    return type === "fg"
      ? `\x1b[38;5;${resolved.value}m`
      : `\x1b[48;5;${resolved.value}m`;
  }

  if (resolved.mode === "8" && typeof resolved.value === "number") {
    const code = resolved.value;
    return type === "fg" ? `\x1b[3${code}m` : `\x1b[4${code}m`;
  }

  // 16-color mode
  if (resolved.mode === "16" && typeof resolved.value === "number") {
    const code = resolved.value;
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
  options?: ColorCapabilities | ColorResolveOptions,
): {
  attr: number; // Packed attribute (for 16/256-color)
  truecolor: [number, number, number] | null; // RGB array or null
} {
  const resolved = resolveColor(color, normalizeOptions(options));

  // Truecolor mode
  if (resolved.mode === "truecolor" && Array.isArray(resolved.value)) {
    return {
      attr: type === "fg" ? 0x1ff << 9 : 0x1ff, // Default attr (truecolor takes precedence)
      truecolor: resolved.value,
    };
  }

  // 256-color or 16-color mode
  if (typeof resolved.value === "number") {
    const index = resolved.value;
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

function normalizeOptions(
  options?: ColorCapabilities | ColorResolveOptions,
): ColorResolveOptions {
  if (!options) return {};
  if ((options as ColorCapabilities).supportsTruecolor !== undefined) {
    return { capabilities: options as ColorCapabilities };
  }
  return options as ColorResolveOptions;
}
