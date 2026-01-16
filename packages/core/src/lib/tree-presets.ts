/**
 * tree-presets.ts - Predefined style presets for the Tree widget
 *
 * These presets provide ready-to-use configurations for common tree styles.
 * Use them to quickly achieve popular tree rendering styles without manual configuration.
 *
 * @example
 * ```typescript
 * import { Tree, TreePresets } from '@unblessed/node';
 *
 * const tree = new Tree({
 *   ...TreePresets.Modern,
 *   data: myTreeData,
 * });
 * ```
 */

import type { TreeConfig, TreeIconRule } from "../types/options.js";
import type { TreeStyle } from "../types/style.js";

/**
 * A complete tree preset configuration.
 * Combines config, style, and iconRules for a cohesive look.
 */
export interface TreePreset {
  /**
   * Config for tree rendering structure.
   */
  config: TreeConfig;

  /**
   * Style configuration for colors and visual appearance.
   */
  style: TreeStyle;

  /**
   * Icon rules for automatic icon assignment.
   */
  iconRules: TreeIconRule[];
}

// =============================================================================
// Nerd Font Icons (require a Nerd Font to be installed)
// Use String.fromCodePoint() to avoid file encoding issues
// =============================================================================

const NerdIcons = {
  // Folders
  folder: String.fromCodePoint(0xf07b), //
  folderOpen: String.fromCodePoint(0xf07c), //

  // Files
  file: String.fromCodePoint(0xf15b), //
  fileCode: String.fromCodePoint(0xf1c9), //

  // Languages
  typescript: String.fromCodePoint(0xe628), //
  javascript: String.fromCodePoint(0xe74e), //
  python: String.fromCodePoint(0xe73c), //
  rust: String.fromCodePoint(0xe7a8), //
  go: String.fromCodePoint(0xe627), //
  java: String.fromCodePoint(0xe738), //
  ruby: String.fromCodePoint(0xe739), //
  php: String.fromCodePoint(0xe73d), //
  csharp: String.fromCodePoint(0xe648), //
  cpp: String.fromCodePoint(0xe646), //
  c: String.fromCodePoint(0xe61e), //
  swift: String.fromCodePoint(0xe755), //
  kotlin: String.fromCodePoint(0xe634), //

  // Web
  html: String.fromCodePoint(0xe736), //
  css: String.fromCodePoint(0xe749), //
  sass: String.fromCodePoint(0xe74b), //
  vue: String.fromCodePoint(0xe6a0), //
  react: String.fromCodePoint(0xe7ba), // (uses atom icon)
  svelte: String.fromCodePoint(0xe697), //

  // Data/Config
  json: String.fromCodePoint(0xe60b), // nf-seti-json
  yaml: String.fromCodePoint(0xe6a8), // nf-seti-yml
  xml: String.fromCodePoint(0xe619), // nf-seti-xml (basic PUA)
  toml: String.fromCodePoint(0xe6b2), // nf-seti-settings

  // Documentation - use file icons (more reliable)
  markdown: String.fromCodePoint(0xf15c), // nf-fa-file_text
  text: String.fromCodePoint(0xf15c), // nf-fa-file_text
  pdf: String.fromCodePoint(0xf1c1), // nf-fa-file_pdf_o

  // Version Control
  git: String.fromCodePoint(0xe702), // nf-dev-git
  github: String.fromCodePoint(0xe709), // nf-dev-github_alt (basic PUA)

  // Config/Tooling
  config: String.fromCodePoint(0xf013), // nf-fa-cog (gear)
  npm: String.fromCodePoint(0xe71e), // nf-dev-nodejs_small
  docker: String.fromCodePoint(0xe7b0), // nf-dev-docker (basic PUA)

  // Images
  image: String.fromCodePoint(0xf1c5), // nf-fa-file_image_o

  // Shell
  shell: String.fromCodePoint(0xf120), // nf-fa-terminal

  // Lock files
  lock: String.fromCodePoint(0xf023), // nf-fa-lock
} as const;

// =============================================================================
// Standard Unicode Icons (work in all terminals)
// =============================================================================

const UnicodeIcons = {
  // Expand/collapse
  collapsed: "\u25b8", // ▸ right-pointing triangle
  expanded: "\u25be", // ▾ down-pointing triangle

  // Status indicators
  modified: "\u2717", // ✗
  staged: "\u2605", // ★

  // Simple shapes
  folder: "\u25b8", // ▸
  file: "\u25aa", // ▪ small square
  bullet: "\u2022", // •
  dash: "\u2500", // ─
} as const;

