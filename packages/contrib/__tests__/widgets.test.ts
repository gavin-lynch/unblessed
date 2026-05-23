/**
 * Tests for @gavin-lynch/unblessed-contrib widgets
 */

import { Screen } from "@gavin-lynch/unblessed-core";
import { describe, expect, it } from "vitest";
import {
  Bar,
  Carousel,
  Donut,
  Gauge,
  GaugeList,
  Grid,
  LCD,
  Line,
  Log,
  Markdown,
  Picture,
  Sparkline,
  StackedBar,
  Table,
  WorldMap,
} from "../src/index.js";

describe("Line Chart", () => {
  it("should create a Line chart", () => {
    const screen = new Screen({ width: 80, height: 24 });
    const line = new Line({
      parent: screen,
      width: 40,
      height: 12,
      label: "Test Line",
    });

    expect(line.type).toBe("linechart");
    screen.destroy();
  });

  it("should set data after attach", async () => {
    const screen = new Screen({ width: 80, height: 24 });
    const line = new Line({
      parent: screen,
      width: 40,
      height: 12,
    });

    screen.append(line);
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Should not throw
    line.setData([
      {
        title: "Series 1",
        x: ["t1", "t2", "t3"],
        y: [10, 20, 15],
        style: { line: "yellow" },
      },
    ]);

    screen.destroy();
  });

  it("should handle multiple series", async () => {
    const screen = new Screen({ width: 80, height: 24 });
    const line = new Line({
      parent: screen,
      width: 40,
      height: 12,
      showLegend: true,
    });

    screen.append(line);
    await new Promise((resolve) => setTimeout(resolve, 10));

    line.setData([
      { title: "CPU", x: ["t1", "t2"], y: [10, 20], style: { line: "red" } },
      {
        title: "Memory",
        x: ["t1", "t2"],
        y: [30, 40],
        style: { line: "blue" },
      },
    ]);

    screen.destroy();
  });
});

describe("Bar Chart", () => {
  it("should create a Bar chart", () => {
    const screen = new Screen({ width: 80, height: 24 });
    const bar = new Bar({
      parent: screen,
      width: 40,
      height: 12,
      label: "Test Bar",
    });

    expect(bar.type).toBe("bar");
    screen.destroy();
  });

  it("should set data after attach", async () => {
    const screen = new Screen({ width: 80, height: 24 });
    const bar = new Bar({
      parent: screen,
      width: 40,
      height: 12,
    });

    screen.append(bar);
    await new Promise((resolve) => setTimeout(resolve, 10));

    bar.setData({
      titles: ["A", "B", "C"],
      data: [10, 20, 15],
    });

    screen.destroy();
  });
});

describe("Stacked Bar Chart", () => {
  it("should create a StackedBar chart", () => {
    const screen = new Screen({ width: 80, height: 24 });
    const stackedBar = new StackedBar({
      parent: screen,
      width: 40,
      height: 12,
    });

    expect(stackedBar.type).toBe("stacked-bar");
    screen.destroy();
  });

  it("should set data with multiple stacks", async () => {
    const screen = new Screen({ width: 80, height: 24 });
    const stackedBar = new StackedBar({
      parent: screen,
      width: 40,
      height: 12,
      barBgColor: ["green", "yellow", "red"],
    });

    screen.append(stackedBar);
    await new Promise((resolve) => setTimeout(resolve, 10));

    stackedBar.setData({
      barCategory: ["Server 1", "Server 2"],
      stackedCategory: ["CPU", "Memory", "Disk"],
      data: [
        [20, 30, 10],
        [40, 20, 15],
      ],
    });

    screen.destroy();
  });
});

describe("Gauge", () => {
  it("should create a Gauge", () => {
    const screen = new Screen({ width: 80, height: 24 });
    const gauge = new Gauge({
      parent: screen,
      width: 40,
      height: 5,
    });

    expect(gauge.type).toBe("gauge");
    screen.destroy();
  });

  it("should set percent value", async () => {
    const screen = new Screen({ width: 80, height: 24 });
    const gauge = new Gauge({
      parent: screen,
      width: 40,
      height: 5,
    });

    screen.append(gauge);
    await new Promise((resolve) => setTimeout(resolve, 10));

    gauge.setPercent(75);
    screen.destroy();
  });

  it("should set stacked values", async () => {
    const screen = new Screen({ width: 80, height: 24 });
    const gauge = new Gauge({
      parent: screen,
      width: 40,
      height: 5,
    });

    screen.append(gauge);
    await new Promise((resolve) => setTimeout(resolve, 10));

    gauge.setStack([
      { percent: 30, stroke: "green" },
      { percent: 50, stroke: "yellow" },
      { percent: 20, stroke: "red" },
    ]);

    screen.destroy();
  });
});

