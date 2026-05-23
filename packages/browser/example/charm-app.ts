/**
 * Lip Gloss style demo (Bubble Tea aesthetics) — browser port of
 * `packages/contrib/examples/charm.ts`.
 *
 * Recreates the layout and vibe of the Lip Gloss example:
 * tabs, stacked labels, dialog, lists, color grid, and cards.
 */

import {
  Box,
  BrowserRuntime,
  Screen,
  setRuntime,
} from "@gavin-lynch/unblessed-browser";
import { unicode } from "@gavin-lynch/unblessed-core";
import { createTheme } from "@gavin-lynch/unblessed-theme";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

import "xterm/css/xterm.css";

setRuntime(new BrowserRuntime());

const fitAddon = new FitAddon();
const term = new Terminal({
  fontSize: 13,
  allowProposedApi: true,
  fontFamily:
    'Menlo, Monaco, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", monospace',
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
  fullUnicode: true,
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

// Lip Gloss example palette (dark background)
const lip = {
  subtle: "#383838",
  highlight: "#7D56F4",
  special: "#73F59F",
  dialogBorder: "#874BFD",
  titleFg: "#FFF7DB",
  historyFg: "#FAFAFA",
  statusBarBg: "#353533",
  statusBarFg: "#C1C6B2",
  statusBadge: "#FF5F87",
  encodingBadge: "#A550DF",
  fishCakeBadge: "#6124DF",
  badgeFg: "#FFFDF5",
  buttonInactive: "#888B7E",
  listDone: "#696969",
  gradientFrom: "#EDFF82",
  gradientTo: "#F25D94",
} as const;

const statusBgStyle = { bg: lip.statusBarBg, fg: lip.statusBarFg };
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
  return `\x1b[38;2;${rgb[0]};${rgb[1]};${rgb[2]}m${text}`;
}

function bg(rgb: RGB, text: string): string {
  return `\x1b[48;2;${rgb[0]};${rgb[1]};${rgb[2]}m${text}`;
}

function chip(bgRgb: RGB, fgRgb: RGB, text: string): string {
  return (
    `\x1b[48;2;${bgRgb[0]};${bgRgb[1]};${bgRgb[2]}m` +
    `\x1b[38;2;${fgRgb[0]};${fgRgb[1]};${fgRgb[2]}m` +
    text
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

function blend1D(steps: number, from: RGB, to: RGB): RGB[] {
  if (steps <= 1) return [from];
  const out: RGB[] = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    out.push([
      Math.round(from[0] + (to[0] - from[0]) * t),
      Math.round(from[1] + (to[1] - from[1]) * t),
      Math.round(from[2] + (to[2] - from[2]) * t),
    ]);
  }
  return out;
}

function makeColorGrid(xSteps: number, ySteps: number): RGB[][] {
  const left = blend1D(ySteps, hexToRgb("#F25D94"), hexToRgb("#643AFF"));
  const right = blend1D(ySteps, hexToRgb("#EDFF82"), hexToRgb("#14F9D5"));
  return left.map((leftColor, y) => blend1D(xSteps, leftColor, right[y]!));
}

function applyGradient(text: string, fromHex: string, toHex: string): string {
  const chars = [...text];
  if (chars.length === 0) return "";
  const gradient = blend1D(chars.length, hexToRgb(fromHex), hexToRgb(toHex));
  return chars
    .map(
      (ch, i) =>
        `\x1b[38;2;${gradient[i]![0]};${gradient[i]![1]};${gradient[i]![2]}m${ch}`,
    )
    .join("");
}

function strike(rgb: RGB, text: string): string {
  return `\x1b[9m${fg(rgb, text)}\x1b[29m`;
}

function underline(text: string): string {
  return `\x1b[4m${text}\x1b[24m`;
}

function italic(text: string): string {
  return `\x1b[3m${text}\x1b[23m`;
}

function visibleWidth(text: string): number {
  return unicode.strWidth(text.replace(/\x1b\[[0-9;]*m/g, ""));
}

function padToWidth(text: string, width: number): string {
  const extra = Math.max(0, width - visibleWidth(text));
  return text + " ".repeat(extra);
}

function buildStatusLine(barWidth: number): string {
  const statusKey =
    chip(hexToRgb(lip.statusBadge), hexToRgb(lip.badgeFg), " STATUS ") +
    "\x1b[49m";
  const statusVal = fg(hexToRgb(lip.statusBarFg), "Ravishingly Dark!");
  const encoding = chip(
    hexToRgb(lip.encodingBadge),
    hexToRgb(lip.badgeFg),
    " UTF-8 ",
  );
  const fishCake = chip(
    hexToRgb(lip.fishCakeBadge),
    hexToRgb(lip.badgeFg),
    " 🍥 Fish Cake ",
  );

  const keyPart = statusKey + " ";
  const rightPart = encoding + fishCake;
  const valWidth = Math.max(
    0,
    barWidth - visibleWidth(keyPart) - visibleWidth(rightPart),
  );

  return keyPart + padToWidth(statusVal, valWidth) + rightPart;
}

function centerLine(width: number, text: string): string {
  const pad = Math.max(0, Math.floor((width - visibleWidth(text)) / 2));
  return " ".repeat(pad) + text;
}

let dialogInnerWidth = 50;

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
  style: theme.utils.parseClasses("bg-bg").style ?? { bg: colors.bg },
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

const heroBackdrop = new Box({
  parent: screen,
  tags: false,
  style: theme.utils.parseClasses("bg-bg").style ?? { bg: colors.bg },
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
    border: { fg: lip.dialogBorder },
  },
  transparent: true,
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
  tags: false,
  align: "right",
  style: { bg: lip.highlight, fg: lip.historyFg },
  padding: { top: 1, left: 2, right: 2, bottom: 1 },
});

const cardMiddle = new Box({
  parent: screen,
  tags: false,
  align: "center",
  style: { bg: lip.highlight, fg: lip.historyFg },
  padding: { top: 1, left: 2, right: 2, bottom: 1 },
});

const cardRight = new Box({
  parent: screen,
  tags: false,
  align: "left",
  style: { bg: lip.highlight, fg: lip.historyFg },
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
  const borderTag = `{${lip.highlight}-fg}`;
  const textTag = `{${lip.titleFg}-fg}`;
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
    if (activeRange[0] < rows[2].length) rows[2][activeRange[0]] = "┘";
    if (activeRange[1] < rows[2].length) rows[2][activeRange[1]] = "└";
  }

  const styledRows = rows.map((row) => {
    const line = row.join("");
    return applyRowStyles(
      line,
      new Array<string | null>(line.length).fill(borderTag + textTag),
      resetTag,
    );
  });

  tabsBar.setContent(styledRows.join("\n"));

  if (debugTabs && !debugTabsLogged) {
    debugTabsLogged = true;
    console.log("TAB_DEBUG", { rows: styledRows });
  }
}

function buildColorGrid(width: number, height: number): string {
  const xSteps = Math.max(8, Math.floor(width / 2));
  const ySteps = Math.max(6, height);
  const grid = makeColorGrid(xSteps, ySteps);
  return grid
    .map((row) => row.map((color) => bg(color, "  ")).join(""))
    .join("\n");
}

function buildPattern(width: number, height: number): string {
  // xterm.js mishandles dense wide-character fills; use single-width dots.
  const cell = "· ";
  const subtle = hexToRgb(lip.subtle);
  let plain = "";
  while (plain.length < width) {
    plain += cell;
  }
  plain = plain.slice(0, width);
  const line = fg(subtle, plain);
  return Array.from({ length: height }, () => line).join("\n");
}

function updateContent(): void {
  const subtle = hexToRgb(lip.subtle);
  const special = hexToRgb(lip.special);
  const doneColor = hexToRgb(lip.listDone);
  const titleFg = hexToRgb(lip.titleFg);

  const listDone = (text: string) =>
    `${fg(special, "✓")} ${strike(doneColor, text)}`;
  const listItem = (text: string) => `  ${fg(colors.text, text)}`;

  commandLine.setContent(
    `${fg(hexToRgb(lip.highlight), ">")}${fg(colors.text, " ./lipgloss-example")}`,
  );

  const titleColors = makeColorGrid(1, 5).map((row) => row[0]!);
  tagStack.setContent(
    titleColors
      .map(
        (color, i) =>
          " ".repeat(i * 2) + chip(color, titleFg, italic(" Lip Gloss ")),
      )
      .join("\n"),
  );

  const ruleWidth = Math.max(10, (headerText.width || 40) - 2);
  headerText.setContent(
    [
      fg(colors.text, "Style Definitions for Nice Terminal Layouts"),
      fg(subtle, "─".repeat(ruleWidth)),
      `${fg(subtle, "From Charm")}${fg(subtle, " • ")}${fg(special, "https://github.com/charmbracelet/lipgloss")}`,
    ].join("\n"),
  );

  dialog.setContent(
    [
      centerLine(
        dialogInnerWidth,
        applyGradient(
          "Are you sure you want to eat marmalade?",
          lip.gradientFrom,
          lip.gradientTo,
        ),
      ),
      "",
      centerLine(
        dialogInnerWidth,
        `${chip(hexToRgb(lip.gradientTo), hexToRgb(lip.badgeFg), underline("  Yes  "))}` +
          `\x1b[49m  ${chip(hexToRgb(lip.buttonInactive), hexToRgb(lip.badgeFg), " Maybe ")}\x1b[49m`,
      ),
      "",
    ].join("\n"),
  );

  listLeft.setContent(
    [
      fg(colors.text, "Citrus Fruits to Try"),
      fg(subtle, "──────────────────"),
      listDone("Grapefruit"),
      listDone("Yuzu"),
      listItem("Citron"),
      listItem("Kumquat"),
      listItem("Pomelo"),
    ].join("\n"),
  );

  listMiddle.setContent(
    [
      fg(colors.text, "Actual Lip Gloss Vendors"),
      fg(subtle, "────────────────────"),
      listItem("Glossier"),
      listItem("Claire's Boutique"),
      listDone("Nyx"),
      listItem("Mac"),
      listDone("Milk"),
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

  const barWidth = Math.max(1, statusBar.width || 80);
  statusBar.setContent(buildStatusLine(barWidth));
  promptLine.setContent(`${fg(hexToRgb(lip.highlight), ">")}`);
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
  const heroHeight = 6;

  heroBackdrop.top = patternTop;
  heroBackdrop.left = margin;
  heroBackdrop.width = innerWidth;
  heroBackdrop.height = heroHeight;

  tagStack.top = patternTop + 1;
  tagStack.left = margin + 2;
  tagStack.width = 22;

  headerText.top = tagStack.top + 1;
  headerText.left = tagStack.left + 18;
  headerText.width = Math.max(20, innerWidth - 24);
  headerText.height = 3;

  headerRule.hide();

  dialog.width = Math.min(54, innerWidth - 6);
  dialog.height = 6;
  dialog.top = patternTop + heroHeight + 1;
  dialog.left = Math.max(margin, Math.floor((cols - dialog.width) / 2));
  dialogInnerWidth = Math.max(10, dialog.width - 2);

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

  columnSepLeft.style = { fg: lip.subtle, bg: colors.bg };
  columnSepRight.style = { fg: lip.subtle, bg: colors.bg };
  columnSepLeft.top = listsTop + 1;
  columnSepLeft.left = middleX - 1;
  columnSepLeft.height = Math.max(1, listsHeight - 1);
  columnSepLeft.setContent("│\n".repeat(columnSepLeft.height).trimEnd());

  columnSepRight.top = listsTop + 1;
  columnSepRight.left = rightX - 1;
  columnSepRight.height = Math.max(1, listsHeight - 1);
  columnSepRight.setContent("│\n".repeat(columnSepRight.height).trimEnd());

  patternField.top = dialog.top - 1;
  patternField.left = margin;
  patternField.width = innerWidth;
  patternField.height = dialog.height + 2;
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