// =============================================================================
// PRESETS
// =============================================================================

/**
 * Modern preset - Clean, minimal style inspired by modern file explorers.
 *
 * Features:
 * - Space-based indentation (no tree lines)
 * - No expand/collapse indicators
 * - Nerd Font icons for file types
 * - 4-space initial indent, 1-space per nested level
 *
 * Perfect for: IDE-like file explorers, modern CLI tools
 *
 * @example
 * ```typescript
 * const tree = new Tree({
 *   ...TreePresets.Modern,
 *   parent: screen,
 *   data: {
 *     extended: true,
 *     children: {
 *       'src': { children: { 'index.ts': {} } },
 *       'package.json': {},
 *     }
 *   }
 * });
 * ```
 */
export const Modern: TreePreset = {
  config: {
    lines: false,
    spaces: true,
    indent: 2,
    collapse: "", // No suffix indicator
    expand: "", // No suffix indicator
    // NERDTree-style prefix indicators (triangles)
    prefixIndicator: (node) =>
      node.extended
        ? UnicodeIcons.expanded + " " // ▾
        : UnicodeIcons.collapsed + " ", // ▸
  },
  style: {
    border: { fg: "cyan" },
    selected: { bg: "blue", fg: "white", bold: true },
    item: { fg: "white" },
    icon: { fg: "cyan" },
    expanded: { fg: "blue" },
    collapsed: { fg: "blue" },
    leaf: { fg: "white" },
  },
  iconRules: [
    // Folders - show open/closed icon based on extended state
    {
      test: (node) =>
        !!(node.children || node.childrenContent) && !!node.extended,
      icon: NerdIcons.folderOpen,
    },
    {
      test: (node) => !!(node.children || node.childrenContent),
      icon: NerdIcons.folder,
    },

    // Version control
    { test: ".git", icon: NerdIcons.git },
    { test: ".git*", icon: NerdIcons.git },
    { test: ".github", icon: NerdIcons.github },

    // TypeScript/JavaScript
    { test: "*.ts", icon: NerdIcons.typescript },
    { test: "*.tsx", icon: NerdIcons.typescript },
    { test: "*.js", icon: NerdIcons.javascript },
    { test: "*.jsx", icon: NerdIcons.javascript },
    { test: "*.mjs", icon: NerdIcons.javascript },
    { test: "*.cjs", icon: NerdIcons.javascript },

    // Web
    { test: "*.html", icon: NerdIcons.html },
    { test: "*.htm", icon: NerdIcons.html },
    { test: "*.css", icon: NerdIcons.css },
    { test: "*.scss", icon: NerdIcons.sass },
    { test: "*.sass", icon: NerdIcons.sass },
    { test: "*.vue", icon: NerdIcons.vue },
    { test: "*.svelte", icon: NerdIcons.svelte },

    // Other languages
    { test: "*.py", icon: NerdIcons.python },
    { test: "*.rs", icon: NerdIcons.rust },
    { test: "*.go", icon: NerdIcons.go },
    { test: "*.java", icon: NerdIcons.java },
    { test: "*.rb", icon: NerdIcons.ruby },
    { test: "*.php", icon: NerdIcons.php },
    { test: "*.cs", icon: NerdIcons.csharp },
    { test: "*.cpp", icon: NerdIcons.cpp },
    { test: "*.c", icon: NerdIcons.c },
    { test: "*.h", icon: NerdIcons.c },
    { test: "*.swift", icon: NerdIcons.swift },
    { test: "*.kt", icon: NerdIcons.kotlin },

    // Data/Config
    { test: "*.json", icon: NerdIcons.json },
    { test: "*.yaml", icon: NerdIcons.yaml },
    { test: "*.yml", icon: NerdIcons.yaml },
    { test: "*.xml", icon: NerdIcons.xml },
    { test: "*.toml", icon: NerdIcons.toml },

    // Documentation
    { test: "*.md", icon: NerdIcons.markdown },
    { test: "*.txt", icon: NerdIcons.text },
    { test: "*.pdf", icon: NerdIcons.pdf },
    { test: "README*", icon: NerdIcons.markdown },
    { test: "CHANGELOG*", icon: NerdIcons.markdown },
    { test: "LICENSE*", icon: NerdIcons.text },

    // Config files
    { test: "*config*", icon: NerdIcons.config },
    { test: "*rc", icon: NerdIcons.config },
    { test: ".*rc", icon: NerdIcons.config },
    { test: ".env*", icon: NerdIcons.config },
    { test: "tsconfig.json", icon: NerdIcons.typescript },
    { test: "package.json", icon: NerdIcons.npm },
    { test: "package-lock.json", icon: NerdIcons.npm },
    { test: "pnpm-lock.yaml", icon: NerdIcons.npm },
    { test: "yarn.lock", icon: NerdIcons.npm },
    { test: "bun.lock*", icon: NerdIcons.npm },

    // Docker
    { test: "Dockerfile*", icon: NerdIcons.docker },
    { test: "docker-compose*", icon: NerdIcons.docker },
    { test: ".dockerignore", icon: NerdIcons.docker },

    // Shell
    { test: "*.sh", icon: NerdIcons.shell },
    { test: "*.bash", icon: NerdIcons.shell },
    { test: "*.zsh", icon: NerdIcons.shell },

    // Images
    { test: "*.png", icon: NerdIcons.image },
    { test: "*.jpg", icon: NerdIcons.image },
    { test: "*.jpeg", icon: NerdIcons.image },
    { test: "*.gif", icon: NerdIcons.image },
    { test: "*.svg", icon: NerdIcons.image },
    { test: "*.ico", icon: NerdIcons.image },
    { test: "*.webp", icon: NerdIcons.image },

    // Lock files
    { test: "*.lock", icon: NerdIcons.lock },

    // Default file icon
    { test: "*", icon: NerdIcons.file },
  ],
};

