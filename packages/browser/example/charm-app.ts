/**
 * Lip Gloss style demo (Bubble Tea aesthetics) — browser port of
 * `packages/contrib/examples/charm.ts`.
 *
 * Recreates the layout and vibe of the Lip Gloss example:
 * tabs, stacked labels, dialog, lists, color grid, and cards.
 */

import { Box, BrowserRuntime, Screen, setRuntime } from "@unblessed/browser";
import { createTheme } from "@unblessed/theme";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

import "xterm/css/xterm.css";

setRuntime(new BrowserRuntime());

const fitAddon = new FitAddon();
const term = new Terminal({
  fontSize: 13,
  fontFamily: 'Menlo, Monaco, "Courier New", monospace',
  theme: {
    background: "#101010",
    foreground: "#e0e0e0",
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
  color: {
    mode: "truecolor",
    allowTruecolorFromContent: true,
    preferForStyle: "fidelity",
    preferForContent: "fidelity",
  },
});

screen.enableMouse();

screen.title = "Lip Gloss Example";

type RGB = [number, number, number];

type ThemeColors = {
  bg: string;
  panel: string;
  panelAlt: string;
  line: string;
  accentBorder: string;
  tabText: string;
  tabTextActive: string;
  text: RGB;
  muted: RGB;
  accent: RGB;
  accent2: RGB;
  accent3: RGB;
  accent4: RGB;
  purpleCard: string;
  statusBg: string;
};

const theme = createTheme({
  colors: {
    bg: "#101010",
    panel: "#1a1a1a",
    panelAlt: "#202020",
    line: "#5e4d8d",
    accentBorder: "#8a63ff",
    tabText: "#f0f0f0",
    tabTextActive: "#fdfbff",
    text: [224, 224, 224],
    muted: [146, 146, 146],
    accent: [255, 92, 184],
    accent2: [170, 120, 255],
    accent3: [72, 220, 176],
    accent4: [255, 196, 120],
    purpleCard: "#7b52e8",
    statusBg: "#2a2a2a",
  },
  spacing: { sm: 1, md: 2, lg: 3 },
});

const colors = theme.tokens.colors as ThemeColors;
const statusBgStyle = theme.utils.parseClasses("bg-statusBg").style ?? {
  bg: colors.statusBg,
};
const promptStyle = theme.utils.parseClasses("fg-muted bg-bg").style ?? {
  fg: "#929292",
  bg: colors.bg,
};

const rounded = {
  topLeft: "╭",
  top: "─",
  topRight: "╮",
  right: "│",
  bottomRight: "╯",
  bottom: "─",
  bottomLeft: "╰",
  left: "│",
};

function fg(rgb: RGB, text: string): string {
  return `\x1b[38;2;${rgb[0]};${rgb[1]};${rgb[2]}m${text}\x1b[39m`;
}

function bg(rgb: RGB, text: string): string {
  return `\x1b[48;2;${rgb[0]};${rgb[1]};${rgb[2]}m${text}\x1b[49m`;
}

function chip(bgRgb: RGB, fgRgb: RGB, text: string): string {
  return (
    `\x1b[48;2;${bgRgb[0]};${bgRgb[1]};${bgRgb[2]}m` +
    `\x1b[38;2;${fgRgb[0]};${fgRgb[1]};${fgRgb[2]}m` +
    `${text}\x1b[39m\x1b[49m`
  );
}

function hexToRgb(hex: string): RGB {
  const clean = hex.startsWith("#") ? hex.slice(1) : hex;
  const value = parseInt(clean, 16);
  const r = (value >> 16) & 0xff;
  const g = (value >> 8) & 0xff;
  const b = value & 0xff;
  return [r, g, b];
}

const _background = new Box({
  parent: screen,
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  ch: " ",
  style: theme.utils.parseClasses("bg-bg").style ?? { bg: colors.bg },
});

const commandLine = new Box({
  parent: screen,
  top: 1,
  left: 2,
  height: 1,
  width: "95%",
  tags: false,
  style: theme.utils.parseClasses("fg-text bg-bg").style ?? {
    fg: "#cfcfcf",
    bg: colors.bg,
  },
});

const tabsBar = new Box({
  parent: screen,
  height: 3,
  tags: true,
  style: theme.utils.parseClasses("fg-line bg-bg").style ?? {
    fg: colors.line,
    bg: colors.bg,
  },
});

tabsBar.on("click", (data: any) => {
  const lpos = tabsBar._getCoords();
  if (!lpos) return;
  const x = data.x - lpos.xi;
  const hit = tabRanges.find((range) => x >= range.start && x <= range.end);
  if (hit) {
    setActiveTab(hit.index);
  }
});

const patternField = new Box({
  parent: screen,
  tags: false,
  style: theme.utils.parseClasses("fg-muted bg-bg").style ?? {
    fg: "#2b2b2b",
    bg: colors.bg,
  },
});

const tagStack = new Box({
  parent: screen,
  width: 18,
  height: 5,
  tags: false,
  style: theme.utils.parseClasses("bg-bg").style ?? { bg: colors.bg },
});

const headerText = new Box({
  parent: screen,
  height: 4,
  tags: false,
  style: theme.utils.parseClasses("fg-text bg-bg").style ?? {
    fg: "#dcdcdc",
    bg: colors.bg,
  },
});

const headerRule = new Box({
  parent: screen,
  height: 1,
  tags: false,
  style: theme.utils.parseClasses("fg-line bg-bg").style ?? {
    fg: colors.line,
    bg: colors.bg,
  },
});

const dialog = new Box({
  parent: screen,
  border: { type: "line", style: rounded },
  style: {
    ...theme.utils.parseClasses("bg-panelAlt").style,
    border: { fg: colors.accentBorder },
  },
  tags: false,
});

const dialogText = new Box({
  parent: dialog,
  top: 1,
  left: 2,
  width: "90%",
  height: 1,
  align: "center",
  tags: false,
});

const dialogButtons = new Box({
  parent: dialog,
  top: 3,
  left: "center",
  width: 24,
  height: 1,
  align: "center",
  tags: false,
});

const listLeft = new Box({
  parent: screen,
  style: theme.utils.parseClasses("bg-bg").style ?? { bg: colors.bg },
  tags: false,
  padding: { top: 1, left: 2, right: 2, bottom: 1 },
});

const listMiddle = new Box({
  parent: screen,
  style: theme.utils.parseClasses("bg-bg").style ?? { bg: colors.bg },
  tags: false,
  padding: { top: 1, left: 2, right: 2, bottom: 1 },
});

const columnSepLeft = new Box({
  parent: screen,
  width: 1,
  tags: false,
  style: theme.utils.parseClasses("fg-line bg-bg").style ?? {
    fg: colors.line,
    bg: colors.bg,
  },
});

const columnSepRight = new Box({
  parent: screen,
  width: 1,
  tags: false,
  style: theme.utils.parseClasses("fg-line bg-bg").style ?? {
    fg: colors.line,
    bg: colors.bg,
  },
});

const colorGrid = new Box({
  parent: screen,
  style: theme.utils.parseClasses("bg-panel").style ?? { bg: colors.panel },
  tags: false,
  padding: { top: 0, left: 0, right: 0, bottom: 0 },
});

const cardLeft = new Box({
  parent: screen,
  border: { type: "line", style: rounded },
  style: {
    ...theme.utils.parseClasses("bg-purpleCard").style,
    border: { fg: colors.purpleCard },
  },
  tags: false,
  padding: { top: 1, left: 2, right: 2, bottom: 1 },
});

const cardMiddle = new Box({
  parent: screen,
  border: { type: "line", style: rounded },
  style: {
    ...theme.utils.parseClasses("bg-purpleCard").style,
    border: { fg: colors.purpleCard },
  },
  tags: false,
  padding: { top: 1, left: 2, right: 2, bottom: 1 },
});

const cardRight = new Box({
  parent: screen,
  border: { type: "line", style: rounded },
  style: {
    ...theme.utils.parseClasses("bg-purpleCard").style,
    border: { fg: colors.purpleCard },
  },
  tags: false,
  padding: { top: 1, left: 2, right: 2, bottom: 1 },
});

const statusLeft = new Box({
  parent: screen,
  height: 1,
  tags: false,
  style: statusBgStyle,
});

const statusMiddle = new Box({
  parent: screen,
  height: 1,
  tags: false,
  style: statusBgStyle,
});

const statusRight = new Box({
  parent: screen,
  height: 1,
  tags: false,
  style: statusBgStyle,
});

const statusBar = new Box({
  parent: screen,
  height: 1,
  tags: false,
  style: statusBgStyle,
});

const promptLine = new Box({
  parent: screen,
  height: 1,
  tags: false,
  style: promptStyle,
});

const statusSlots = {
  left: 10,
  middle: 40,
  right: 18,
};

const tabs = [
  { label: "Lip Gloss", active: true },
  { label: "Blush", active: false },
  { label: "Eye Shadow", active: false },
  { label: "Mascara", active: false },
  { label: "Foundation", active: false },
];

const debugTabs = process.env.DEBUG_TABS === "1";
let debugTabsLogged = false;

type TabRange = { start: number; end: number; index: number };
let tabRanges: TabRange[] = [];

function applyRowStyles(
  line: string,
  styles: Array<string | null>,
  resetTag: string,
): string {
  let out = "";
  let activeStyle: string | null = null;

  for (let i = 0; i < line.length; i++) {
    const nextStyle = styles[i] ?? null;
    if (nextStyle !== activeStyle) {
      if (activeStyle) out += resetTag;
      if (nextStyle) out += nextStyle;
      activeStyle = nextStyle;
    }
    out += line[i]!;
  }

  if (activeStyle) out += resetTag;
  return out;
}

function setActiveTab(index: number): void {
  tabs.forEach((tab, i) => {
    tab.active = i === index;
  });
  renderTabs(Math.max(1, tabsBar.width));
  screen.render();
}

function renderTabs(width: number): void {
  const height = 3;
  const rows = Array.from({ length: height }, () => Array(width).fill(" "));
  const padding = 1;
  const gap = 1;
  let cursor = 0;
  let activeRange: [number, number] | null = null;
  tabRanges = [];
  const activeBgTag = "{#7656d2-bg}";
  const activeFgTag = "{#ffffff-fg}";
  const inactiveFgTag = "{#e6e6e6-fg}";
  const resetTag = "{/}";

  const baseline = "─".repeat(Math.max(1, width));
  rows[2] = baseline.split("");

  for (let i = 0; i < tabs.length; i++) {
    const tab = tabs[i];
    const label = tab.label;
    const tabInner = label.length + padding * 2;
    const tabWidth = tabInner + 2;
    if (cursor + tabWidth > width && cursor > 0) break;

    const start = cursor;
    const end = cursor + tabWidth - 1;

    rows[0][start] = "╭";
    for (let x = 0; x < tabInner; x++) {
      rows[0][start + 1 + x] = "─";
    }
    rows[0][end] = "╮";

    rows[1][start] = "│";
    const labelStart = start + 1 + padding;
    for (let x = 0; x < label.length; x++) {
      rows[1][labelStart + x] = label[x]!;
    }
    rows[1][end] = "│";

    if (tab.active) {
      activeRange = [start, end];
    } else {
      rows[2][start] = "┴";
      rows[2][end] = "┴";
    }

    cursor += tabWidth + gap;
    tabRanges.push({ start, end, index: i });
  }

  if (activeRange) {
    for (let x = activeRange[0]; x <= activeRange[1]; x++) {
      if (x < rows[2].length) rows[2][x] = " ";
    }
    if (activeRange[0] < rows[2].length) rows[2][activeRange[0]] = "╯";
    if (activeRange[1] < rows[2].length) rows[2][activeRange[1]] = "╰";
  }

  const row0 = rows[0].join("");
  const row1 = rows[1].join("");
  const row2 = rows[2].join("");

  const row0Styles = new Array<string | null>(row0.length).fill(null);
  const row1Styles = new Array<string | null>(row1.length).fill(null);

  for (const range of tabRanges) {
    for (let x = range.start; x <= range.end; x++) {
      if (x < row1Styles.length) row1Styles[x] = inactiveFgTag;
    }
  }

  if (activeRange) {
    for (let x = activeRange[0]; x <= activeRange[1]; x++) {
      if (x < row0Styles.length) row0Styles[x] = activeBgTag;
      if (x < row1Styles.length) row1Styles[x] = activeBgTag + activeFgTag;
    }
  }

  const styledRow0 = applyRowStyles(row0, row0Styles, resetTag);
  const styledRow1 = applyRowStyles(row1, row1Styles, resetTag);

  tabsBar.setContent([styledRow0, styledRow1, row2].join("\n"));

  if (debugTabs && !debugTabsLogged) {
    debugTabsLogged = true;
    console.log("TAB_DEBUG", { row0: styledRow0, row1: styledRow1, row2 });
  }
}

function buildColorGrid(width: number, height: number): string {
  const rows: string[] = [];
  const cols = Math.max(8, Math.floor(width / 2));
  const gridRows = Math.max(6, height);
  for (let y = 0; y < gridRows; y++) {
    let row = "";
    for (let x = 0; x < cols; x++) {
      const r = Math.floor(255 * (x / Math.max(1, cols - 1)));
      const g = Math.floor(255 * (y / Math.max(1, gridRows - 1)));
      const b = Math.floor(255 * (1 - x / Math.max(1, cols - 1)));
      row += bg([r, g, b], "  ");
    }
    rows.push(row);
  }
  return rows.join("\n");
}

function buildPattern(width: number, height: number): string {
  const line = ".  ".repeat(Math.ceil(width / 3)).slice(0, width);
  return Array.from({ length: height }, () => line).join("\n");
}

function updateContent(): void {
  commandLine.setContent(
    `${fg(colors.accent2, ">")}${fg(colors.text, " ./lipgloss-example")}`,
  );

  tagStack.setContent(
    [
      bg(colors.accent, " Lip Gloss "),
      " " + bg([255, 105, 196], " Lip Gloss "),
      "  " + bg([200, 110, 240], " Lip Gloss "),
      "   " + bg(colors.accent2, " Lip Gloss "),
    ].join("\n"),
  );

  headerText.setContent(
    [
      `${fg(colors.text, "Style Definitions for Nice Terminal Layouts")}`,
      `${fg(colors.muted, "From Charm ")}${fg(colors.accent3, "https://github.com/charmbracelet/lipgloss")}`,
    ].join("\n"),
  );

  dialogText.setContent(
    `${fg(colors.accent, "Are you sure ")}` +
      `${fg(colors.accent4, "you want ")}` +
      `${fg(colors.accent2, "to eat marmalade?")}`,
  );

  dialogButtons.setContent(
    `${bg([252, 85, 174], "  Yes  ")}  ${bg([120, 120, 120], " Maybe ")}`,
  );

  listLeft.setContent(
    [
      fg(colors.text, "Citrus Fruits to Try"),
      fg(hexToRgb(colors.line), "──────────────────"),
      `${fg(colors.accent3, "✓")} ${fg(colors.muted, "Grapefruit")}`,
      `${fg(colors.accent3, "✓")} ${fg(colors.muted, "Yuzu")}`,
      fg(colors.text, "Citron"),
      fg(colors.text, "Kumquat"),
      fg(colors.text, "Pomelo"),
    ].join("\n"),
  );

  listMiddle.setContent(
    [
      fg(colors.text, "Actual Lip Gloss Vendors"),
      fg(hexToRgb(colors.line), "────────────────────"),
      fg(colors.text, "Glossier"),
      fg(colors.text, "Claire's Boutique"),
      `${fg(colors.accent3, "✓")} ${fg(colors.muted, "Nyx")}`,
      fg(colors.text, "Mac"),
      `${fg(colors.accent3, "✓")} ${fg(colors.muted, "Milk")}`,
    ].join("\n"),
  );

  colorGrid.setContent("");

  cardLeft.setContent(
    "The Romans learned from\n" +
      "the Greeks that quinces\n" +
      "slowly cooked with honey\n" +
      'would "set" when cool.\n' +
      "The Apicius gives a\n" +
      "recipe for preserving\n" +
      "whole quinces, stems\n" +
      "and leaves attached.\n",
  );

  cardMiddle.setContent(
    "Medieval quince preserves,\n" +
      "which went by the French\n" +
      "name cotignac, produced\n" +
      "in a clear version and a\n" +
      "fruit pulp version. In\n" +
      "the 17th century, La\n" +
      "Varenne provided recipes\n" +
      "for both thick and clear.\n",
  );

  cardRight.setContent(
    "In 1524, Henry VIII, King\n" +
      "of England, received a\n" +
      '"box of marmalade" from\n' +
      "Mr. Hull of Exeter. This\n" +
      "was probably marmelada,\n" +
      "a quince paste from\n" +
      "Portugal, still made\n" +
      "and sold in southern\n" +
      "Europe today.\n",
  );

  const leftBadge = chip([252, 85, 174], [26, 26, 26], " STATUS ");
  const middleText = fg([189, 189, 189], "Ravishingly Dark!");
  const rightBadges =
    `${chip([138, 94, 255], [26, 26, 26], " UTF-8 ")} ` +
    `${chip([118, 118, 118], [26, 26, 26], " Fish Cake ")}`;

  const pad = (text: string, width: number): string => {
    const plain = text.replace(/\x1b\[[0-9;]*m/g, "");
    const extra = Math.max(0, width - plain.length);
    return text + " ".repeat(extra);
  };

  const statusLine =
    pad(leftBadge, statusSlots.left) +
    " " +
    pad(middleText, statusSlots.middle) +
    " " +
    pad(rightBadges, statusSlots.right);

  statusBar.setContent(statusLine);
  promptLine.setContent(`${fg(colors.accent2, ">")}`);
}

function layout(): void {
  const cols = screen.cols;
  const rows = screen.rows;
  const margin = 2;
  const gap = 2;
  const innerWidth = Math.max(40, cols - margin * 2);
  const columnWidth = Math.floor((innerWidth - gap * 2) / 3);
  const leftX = margin;
  const middleX = leftX + columnWidth + gap;
  const rightX = middleX + columnWidth + gap;

  commandLine.top = 1;
  commandLine.left = margin;
  commandLine.width = innerWidth;

  const tabsTop = 3;
  tabsBar.top = tabsTop;
  tabsBar.left = margin;
  tabsBar.width = innerWidth;
  renderTabs(innerWidth);

  const patternTop = tabsTop + 3;
  tagStack.top = patternTop + 1;
  tagStack.left = margin + 2;

  headerText.top = tagStack.top + 1;
  headerText.left = tagStack.left + 18;
  headerText.width = Math.max(20, innerWidth - 24);

  headerRule.top = headerText.top + 2;
  headerRule.left = headerText.left;
  headerRule.width = Math.max(10, innerWidth - (headerText.left - margin) - 2);
  headerRule.setContent("─".repeat(Math.max(1, headerRule.width)));

  dialog.width = Math.min(64, innerWidth - 6);
  dialog.height = 6;
  dialog.top = patternTop + 7;
  dialog.left = Math.max(margin, Math.floor((cols - dialog.width) / 2));

  const listsTop = dialog.top + dialog.height + 2;
  const listsHeight = 8;
  listLeft.top = listsTop;
  listLeft.left = leftX;
  listLeft.width = columnWidth;
  listLeft.height = listsHeight;

  listMiddle.top = listsTop;
  listMiddle.left = middleX;
  listMiddle.width = columnWidth;
  listMiddle.height = listsHeight;

  colorGrid.top = listsTop;
  colorGrid.left = rightX;
  colorGrid.width = columnWidth;
  colorGrid.height = listsHeight;

  columnSepLeft.top = listsTop + 1;
  columnSepLeft.left = middleX - 1;
  columnSepLeft.height = Math.max(1, listsHeight - 1);
  columnSepLeft.setContent("│\n".repeat(columnSepLeft.height).trimEnd());

  columnSepRight.top = listsTop + 1;
  columnSepRight.left = rightX - 1;
  columnSepRight.height = Math.max(1, listsHeight - 1);
  columnSepRight.setContent("│\n".repeat(columnSepRight.height).trimEnd());

  patternField.top = patternTop;
  patternField.left = margin;
  patternField.width = innerWidth;
  patternField.height = Math.max(3, listsTop - patternTop - 1);
  patternField.setContent(
    buildPattern(patternField.width, patternField.height),
  );

  const cardsTop = listsTop + listsHeight + 2;
  const cardHeight = Math.min(16, Math.max(10, rows - cardsTop - 4));
  cardLeft.top = cardsTop;
  cardLeft.left = leftX;
  cardLeft.width = columnWidth;
  cardLeft.height = cardHeight;

  cardMiddle.top = cardsTop;
  cardMiddle.left = middleX;
  cardMiddle.width = columnWidth;
  cardMiddle.height = cardHeight;

  cardRight.top = cardsTop;
  cardRight.left = rightX;
  cardRight.width = columnWidth;
  cardRight.height = cardHeight;

  const statusTop = rows - 2;
  statusBar.top = statusTop;
  statusBar.left = margin;
  statusBar.width = innerWidth;

  statusLeft.hide();
  statusMiddle.hide();
  statusRight.hide();

  statusLeft.top = statusTop;
  statusLeft.left = margin;
  statusLeft.width = 10;

  statusSlots.left = statusLeft.width;

  statusMiddle.top = statusTop;
  statusMiddle.left = statusLeft.left + statusLeft.width + 1;
  statusMiddle.width = Math.max(10, innerWidth - 28);

  statusSlots.middle = statusMiddle.width;

  statusRight.top = statusTop;
  statusRight.left = statusMiddle.left + statusMiddle.width + 1;
  statusRight.width = 18;

  statusSlots.right = statusRight.width;

  promptLine.top = rows - 1;
  promptLine.left = margin;
  promptLine.width = 4;

  updateContent();
  const gridWidth = Math.max(6, colorGrid.width);
  const gridHeight = Math.max(4, colorGrid.height);
  colorGrid.setContent(buildColorGrid(gridWidth, gridHeight));
  screen.render();
}

screen.on("resize", layout);
screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
});

layout();
