/**
 * tabs.ts - Tabs widget
 */

import helpers from "../lib/helpers.js";
import type { BoxOptions } from "../types/options.js";
import { Box } from "./box.js";
import type { Element } from "./element.js";

export interface TabItem {
  title: string;
  content?: string;
  render?: (parent: Box, index: number) => void | Promise<void>;
  element?: Element;
}

export interface TabsOptions extends BoxOptions {
  tabs?: TabItem[];
  activeTab?: number;
  tabBarHeight?: number;
  tabBarOptions?: BoxOptions & {
    keys?: boolean;
    vi?: boolean;
    mouse?: boolean;
    autoCommandKeys?: boolean;
  };
  contentStyle?: BoxOptions["style"];
  keys?: boolean;
  vi?: boolean;
  mouse?: boolean;
  autoCommandKeys?: boolean;
}

type TabPosition = {
  start: number;
  end: number;
  index: number;
};

export class Tabs extends Box {
  override type = "tabs";
  declare options: TabsOptions;

  private tabBar: Box;
  private contentBox: Box;
  private tabs: TabItem[] = [];
  private activeIndex = 0;
  private tabPositions: TabPosition[] = [];
  private tabPadding = 1;
  private tabGap = 1;
  private tabBarHeight: number;
  private tabItemStyle: any = {};
  private tabSelectedStyle: any = {};

  constructor(options: TabsOptions = {}) {
    super(options);
    this.options = options;
    this.tabBarHeight = options.tabBarHeight ?? 3;

    const tabBarOptions = options.tabBarOptions || {};
    this.tabItemStyle = tabBarOptions.style?.item ?? tabBarOptions.style ?? {};
    this.tabSelectedStyle = tabBarOptions.style?.selected ?? {};

    const tabMouse =
      options.mouse ??
      tabBarOptions.mouse ??
      options.tabBarOptions?.mouse ??
      true;
    const tabKeys = options.keys ?? tabBarOptions.keys ?? true;
    const tabViEnabled = options.vi ?? tabBarOptions.vi ?? true;
    const tabAutoCommandKeys =
      options.autoCommandKeys ?? tabBarOptions.autoCommandKeys ?? true;

    this.tabBar = new Box({
      top: 0,
      left: 0,
      width: "100%",
      height: this.tabBarHeight,
      tags: true,
      mouse: tabMouse,
      ...tabBarOptions,
      parent: this,
    });

    if (tabMouse) {
      this.tabBar.enableMouse();
    }
    if (tabKeys) {
      this.tabBar.enableKeys();
    }

    this.contentBox = new Box({
      top: this.tabBarHeight,
      left: 0,
      right: 0,
      bottom: 0,
      style: options.contentStyle,
      parent: this,
    });

    if (tabKeys) {
      this.tabBar.on("keypress", (_ch: any, key: any) => {
        if (key.name === "left" || (tabViEnabled && key.name === "h")) {
          this.move(-1);
          return undefined;
        }
        if (key.name === "right" || (tabViEnabled && key.name === "l")) {
          this.move(1);
          return undefined;
        }
        if (key.name === "enter") {
          void this.select(this.activeIndex);
          return undefined;
        }
        return undefined;
      });
    }

    if (tabAutoCommandKeys) {
      this.onScreenEvent("keypress", (ch: any) => {
        if (/^[0-9]$/.test(ch)) {
          let i = +ch - 1;
          if (!~i) i = 9;
          void this.select(i);
        }
      });
    }

    if (tabMouse) {
      this.tabBar.on("click", (data: any) => {
        const lpos = this.tabBar._getCoords();
        if (!lpos) return;
        const x = data.x - lpos.xi;
        const hit = this.tabPositions.find(
          (pos) => x >= pos.start && x <= pos.end,
        );
        if (hit) {
          void this.select(hit.index);
        }
      });
    }

    if (options.tabs) {
      this.setTabs(options.tabs);
    }

    if (options.activeTab !== undefined) {
      this.activeIndex = options.activeTab;
    }

    this.on("attach", () => {
      this.renderTabBar();
      void this.select(this.activeIndex);
    });

    this.on("resize", () => {
      this.renderTabBar();
    });
  }

  get activeTab(): number {
    return this.activeIndex;
  }

  setTabs(tabs: TabItem[]): void {
    this.tabs = tabs;
    this.activeIndex = Math.min(this.activeIndex, Math.max(0, tabs.length - 1));
    this.renderTabBar();
    if (this.screen) {
      void this.select(this.activeIndex);
    }
  }

