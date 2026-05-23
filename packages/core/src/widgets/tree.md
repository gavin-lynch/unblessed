# Tree Widget

A powerful, collapsible tree widget for displaying hierarchical data with full customization support.

## Table of Contents

- [Overview](#overview)
- [Quick Start with Presets](#quick-start-with-presets)
- [Features](#features)
- [Basic Usage](#basic-usage)
- [TreePresets](#treepresets)
- [Options Reference](#options-reference)
- [TreeNode Structure](#treenode-structure)
- [Icon Rules (iconRules)](#icon-rules-iconrules)
- [Rendering Styles](#rendering-styles)
- [Styling](#styling)
- [Events](#events)
- [Methods](#methods)
- [Keyboard Navigation](#keyboard-navigation)
- [Advanced Examples](#advanced-examples)
- [Icon Reference](#icon-reference)
- [Tips & Best Practices](#tips--best-practices)

---

## Overview

The Tree widget extends `List` to provide a navigable, collapsible tree structure. It's designed for file explorers, configuration viewers, data browsers, and any hierarchical data display.

**Key capabilities:**

- Two built-in presets: **Modern** (IDE-like) and **Classic** (blessed-contrib compatible)
- Automatic icon assignment via pattern matching (`iconRules`)
- Multiple rendering styles (tree lines, space-based, ASCII)
- Comprehensive styling with depth-based colors
- Full keyboard/mouse navigation
- Lazy-loaded children for large datasets

---

## Quick Start with Presets

The fastest way to get a beautiful tree:

```typescript
import { Screen, Tree, TreePresets } from "@gavin-lynch/unblessed-node";

const screen = new Screen({ smartCSR: true });

// Just spread a preset and add your data!
const tree = new Tree({
  ...TreePresets.Modern, // or TreePresets.Classic
  parent: screen,
  width: "50%",
  height: "100%",
  border: "line",
  data: {
    extended: true,
    children: {
      src: { children: { "index.ts": {}, "utils.ts": {} } },
      "package.json": {},
      "README.md": {},
    },
  },
});

tree.focus();
screen.render();
```

---

## Features

### Core Features

- **Collapsible nodes** - Expand/collapse with configurable keys
- **Two presets** - Modern (Nerd Fonts) and Classic (blessed-contrib)
- **Automatic icons** - `iconRules` pattern matching for file types
- **Manual icons** - Per-node `icon` property with override support
- **Lazy loading** - Dynamic children via callback functions

### Rendering Styles

- **Unicode tree lines** - `├─`, `└─`, `│` hierarchy display
- **Space-based** - Clean vim-tree/IDE style indentation
- **ASCII fallback** - `|-` style for limited terminals
- **Customizable indicators** - `[+]/[-]`, `▸/▾`, or none

### Styling

- **Tree lines** - Color the hierarchy lines
- **Indicators** - Style expand/collapse markers
- **Icons** - Colorize file type icons
- **Node states** - Different colors for expanded/collapsed/leaf
- **Depth colors** - Cycle colors by tree level

### Navigation

- **Full keyboard support** - Vim keys, arrows, Home/End, PageUp/Down
- **Mouse support** - Click to select, toggle on selection
- **Events** - select, toggle, expand, collapse

---

## Basic Usage

```typescript
import { Screen, Tree } from "@gavin-lynch/unblessed-node";

const screen = new Screen({ smartCSR: true });

const tree = new Tree({
  parent: screen,
  top: 0,
  left: 0,
  width: "50%",
  height: "100%",
  border: "line",
  label: " File Explorer ",
  keys: true,
  vi: true,
  mouse: true,
  data: {
    name: "root",
    extended: true,
    children: {
      folder1: {
        children: {
          "file1.txt": {},
          "file2.txt": {},
        },
      },
      folder2: {
        children: {
          "file3.txt": {},
        },
      },
    },
  },
});

tree.on("select", (node, index) => {
  console.log("Selected:", node.name);
});

tree.focus();
screen.render();
```

---

## TreePresets

Presets provide pre-configured `template`, `style`, and `iconRules` for common tree styles.

### TreePresets.Modern

A clean, IDE-like style with Nerd Font icons and space-based indentation.

```typescript
import { Screen, Tree, TreePresets } from "@gavin-lynch/unblessed-node";

const tree = new Tree({
  ...TreePresets.Modern,
  parent: screen,
  data: myData,
});
```

**Output:**

```
     src
      index.ts
      utils.ts
     package.json
    󰂺 README.md
```

**Modern preset includes:**
| Property | Value |
|----------|-------|
| `template.lines` | `false` |
| `template.spaces` | `true` |
| `template.indent` | `4` |
| `template.extend` | `""` (no indicator) |
| `template.retract` | `""` (no indicator) |
| `iconRules` | 50+ patterns for common file types |

### TreePresets.Classic

Traditional blessed-contrib compatible style with tree lines and `[+]/[-]` indicators.

```typescript
import { Screen, Tree, TreePresets } from "@gavin-lynch/unblessed-node";

const tree = new Tree({
  ...TreePresets.Classic,
  parent: screen,
  data: myData,
});
```

**Output:**

```
root [-]
├┬folder1 [-]
│├─file1.txt
│└─file2.txt
└─folder2 [+]
```

**Classic preset includes:**
| Property | Value |
|----------|-------|
| `template.lines` | `true` |
| `template.spaces` | `false` |
| `template.indent` | `2` |
| `template.extend` | `" [+]"` |
| `template.retract` | `" [-]"` |
| `iconRules` | `[]` (no auto-icons) |

### Overriding Preset Options

```typescript
const tree = new Tree({
  ...TreePresets.Modern,
  // Override specific options
  template: {
    ...TreePresets.Modern.template,
    indent: 2, // Change indent from 4 to 2
  },
  style: {
    ...TreePresets.Modern.style,
    icon: { fg: "yellow" }, // Change icon color
  },
  // Add custom iconRules while keeping preset's rules
  iconRules: [
    { test: (node) => node.modified, icon: "✗" }, // Custom rule first
    ...TreePresets.Modern.iconRules, // Then preset rules
  ],
  parent: screen,
  data: myData,
});
```

### Exported Icons

The preset module exports icon collections for custom use:

```typescript
import { NerdIcons, UnicodeIcons } from "@gavin-lynch/unblessed-node";

// Combine icons for status indicators
const data = {
  children: {
    "modified-file.ts": {
      icon: UnicodeIcons.modified + " " + NerdIcons.typescript, // ✗
    },
    "staged-file.js": {
      icon: UnicodeIcons.staged + " " + NerdIcons.javascript, // ★
    },
  },
};
```

**NerdIcons** (require Nerd Font):
`folder`, `folderOpen`, `file`, `fileCode`, `typescript`, `javascript`, `python`, `rust`, `go`, `java`, `ruby`, `php`, `csharp`, `cpp`, `c`, `swift`, `kotlin`, `html`, `css`, `sass`, `vue`, `react`, `svelte`, `json`, `yaml`, `xml`, `toml`, `markdown`, `text`, `pdf`, `git`, `github`, `config`, `npm`, `docker`, `image`, `shell`, `lock`

**UnicodeIcons** (work everywhere):
`collapsed` (▸), `expanded` (▾), `modified` (✗), `staged` (★), `folder`, `file`, `bullet`, `dash`

---

## Options Reference

### TreeOptions

| Option      | Type                            | Default                   | Description                           |
| ----------- | ------------------------------- | ------------------------- | ------------------------------------- |
| `data`      | `TreeNode`                      | `{}`                      | Initial tree data to display          |
| `extended`  | `boolean`                       | `false`                   | Whether nodes are expanded by default |
| `keys`      | `boolean \| string \| string[]` | `['+', 'space', 'enter']` | Keys to toggle node expansion         |
| `template`  | `TreeTemplate`                  | See below                 | Template configuration for rendering  |
| `style`     | `TreeStyle`                     | `{}`                      | Style configuration                   |
| `iconRules` | `TreeIconRule[]`                | `[]`                      | Rules for automatic icon assignment   |

### TreeTemplate

| Option            | Type               | Default     | Description                                                  |
| ----------------- | ------------------ | ----------- | ------------------------------------------------------------ |
| `collapse`        | `string`           | `' [+]'`    | Suffix shown when node is collapsed                          |
| `expand`          | `string`           | `' [-]'`    | Suffix shown when node is expanded                           |
| `prefixIndicator` | `(node) => string` | `undefined` | Left-side indicator (before icon/name)                       |
| `suffixIndicator` | `(node) => string` | `undefined` | Right-side indicator (after name, overrides collapse/expand) |
| `lines`           | `boolean`          | `true`      | Show Unicode tree lines (├─, └─, │)                          |
| `spaces`          | `boolean`          | `false`     | Use space-based indentation instead of lines                 |
| `indent`          | `number`           | `2`         | Spaces per indentation level                                 |

#### Indicator Positions

**Prefix indicators** (left side) - NERDTree/modern style:

```typescript
template: {
  prefixIndicator: (node) => node.extended ? '▾ ' : '▸ ',
  collapse: '',  // Disable suffix
  expand: '',
}
```

**Suffix indicators** (right side) - Classic style:

```typescript
template: {
  collapse: ' [+]',  // Shown when collapsed
  expand: ' [-]',    // Shown when expanded
}
```

**Both indicators** (custom):

```typescript
template: {
  prefixIndicator: (node) => node.extended ? '▾ ' : '▸ ',
  suffixIndicator: (node) => node.extended ? ' (open)' : ' (closed)',
}
```

### TreeStyle

| Option      | Type               | Description                       |
| ----------- | ------------------ | --------------------------------- |
| `border`    | `Partial<Style>`   | Border styling                    |
| `selected`  | `Partial<Style>`   | Selected item highlighting        |
| `item`      | `Partial<Style>`   | Default item style                |
| `line`      | `Partial<Style>`   | Tree line characters (├, └, │, ─) |
| `indicator` | `Partial<Style>`   | Expand/collapse indicators        |
| `icon`      | `Partial<Style>`   | Node icons (emoji, nerd fonts)    |
| `expanded`  | `Partial<Style>`   | Expanded folder nodes             |
| `collapsed` | `Partial<Style>`   | Collapsed folder nodes            |
| `leaf`      | `Partial<Style>`   | Leaf nodes (no children)          |
| `depth`     | `Partial<Style>[]` | Depth-cycling colors              |
| `spacer`    | `string`           | Characters between lines and text |

---

## TreeNode Structure

```typescript
interface TreeNode {
  // Display name - uses object key if not provided
  name?: string;

  // Icon - can be a string OR a function that receives the node
  icon?: string | ((node: TreeNode) => string);

  // Whether node is expanded (default: false or options.extended)
  extended?: boolean;

  // Child nodes - object or lazy-load function
  children?:
    | Record<string, TreeNode>
    | ((node: TreeNode) => Record<string, TreeNode>);

  // Custom data (accessible in icon functions, iconRules, and events)
  [key: string]: any;
}
```

### Dynamic Icons

The `icon` property can be a function that receives the node and returns an icon string.
This allows icons to change based on node state (e.g., open/closed folders):

```typescript
// Helper function for folder icons
const folderIcon = (node) => (node.extended ? "" : "");

const tree = new Tree({
  data: {
    name: "src",
    icon: folderIcon, // Dynamic: shows open/closed based on state
    extended: true,
    children: {
      "index.ts": { icon: "" }, // Static icon (string)
    },
  },
});
```

### Icon with Status Indicators

Combine status indicators with dynamic folder icons:

```typescript
const folderWithStatus = (status) => (node) =>
  status + ' ' + (node.extended ? '' : '');

const data = {
  name: 'packages',
  icon: folderWithStatus('✗ ★'),  // Shows: "✗ ★ " or "✗ ★ "
  children: { ... }
};
```

**Priority order:**

1. `icon` (explicit - string or function)
2. `iconRules` (pattern/function matching)

````

**Example with all properties:**

```typescript
const data = {
  name: 'project',
  icon: '📁',
  extended: true,
  modified: true,  // Custom data
  children: {
    'src': {
      extended: true,
      children: {
        'index.ts': { size: 1024 },  // Custom data
        'utils.ts': { size: 512 },
      }
    },
    'README.md': { icon: '📝' },  // Manual icon override
  }
};
````

---

## Icon Rules (iconRules)

Automatically assign icons based on patterns or conditions. Rules are evaluated in order; **first match wins**. Explicit `node.icon` always takes precedence.

### Interface

```typescript
interface TreeIconRule {
  test: string | ((node: TreeNode) => boolean);
  icon: string;
}
```

### Glob Pattern Rules

```typescript
iconRules: [
  { test: "*.ts", icon: "" }, // TypeScript
  { test: "*.tsx", icon: "" }, // TSX
  { test: "*.js", icon: "" }, // JavaScript
  { test: "*.json", icon: "" }, // JSON
  { test: "*.md", icon: "󰂺" }, // Markdown
  { test: ".git*", icon: "" }, // Git files
  { test: "*config*", icon: "" }, // Config files
  { test: "*rc", icon: "" }, // RC files
  { test: "*", icon: "" }, // Default (catch-all)
];
```

**Supported patterns:**

- `*` - matches any characters (zero or more)
- `?` - matches single character
- Case-insensitive matching

### Function Rules

```typescript
iconRules: [
  // Folders (nodes with children)
  { test: (node) => !!node.children, icon: "" },

  // Hidden files
  { test: (node) => node.name?.startsWith("."), icon: "🔒" },

  // Custom property checks
  { test: (node) => node.modified === true, icon: "✗ " },
  { test: (node) => node.staged === true, icon: "★ " },

  // Size-based icons
  { test: (node) => node.size > 1000000, icon: "📊" },
];
```

### Combined Rules (Recommended)

```typescript
const tree = new Tree({
  iconRules: [
    // 1. Status indicators (most specific - check first)
    { test: (node) => node.modified, icon: "✗ " + NerdIcons.file },
    { test: (node) => node.staged, icon: "★ " + NerdIcons.file },

    // 2. Folders
    { test: (node) => !!node.children, icon: NerdIcons.folder },

    // 3. Specific file types
    { test: "*.ts", icon: NerdIcons.typescript },
    { test: "*.tsx", icon: NerdIcons.typescript },
    { test: "*.js", icon: NerdIcons.javascript },
    { test: "*.md", icon: NerdIcons.markdown },
    { test: "*.json", icon: NerdIcons.json },

    // 4. Config files
    { test: ".git*", icon: NerdIcons.git },
    { test: "*config*", icon: NerdIcons.config },

    // 5. Default (catch-all - always last)
    { test: "*", icon: NerdIcons.file },
  ],
  data: myData,
});
```

---

## Rendering Styles

### Modern/IDE Style

Clean, space-based indentation with icons. No tree lines or indicators.

```
     src
      index.ts
      utils.ts
     package.json
    󰂺 README.md
```

```typescript
template: {
  lines: false,
  spaces: true,
  extend: '',      // No indicator
  retract: '',     // No indicator
  indent: 4,       // 4 spaces first level, +1 per nested
}
```

### Classic/Traditional Style

Tree lines showing hierarchy with expand/collapse indicators.

```
root [-]
├┬folder1 [-]
│├─file1.txt
│└─file2.txt
└─folder2 [+]
```

```typescript
template: {
  lines: true,
  spaces: false,
  extend: ' [+]',
  retract: ' [-]',
  indent: 2,
}
```

### Unicode Triangles Style

Modern indicators with tree lines.

```
root ▾
├┬folder1 ▾
│├─file1.txt
│└─file2.txt
└─folder2 ▸
```

```typescript
template: {
  lines: true,
  spaces: false,
  extend: ' ▸',    // Default
  retract: ' ▾',   // Default
}
```

### ASCII Fallback

For terminals without Unicode support.

```
root [-]
|-folder1 [-]
| |-file1.txt
| |-file2.txt
|-folder2 [+]
```

```typescript
template: {
  lines: false,    // Disables Unicode lines, uses |-
  spaces: false,
  extend: ' [+]',
  retract: ' [-]',
}
```

---

## Styling

### Colorful Theme

```typescript
style: {
  border: { fg: 'cyan' },
  selected: { bg: 'blue', fg: 'white', bold: true },
  line: { fg: 'cyan' },
  indicator: { fg: 'yellow' },
  icon: { fg: 'cyan' },
  expanded: { fg: 'green' },
  collapsed: { fg: 'magenta' },
  leaf: { fg: 'white' },
}
```

### Depth-Based Colors

Colors cycle through the array based on node depth.

```typescript
style: {
  depth: [
    { fg: 'cyan' },     // Level 0 (root)
    { fg: 'green' },    // Level 1
    { fg: 'yellow' },   // Level 2
    { fg: 'magenta' },  // Level 3
    // Cycles back to cyan for level 4+
  ],
}
```

### Monochrome Theme

```typescript
style: {
  border: { fg: 'white' },
  selected: { bg: 'white', fg: 'black' },
  line: { fg: 'gray' },
  indicator: { fg: 'white' },
  icon: { fg: 'gray' },
  expanded: { fg: 'white' },
  collapsed: { fg: 'gray' },
  leaf: { fg: 'gray' },
}
```

---

## Events

| Event      | Callback                                  | Description                |
| ---------- | ----------------------------------------- | -------------------------- |
| `select`   | `(node: TreeNode, index: number) => void` | Selection changed          |
| `toggle`   | `(node: TreeNode) => void`                | Node expanded or collapsed |
| `expand`   | `(node: TreeNode) => void`                | Node expanded              |
| `collapse` | `(node: TreeNode) => void`                | Node collapsed             |

```typescript
tree.on("select", (node, index) => {
  infoPanel.setContent(`Selected: ${node.name} at index ${index}`);
  screen.render();
});

tree.on("toggle", (node) => {
  console.log(
    `${node.name} is now ${node.extended ? "expanded" : "collapsed"}`,
  );
});

tree.on("expand", (node) => {
  // Load children dynamically
  if (!node.childrenContent) {
    loadChildren(node);
  }
});
```

---

## Methods

| Method            | Signature                                 | Description            |
| ----------------- | ----------------------------------------- | ---------------------- |
| `setData`         | `(data: TreeNode) => void`                | Replace tree data      |
| `getSelectedNode` | `() => DisplayNode \| undefined`          | Get current selection  |
| `toggleSelected`  | `() => void`                              | Toggle current node    |
| `expand`          | `(target: number \| DisplayNode) => void` | Expand specific node   |
| `collapse`        | `(target: number \| DisplayNode) => void` | Collapse specific node |
| `expandAll`       | `() => void`                              | Expand all nodes       |
| `collapseAll`     | `() => void`                              | Collapse all nodes     |

```typescript
// Update tree data
tree.setData(newTreeData);

// Get selected node
const node = tree.getSelectedNode();
console.log(node?.name, node?.depth);

// Programmatic expand/collapse
tree.expand(0); // Expand first node
tree.collapseAll();

// Keyboard shortcuts
screen.key("e", () => tree.expandAll());
screen.key("c", () => tree.collapseAll());
```

---

## Keyboard Navigation

| Key                     | Action                 |
| ----------------------- | ---------------------- |
| `↑` / `k`               | Move selection up      |
| `↓` / `j`               | Move selection down    |
| `←` / `h`               | Collapse current node  |
| `→` / `l`               | Expand current node    |
| `Home` / `g`            | Jump to first item     |
| `End` / `G`             | Jump to last item      |
| `PageUp`                | Page up                |
| `PageDown`              | Page down              |
| `Space` / `Enter` / `+` | Toggle expand/collapse |

---

## Advanced Examples

### File Explorer with Status Indicators

```typescript
import {
  Screen,
  Tree,
  Box,
  TreePresets,
  NerdIcons,
  UnicodeIcons,
} from "@gavin-lynch/unblessed-node";

const screen = new Screen({ smartCSR: true, title: "File Explorer" });

const tree = new Tree({
  ...TreePresets.Modern,
  parent: screen,
  width: "50%",
  height: "100%",
  border: "line",
  label: " Explorer ",
  // Override iconRules to add status indicators
  iconRules: [
    // Status indicators first
    {
      test: (node) => node.modified && node.staged,
      icon:
        UnicodeIcons.modified +
        " " +
        UnicodeIcons.staged +
        " " +
        NerdIcons.file,
    },
    {
      test: (node) => node.modified,
      icon: UnicodeIcons.modified + " " + NerdIcons.file,
    },
    {
      test: (node) => node.staged,
      icon: UnicodeIcons.staged + " " + NerdIcons.file,
    },
    // Then standard rules from preset
    ...TreePresets.Modern.iconRules,
  ],
  data: {
    extended: true,
    children: {
      src: {
        extended: true,
        children: {
          "index.ts": { modified: true },
          "utils.ts": { staged: true },
          "types.ts": { modified: true, staged: true },
        },
      },
      "package.json": {},
      "README.md": { staged: true },
    },
  },
});

// Info panel
const info = new Box({
  parent: screen,
  right: 0,
  width: "50%",
  height: "100%",
  border: "line",
  label: " Info ",
  tags: true,
});

tree.on("select", (node) => {
  const status = [];
  if (node.modified) status.push("{red-fg}modified{/red-fg}");
  if (node.staged) status.push("{green-fg}staged{/green-fg}");

  info.setContent(
    `{bold}Name:{/bold} ${node.name}\n` +
      `{bold}Type:{/bold} ${node.children ? "folder" : "file"}\n` +
      `{bold}Depth:{/bold} ${node.depth}\n` +
      `{bold}Status:{/bold} ${status.join(", ") || "clean"}`,
  );
  screen.render();
});

screen.key(["q", "escape"], () => process.exit(0));
screen.key("e", () => tree.expandAll());
screen.key("c", () => tree.collapseAll());

tree.focus();
screen.render();
```

### Lazy-Loaded Children

```typescript
const tree = new Tree({
  ...TreePresets.Classic,
  parent: screen,
  data: {
    name: "root",
    extended: true,
    children: (node) => {
      // Called once when node is first expanded
      // Must be synchronous - pre-fetch or use placeholder
      console.log("Loading children for:", node.name);

      // Simulated file system
      return {
        folder1: {
          children: (n) => ({
            nested1: {},
            nested2: {},
          }),
        },
        folder2: { children: {} },
        "file1.txt": {},
      };
    },
  },
});
```

### Hybrid Preset (Classic + Icons)

```typescript
import { TreePresets, NerdIcons } from "@gavin-lynch/unblessed-node";

const tree = new Tree({
  // Start with Classic template (tree lines, [+]/[-])
  template: TreePresets.Classic.template,
  // Use Modern's styling
  style: TreePresets.Modern.style,
  // Add iconRules to Classic
  iconRules: [
    { test: (node) => !!node.children, icon: NerdIcons.folder },
    { test: "*.ts", icon: NerdIcons.typescript },
    { test: "*.js", icon: NerdIcons.javascript },
    { test: "*", icon: NerdIcons.file },
  ],
  parent: screen,
  data: myData,
});
```

---

## Icon Reference

### Nerd Font Icons

Requires a [Nerd Font](https://www.nerdfonts.com/) installed.

| Icon | Code      | Name         | Usage            |
| ---- | --------- | ------------ | ---------------- |
|      | `0xf07b`  | `folder`     | Directories      |
|      | `0xf07c`  | `folderOpen` | Open directories |
|      | `0xf15b`  | `file`       | Generic files    |
|      | `0xe628`  | `typescript` | `.ts`, `.tsx`    |
|      | `0xe74e`  | `javascript` | `.js`, `.jsx`    |
|      | `0xe60b`  | `json`       | `.json`          |
| 󰂺    | `0xf00ba` | `markdown`   | `.md`            |
|      | `0xe702`  | `git`        | `.git*`          |
|      | `0xe615`  | `config`     | Config files     |
|      | `0xe73c`  | `python`     | `.py`            |
|      | `0xe7a8`  | `rust`       | `.rs`            |
|      | `0xe627`  | `go`         | `.go`            |
|      | `0xe736`  | `html`       | `.html`          |
|      | `0xe749`  | `css`        | `.css`           |
|      | `0xf308`  | `docker`     | `Dockerfile`     |
|      | `0xe71e`  | `npm`        | `package.json`   |

**Usage with `String.fromCodePoint()`:**

```typescript
const folderIcon = String.fromCodePoint(0xf07b); //
const tsIcon = String.fromCodePoint(0xe628); //
```

### Unicode Symbols

Work in all terminals without special fonts.

| Symbol | Code     | Name        | Usage               |
| ------ | -------- | ----------- | ------------------- |
| ▸      | `\u25B8` | `collapsed` | Collapsed indicator |
| ▾      | `\u25BE` | `expanded`  | Expanded indicator  |
| ✗      | `\u2717` | `modified`  | Modified status     |
| ★      | `\u2605` | `staged`    | Staged status       |
| ✓      | `\u2713` | —           | Success             |
| ●      | `\u25CF` | —           | Active/selected     |
| ○      | `\u25CB` | —           | Inactive            |
| •      | `\u2022` | `bullet`    | List item           |
| ─      | `\u2500` | `dash`      | Horizontal line     |

---

## Tips & Best Practices

### 1. Use Presets as Starting Points

```typescript
// Start with a preset, customize as needed
const tree = new Tree({
  ...TreePresets.Modern,
  style: {
    ...TreePresets.Modern.style,
    icon: { fg: "yellow" }, // Just change icon color
  },
  data: myData,
});
```

### 2. Order iconRules from Specific to General

```typescript
iconRules: [
  // Most specific first
  { test: (node) => node.name === "package.json", icon: NerdIcons.npm },
  { test: "*.test.ts", icon: "🧪" },

  // Then patterns
  { test: "*.ts", icon: NerdIcons.typescript },
  { test: "*.js", icon: NerdIcons.javascript },

  // Catch-all last
  { test: "*", icon: NerdIcons.file },
];
```

### 3. Use `String.fromCodePoint()` for Nerd Fonts

Avoids file encoding issues with high Unicode codepoints:

```typescript
// ✅ Good - works regardless of file encoding
const icon = String.fromCodePoint(0xf07b);

// ❌ Risky - may corrupt in some editors/systems
const icon = "";
```

### 4. Combine Function and Glob Rules

```typescript
iconRules: [
  // Functions for complex logic
  {
    test: (node) => !!node.children && node.extended,
    icon: NerdIcons.folderOpen,
  },
  { test: (node) => !!node.children, icon: NerdIcons.folder },
  { test: (node) => node.size > 1000000, icon: "📊" },

  // Globs for simple patterns
  { test: "*.ts", icon: NerdIcons.typescript },
  { test: "*", icon: NerdIcons.file },
];
```

### 5. Lazy Load Large Trees

```typescript
const tree = new Tree({
  data: {
    name: "root",
    children: (node) => {
      // Only called when node is expanded
      return fetchDirectoryContents(node.path);
    },
  },
});
```

### 6. Access Node Data in Events

```typescript
tree.on("select", (node, index) => {
  // Access standard properties
  console.log(node.name, node.depth, node.extended);

  // Access custom data
  console.log(node.path, node.size, node.modified);

  // Access parent
  console.log(node.parent?.name);

  // Access via tree.nodeLines
  console.log(tree.nodeLines[index]);
});
```

### 7. Vim-Tree Style for Clean UI

```typescript
template: {
  lines: false,
  spaces: true,
  extend: '',
  retract: '',
  indent: 4,
}
```

### 8. blessed-contrib Compatibility

Use `TreePresets.Classic` for drop-in compatibility with blessed-contrib dashboards:

```typescript
const tree = new Tree({
  ...TreePresets.Classic,
  // Works exactly like blessed-contrib's tree
});
```
