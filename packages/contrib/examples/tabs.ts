#!/usr/bin/env tsx
/**
 * Tabs example
 *
 * Demonstrates a simple tabs widget with mixed content.
 */

import { Box } from "@unblessed/core";
import { Screen } from "@unblessed/node";
import { Line, Table, Tabs } from "../src/index.js";

const screen = new Screen({ smartCSR: true });
screen.title = "Tabs Example";

const backdrop = new Box({
  parent: screen,
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  style: { bg: "black" },
});

const tabs = new Tabs({
  parent: backdrop,
  width: "100%",
  height: "100%",
  tabBarHeight: 3,
  tabBarOptions: {
    style: {
      bg: "black",
      item: { fg: "gray", bg: "black" },
      selected: { fg: "black", bg: "cyan" },
    },
    keys: true,
    mouse: true,
    autoCommandKeys: true,
  },
  tabs: [
    {
      title: "Overview",
      render: (parent) => {
        new Box({
          parent,
          top: 1,
          left: 2,
          width: "85%",
          height: 7,
          content:
            "Use left/right arrows or 1-3 to switch tabs.\n\nThis demo shows a chart and a table with a calmer, high-contrast palette.",
          border: { type: "line" },
          style: { border: { fg: "cyan" }, fg: "white", bg: "black" },
        });
        new Box({
          parent,
          top: 10,
          left: 2,
          width: "70%",
          height: 5,
          label: "Quick Actions",
          border: { type: "line" },
          content: "[r] refresh  [f] filter  [e] export  [/] search",
          style: { border: { fg: "gray" }, fg: "gray", bg: "black" },
        });
      },
    },
    {
      title: "Trend",
      render: (parent) => {
        const line = new Line({
          parent,
          top: 1,
          left: 2,
          width: "92%",
          height: "65%",
          xPadding: 6,
          label: "Latency (ms)",
          style: {
            line: "cyan",
            text: "gray",
            baseline: "gray",
          },
        });
        const setLineData = () => {
          line.setData([
            {
              title: "api",
              x: ["t1", "t2", "t3", "t4"],
              y: [1, 2, 1, 3],
            },
          ]);
        };
        line.once("attach", setLineData);
        setTimeout(() => {
          if ((line as any).ctx) setLineData();
        }, 0);
      },
    },
    {
      title: "Table",
      render: (parent) => {
        const table = new Table({
          parent,
          top: 1,
          left: 2,
          width: "92%",
          height: "70%",
          label: "Services",
          columnWidth: [18, 10, 10],
          style: {
            header: { fg: "black", bg: "cyan" },
            cell: { fg: "white", bg: "black" },
            border: { fg: "gray" },
          },
        });
        table.setData({
          headers: ["Name", "Status", "RTT"],
          data: [
            ["auth", "ok", "12ms"],
            ["billing", "warn", "64ms"],
            ["edge", "ok", "8ms"],
            ["search", "ok", "18ms"],
            ["media", "warn", "52ms"],
          ],
        });
      },
    },
  ],
});

screen.key(["escape", "q", "C-c"], () => {
  screen.destroy();
  process.exit(0);
});

screen.render();
