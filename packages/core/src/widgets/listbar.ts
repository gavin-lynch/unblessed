/**
 * listbar.ts - listbar element for blessed
 */

import helpers from "../lib/helpers.js";
import type { KeyEvent, ListbarOptions, ListElementStyle } from "../types";
import Box from "./box.js";

type ListbarCommand = {
  text?: string;
  prefix?: string;
  keys?: string[];
  callback?: () => void;
  element?: Box;
  _?: {
    width?: number;
  };
};

class Listbar extends Box {
  override type = "listbar";
  declare style: ListElementStyle;
  override items: Box[] = [];
  commands: ListbarCommand[] = [];
  leftBase = 0;
  selectedIndex = 0;
  mouse: boolean;
  override _: Record<string, Box> = {};

  get selected() {
    return this.selectedIndex;
  }

  constructor(options: ListbarOptions = {}) {
    super(options);

    this.items = [];
    this.commands = [];
    this.leftBase = 0;
    this.selectedIndex = 0;
    this.mouse = options.mouse || false;

    if (!this.style.selected) this.style.selected = {};
    if (!this.style.item) this.style.item = {};

    if (options.commands || options.items) {
      this.setItems(options.commands || options.items);
    }

    if (options.keys) {
      this.on("keypress", (_ch: any, key: KeyEvent) => {
        if (
          key.name === "left" ||
          (options.vi && key.name === "h") ||
          (key.shift && key.name === "tab")
        ) {
          this.moveLeft();
          this.screen.render();
          if (key.name === "tab") return false;
          return undefined;
        }
        if (
          key.name === "right" ||
          (options.vi && key.name === "l") ||
          key.name === "tab"
        ) {
          this.moveRight();
          this.screen.render();
          if (key.name === "tab") return false;
          return undefined;
        }
        if (key.name === "enter" || (options.vi && key.name === "k")) {
          this.emit("action", this.items[this.selected], this.selected);
          this.emit("select", this.items[this.selected], this.selected);
          const cmd = this.commands[this.selected];
          cmd?.callback?.();
          this.screen.render();
          return undefined;
        }
        if (key.name === "escape" || (options.vi && key.name === "q")) {
          this.emit("action");
          this.emit("cancel");
          return undefined;
        }
        return undefined;
      });
    }

    if (options.autoCommandKeys) {
      this.onScreenEvent("keypress", (ch: any) => {
        if (/^[0-9]$/.test(ch)) {
          let i = +ch - 1;
          if (!~i) i = 9;
          return this.selectTab(i);
        }
        return undefined;
      });
    }

    this.on("focus", () => {
      this.select(this.selected);
    });
  }

  setItems(commands: any) {
    const normalized = this.normalizeCommands(commands);

    this.items.forEach((el) => el.detach());
    this.items = [];
    this.commands = [];
    this.leftBase = 0;
    this.selectedIndex = 0;

    normalized.forEach((cmd) => {
      this.appendItem(cmd);
    });

    this.emit("set items");
  }

  add(item: any, callback?: any) {
    return this.appendItem(this.normalizeCommand(item, callback));
  }

  addItem(item: any, callback?: any) {
    return this.appendItem(this.normalizeCommand(item, callback));
  }

  appendItem(command: ListbarCommand) {
    const index = this.items.length;
    const cmd = { ...command } as ListbarCommand;

    if (cmd.prefix == null) cmd.prefix = String(index + 1);
    if (cmd.keys && cmd.keys[0]) cmd.prefix = cmd.keys[0];

    const prefixTag = helpers.generateTags(
      this.style.prefix || { fg: "lightblack" },
    );
    const title =
      (cmd.prefix ? prefixTag.open + cmd.prefix + prefixTag.close + ":" : "") +
      (cmd.text ?? "");

    const visibleTitle = helpers.dropUnicode(helpers.stripTags(title));
    const width = Math.max(1, visibleTitle.length + 2);

    const el = new Box({
      screen: this.screen,
      top: 0,
      left: 0,
      height: 1,
      content: title,
      width,
      align: "center",
      tags: true,
      mouse: true,
      style: helpers.merge({}, this.style.item),
      noOverflow: true,
    });

    ["bg", "fg", "bold", "underline", "blink", "inverse", "invisible"].forEach(
      (name) => {
        (el.style as any)[name] = () => {
          const isSelected = this.items[this.selected] === el;
          let attr = isSelected
            ? this.style.selected[name]
            : this.style.item[name];
          if (typeof attr === "function") attr = attr(el);
          return attr;
        };
      },
    );

    if (!this.screen.autoPadding) {
      el.top += this.itop;
      el.left += this.ileft;
    }

    cmd.element = el;
    cmd._ = { width };
    (el as any)._ = { cmd };

    this.items.push(el);
    this.commands.push(cmd);
    this.append(el);
    this._[cmd.text ?? String(index)] = el;

    if (cmd.callback && cmd.keys) {
      this.screen.key(cmd.keys, () => {
        this.emit("action", el, this.selected);
        this.emit("select", el, this.selected);
        cmd.callback?.();
        this.select(el);
        this.screen.render();
      });
    }

    if (this.items.length === 1) {
      this.select(0);
    }

    if (this.mouse) {
      el.on("click", () => {
        this.emit("action", el, this.selected);
        this.emit("select", el, this.selected);
        cmd.callback?.();
        this.select(el);
        this.screen.render();
      });
    }

    this.emit("add item");
  }

