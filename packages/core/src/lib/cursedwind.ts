/**
 * cursedwind.ts - CursedWind class name parser for terminal UI styling.
 *
 * Provides a declarative way to style terminal widgets using class names
 * with a Tailwind-like syntax, adapted for terminal capabilities.
 *
 * @example
 * ```typescript
 * import { Box } from '@unblessed/core';
 *
 * const box = new Box({
 *   parent: screen,
 *   className: 'bg-blue fg-white bold border-line border-cyan p-2'
 * });
 * ```
 */

import type { Padding } from "../types/common.js";
import type { Style } from "../types/style.js";
import type { BorderStyleName } from "./border-styles.js";

/**
 * Tree-specific style options parsed from className.
 */
export interface ParsedTreeStyle {
  /** Style for tree lines (├, └, │, ─) */
  line?: Partial<Style>;
  /** Style for expand/collapse indicators ([+], [-]) */
  indicator?: Partial<Style>;
  /** Style for expanded nodes */
  expanded?: Partial<Style>;
  /** Style for collapsed nodes */
  collapsed?: Partial<Style>;
  /** Style for leaf nodes */
  leaf?: Partial<Style>;
  /** Array of styles for different tree depths */
  depth?: Partial<Style>[];
}

/**
 * Result of parsing a className string.
 * Contains all the style-related properties that can be applied to an element.
 */
export interface ParsedClassName {
  /** Style object with colors and attributes */
  style?: Partial<Style>;
  /** Border configuration */
  border?: {
    type?: "line" | "bg";
    style?: BorderStyleName;
    fg?: string | number;
    bg?: string | number;
    ch?: string;
  };
  /** Padding configuration */
  padding?: Partial<Padding>;
  /** Text alignment */
  align?: "left" | "center" | "right";
  /** Vertical alignment */
  valign?: "top" | "middle" | "bottom";
  /** Whether to shrink to content */
  shrink?: boolean;
  /** Whether element is hidden */
  hidden?: boolean;
  /** Whether to wrap text */
  wrap?: boolean;
  /** Shadow effect */
  shadow?: boolean;
  /** Whether element is scrollable */
  scrollable?: boolean;
  /** Positioning values */
  position?: {
    top?: number | string;
    left?: number | string;
    right?: number | string;
    bottom?: number | string;
    width?: number | string;
    height?: number | string;
  };
  /** Tree-specific styles (for Tree widget) */
  tree?: ParsedTreeStyle;
}

// =============================================================================
// Terminal Color Palette
// =============================================================================

/**
 * Terminal color names mapped to their ANSI color codes.
 * Supports basic 16 colors and extended named colors.
 */
const terminalColors: Record<string, number | string> = {
  // Basic colors (0-7)
  black: 0,
  red: 1,
  green: 2,
  yellow: 3,
  blue: 4,
  magenta: 5,
  cyan: 6,
  white: 7,

  // Bright/light colors (8-15)
  "light-black": 8,
  "light-red": 9,
  "light-green": 10,
  "light-yellow": 11,
  "light-blue": 12,
  "light-magenta": 13,
  "light-cyan": 14,
  "light-white": 15,

  // Bright colors (aliases)
  "bright-black": 8,
  "bright-red": 9,
  "bright-green": 10,
  "bright-yellow": 11,
  "bright-blue": 12,
  "bright-magenta": 13,
  "bright-cyan": 14,
  "bright-white": 15,

  // Additional common names
  gray: 8,
  grey: 8,
  "light-gray": 7,
  "light-grey": 7,

  // Extended 256-color palette selections (commonly used)
  orange: 208,
  pink: 213,
  purple: 129,
  violet: 99,
  indigo: 54,
  teal: 30,
  lime: 118,
  amber: 214,
  rose: 204,
  sky: 117,
  emerald: 42,
  slate: 242,
  zinc: 245,
  stone: 249,
  neutral: 250,

  // Default/inherit
  default: -1,
  inherit: -1,
};

/**
 * Shade modifiers for color intensity.
 * Maps shade numbers (50-900) to 256-color palette adjustments.
 */
