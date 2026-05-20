/**
 * Tree widget demo (browser). Based on `packages/core/src/widgets/tree.md`
 * ("File Explorer with Status Indicators" + `TreePresets.Modern`).
 */

import {
  Box,
  BrowserRuntime,
  NerdIcons,
  Screen,
  setRuntime,
  Tree,
  TreePresets,
  type TreeNode,
  UnicodeIcons,
} from "@unblessed/browser";
import { FitAddon } from "xterm-addon-fit";
import { Terminal } from "xterm";

import "xterm/css/xterm.css";

setRuntime(new BrowserRuntime());

const fitAddon = new FitAddon();
const term = new Terminal({
  fontSize: 14,
  fontFamily:
    '"JetBrainsMono Nerd Font", "Symbols Nerd Font Mono", "SF Mono", Menlo, Monaco, "Courier New", monospace',
  theme: {
    background: "#050505",
    foreground: "#e8e8e8",
  },
});
term.loadAddon(fitAddon);

const mount = document.getElementById("terminal");
if (!mount) {
  throw new Error("#terminal element missing");
}
term.open(mount);
fitAddon.fit();
window.addEventListener("resize", () => fitAddon.fit());

const screen = new Screen({
  terminal: term,
  smartCSR: true,
  mouse: true,
});

const tree = new Tree({
  ...TreePresets.Modern,
  parent: screen,
  left: 0,
  top: 0,
  width: "50%",
  height: "100%",
  border: "line",
  label: " Explorer ",
  keys: true,
  vi: true,
  mouse: true,
  iconRules: [
    {
      test: (node) => !!(node.modified && node.staged),
      icon:
        UnicodeIcons.modified +
        " " +
        UnicodeIcons.staged +
        " " +
        NerdIcons.file,
    },
    {
      test: (node) => !!node.modified,
      icon: UnicodeIcons.modified + " " + NerdIcons.file,
    },
    {
      test: (node) => !!node.staged,
      icon: UnicodeIcons.staged + " " + NerdIcons.file,
    },
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

const info = new Box({
  parent: screen,
  right: 0,
  top: 0,
  width: "50%",
  height: "100%",
  border: "line",
  label: " Info ",
  tags: true,
  content:
    "{bold}Tree demo{/bold}\n\n" +
    "Select a node to see details.\n\n" +
    "{cyan-fg}Keys:{/cyan-fg}\n" +
    "  j/k or ↓/↑  navigate\n" +
    "  h/l or ←/→  collapse / expand\n" +
    "  Space / Enter  toggle folder\n" +
    "  e  expand all\n" +
    "  c  collapse all\n" +
    "  q / Esc / Ctrl+C  quit\n\n" +
    "{gray-fg}Nerd Font icons look best with a patched font installed; otherwise you may see placeholders.{/gray-fg}",
});

tree.on("select", (node: TreeNode) => {
  const status: string[] = [];
  if (node.modified) status.push("{red-fg}modified{/red-fg}");
  if (node.staged) status.push("{green-fg}staged{/green-fg}");

  info.setContent(
    `{bold}Name:{/bold} ${node.name ?? "(unknown)"}\n` +
      `{bold}Type:{/bold} ${node.children ? "folder" : "file"}\n` +
      `{bold}Depth:{/bold} ${node.depth ?? "—"}\n` +
      `{bold}Status:{/bold} ${status.join(", ") || "clean"}`,
  );
  screen.render();
});

tree.on("toggle", (node) => {
  console.log(
    `[tree] ${node.name} is now ${node.extended ? "expanded" : "collapsed"}`,
  );
});

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
});

screen.key("e", () => {
  tree.expandAll();
  screen.render();
});

screen.key("c", () => {
  tree.collapseAll();
  screen.render();
});

screen.on("resize", () => {
  screen.render();
});

tree.focus();
screen.render();
