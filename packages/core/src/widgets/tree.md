# Tree Widget

A collapsible tree widget for displaying hierarchical data structures with full customization support.

## Overview

The Tree widget extends `List` to provide a navigable, collapsible tree structure. It supports multiple rendering styles (traditional tree lines or vim-tree style), automatic icon assignment via rules, comprehensive styling, and full keyboard/mouse navigation.

## Features

- **Collapsible nodes** with configurable toggle keys
- **Multiple rendering styles**: Unicode tree lines, ASCII fallback, or vim-tree (space-based)
- **Node icons**: Manual per-node icons or automatic assignment via `iconRules`
- **Lazy-loaded children** via callback functions
- **Comprehensive styling**: lines, indicators, icons, node types, depth-based colors
- **Full keyboard navigation**: up/down/left/right/home/end/pgup/pgdn
- **Mouse support**: click to select, double-click to toggle
- **Events**: select, toggle, expand, collapse

## Basic Usage

```typescript
import { Screen, Tree } from '@unblessed/node';

const screen = new Screen({ smartCSR: true });

const tree = new Tree({
  parent: screen,
  top: 0,
  left: 0,
  width: '50%',
  height: '100%',
  border: 'line',
  label: ' File Explorer ',
  keys: true,
  vi: true,
  mouse: true,
  data: {
    name: 'root',
    extended: true,
    children: {
      'folder1': {
        children: {
          'file1.txt': {},
          'file2.txt': {},
        }
      },
      'folder2': {
        children: {
          'file3.txt': {}
        }
      }
    }
  }
});

tree.on('select', (node, index) => {
  console.log('Selected:', node.name);
});

tree.focus();
screen.render();
```

## Options

### TreeOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `data` | `TreeNode` | `{}` | Initial tree data to display |
| `extended` | `boolean` | `false` | Whether nodes are expanded by default |
| `keys` | `boolean \| string \| string[]` | `['+', 'space', 'enter']` | Keys to toggle node expansion |
| `template` | `TreeTemplate` | See below | Template configuration for rendering |
| `style` | `TreeStyle` | `{}` | Style configuration |
| `iconRules` | `TreeIconRule[]` | `[]` | Rules for automatic icon assignment |

### TreeTemplate

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `extend` | `string` | `' [+]'` | Suffix for collapsed nodes with children |
| `retract` | `string` | `' [-]'` | Suffix for expanded nodes with children |
| `lines` | `boolean` | `true` | Show tree lines (├─, └─, │) |
| `spaces` | `boolean` | `false` | Use space-based indentation (vim-tree style) |
| `indent` | `number` | `2` | Spaces per indentation level (when `spaces: true`) |

### TreeStyle

| Option | Type | Description |
|--------|------|-------------|
| `line` | `Partial<Style>` | Style for tree lines (├, └, │, ─) |
| `indicator` | `Partial<Style>` | Style for expand/collapse indicators ([+], [-]) |
| `icon` | `Partial<Style>` | Style for node icons |
| `expanded` | `Partial<Style>` | Style for expanded (open) folders |
| `collapsed` | `Partial<Style>` | Style for collapsed folders |
| `leaf` | `Partial<Style>` | Style for leaf nodes (no children) |
| `depth` | `Partial<Style>[]` | Array of styles that cycle by depth level |
| `spacer` | `string` | Character(s) between tree lines and node text |

## TreeNode Structure

```typescript
interface TreeNode {
  name?: string;           // Display name (key used if not provided)
  icon?: string;           // Icon prefix (emoji, nerd font, text)
  extended?: boolean;      // Whether node is expanded
  children?: Record<string, TreeNode> | ((node: TreeNode) => Record<string, TreeNode>);
  [key: string]: any;      // Custom data
}
```

## Icon Rules (iconRules)

Automatically assign icons to nodes based on patterns or conditions. Rules are evaluated in order; first match wins. Explicit `node.icon` takes precedence over rules.

### TreeIconRule Interface

```typescript
interface TreeIconRule {
  test: string | ((node: TreeNode) => boolean);
  icon: string;
}
```

### Pattern-Based Rules (Glob)

```typescript
iconRules: [
  { test: '*.ts', icon: '📘' },      // TypeScript files
  { test: '*.tsx', icon: '📘' },     // TSX files
  { test: '*.md', icon: '📝' },      // Markdown
  { test: '*.json', icon: '📦' },    // JSON
  { test: '.git*', icon: '🔧' },     // Git files
  { test: '*rc', icon: '⚙️' },       // RC config files
  { test: '*', icon: '📄' },         // Catch-all default
]
```

