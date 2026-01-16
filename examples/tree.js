#!/usr/bin/env node

/**
 * Tree Widget Demo - Classic vs Modern (NERDTree) Styles
 * Run with: node examples/tree-demo.js
 *
 * This demo shows both tree styles side by side:
 * - Left: Classic preset (tree lines, [+]/[-] suffix indicators)
 * - Right: Modern preset (NERDTree style with triangle indicators, Nerd Font icons)
 *
 * Controls:
 *   Tab      - Switch between trees
 *   Up/Down  - Navigate
 *   Enter    - Toggle expand/collapse
 *   e        - Expand all
 *   c        - Collapse all
 *   q/Esc    - Quit
 */

import { NodeRuntime } from '../packages/node/dist/index.js';
import { 
  setRuntime, 
  Screen, 
  Tree, 
  Box, 
  TreePresets,
  NerdIcons,
  UnicodeIcons,
} from '../packages/core/dist/index.js';

// Initialize Node.js runtime
setRuntime(new NodeRuntime());

// Create screen
const screen = new Screen({
  smartCSR: true,
  title: 'Tree Widget Demo - Classic vs Modern',
});

// =============================================================================
// Helper: Dynamic folder icon (changes based on expanded state)
// =============================================================================
const folderIcon = (node) => node.extended ? NerdIcons.folderOpen : NerdIcons.folder;

// =============================================================================
// LEFT SIDE: Classic Preset (blessed-contrib compatible)
// =============================================================================

const classicTree = new Tree({
  // Spread the Classic preset - provides template, style, iconRules
  ...TreePresets.Classic,
  parent: screen,
  top: 0,
  left: 0,
  width: '50%',
  height: '70%',
  border: 'line',
  label: ' Classic Style ',
  tags: true,
  keys: true,
  vi: true,
  mouse: true,
  data: {
    name: '/',
    extended: true,
    children: {
      'home': {
        extended: true,
        children: {
          'user': {
            extended: true,
            children: {
              'documents': {
                children: {
                  'readme.txt': {},
                  'notes.md': {},
                  'report.pdf': {},
                }
              },
              'pictures': { children: { 'photo.jpg': {}, 'icon.png': {} } },
              '.config': { children: { 'settings.json': {} } },
            }
          }
        }
      },
      'etc': { children: { 'hosts': {}, 'passwd': {} } },
      'var': { children: { 'log': { children: { 'syslog': {} } } } },
      'usr': { children: { 'bin': { children: {} }, 'lib': { children: {} } } },
    },
  },
});

// =============================================================================
// RIGHT SIDE: Modern Preset (NERDTree Style)
// =============================================================================

const modernTree = new Tree({
  // Spread the Modern preset - provides template (with prefixIndicator), style, iconRules
  ...TreePresets.Modern,
  parent: screen,
  top: 0,
  right: 0,
  width: '50%',
  height: '70%',
  border: 'line',
  label: ' Modern (NERDTree) Style ',
  tags: true,
  keys: true,
  vi: true,
  mouse: true,
  data: {
    name: 'my-project',
    icon: folderIcon,
    extended: true,
    children: {
      '.git': {
        icon: NerdIcons.git,
        children: {
          'config': { icon: NerdIcons.file },
          'HEAD': { icon: NerdIcons.file },
        },
      },
      'src': {
        icon: folderIcon,
        extended: true,
        children: {
          'components': {
            icon: folderIcon,
            children: {
              'Button.tsx': { icon: NerdIcons.typescript },
              'Input.tsx': { icon: NerdIcons.typescript },
              'Modal.tsx': { icon: NerdIcons.typescript },
            },
          },
          'utils': {
            icon: folderIcon,
            children: {
              'helpers.ts': { icon: NerdIcons.typescript },
              'api.ts': { icon: NerdIcons.typescript },
            },
          },
          'index.ts': { icon: NerdIcons.typescript },
          'App.tsx': { icon: NerdIcons.typescript },
          'styles.css': { icon: NerdIcons.css },
        },
      },
      'public': {
        icon: folderIcon,
        children: {
          'index.html': { icon: NerdIcons.html },
          'favicon.ico': { icon: NerdIcons.image },
        },
      },
      'docs': {
        icon: folderIcon,
        children: {
          'README.md': { icon: NerdIcons.markdown },
          'CHANGELOG.md': { icon: NerdIcons.markdown },
        },
      },
      '.gitignore': { icon: NerdIcons.git },
      'package.json': { icon: NerdIcons.json },
      'package-lock.json': { icon: NerdIcons.lock },
      'tsconfig.json': { icon: NerdIcons.typescript },
      'README.md': { icon: NerdIcons.markdown },
    },
  },
});

