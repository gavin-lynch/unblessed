/**
 * Tests for CanvasWidget
 *
 * Tests the blessed-contrib compatible Canvas widget.
 */

import { beforeAll, describe, expect, it } from "vitest";
import {
  AnsiTermCanvas,
  CanvasWidget,
  createBrailleCanvas,
  createCharCanvas,
} from "../../src/widgets/canvas.js";
import { Screen } from "../../src/widgets/screen.js";
import { initTestRuntime } from "../helpers/mock.js";

describe("CanvasWidget", () => {
  beforeAll(() => {
    initTestRuntime();
  });

  it("should create CanvasWidget with default options", () => {
    const screen = new Screen({ width: 80, height: 24 });
    const canvas = new CanvasWidget({
      parent: screen,
      width: 40,
      height: 12,
    });

    expect(canvas.type).toBe("canvas");
    expect(canvas.ctx).toBe(null); // Not created until attach

    screen.destroy();
  });

  it("should create canvas context on attach", async () => {
    const screen = new Screen({ width: 80, height: 24 });
    const canvas = new CanvasWidget({
      parent: screen,
      width: 40,
      height: 12,
    });

    // After append, the canvas should have a context
    screen.append(canvas);

    // Wait for attach event
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(canvas.ctx).not.toBe(null);
    expect(canvas.canvasSize.width).toBeGreaterThan(0);
    expect(canvas.canvasSize.height).toBeGreaterThan(0);

    screen.destroy();
  });

  it("should use DrawilleCanvas by default", async () => {
    const screen = new Screen({ width: 80, height: 24 });
    const canvas = new CanvasWidget({
      parent: screen,
      width: 40,
      height: 12,
    });

    screen.append(canvas);
    await new Promise((resolve) => setTimeout(resolve, 10));

    // DrawilleCanvas has specific dimension calculations
    // width*2 - 12 for braille
    expect(canvas.canvasSize.width).toBe(40 * 2 - 12);
    expect(canvas.canvasSize.height).toBe(12 * 4);

    screen.destroy();
  });

  it("should use AnsiTermCanvas when specified", async () => {
    const screen = new Screen({ width: 80, height: 24 });
    const canvas = new CanvasWidget(
      {
        parent: screen,
        width: 40,
        height: 12,
      },
      AnsiTermCanvas,
    );

    screen.append(canvas);
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(canvas.ctx).not.toBe(null);

    screen.destroy();
  });

  it("should clear the canvas", async () => {
    const screen = new Screen({ width: 80, height: 24 });
    const canvas = new CanvasWidget({
      parent: screen,
      width: 40,
      height: 12,
    });

    screen.append(canvas);
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Draw something
    canvas.ctx!.fillRect(0, 0, 20, 20);

    // Clear
    canvas.clear();

    // Should not throw
    expect(() => canvas.render()).not.toThrow();

    screen.destroy();
  });

  it("should render canvas content", async () => {
    const screen = new Screen({ width: 80, height: 24 });
    const canvas = new CanvasWidget({
      parent: screen,
      width: 40,
      height: 12,
    });

    screen.append(canvas);
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Draw something
    const ctx = canvas.ctx!;
    ctx.strokeStyle = "yellow";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(40, 20);
    ctx.stroke();

    // Render should update content
    screen.alloc();
    canvas.render();

    // Content should be set
    expect(canvas.getContent()).toBeDefined();

    screen.destroy();
  });

  it("should call setData when data option is provided", async () => {
    const screen = new Screen({ width: 80, height: 24 });

    // Create a subclass that tracks setData calls
    class TestCanvas extends CanvasWidget {
      setDataCalled = false;
      receivedData: unknown = null;

      override setData(data: unknown): void {
        this.setDataCalled = true;
        this.receivedData = data;
      }
    }

    const testData = { x: [1, 2, 3], y: [4, 5, 6] };
    const canvas = new TestCanvas({
      parent: screen,
      width: 40,
      height: 12,
      data: testData,
    });

    screen.append(canvas);
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(canvas.setDataCalled).toBe(true);
    expect(canvas.receivedData).toBe(testData);

    screen.destroy();
  });

  describe("calcSize", () => {
    it("should calculate correct size for braille canvas", async () => {
      const screen = new Screen({ width: 80, height: 24 });
      const canvas = new CanvasWidget({
        parent: screen,
        width: 50,
        height: 20,
      });

      screen.append(canvas);
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Default braille calculation: width*2-12, height*4
      expect(canvas.canvasSize.width).toBe(50 * 2 - 12);
      expect(canvas.canvasSize.height).toBe(20 * 4);

      screen.destroy();
    });

    it("should be overridable in subclasses", async () => {
      const screen = new Screen({ width: 80, height: 24 });

      class CustomCanvas extends CanvasWidget {
        override calcSize(): void {
          this.canvasSize = {
            width: this.width - 2,
            height: this.height,
          };
        }
      }

      const canvas = new CustomCanvas({
        parent: screen,
        width: 40,
        height: 12,
      });

      screen.append(canvas);
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(canvas.canvasSize.width).toBe(38);
      expect(canvas.canvasSize.height).toBe(12);

      screen.destroy();
    });
  });
});