  async select(index: number): Promise<void> {
    if (!this.tabs.length) return;
    const nextIndex = Math.max(0, Math.min(index, this.tabs.length - 1));
    if (this.activeIndex === nextIndex && this.contentBox.children.length) {
      return;
    }
    this.activeIndex = nextIndex;

    this.contentBox.setContent("");
    let i = this.contentBox.children.length;
    while (i--) {
      this.contentBox.children[i].detach();
    }

    const tab = this.tabs[nextIndex];
    if (!tab) return;

    if (tab.element) {
      this.contentBox.append(tab.element);
    } else if (tab.render) {
      await tab.render(this.contentBox, nextIndex);
    } else if (tab.content) {
      this.contentBox.setContent(tab.content);
    }

    this.renderTabBar();
    if (this.screen) this.screen.render();
  }

  override focus(): void {
    this.tabBar.focus();
  }

  private move(offset: number): void {
    const next = Math.max(
      0,
      Math.min(this.activeIndex + offset, this.tabs.length - 1),
    );
    void this.select(next);
  }

  private renderTabBar(): void {
    const width = Math.max(1, this.tabBar.width - this.tabBar.iwidth);
    const height = Math.max(1, this.tabBar.height);
    const rows = Array.from({ length: height }, () => Array(width).fill(" "));
    const baselineRow = height - 1;

    for (let x = 0; x < width; x++) {
      rows[baselineRow][x] = "─";
    }

    let cursor = 0;
    this.tabPositions = [];
    const rowRanges: Array<{ start: number; end: number; style: any }[]> =
      Array.from({ length: height }, () => []);

    if (Object.keys(this.tabItemStyle).length) {
      rowRanges[baselineRow].push({
        start: 0,
        end: width - 1,
        style: this.tabItemStyle,
      });
    }

    for (let i = 0; i < this.tabs.length; i++) {
      const title = this.tabs[i].title;
      const visible = helpers.dropUnicode(helpers.stripTags(title));
      const labelWidth = visible.length;
      const innerWidth = labelWidth + this.tabPadding * 2;
      const tabWidth = innerWidth + 2;

      if (cursor + tabWidth > width && cursor > 0) break;

      const start = cursor;
      const end = cursor + tabWidth - 1;

      if (height >= 2) {
        rows[0][start] = "╭";
        for (let x = 0; x < innerWidth; x++) {
          rows[0][start + 1 + x] = "─";
        }
        rows[0][end] = "╮";

        rows[1][start] = "│";
        const labelStart = start + 1 + this.tabPadding;
        const labelChars = visible.split("");
        for (let x = 0; x < labelChars.length; x++) {
          if (labelStart + x <= end - 1) {
            rows[1][labelStart + x] = labelChars[x]!;
          }
        }
        rows[1][end] = "│";
      }

      if (height >= 3) {
        if (i === this.activeIndex) {
          for (let x = start; x <= end; x++) {
            rows[baselineRow][x] = " ";
          }
          rowRanges[baselineRow].push({
            start,
            end,
            style: this.tabSelectedStyle,
          });
        } else {
          rows[baselineRow][start] = "╰";
          for (let x = 0; x < innerWidth; x++) {
            rows[baselineRow][start + 1 + x] = "─";
          }
          rows[baselineRow][end] = "╯";
        }
      }

      const style =
        i === this.activeIndex ? this.tabSelectedStyle : this.tabItemStyle;
      if (Object.keys(style).length) {
        rowRanges[0].push({ start, end, style });
        if (height > 1) rowRanges[1].push({ start, end, style });
      }

      this.tabPositions.push({ start, end, index: i });
      cursor += tabWidth + this.tabGap;
    }

    const content = rows
      .map((row, rowIndex) =>
        this.applyTagRanges(row.join(""), rowRanges[rowIndex] || []),
      )
      .join("\n");
    this.tabBar.setContent(content);
  }

  private applyTagRanges(
    line: string,
    ranges: { start: number; end: number; style: any }[],
  ): string {
    if (!ranges.length) return line;
    const ordered = [...ranges].sort((a, b) => b.start - a.start);
    let result = line;
    for (const range of ordered) {
      if (range.end < range.start) continue;
      const tags = helpers.generateTags(range.style);
      if (!tags.open && !tags.close) continue;
      result =
        result.slice(0, range.start) +
        tags.open +
        result.slice(range.start, range.end + 1) +
        tags.close +
        result.slice(range.end + 1);
    }
    return result;
  }
}

export default Tabs;
