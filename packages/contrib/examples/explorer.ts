#!/usr/bin/env tsx
/**
 * File explorer example
 *
 * Demonstrates filesystem tree navigation with file info display.
 */

import { Tree } from "@gavin-lynch/unblessed-core";
import { Screen } from "@gavin-lynch/unblessed-node";
import fs from "fs";
import { Grid, Table } from "../src/index.js";

const screen = new Screen({ smartCSR: true });

const grid = new Grid({ rows: 1, cols: 2, screen: screen });

const tree = grid.set(0, 0, 1, 1, (opts) => new Tree(opts), {
  style: { text: "red" },
  template: { lines: true },
  label: "Filesystem Tree",
});

const table = grid.set(0, 1, 1, 1, (opts) => new Table(opts), {
  keys: true,
  fg: "green",
  label: "Informations",
  columnWidth: [24, 10, 10],
});

// File explorer
const explorer: any = {
  name: "/",
  extended: true,
  getPath: function (self: any) {
    if (!self.parent) return "";
    return self.parent.getPath(self.parent) + "/" + self.name;
  },
  children: function (self: any) {
    const result: any = {};
    const selfPath = self.getPath(self);
    try {
      const children = fs.readdirSync(selfPath + "/");
      if (!self.childrenContent) {
        for (const child of children) {
          const completePath = selfPath + "/" + child;
          if (fs.lstatSync(completePath).isDirectory()) {
            result[child] = {
              name: child,
              getPath: self.getPath,
              extended: false,
              children: self.children,
            };
          } else {
            result[child] = {
              name: child,
              getPath: self.getPath,
              extended: false,
            };
          }
        }
      } else {
        return self.childrenContent;
      }
    } catch (_e) {}
    return result;
  },
};

tree.setData(explorer);

tree.on("select", (node: any) => {
  const path = node.getPath(node);
  let data: string[][] = [];
  const actualPath = path === "" ? "/" : path;
  data.push([actualPath]);
  data.push([""]);
  try {
    const stats = fs.lstatSync(actualPath);
    data = data.concat(
      JSON.stringify(stats, null, 2)
        .split("\n")
        .map((e) => [e]),
    );
    table.setData({ headers: ["Info"], data: data });
  } catch (e: any) {
    table.setData({ headers: ["Info"], data: [[e.toString()]] });
  }
  screen.render();
});

table.setData({ headers: ["Info"], data: [[]] });

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});

screen.key(["tab"], () => {
  if (screen.focused === tree) {
    table.focus();
  } else {
    tree.focus();
  }
});

tree.focus();
screen.render();