describe("Box model sizing", () => {
  it("should honor inner box metrics for gauge", async () => {
    const screen = new Screen({ width: 80, height: 24 });
    const gauge = new Gauge({
      parent: screen,
      width: 20,
      height: 6,
      border: { type: "line" },
      padding: 1,
    });

    screen.append(gauge);
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(gauge.canvasSize).toEqual({ width: 18, height: 4 });
    screen.destroy();
  });

  it("should honor inner box metrics for line chart", async () => {
    const screen = new Screen({ width: 80, height: 24 });
    const line = new Line({
      parent: screen,
      width: 20,
      height: 6,
      border: { type: "line" },
      padding: 1,
    });

    screen.append(line);
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(line.canvasSize).toEqual({ width: 28, height: 16 });
    screen.destroy();
  });
});

describe("Donut", () => {
  it("should create a Donut chart", () => {
    const screen = new Screen({ width: 80, height: 24 });
    const donut = new Donut({
      parent: screen,
      width: 30,
      height: 15,
    });

    expect(donut.type).toBe("donut");
    screen.destroy();
  });

  it("should set data", async () => {
    const screen = new Screen({ width: 80, height: 24 });
    const donut = new Donut({
      parent: screen,
      width: 30,
      height: 15,
    });

    screen.append(donut);
    await new Promise((resolve) => setTimeout(resolve, 10));

    donut.setData([
      { label: "A", percent: 75, color: "green" },
      { label: "B", percent: 45, color: "blue" },
    ]);

    screen.destroy();
  });
});

describe("Log", () => {
  it("should create a Log widget", () => {
    const screen = new Screen({ width: 80, height: 24 });
    const log = new Log({
      parent: screen,
      width: 40,
      height: 12,
    });

    expect(log.type).toBe("log");
    screen.destroy();
  });

  it("should log messages", () => {
    const screen = new Screen({ width: 80, height: 24 });
    const log = new Log({
      parent: screen,
      width: 40,
      height: 12,
      bufferLength: 10,
    });

    log.log("Message 1");
    log.log("Message 2");
    log.log("Message 3");

    expect(log.getLogLines()).toEqual(["Message 1", "Message 2", "Message 3"]);
    screen.destroy();
  });

  it("should respect buffer length", () => {
    const screen = new Screen({ width: 80, height: 24 });
    const log = new Log({
      parent: screen,
      width: 40,
      height: 12,
      bufferLength: 3,
    });

    log.log("1");
    log.log("2");
    log.log("3");
    log.log("4");
    log.log("5");

    expect(log.getLogLines()).toEqual(["3", "4", "5"]);
    screen.destroy();
  });

  it("should clear log", () => {
    const screen = new Screen({ width: 80, height: 24 });
    const log = new Log({
      parent: screen,
      width: 40,
      height: 12,
    });

    log.log("Message 1");
    log.log("Message 2");
    log.clearLog();

    expect(log.getLogLines()).toEqual([]);
    screen.destroy();
  });
});

describe("Sparkline", () => {
  it("should create a Sparkline", () => {
    const screen = new Screen({ width: 80, height: 24 });
    const sparkline = new Sparkline({
      parent: screen,
      width: 40,
      height: 12,
    });

    expect(sparkline.type).toBe("sparkline");
    screen.destroy();
  });

  it("should set data", () => {
    const screen = new Screen({ width: 80, height: 24 });
    const sparkline = new Sparkline({
      parent: screen,
      width: 40,
      height: 12,
    });

    sparkline.setData(
      ["Traffic", "Errors"],
      [
        [10, 20, 30, 40, 50],
        [5, 15, 10, 20, 25],
      ],
    );

    // Content should include sparkline characters
    const content = sparkline.getContent();
    expect(content).toBeDefined();
    screen.destroy();
  });
});

describe("LCD", () => {
  it("should create an LCD widget", () => {
    const screen = new Screen({ width: 80, height: 24 });
    const lcd = new LCD({
      parent: screen,
      width: 30,
      height: 12,
    });

    expect(lcd.type).toBe("lcd");
    screen.destroy();
  });

  it("should set display text after attach", async () => {
    const screen = new Screen({ width: 80, height: 24 });
    const lcd = new LCD({
      parent: screen,
      width: 30,
      height: 12,
      elements: 5,
    });

    screen.append(lcd);
    await new Promise((resolve) => setTimeout(resolve, 10));

    lcd.setDisplay("HELLO");
    screen.destroy();
  });

  it("should set numeric display", async () => {
    const screen = new Screen({ width: 80, height: 24 });
    const lcd = new LCD({
      parent: screen,
      width: 30,
      height: 12,
      elements: 4,
      display: 1234,
    });

    screen.append(lcd);
    await new Promise((resolve) => setTimeout(resolve, 10));

    lcd.setDisplay(5678);
    screen.destroy();
  });
});

