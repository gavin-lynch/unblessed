/**
 * color-utils.ts - Canvas color utilities
 *
 * Integrates canvas system with unified color system.
 */

import {
  detectColorCapabilities,
  type ColorCapabilities,
} from "../color-capabilities.js";
import { resolveColor, type ColorInput } from "../color-converter.js";
import type { AnsiTermCanvas } from "./ansi-term.js";
import type { DrawilleCanvas } from "./drawille.js";

/**
 * Set canvas color (stroke/fill)
 * Automatically uses best color mode
 *
 * @param canvas - Canvas instance
 * @param color - Color input
 * @param type - Color type (stroke, fill, fontFg, fontBg)
 * @param capabilities - Terminal capabilities (auto-detected if not provided)
 */
export function setCanvasColor(
  canvas: DrawilleCanvas | AnsiTermCanvas,
  color: ColorInput,
  type: "stroke" | "fill" | "fontFg" | "fontBg",
  capabilities?: ColorCapabilities,
): void {
  const resolved = resolveColor(color, { capabilities });

  // Set appropriate canvas property
  if (type === "stroke" || type === "fill") {
    // For stroke/fill, preserve RGB arrays for truecolor
    if (resolved.mode === "truecolor" && Array.isArray(resolved.value)) {
      canvas.color = resolved.value;
    } else if (resolved.mode === "256" && typeof resolved.value === "number") {
      // For 256-color, we need to convert back to RGB for canvas
      // Canvas expects RGB arrays for truecolor, or we use ANSI codes
      // For now, use the original input if it was an array
      canvas.color = resolved.original as ColorInput;
    } else {
      canvas.color = resolved.original as ColorInput;
    }
  } else if (type === "fontFg") {
    if (resolved.mode === "truecolor" && Array.isArray(resolved.value)) {
      canvas.fontFg = resolved.value;
    } else {
      canvas.fontFg = resolved.original as ColorInput;
    }
  } else if (type === "fontBg") {
    if (resolved.mode === "truecolor" && Array.isArray(resolved.value)) {
      canvas.fontBg = resolved.value;
    } else {
      canvas.fontBg = resolved.original as ColorInput;
    }
  }
}

/**
 * Convert canvas color to normalized cell format
 * For direct cell manipulation (bypassing ANSI string generation)
 *
 * @param color - Color input
 * @param capabilities - Terminal capabilities (auto-detected if not provided)
 * @returns Object with attr and truecolor values
 */
/**
 * Convert canvas color to normalized cell format
 * For direct cell manipulation (bypassing ANSI string generation)
 *
 * @param color - Color input
 * @param capabilities - Terminal capabilities (auto-detected if not provided)
 * @returns Object with attr and truecolor values
 */
export function canvasColorToCell(
  color: ColorInput,
  capabilities?: ColorCapabilities,
): {
  attr: number;
  truecolorBg: [number, number, number] | null;
  truecolorFg: [number, number, number] | null;
} {
  const caps = capabilities || detectColorCapabilities();
  const fg = resolveColor(color, { capabilities: caps });

  const truecolorFg =
    fg.mode === "truecolor" && Array.isArray(fg.value) ? fg.value : null;
  const attrFg =
    typeof fg.value === "number" ? (fg.value & 0x1ff) << 9 : 0x1ff << 9;

  return {
    attr: attrFg,
    truecolorBg: null,
    truecolorFg,
  };
}