**Supported glob patterns:**
- `*` - matches any characters
- `?` - matches single character
- Patterns are case-insensitive

### Function-Based Rules

```typescript
iconRules: [
  // Folders (nodes with children)
  { test: (node) => !!node.children, icon: '📁' },
  
  // Hidden files (start with .)
  { test: (node) => node.name?.startsWith('.'), icon: '🔒' },
  
  // Custom property check
  { test: (node) => node.modified === true, icon: '✗' },
  
  // Size-based
  { test: (node) => node.size > 1000000, icon: '📊' },
]
```

### Combined Rules Example

```typescript
const tree = new Tree({
  iconRules: [
    // Folders first (most specific)
    { test: (node) => !!node.children, icon: String.fromCodePoint(0xf07b) },
    
    // Language-specific files
    { test: '*.ts', icon: String.fromCodePoint(0xe628) },
    { test: '*.js', icon: String.fromCodePoint(0xe74e) },
    { test: '*.md', icon: String.fromCodePoint(0xf00ba) },
    { test: '*.json', icon: String.fromCodePoint(0xe60b) },
    
    // Config files
    { test: '.git*', icon: String.fromCodePoint(0xe702) },
    { test: '*config*', icon: String.fromCodePoint(0xe615) },
    
    // Default file
    { test: '*', icon: String.fromCodePoint(0xf15b) },
  ],
  data: {
    extended: true,
    children: {
      'src': { children: { 'index.ts': {}, 'utils.ts': {} } },
      '.gitignore': {},
      'package.json': {},
      'README.md': {},
    }
  }
});
```

## Rendering Styles

### Traditional Tree Lines (Default)

```
root [-]
├┬folder1 [-]
│├─file1.txt
│└─file2.txt
└─folder2 [+]
```

```typescript
template: {
  lines: true,    // Show tree lines
  spaces: false,
}
```

### Vim-Tree Style (Space-Based)

```
    📁 root
    📁 folder1
     📄 file1.txt
     📄 file2.txt
    📁 folder2
```

```typescript
template: {
  lines: false,
  spaces: true,
  extend: '',     // No [+] indicator
  retract: '',    // No [-] indicator
  indent: 4,      // 4 spaces at first level, +1 per nested level
}
```

### ASCII Fallback

```
root [-]
|-folder1 [-]
| |-file1.txt
| |-file2.txt
|-folder2 [+]
```

```typescript
template: {
  lines: false,   // Disables unicode, uses |- instead
  spaces: false,
}
```

## Styling Examples

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

```typescript
style: {
  depth: [
    { fg: 'cyan' },     // Level 0
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
  line: { fg: 'white' },
  indicator: { fg: 'white' },
  expanded: { fg: 'white' },
  collapsed: { fg: 'gray' },
  leaf: { fg: 'gray' },
}
```

## Lazy-Loaded Children

Load children dynamically when a node is expanded:

```typescript
const tree = new Tree({
  data: {
    name: 'root',
    extended: true,
    children: (node) => {
      // Called once when node is first expanded
      // Return value is cached in node.childrenContent
      return fetchChildrenFromAPI(node.name);
    }
  }
});

// Example async pattern
function fetchChildrenFromAPI(parentName) {
  // Synchronous return required - pre-fetch or use placeholder
  return {
    'loading...': {}
  };
}
```

## Events

| Event | Callback Signature | Description |
|-------|-------------------|-------------|
| `select` | `(node: TreeNode, index: number) => void` | Fired when selection changes |
| `toggle` | `(node: TreeNode) => void` | Fired when node is expanded or collapsed |
| `expand` | `(node: TreeNode) => void` | Fired when node is expanded |
| `collapse` | `(node: TreeNode) => void` | Fired when node is collapsed |

```typescript
tree.on('select', (node, index) => {
  infoPanel.setContent(`Selected: ${node.name}`);
  screen.render();
});

tree.on('toggle', (node) => {
  console.log(`${node.name} is now ${node.extended ? 'expanded' : 'collapsed'}`);
});
```

## Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `setData` | `(data: TreeNode) => void` | Set new tree data |
| `expandAll` | `() => void` | Expand all nodes |
| `collapseAll` | `() => void` | Collapse all nodes |