const colorShades: Record<string, Record<number, number>> = {
  red: {
    50: 224,
    100: 217,
    200: 210,
    300: 203,
    400: 196,
    500: 160,
    600: 124,
    700: 88,
    800: 52,
    900: 52,
  },
  green: {
    50: 194,
    100: 157,
    200: 120,
    300: 84,
    400: 48,
    500: 34,
    600: 28,
    700: 22,
    800: 22,
    900: 22,
  },
  blue: {
    50: 195,
    100: 159,
    200: 117,
    300: 75,
    400: 33,
    500: 27,
    600: 21,
    700: 19,
    800: 18,
    900: 17,
  },
  yellow: {
    50: 230,
    100: 229,
    200: 228,
    300: 227,
    400: 226,
    500: 220,
    600: 214,
    700: 208,
    800: 202,
    900: 166,
  },
  cyan: {
    50: 195,
    100: 159,
    200: 123,
    300: 87,
    400: 51,
    500: 44,
    600: 37,
    700: 30,
    800: 23,
    900: 23,
  },
  magenta: {
    50: 225,
    100: 219,
    200: 213,
    300: 207,
    400: 201,
    500: 165,
    600: 129,
    700: 93,
    800: 57,
    900: 54,
  },
  gray: {
    50: 255,
    100: 253,
    200: 251,
    300: 249,
    400: 247,
    500: 244,
    600: 241,
    700: 238,
    800: 235,
    900: 232,
  },
  // Alias
  grey: {
    50: 255,
    100: 253,
    200: 251,
    300: 249,
    400: 247,
    500: 244,
    600: 241,
    700: 238,
    800: 235,
    900: 232,
  },
};

// =============================================================================
// Style Parsers
// =============================================================================

/**
 * Parse a color class (bg-*, fg-*, text-*).
 * Supports: bg-red, fg-blue-500, text-#ff0000, bg-[200]
 */
function parseColor(
  cls: string,
  prefix: "bg" | "fg" | "text",
): string | number | undefined {
  if (!cls.startsWith(`${prefix}-`)) return undefined;

  const colorPart = cls.substring(prefix.length + 1);

  // Hex color: bg-#ff0000 or fg-#00ff00
  if (colorPart.startsWith("#")) {
    return colorPart;
  }

  // Arbitrary value: bg-[200] or fg-[44]
  const arbitraryMatch = colorPart.match(/^\[(\d+)\]$/);
  if (arbitraryMatch) {
    return parseInt(arbitraryMatch[1], 10);
  }

  // Color with shade: bg-red-500
  const shadeMatch = colorPart.match(/^([a-z]+)-(\d+)$/);
  if (shadeMatch) {
    const [, colorName, shade] = shadeMatch;
    const shadeMap = colorShades[colorName];
    if (shadeMap && shadeMap[parseInt(shade, 10)] !== undefined) {
      return shadeMap[parseInt(shade, 10)];
    }
  }

  // Simple color name: bg-red, fg-blue
  if (terminalColors[colorPart] !== undefined) {
    return terminalColors[colorPart];
  }

  return undefined;
}

/**
 * Parse border-related classes.
 */