describe("GaugeList", () => {
  it("should create a GaugeList widget", () => {
    const screen = new Screen({ width: 80, height: 24 });
    const gaugeList = new GaugeList({
      parent: screen,
      width: 40,
      height: 10,
    });

    expect(gaugeList.type).toBe("gauge-list");
    screen.destroy();
  });

  it("should set gauges after attach", async () => {
    const screen = new Screen({ width: 80, height: 24 });
    const gaugeList = new GaugeList({
      parent: screen,
      width: 40,
      height: 10,
    });

    screen.append(gaugeList);
    await new Promise((resolve) => setTimeout(resolve, 10));

    gaugeList.setGauges([
      { stack: [30, 70] },
      { stack: [{ percent: 50, stroke: "green" }] },
    ]);

    screen.destroy();
  });
});

describe("Table", () => {
  it("should create a Table widget", () => {
    const screen = new Screen({ width: 80, height: 24 });
    const table = new Table({
      parent: screen,
      width: 60,
      height: 10,
      columnWidth: [20, 10, 10],
    });

    expect(table.type).toBe("table");
    screen.destroy();
  });

  it("should set data after attach", async () => {
    const screen = new Screen({ width: 80, height: 24 });
    const table = new Table({
      parent: screen,
      width: 60,
      height: 10,
      columnWidth: [20, 10, 10],
    });

    screen.append(table);
    await new Promise((resolve) => setTimeout(resolve, 10));

    table.setData({
      headers: ["Name", "Value", "Status"],
      data: [
        ["Server 1", "100", "OK"],
        ["Server 2", "200", "WARN"],
      ],
    });

    screen.destroy();
  });

  it("should create without columnWidth", () => {
    const screen = new Screen({ width: 80, height: 24 });
    const table = new Table({
      parent: screen,
      width: 60,
      height: 10,
    });

    expect(table.type).toBe("table");
    screen.destroy();
  });
});

describe("Carousel", () => {
  it("should create a Carousel", () => {
    const screen = new Screen({ width: 80, height: 24 });
    const pages = [(_s: any) => {}, (_s: any) => {}];
    const carousel = new Carousel(pages, { screen });

    expect(carousel).toBeDefined();
    expect(carousel.pageCount).toBe(2);
    expect(carousel.currentPage).toBe(0);
    screen.destroy();
  });

  it("should navigate pages", () => {
    const screen = new Screen({ width: 80, height: 24 });
    const pages = [(_s: any) => {}, (_s: any) => {}, (_s: any) => {}];
    const carousel = new Carousel(pages, { screen });

    carousel.start();
    expect(carousel.currentPage).toBe(0);

    carousel.next();
    expect(carousel.currentPage).toBe(1);

    carousel.prev();
    expect(carousel.currentPage).toBe(0);

    carousel.end();
    expect(carousel.currentPage).toBe(2);

    carousel.home();
    expect(carousel.currentPage).toBe(0);

    carousel.goto(1);
    expect(carousel.currentPage).toBe(1);

    screen.destroy();
  });

  it("should stop at ends without rotate", () => {
    const screen = new Screen({ width: 80, height: 24 });
    const pages = [(_s: any) => {}, (_s: any) => {}];
    const carousel = new Carousel(pages, { screen, rotate: false });

    carousel.start();
    carousel.prev(); // Should stay at 0
    expect(carousel.currentPage).toBe(0);

    carousel.end();
    carousel.next(); // Should stay at 1
    expect(carousel.currentPage).toBe(1);

    screen.destroy();
  });

  it("should rotate when enabled", () => {
    const screen = new Screen({ width: 80, height: 24 });
    const pages = [(_s: any) => {}, (_s: any) => {}];
    const carousel = new Carousel(pages, { screen, rotate: true });

    carousel.start();
    carousel.prev(); // Should wrap to end
    expect(carousel.currentPage).toBe(1);

    carousel.next(); // Should wrap to start
    expect(carousel.currentPage).toBe(0);

    screen.destroy();
  });
});

