#!/usr/bin/env tsx
/**
 * Tree Widget Demo - Classic vs Modern Styles
 * Run with: tsx packages/react/examples/tree-demo.tsx
 *
 * This demo shows both tree styles side by side:
 * - Left: Classic preset (tree lines, [+]/[-] suffix indicators)
 * - Right: Modern preset (triangle indicators, Nerd Font icons)
 *
 * Controls:
 *   Tab      - Cycle focus between panels
 *   Up/Down  - Navigate (j/k with vi mode)
 *   Enter    - Toggle expand/collapse (trees)
 *   q/Esc    - Quit
 */

import { NerdIcons, TreePresets } from "@gavin-lynch/unblessed-core";
import { NodeRuntime } from "@gavin-lynch/unblessed-node";
import { useState } from "react";
import { Box, List, render, Tree, useKeyboard } from "../dist/index.js";

// Generate preset info lines for display
const classicLines = [
  "{bold}{green-fg}TreePresets.Classic{/}",
  "{gray-fg}config: {{/}",
  "  {cyan-fg}lines{/}: {green-fg}true{/}",
  "  {cyan-fg}spaces{/}: {red-fg}false{/}",
  "  {cyan-fg}indent{/}: {yellow-fg}2{/}",
  '  {cyan-fg}collapse{/}: {magenta-fg}" [+]"{/}',
  '  {cyan-fg}expand{/}: {magenta-fg}" [-]"{/}',
  "{gray-fg}}{/}",
  "",
  "{bold}iconRules: []{/} {gray-fg}(none){/}",
];

const modernLines = [
  "{bold}{yellow-fg}TreePresets.Modern{/}",
  "{gray-fg}config: {{/}",
  "  {cyan-fg}lines{/}: {red-fg}false{/}",
  "  {cyan-fg}spaces{/}: {green-fg}true{/}",
  "  {cyan-fg}indent{/}: {yellow-fg}2{/}",
  "  {cyan-fg}prefixIndicator{/}: {magenta-fg}▸/▾{/}",
  "{gray-fg}}{/}",
  "",
  "{bold}iconRules:{/}",
  ...TreePresets.Modern.iconRules.map((rule) => {
    const pattern =
      typeof rule.test === "string" ? rule.test : "{gray-fg}(fn){/}";
    return `  {cyan-fg}${pattern}{/} → {yellow-fg}${rule.icon}{/}`;
  }),
];

// Dynamic folder icon (changes based on expanded state)
const folderIcon = (node: any) =>
  node.extended ? NerdIcons.folderOpen : NerdIcons.folder;

// Classic tree data (simple structure)
const classicData = {
  name: "/",
  extended: true,
  children: {
    home: {
      extended: true,
      children: {
        user: {
          extended: true,
          children: {
            documents: {
              children: {
                "readme.txt": {},
                "notes.md": {},
                "report.pdf": {},
              },
            },
            pictures: { children: { "photo.jpg": {}, "icon.png": {} } },
            ".config": { children: { "settings.json": {} } },
          },
        },
      },
    },
    etc: { children: { hosts: {}, passwd: {} } },
    var: { children: { log: { children: { syslog: {} } } } },
    usr: { children: { bin: { children: {} }, lib: { children: {} } } },
  },
};

// Modern tree data (with Nerd Font icons)
const modernData = {
  name: "my-project",
  icon: folderIcon,
  extended: true,
  children: {
    src: {
      icon: folderIcon,
      extended: true,
      children: {
        components: {
          icon: folderIcon,
          children: {
            "Button.tsx": { icon: NerdIcons.typescript },
            "Input.tsx": { icon: NerdIcons.typescript },
            "Modal.tsx": { icon: NerdIcons.typescript },
          },
        },
        utils: {
          icon: folderIcon,
          children: {
            "helpers.ts": { icon: NerdIcons.typescript },
            "api.ts": { icon: NerdIcons.typescript },
          },
        },
        "index.ts": { icon: NerdIcons.typescript },
        "App.tsx": { icon: NerdIcons.typescript },
        "styles.css": { icon: NerdIcons.css },
      },
    },
    ".git": {
      icon: NerdIcons.git,
      children: {
        config: { icon: NerdIcons.file },
        HEAD: { icon: NerdIcons.file },
      },
    },
    public: {
      icon: folderIcon,
      children: {
        "index.html": { icon: NerdIcons.html },
        "favicon.ico": { icon: NerdIcons.image },
      },
    },
    docs: {
      icon: folderIcon,
      children: {
        "README.md": { icon: NerdIcons.markdown },
        "CHANGELOG.md": { icon: NerdIcons.markdown },
      },
    },
    ".gitignore": { icon: NerdIcons.git },
    "package.json": { icon: NerdIcons.json },
    "package-lock.json": { icon: NerdIcons.lock },
    "tsconfig.json": { icon: NerdIcons.typescript },
    "README.md": { icon: NerdIcons.markdown },
  },
};

type Panel = "classicTree" | "modernTree" | "classicInfo" | "modernInfo";

function App() {
  const [focused, setFocused] = useState<Panel>("classicTree");

  const panels: Panel[] = [
    "classicTree",
    "modernTree",
    "classicInfo",
    "modernInfo",
  ];

  useKeyboard({
    tab: () =>
      setFocused((f) => {
        const idx = panels.indexOf(f);
        return panels[(idx + 1) % panels.length];
      }),
  });

  const borderColor = (panel: Panel) => (focused === panel ? "cyan" : "white");

  return (
    <Box flexDirection="column" width="100%" height="100%">
      {/* Top row: Both trees */}
      <Box flexDirection="row" height="70%">
        {/* Classic Tree */}
        <Box width="50%">
          <Tree
            preset="classic"
            data={classicData}
            label=" Classic Style "
            border={1}
            borderColor={borderColor("classicTree")}
            vi
            flexGrow={1}
          />
        </Box>

        {/* Modern Tree */}
        <Box width="50%">
          <Tree
            preset="modern"
            data={modernData}
            label=" Modern (NERDTree) Style "
            border={1}
            borderColor={borderColor("modernTree")}
            vi
            flexGrow={1}
          />
        </Box>
      </Box>

      {/* Bottom row: Scrollable preset info */}
      <Box flexDirection="row" height="30%">
        {/* Classic Preset Info */}
        <List
          items={classicLines}
          label=" Classic Preset "
          border={1}
          borderColor={borderColor("classicInfo")}
          tags
          vi
          scrollbar
          width="50%"
          flexGrow={1}
        />

        {/* Modern Preset Info */}
        <List
          items={modernLines}
          label=" Modern Preset "
          border={1}
          borderColor={borderColor("modernInfo")}
          tags
          vi
          scrollbar
          width="50%"
          flexGrow={1}
        />
      </Box>
    </Box>
  );
}

const instance = render(<App />, {
  runtime: new NodeRuntime(),
});

instance.screen.key(["q", "escape", "C-c"], () => {
  instance.unmount();
  process.exit(0);
});