/**
 * Classic preset - Traditional blessed-contrib compatible tree style.
 *
 * Features:
 * - Unicode tree lines (├─, └─, │) showing hierarchy
 * - [+] and [-] expand/collapse indicators
 * - No automatic icons (manual icon assignment only)
 * - 2-space indentation
 *
 * Perfect for: Terminal dashboards, blessed-contrib compatibility, traditional CLI tools
 *
 * @example
 * ```typescript
 * const tree = new Tree({
 *   ...TreePresets.Classic,
 *   parent: screen,
 *   data: {
 *     name: 'root',
 *     extended: true,
 *     children: {
 *       'folder1': { children: { 'file1.txt': {} } },
 *       'folder2': { children: {} },
 *     }
 *   }
 * });
 * ```
 *
 * Output:
 * ```
 * root [-]
 * ├┬folder1 [-]
 * │└─file1.txt
 * └─folder2 [+]
 * ```
 */
export const Classic: TreePreset = {
  config: {
    lines: true, // Show tree lines (├─, └─, │)
    spaces: false, // Don't use space-based indentation
    indent: 2, // 2-space indent for continuation
    collapse: " [+]", // Suffix when collapsed
    expand: " [-]", // Suffix when expanded
  },
  style: {
    border: { fg: "cyan" },
    selected: { bg: "blue", fg: "white", bold: true },
    item: { fg: "white" },
    line: { fg: "cyan" }, // Tree line color
    indicator: { fg: "green" }, // [+]/[-] indicator color
    expanded: { fg: "cyan" }, // Expanded folder color
    collapsed: { fg: "cyan" }, // Collapsed folder color
    leaf: { fg: "white" }, // File/leaf node color
  },
  // No automatic icon rules - classic style uses manual icons only
  iconRules: [],
};

// =============================================================================
// Exported Presets Object
// =============================================================================

/**
 * Collection of predefined tree presets.
 *
 * @example
 * ```typescript
 * import { Tree, TreePresets } from '@unblessed/node';
 *
 * // Use a preset directly
 * const tree = new Tree({
 *   ...TreePresets.Modern,
 *   parent: screen,
 *   data: myData,
 * });
 *
 * // Override specific preset options
 * const tree = new Tree({
 *   ...TreePresets.Modern,
 *   config: {
 *     ...TreePresets.Modern.config,
 *     indent: 4,  // Override indent
 *   },
 *   parent: screen,
 *   data: myData,
 * });
 * ```
 */
export const TreePresets = {
  /**
   * Modern preset - Clean, minimal IDE-like file explorer style.
   * Uses Nerd Font icons and space-based indentation.
   */
  Modern,

  /**
   * Classic preset - Traditional blessed-contrib compatible style.
   * Uses tree lines (├─, └─, │) and [+]/[-] indicators.
   */
  Classic,
} as const;

// Also export icons for users who want to use them directly
export { NerdIcons, UnicodeIcons };

export default TreePresets;