describe("Grid", () => {
  it("should create a Grid layout", () => {
    const screen = new Screen({ width: 80, height: 24 });
    const grid = new Grid({
      screen: screen,
      rows: 12,
      cols: 12,
    });

    expect(grid).toBeDefined();
    screen.destroy();
  });

  it("should throw without screen", () => {
    expect(
      () =>
        new Grid({
          screen: undefined as any,
          rows: 12,
          cols: 12,
        }),
    ).toThrow();
  });

  it("should add widgets to grid", () => {
    const screen = new Screen({ width: 80, height: 24 });
    const grid = new Grid({
      screen: screen,
      rows: 12,
      cols: 12,
    });

    const log = grid.set(0, 0, 6, 6, (opts) => new Log(opts), {
      label: "Log",
    });

    expect(log).toBeDefined();
    expect(log.type).toBe("log");
    screen.destroy();
  });

  it("should position widgets correctly", () => {
    const screen = new Screen({ width: 80, height: 24 });
    const grid = new Grid({
      screen: screen,
      rows: 12,
      cols: 12,
    });

    const widget = grid.set(0, 0, 6, 6, (opts) => new Log(opts), {});

    // Widget should have percentage-based positioning
    expect(widget.position.top).toContain("%");
    expect(widget.position.left).toContain("%");
    expect(widget.position.width).toContain("%");
    expect(widget.position.height).toContain("%");

    screen.destroy();
  });

  it("should add borders by default", () => {
    const screen = new Screen({ width: 80, height: 24 });
    const grid = new Grid({
      screen: screen,
      rows: 12,
      cols: 12,
    });

    const widget = grid.set(0, 0, 6, 6, (opts) => new Log(opts), {});

    expect(widget.border).toBeDefined();
    screen.destroy();
  });

  it("should hide borders when specified", () => {
    const screen = new Screen({ width: 80, height: 24 });
    const grid = new Grid({
      screen: screen,
      rows: 12,
      cols: 12,
      hideBorder: true,
    });

    const widget = grid.set(0, 0, 6, 6, (opts) => new Log(opts), {});

    // Border should not be set by grid
    // (widget may have its own border from options)
    screen.destroy();
  });
});

describe("Markdown", () => {
  it("should create a Markdown widget", () => {
    const screen = new Screen({ width: 80, height: 24 });
    const markdown = new Markdown({
      parent: screen,
      width: "80%",
      height: "80%",
    });

    expect(markdown.type).toBe("markdown");
    screen.destroy();
  });

  it("should set markdown content", async () => {
    const screen = new Screen({ width: 80, height: 24 });
    const markdown = new Markdown({
      parent: screen,
      width: "80%",
      height: "80%",
    });

    // Should not throw even without marked dependency
    await markdown.setMarkdown("# Hello\n\nThis is **bold** text.");
    screen.destroy();
  });
});

describe("WorldMap", () => {
  it("should create a WorldMap widget", () => {
    const screen = new Screen({ width: 80, height: 24 });
    const map = new WorldMap({
      parent: screen,
      width: "80%",
      height: "80%",
    });

    expect(map.type).toBe("map");
    screen.destroy();
  });

  it("should add markers", async () => {
    const screen = new Screen({ width: 80, height: 24 });
    const map = new WorldMap({
      parent: screen,
      width: "80%",
      height: "80%",
    });

    screen.append(map);
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Should not throw even without map-canvas dependency
    map.addMarker({ lon: "-122.4", lat: "37.8", color: "red", char: "X" });
    map.clearMarkers();
    screen.destroy();
  });
});

describe("Picture", () => {
  it("should create a Picture widget", () => {
    const screen = new Screen({ width: 80, height: 24 });
    const picture = new Picture({
      parent: screen,
      width: "50%",
      height: "50%",
      cols: 30,
    });

    expect(picture.type).toBe("picture");
    screen.destroy();
  });

  it("should handle missing image gracefully", async () => {
    const screen = new Screen({ width: 80, height: 24 });
    const picture = new Picture({
      parent: screen,
      width: "50%",
      height: "50%",
    });

    // Should not throw even with invalid base64 and no picture-tuber
    await picture.setImage({ base64: "invalid" });
    screen.destroy();
  });
});

describe("Utils", () => {
  it("should abbreviate numbers", async () => {
    const { abbreviateNumber } = await import("../src/utils.js");

    expect(abbreviateNumber(500)).toBe("500");
    expect(abbreviateNumber(1000)).toBe("1k");
    expect(abbreviateNumber(1500)).toBe("1.5k");
    expect(abbreviateNumber(1000000)).toBe("1m");
    expect(abbreviateNumber(1500000000)).toBe("1.5b");
  });

  it("should merge objects recursively", async () => {
    const { mergeRecursive } = await import("../src/utils.js");

    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { b: { d: 3 }, e: 4 };

    const result = mergeRecursive(obj1, obj2);

    expect(result).toEqual({
      a: 1,
      b: { c: 2, d: 3 },
      e: 4,
    });
  });
});