describe("createBrailleCanvas helper", () => {
  beforeAll(() => {
    initTestRuntime();
  });

  it("should create CanvasWidget with DrawilleCanvas", async () => {
    const screen = new Screen({ width: 80, height: 24 });
    const canvas = createBrailleCanvas({
      parent: screen,
      width: 40,
      height: 12,
    });

    screen.append(canvas);
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(canvas.ctx).not.toBe(null);

    screen.destroy();
  });
});

describe("createCharCanvas helper", () => {
  beforeAll(() => {
    initTestRuntime();
  });

  it("should create CanvasWidget with AnsiTermCanvas", async () => {
    const screen = new Screen({ width: 80, height: 24 });
    const canvas = createCharCanvas({
      parent: screen,
      width: 40,
      height: 12,
    });

    screen.append(canvas);
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(canvas.ctx).not.toBe(null);

    screen.destroy();
  });
});

describe("CanvasWidget blessed-contrib compatibility", () => {
  beforeAll(() => {
    initTestRuntime();
  });

  it("should support the blessed-contrib Canvas pattern", async () => {
    // This simulates how blessed-contrib uses Canvas
    const screen = new Screen({ width: 80, height: 24 });

    // Create canvas (like blessed-contrib Canvas constructor)
    const canvas = new CanvasWidget({
      parent: screen,
      width: "50%",
      height: "50%",
      border: { type: "line" },
    });

    screen.append(canvas);
    await new Promise((resolve) => setTimeout(resolve, 10));

    // After attach, canvas size should be calculated
    expect(canvas.canvasSize.width).toBeGreaterThan(0);
    expect(canvas.canvasSize.height).toBeGreaterThan(0);

    // Context should be available
    expect(canvas.ctx).not.toBe(null);

    // Drawing should work
    const ctx = canvas.ctx!;
    ctx.strokeStyle = "yellow";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.canvasSize.width / 2, canvas.canvasSize.height / 2);
    ctx.stroke();

    // Render should update content
    screen.alloc();
    screen.render();

    screen.destroy();
  });

  it("should support clearPos pattern", async () => {
    const screen = new Screen({ width: 80, height: 24 });
    const canvas = new CanvasWidget({
      parent: screen,
      width: 40,
      height: 12,
    });

    screen.append(canvas);
    await new Promise((resolve) => setTimeout(resolve, 10));

    // This is the pattern blessed-contrib uses in render()
    screen.alloc();
    canvas.clearPos(true);
    canvas.setContent("");
    canvas.render();

    // Should not throw
    screen.destroy();
  });
});