function parseBorder(cls: string): Partial<ParsedClassName["border"]> | null {
  // Border type: border-line, border-bg
  if (cls === "border" || cls === "border-line") {
    return { type: "line" };
  }
  if (cls === "border-bg") {
    return { type: "bg" };
  }

  // Border style: border-single, border-double, border-round, etc.
  const styleMatch = cls.match(
    /^border-(single|double|round|bold|singleDouble|doubleSingle|classic|arrow)$/,
  );
  if (styleMatch) {
    return {
      type: "line",
      style: styleMatch[1] as BorderStyleName,
    };
  }

  // Border color: border-red, border-blue-500
  const borderColorMatch = cls.match(/^border-([a-z#\[\]0-9-]+)$/);
  if (borderColorMatch) {
    const colorValue = parseColor(`fg-${borderColorMatch[1]}`, "fg");
    if (colorValue !== undefined) {
      return { fg: colorValue };
    }
  }

  return null;
}

/**
 * Parse padding classes.
 * Supports: p-2, px-1, py-2, pt-1, pb-1, pl-1, pr-1
 */
function parsePadding(cls: string): Partial<Padding> | null {
  // All sides: p-2
  const allMatch = cls.match(/^p-(\d+)$/);
  if (allMatch) {
    const value = parseInt(allMatch[1], 10);
    return { left: value, right: value, top: value, bottom: value };
  }

  // Horizontal: px-2
  const hMatch = cls.match(/^px-(\d+)$/);
  if (hMatch) {
    const value = parseInt(hMatch[1], 10);
    return { left: value, right: value };
  }

  // Vertical: py-2
  const vMatch = cls.match(/^py-(\d+)$/);
  if (vMatch) {
    const value = parseInt(vMatch[1], 10);
    return { top: value, bottom: value };
  }

  // Individual sides
  const sideMatch = cls.match(/^p([tblr])-(\d+)$/);
  if (sideMatch) {
    const [, side, valueStr] = sideMatch;
    const value = parseInt(valueStr, 10);
    const sideMap: Record<string, keyof Padding> = {
      t: "top",
      b: "bottom",
      l: "left",
      r: "right",
    };
    return { [sideMap[side]]: value };
  }

  return null;
}

/**
 * Parse position/size classes.
 * Supports: w-10, h-5, w-50%, top-0, left-10, etc.
 */
function parsePosition(
  cls: string,
): { key: string; value: number | string } | null {
  // Width: w-10, w-50%, w-half, w-shrink
  const widthMatch = cls.match(/^w-(.+)$/);
  if (widthMatch) {
    const val = widthMatch[1];
    if (val === "full") return { key: "width", value: "100%" };
    if (val === "half") return { key: "width", value: "50%" };
    if (val === "shrink") return { key: "width", value: "shrink" };
    if (val.endsWith("%")) return { key: "width", value: val };
    const num = parseInt(val, 10);
    if (!isNaN(num)) return { key: "width", value: num };
  }

  // Height: h-10, h-50%, h-half, h-shrink
  const heightMatch = cls.match(/^h-(.+)$/);
  if (heightMatch) {
    const val = heightMatch[1];
    if (val === "full") return { key: "height", value: "100%" };
    if (val === "half") return { key: "height", value: "50%" };
    if (val === "shrink") return { key: "height", value: "shrink" };
    if (val.endsWith("%")) return { key: "height", value: val };
    const num = parseInt(val, 10);
    if (!isNaN(num)) return { key: "height", value: num };
  }

  // Position: top-0, left-10, right-5, bottom-2
  const posMatch = cls.match(/^(top|left|right|bottom)-(.+)$/);
  if (posMatch) {
    const [, prop, val] = posMatch;
    if (val === "center") return { key: prop, value: "center" };
    if (val.endsWith("%")) return { key: prop, value: val };
    const num = parseInt(val, 10);
    if (!isNaN(num)) return { key: prop, value: num };
  }

  return null;
}

// =============================================================================
// Text Attribute Classes
// =============================================================================

/** Text attribute classes that map to Style properties */
const textAttributes: Record<string, Partial<Style>> = {
  bold: { bold: true },
  "no-bold": { bold: false },
  dim: { dim: true },
  "no-dim": { dim: false },
  underline: { underline: true },
  "no-underline": { underline: false },
  blink: { blink: true },
  "no-blink": { blink: false },
  inverse: { inverse: true },
  "no-inverse": { inverse: false },
  invisible: { invisible: true },
  "no-invisible": { invisible: false },
  transparent: { transparent: true },
  "no-transparent": { transparent: false },
};

// =============================================================================
// Alignment Classes
// =============================================================================

const alignmentClasses: Record<
  string,
  { align?: "left" | "center" | "right"; valign?: "top" | "middle" | "bottom" }
> = {
  // Horizontal
  "text-left": { align: "left" },
  "text-center": { align: "center" },
  "text-right": { align: "right" },
  // Vertical
  "align-top": { valign: "top" },
  "align-middle": { valign: "middle" },
  "align-bottom": { valign: "bottom" },
};

// =============================================================================
// Layout/Display Classes
// =============================================================================

const layoutClasses: Record<string, Partial<ParsedClassName>> = {
  shrink: { shrink: true },
  "no-shrink": { shrink: false },
  hidden: { hidden: true },
  visible: { hidden: false },
  wrap: { wrap: true },
  "no-wrap": { wrap: false },
  shadow: { shadow: true },
  "no-shadow": { shadow: false },
  scrollable: { scrollable: true },
  "no-scrollable": { scrollable: false },
};

// =============================================================================
// Tree-Specific Parsers
// =============================================================================

/**
 * Parse tree-specific classes for the Tree widget.
 *
 * Supports:
 * - `tree-line-{color}` - Color for tree lines (├, └, │, ─)
 * - `tree-indicator-{color}` - Color for expand/collapse indicators
 * - `tree-expanded-{color}` - Foreground color for expanded nodes
 * - `tree-expanded-bg-{color}` - Background color for expanded nodes
 * - `tree-collapsed-{color}` - Foreground color for collapsed nodes
 * - `tree-collapsed-bg-{color}` - Background color for collapsed nodes
 * - `tree-leaf-{color}` - Foreground color for leaf nodes
 * - `tree-leaf-bg-{color}` - Background color for leaf nodes
 * - `tree-depth-{n}-{color}` - Foreground color for specific depth level
 * - `tree-depth-{n}-bg-{color}` - Background color for specific depth level
 */
function parseTreeClass(
  cls: string,
): { key: keyof ParsedTreeStyle; style: Partial<Style>; depth?: number } | null {
  // Tree line color: tree-line-cyan, tree-line-#00ff00
  const lineMatch = cls.match(/^tree-line-(.+)$/);
  if (lineMatch) {
    const color = parseColor(`fg-${lineMatch[1]}`, "fg");
    if (color !== undefined) {
      return { key: "line", style: { fg: color } };
    }
  }

  // Tree indicator color: tree-indicator-yellow
  const indicatorMatch = cls.match(/^tree-indicator-(.+)$/);
  if (indicatorMatch) {
    const color = parseColor(`fg-${indicatorMatch[1]}`, "fg");
    if (color !== undefined) {
      return { key: "indicator", style: { fg: color } };
    }
  }

  // Expanded node styles
  const expandedBgMatch = cls.match(/^tree-expanded-bg-(.+)$/);
  if (expandedBgMatch) {
    const color = parseColor(`bg-${expandedBgMatch[1]}`, "bg");
    if (color !== undefined) {
      return { key: "expanded", style: { bg: color } };
    }
  }
  const expandedMatch = cls.match(/^tree-expanded-(.+)$/);
  if (expandedMatch) {
    const color = parseColor(`fg-${expandedMatch[1]}`, "fg");
    if (color !== undefined) {
      return { key: "expanded", style: { fg: color } };
    }
  }

  // Collapsed node styles
  const collapsedBgMatch = cls.match(/^tree-collapsed-bg-(.+)$/);
  if (collapsedBgMatch) {
    const color = parseColor(`bg-${collapsedBgMatch[1]}`, "bg");
    if (color !== undefined) {
      return { key: "collapsed", style: { bg: color } };
    }
  }
  const collapsedMatch = cls.match(/^tree-collapsed-(.+)$/);
  if (collapsedMatch) {
    const color = parseColor(`fg-${collapsedMatch[1]}`, "fg");
    if (color !== undefined) {
      return { key: "collapsed", style: { fg: color } };
    }
  }

  // Leaf node styles
  const leafBgMatch = cls.match(/^tree-leaf-bg-(.+)$/);
  if (leafBgMatch) {
    const color = parseColor(`bg-${leafBgMatch[1]}`, "bg");
    if (color !== undefined) {
      return { key: "leaf", style: { bg: color } };
    }
  }
  const leafMatch = cls.match(/^tree-leaf-(.+)$/);
  if (leafMatch) {
    const color = parseColor(`fg-${leafMatch[1]}`, "fg");
    if (color !== undefined) {
      return { key: "leaf", style: { fg: color } };
    }
  }

  // Depth-based styles: tree-depth-0-cyan, tree-depth-1-bg-blue
  const depthBgMatch = cls.match(/^tree-depth-(\d+)-bg-(.+)$/);
  if (depthBgMatch) {
    const depth = parseInt(depthBgMatch[1], 10);
    const color = parseColor(`bg-${depthBgMatch[2]}`, "bg");
    if (color !== undefined) {
      return { key: "depth", style: { bg: color }, depth };
    }
  }
  const depthMatch = cls.match(/^tree-depth-(\d+)-(.+)$/);
  if (depthMatch) {
    const depth = parseInt(depthMatch[1], 10);
    const color = parseColor(`fg-${depthMatch[2]}`, "fg");
    if (color !== undefined) {
      return { key: "depth", style: { fg: color }, depth };
    }
  }

  return null;
}

// =============================================================================
// Main Parser
// =============================================================================

/**
 * Parse a className string into widget options.
 *
 * CursedWind supports Tailwind-like class names adapted for terminal UIs:
 *
 * **Colors:**
 * - `bg-{color}` - Background color (bg-red, bg-blue-500, bg-#ff0000, bg-[200])
 * - `fg-{color}` or `text-{color}` - Foreground color
 *
 * **Text Attributes:**
 * - `bold`, `no-bold` - Bold text
 * - `dim`, `no-dim` - Dimmed text
 * - `underline`, `no-underline` - Underlined text
 * - `blink`, `no-blink` - Blinking text
 * - `inverse`, `no-inverse` - Inverse colors
 * - `invisible`, `no-invisible` - Hidden text
 * - `transparent`, `no-transparent` - Transparent background
 *
 * **Border:**
 * - `border` or `border-line` - Line border
 * - `border-bg` - Background border
 * - `border-{style}` - Border style (single, double, round, bold, classic, arrow)
 * - `border-{color}` - Border color
 *
 * **Padding:**
 * - `p-{n}` - All sides padding
 * - `px-{n}` - Horizontal padding
 * - `py-{n}` - Vertical padding
 * - `pt-{n}`, `pb-{n}`, `pl-{n}`, `pr-{n}` - Individual side padding
 *
 * **Alignment:**
 * - `text-left`, `text-center`, `text-right` - Horizontal alignment
 * - `align-top`, `align-middle`, `align-bottom` - Vertical alignment
 *
 * **Size:**
 * - `w-{n}`, `w-{n}%`, `w-full`, `w-half`, `w-shrink` - Width
 * - `h-{n}`, `h-{n}%`, `h-full`, `h-half`, `h-shrink` - Height
 *
 * **Position:**
 * - `top-{n}`, `left-{n}`, `right-{n}`, `bottom-{n}` - Position
 *
 * **Layout:**
 * - `shrink`, `no-shrink` - Shrink to content
 * - `hidden`, `visible` - Visibility
 * - `wrap`, `no-wrap` - Text wrapping
 * - `shadow`, `no-shadow` - Shadow effect
 * - `scrollable`, `no-scrollable` - Scrollable content
 *
 * @param className - Space-separated class names
 * @returns Parsed options that can be merged with widget options
 *
 * @example
 * ```typescript
 * const parsed = parseClassName('bg-blue fg-white bold border-line p-2 text-center');
 * // => {
 * //   style: { bg: 4, fg: 7, bold: true },
 * //   border: { type: 'line' },
 * //   padding: { left: 2, right: 2, top: 2, bottom: 2 },
 * //   align: 'center'
 * // }
 * ```
 */
export function parseClassName(className: string): ParsedClassName {
  if (!className || typeof className !== "string") {
    return {};
  }

  const classes = className
    .split(/\s+/)
    .filter(Boolean)
    .map((c) => c.toLowerCase().trim());

  const result: ParsedClassName = {};
  let hasStyle = false;
  let hasBorder = false;
  let hasPadding = false;
  let hasPosition = false;
  let hasTree = false;

  for (const cls of classes) {
    // --- Tree-specific classes (check first due to prefix matching) ---
    if (cls.startsWith("tree-")) {
      const treeParsed = parseTreeClass(cls);
      if (treeParsed) {
        if (!hasTree) {
          result.tree = {};
          hasTree = true;
        }

        if (treeParsed.key === "depth" && treeParsed.depth !== undefined) {
          // Handle depth array
          if (!result.tree!.depth) {
            result.tree!.depth = [];
          }
          // Ensure array is large enough
          while (result.tree!.depth.length <= treeParsed.depth) {
            result.tree!.depth.push({});
          }
          Object.assign(result.tree!.depth[treeParsed.depth], treeParsed.style);
        } else {
          // Handle other tree styles
          if (!result.tree![treeParsed.key]) {
            result.tree![treeParsed.key] = {};
          }
          Object.assign(
            result.tree![treeParsed.key] as Partial<Style>,
            treeParsed.style,
          );
        }
        continue;
      }
    }

    // --- Background color ---
    const bgColor = parseColor(cls, "bg");
    if (bgColor !== undefined) {
      if (!hasStyle) {
        result.style = {};
        hasStyle = true;
      }
      result.style!.bg = bgColor;
      continue;
    }

    // --- Foreground color (fg-* or text-*) ---
    const fgColor = parseColor(cls, "fg") ?? parseColor(cls, "text");
    if (fgColor !== undefined) {
      if (!hasStyle) {
        result.style = {};
        hasStyle = true;
      }
      result.style!.fg = fgColor;
      continue;
    }

    // --- Text attributes ---
    if (textAttributes[cls]) {
      if (!hasStyle) {
        result.style = {};
        hasStyle = true;
      }
      Object.assign(result.style!, textAttributes[cls]);
      continue;
    }

    // --- Border ---
    const borderParsed = parseBorder(cls);
    if (borderParsed) {
      if (!hasBorder) {
        result.border = {};
        hasBorder = true;
      }
      Object.assign(result.border!, borderParsed);
      continue;
    }

    // --- Padding ---
    const paddingParsed = parsePadding(cls);
    if (paddingParsed) {
      if (!hasPadding) {
        result.padding = {};
        hasPadding = true;
      }
      Object.assign(result.padding!, paddingParsed);
      continue;
    }

    // --- Position/Size ---
    const positionParsed = parsePosition(cls);
    if (positionParsed) {
      if (!hasPosition) {
        result.position = {};
        hasPosition = true;
      }
      (result.position as any)[positionParsed.key] = positionParsed.value;
      continue;
    }

    // --- Alignment ---
    if (alignmentClasses[cls]) {
      Object.assign(result, alignmentClasses[cls]);
      continue;
    }

    // --- Layout ---
    if (layoutClasses[cls]) {
      Object.assign(result, layoutClasses[cls]);
      continue;
    }

    // Unknown class - silently ignore (allows for custom classes)
  }

  return result;
}

/**
 * Base options interface that mergeClassNameOptions expects.
 * Matches ElementOptions structure.
 */
interface MergeableOptions {
  style?: Partial<Style>;
  border?: { type?: "line" | "bg"; [key: string]: any } | string;
  padding?: Partial<Padding> | number;
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
  width?: number | string;
  height?: number | string;
  align?: "left" | "center" | "right";
  valign?: "top" | "middle" | "bottom";
  shrink?: boolean;
  hidden?: boolean;
  wrap?: boolean;
  shadow?: boolean;
  scrollable?: boolean;
  [key: string]: any;
}

/**
 * Merge parsed className options with existing widget options.
 * className properties take precedence over existing options.
 *
 * @param baseOptions - Base widget options
 * @param parsedClassName - Parsed className result
 * @returns Merged options object
 */
export function mergeClassNameOptions<T extends MergeableOptions>(
  baseOptions: T,
  parsedClassName: ParsedClassName,
): T {
  const merged: MergeableOptions = { ...baseOptions };

  // Merge style
  if (parsedClassName.style) {
    merged.style = { ...merged.style, ...parsedClassName.style };
  }

  // Merge tree styles into style object (for Tree widget)
  if (parsedClassName.tree) {
    if (!merged.style) {
      merged.style = {};
    }
    const treeStyle = parsedClassName.tree;
    if (treeStyle.line) {
      (merged.style as any).line = {
        ...(merged.style as any).line,
        ...treeStyle.line,
      };
    }
    if (treeStyle.indicator) {
      (merged.style as any).indicator = {
        ...(merged.style as any).indicator,
        ...treeStyle.indicator,
      };
    }
    if (treeStyle.expanded) {
      (merged.style as any).expanded = {
        ...(merged.style as any).expanded,
        ...treeStyle.expanded,
      };
    }
    if (treeStyle.collapsed) {
      (merged.style as any).collapsed = {
        ...(merged.style as any).collapsed,
        ...treeStyle.collapsed,
      };
    }
    if (treeStyle.leaf) {
      (merged.style as any).leaf = {
        ...(merged.style as any).leaf,
        ...treeStyle.leaf,
      };
    }
    if (treeStyle.depth) {
      if (!(merged.style as any).depth) {
        (merged.style as any).depth = [];
      }
      for (let i = 0; i < treeStyle.depth.length; i++) {
        if (!(merged.style as any).depth[i]) {
          (merged.style as any).depth[i] = {};
        }
        Object.assign((merged.style as any).depth[i], treeStyle.depth[i]);
      }
    }
  }

  // Merge border
  if (parsedClassName.border) {
    if (typeof merged.border === "string") {
      merged.border = { type: merged.border as "line" | "bg" };
    }
    merged.border = { ...merged.border, ...parsedClassName.border };
  }

  // Merge padding
  if (parsedClassName.padding) {
    if (typeof merged.padding === "number") {
      merged.padding = {
        left: merged.padding,
        right: merged.padding,
        top: merged.padding,
        bottom: merged.padding,
      };
    }
    merged.padding = { ...merged.padding, ...parsedClassName.padding };
  }

  // Merge position values
  if (parsedClassName.position) {
    const pos = parsedClassName.position;
    if (pos.top !== undefined) merged.top = pos.top;
    if (pos.left !== undefined) merged.left = pos.left;
    if (pos.right !== undefined) merged.right = pos.right;
    if (pos.bottom !== undefined) merged.bottom = pos.bottom;
    if (pos.width !== undefined) merged.width = pos.width;
    if (pos.height !== undefined) merged.height = pos.height;
  }

  // Merge simple properties
  if (parsedClassName.align !== undefined) merged.align = parsedClassName.align;
  if (parsedClassName.valign !== undefined)
    merged.valign = parsedClassName.valign;
  if (parsedClassName.shrink !== undefined)
    merged.shrink = parsedClassName.shrink;
  if (parsedClassName.hidden !== undefined)
    merged.hidden = parsedClassName.hidden;
  if (parsedClassName.wrap !== undefined) merged.wrap = parsedClassName.wrap;
  if (parsedClassName.shadow !== undefined)
    merged.shadow = parsedClassName.shadow;
  if (parsedClassName.scrollable !== undefined)
    merged.scrollable = parsedClassName.scrollable;

  return merged as T;
}

/**
 * Apply className to widget options.
 * Convenience function that combines parsing and merging.
 *
 * @param options - Widget options object (modified in place)
 * @returns The same options object with className applied
 *
 * @example
 * ```typescript
 * const options = {
 *   content: 'Hello',
 *   className: 'bg-blue fg-white bold p-2'
 * };
 * applyClassName(options);
 * // options now has style, padding, etc. applied
 * ```
 */
export function applyClassName<T extends { className?: string }>(
  options: T,
): T {
  if (!options.className) {
    return options;
  }

  const parsed = parseClassName(options.className);
  return mergeClassNameOptions(options, parsed);
}

// =============================================================================
// Exports
// =============================================================================

export {
  alignmentClasses,
  colorShades,
  layoutClasses,
  parseTreeClass,
  terminalColors,
  textAttributes,
};