// =============================================================================
// BOTTOM LEFT: Classic Style Info
// =============================================================================

const classicInfoBox = new Box({
  parent: screen,
  bottom: 0,
  left: 0,
  width: '50%',
  height: '30%',
  border: 'line',
  label: ' TreePresets.Classic ',
  tags: true,
  style: { border: { fg: 'green' } },
  content: `{bold}TreePresets.Classic{/bold}

{cyan-fg}template:{/cyan-fg}
  lines: {green-fg}true{/green-fg}       {gray-fg}// Tree lines (|, +-, \\-){/gray-fg}
  spaces: {red-fg}false{/red-fg}
  collapse: {magenta-fg}" [+]"{/magenta-fg}  {gray-fg}// Suffix indicator{/gray-fg}
  expand: {magenta-fg}" [-]"{/magenta-fg}

{cyan-fg}style:{/cyan-fg}
  line: {cyan-fg}cyan{/cyan-fg}  indicator: {green-fg}green{/green-fg}

{cyan-fg}iconRules:{/cyan-fg} {gray-fg}[] (none - manual icons only){/gray-fg}`,
});

// =============================================================================
// BOTTOM RIGHT: Modern Style Info
// =============================================================================

const modernInfoBox = new Box({
  parent: screen,
  bottom: 0,
  right: 0,
  width: '50%',
  height: '30%',
  border: 'line',
  label: ' TreePresets.Modern ',
  tags: true,
  style: { border: { fg: 'yellow' } },
  content: `{bold}TreePresets.Modern{/bold}

{cyan-fg}template:{/cyan-fg}
  lines: {red-fg}false{/red-fg}      {gray-fg}// No tree lines{/gray-fg}
  spaces: {green-fg}true{/green-fg}
  prefixIndicator: {magenta-fg}(node) => ...{/magenta-fg}
    {gray-fg}// ${UnicodeIcons.collapsed} collapsed, ${UnicodeIcons.expanded} expanded{/gray-fg}
  collapse/expand: {magenta-fg}""{/magenta-fg}

{cyan-fg}iconRules:{/cyan-fg} {gray-fg}50+ patterns (auto-icons){/gray-fg}
{cyan-fg}node.icon:{/cyan-fg} {gray-fg}string | function{/gray-fg}`,
});

// =============================================================================
// Event Handlers
// =============================================================================

// Track which tree is focused
let focusedTree = classicTree;

// Update border colors based on focus
const updateFocusStyles = () => {
  modernTree.style.border.fg = focusedTree === modernTree ? 'cyan' : 'white';
  classicTree.style.border.fg = focusedTree === classicTree ? 'cyan' : 'white';
  screen.render();
};

// Tab to switch between trees
screen.key(['tab'], () => {
  if (focusedTree === classicTree) {
    focusedTree = modernTree;
    modernTree.focus();
  } else {
    focusedTree = classicTree;
    classicTree.focus();
  }
  updateFocusStyles();
});

// Focus events
modernTree.on('focus', () => {
  focusedTree = modernTree;
  updateFocusStyles();
});

classicTree.on('focus', () => {
  focusedTree = classicTree;
  updateFocusStyles();
});

// Expand all
screen.key(['e'], () => {
  focusedTree.expandAll();
});

// Collapse all
screen.key(['c'], () => {
  focusedTree.collapseAll();
});

// Quit
screen.key(['q', 'escape', 'C-c'], () => {
  screen.destroy();
  process.exit(0);
});

// =============================================================================
// Initialize
// =============================================================================

classicTree.focus();
updateFocusStyles();
screen.render();
