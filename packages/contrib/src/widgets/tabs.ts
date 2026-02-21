/**
 * tabs.ts - Tabs widget
 *
 * Displays a tab bar with switchable content panes.
 */

import {
  Box,
  Listbar,
  type BoxOptions,
  type Element,
  type ListbarOptions,
} from "@unblessed/core";

export interface TabItem {
  /** Tab title */
  title: string;
  /** Static content string */
  content?: string;
  /** Render callback for tab content */
  render?: (parent: Box, index: number) => void | Promise<void>;
  /** Pre-built element to attach */
  element?: Element;
}

export interface TabsOptions extends BoxOptions {
  /** Initial tabs */
  tabs?: TabItem[];
  /** Active tab index (default: 0) */
  activeTab?: number;
  /** Tab bar height (default: 3) */
  tabBarHeight?: number;
  /** Tab bar options */
  tabBarOptions?: ListbarOptions;
  /** Content box style */
  contentStyle?: BoxOptions["style"];
  /** Enable keyboard navigation in tab bar */
  keys?: boolean;
  /** Enable vi keys in tab bar */
  vi?: boolean;
  /** Enable mouse support in tab bar */
  mouse?: boolean;
  /** Enable number shortcuts in tab bar */
  autoCommandKeys?: boolean;
}

export class Tabs extends Box {
  override type = "tabs";
  declare options: TabsOptions;

  private tabBar: Listbar;
  private contentBox: Box;
  private tabs: TabItem[] = [];
  private activeIndex: number = 0;
  private suppressSelect: boolean = false;

  constructor(options: TabsOptions = {}) {
    super(options);
    this.options = options;

    const tabBarHeight = options.tabBarHeight ?? 3;

    this.tabBar = new Listbar({
      top: 0,
      left: 0,
      width: "100%",
      height: tabBarHeight,
      keys: options.keys ?? true,
      vi: options.vi ?? true,
      mouse: options.mouse ?? true,
      autoCommandKeys: options.autoCommandKeys ?? true,
      ...options.tabBarOptions,
      parent: this,
    } as ListbarOptions);

    this.contentBox = new Box({
      top: tabBarHeight,
      left: 0,
      right: 0,
      bottom: 0,
      style: options.contentStyle,
      parent: this,
    });

    this.tabBar.on("select tab", (_item: any, index: number) => {
      if (this.suppressSelect) return;
      void this.select(index);
    });

    this.tabBar.on("action", (_item: any, index: number) => {
      if (this.suppressSelect) return;
      void this.select(index);
    });

    if (options.tabs) {
      this.setTabs(options.tabs);
    }

    if (options.activeTab !== undefined) {
      this.activeIndex = options.activeTab;
    }

    this.on("attach", () => {
      void this.select(this.activeIndex);
    });
  }

  get activeTab(): number {
    return this.activeIndex;
  }

  setTabs(tabs: TabItem[]): void {
    this.tabs = tabs;
    const items = tabs.map((tab) => tab.title);
    this.tabBar.setItems(items);
    this.activeIndex = Math.min(this.activeIndex, Math.max(0, tabs.length - 1));
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

    if (typeof (this.tabBar as any).select === "function") {
      this.suppressSelect = true;
      (this.tabBar as any).select(nextIndex);
      this.suppressSelect = false;
    }

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

    if (this.screen) {
      this.screen.render();
    }
  }

  override focus(): void {
    this.tabBar.focus();
  }
}

export default Tabs;