```typescript
// Update tree data
tree.setData(newTreeData);

// Expand/collapse all
screen.key('e', () => tree.expandAll());
screen.key('c', () => tree.collapseAll());
```

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `↑` / `k` | Move selection up |
| `↓` / `j` | Move selection down |
| `←` / `h` | Collapse current node |
| `→` / `l` | Expand current node |
| `Home` / `g` | Jump to first item |
| `End` / `G` | Jump to last item |
| `PageUp` | Page up |
| `PageDown` | Page down |
| `Space` / `Enter` / `+` | Toggle expand/collapse |

## Accessing Node Data

```typescript
// Get currently selected node
const selectedIndex = tree.selected;
const selectedNode = tree.nodeLines[selectedIndex];

console.log(selectedNode.name);      // Node name
console.log(selectedNode.depth);     // Depth level (0 = root)
console.log(selectedNode.extended);  // Is expanded?
console.log(selectedNode.parent);    // Parent node reference
console.log(selectedNode.children);  // Children (if any)
```

## Complete Example

```typescript
import { Screen, Tree, Box } from '@unblessed/node';

const screen = new Screen({ smartCSR: true, title: 'File Explorer' });

// Icon definitions (nerd font codepoints)
const icons = {
  folder: String.fromCodePoint(0xf07b),
  file: String.fromCodePoint(0xf15b),
  ts: String.fromCodePoint(0xe628),
  md: String.fromCodePoint(0xf00ba),
  json: String.fromCodePoint(0xe60b),
};

const tree = new Tree({
  parent: screen,
  width: '50%',
  height: '100%',
  border: 'line',
  label: ' Explorer ',
  keys: true,
  vi: true,
  mouse: true,
  template: {
    lines: false,
    spaces: true,
    extend: '',
    retract: '',
    indent: 4,
  },
  style: {
    border: { fg: 'cyan' },
    selected: { bg: 'blue', fg: 'white', bold: true },
    icon: { fg: 'cyan' },
  },
  iconRules: [
    { test: (node) => !!node.children, icon: icons.folder },
    { test: '*.ts', icon: icons.ts },
    { test: '*.md', icon: icons.md },
    { test: '*.json', icon: icons.json },
    { test: '*', icon: icons.file },
  ],
  data: {
    extended: true,
    children: {
      'src': {
        extended: true,
        children: {
          'index.ts': {},
          'utils.ts': {},
        }
      },
      'README.md': {},
      'package.json': {},
      'tsconfig.json': {},
    }
  }
});

const info = new Box({
  parent: screen,
  right: 0,
  width: '50%',
  height: '100%',
  border: 'line',
  label: ' Info ',
  content: 'Select a file...',
});

tree.on('select', (node) => {
  info.setContent(`Name: ${node.name}\nDepth: ${node.depth}\nType: ${node.children ? 'folder' : 'file'}`);
  screen.render();
});

screen.key(['q', 'escape'], () => process.exit(0));
screen.key('e', () => tree.expandAll());
screen.key('c', () => tree.collapseAll());

tree.focus();
screen.render();
```

## Nerd Font Icon Reference

Common nerd font icons for file trees:

| Icon | Codepoint | Usage |
|------|-----------|-------|
| `` | `0xf07b` | Folder |
| `` | `0xf07c` | Folder open |
| `` | `0xf15b` | File |
| `` | `0xe628` | TypeScript |
| `` | `0xe74e` | JavaScript |
| `` | `0xe60b` | JSON |
| `󰂺` | `0xf00ba` | Markdown |
| `` | `0xe702` | Git |
| `` | `0xe615` | Config |

**Note:** Requires a [Nerd Font](https://www.nerdfonts.com/) installed in your terminal.

## Unicode Symbol Reference

For terminals without nerd fonts:

| Symbol | Unicode | Usage |
|--------|---------|-------|
| `✗` | `\u2717` | Modified |
| `★` | `\u2605` | Staged |
| `✓` | `\u2713` | Success |
| `●` | `\u25CF` | Active |
| `○` | `\u25CB` | Inactive |
| `▸` | `\u25B8` | Collapsed |
| `▾` | `\u25BE` | Expanded |

## Tips

1. **Use `iconRules` for consistency**: Define rules once instead of setting icons on every node.

2. **Order rules from specific to general**: More specific patterns should come first.

3. **Combine function and glob rules**: Use functions for complex logic, globs for simple patterns.

4. **Use `String.fromCodePoint()` for nerd fonts**: Avoids file encoding issues with high Unicode characters.

5. **Vim-tree style for cleaner look**: Set `lines: false, spaces: true` for minimal UI.

6. **Lazy load large trees**: Use function children for directories with many items.