  override render() {
    const lpos = this._getCoords();
    if (!lpos) return super.render();

    const available = Math.max(0, lpos.xl - lpos.xi - this.iwidth);
    let drawn = 0;
    let index = this.leftBase;

    this.items.forEach((el, i) => {
      if (i < this.leftBase) {
        el.hide();
      }
    });

    while (index < this.items.length) {
      const el = this.items[index];
      const width = (this.commands[index]?._?.width ?? el.width) + 1;

      if (drawn + width > available && drawn > 0) {
        el.hide();
        index++;
        continue;
      }

      el.rleft = drawn + 1;
      el.show();
      drawn += width;
      index++;
    }

    return super.render();
  }

  select(offset: any) {
    if (typeof offset !== "number") {
      offset = this.items.indexOf(offset);
    }

    if (offset < 0) offset = 0;
    if (offset >= this.items.length) offset = this.items.length - 1;

    if (this.parent) {
      this.ensureVisible(offset);
    }
    this.selectedIndex = offset;
    this.emit("select item", this.items[offset], offset);
  }

  removeItem(child: any) {
    const i = typeof child !== "number" ? this.items.indexOf(child) : child;
    if (~i && this.items[i]) {
      const el = this.items.splice(i, 1)[0];
      this.commands.splice(i, 1);
      this.remove(el);
      if (i === this.selected) this.select(i - 1);
    }
    this.emit("remove item");
  }

  move(offset: number) {
    this.select(this.selected + offset);
  }

  moveLeft(offset = 1) {
    this.move(-offset);
  }

  moveRight(offset = 1) {
    this.move(offset);
  }

  selectTab(index: number) {
    const item = this.items[index];
    const cmd = this.commands[index];
    if (item) {
      cmd?.callback?.();
      this.select(index);
      this.screen.render();
    }
    this.emit("select tab", item, index);
  }

  private normalizeCommands(commands: any): ListbarCommand[] {
    if (Array.isArray(commands)) {
      return commands.map((cmd) => this.normalizeCommand(cmd));
    }

    return Object.keys(commands).map((key, index) => {
      let cmd = commands[key];
      if (typeof cmd === "function") {
        cmd = { callback: cmd };
      }
      if (cmd.text == null) cmd.text = key;
      if (cmd.prefix == null) cmd.prefix = String(index + 1);
      if (cmd.text == null && cmd.callback) cmd.text = cmd.callback.name;
      return cmd as ListbarCommand;
    });
  }

  private normalizeCommand(item: any, callback?: any): ListbarCommand {
    if (typeof item === "function") {
      return { text: item.name, callback: item };
    }
    if (typeof item === "string") {
      return { text: item, callback };
    }
    return item as ListbarCommand;
  }

  private ensureVisible(index: number) {
    if (!this.parent) return;

    const lpos = this._getCoords();
    if (!lpos) return;

    const available = Math.max(0, lpos.xl - lpos.xi - this.iwidth);
    if (!available) return;

    if (index < this.leftBase) {
      this.leftBase = index;
      return;
    }

    let drawn = 0;
    for (let i = this.leftBase; i < this.items.length; i++) {
      const width = (this.commands[i]?._?.width ?? this.items[i].width) + 1;
      if (drawn + width > available) {
        if (index >= i) {
          this.leftBase = index;
        }
        break;
      }
      if (i === index) break;
      drawn += width;
    }
  }
}

export default Listbar;
export { Listbar };
