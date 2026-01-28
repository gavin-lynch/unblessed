/**
 * Tests for Canvas rendering system
 *
 * Tests the drawille-based canvas, ansi-term canvas, and Canvas2D context.
 */

import { beforeAll, describe, expect, it } from "vitest";
import {
  AnsiTermCanvas,
  Canvas,
  Canvas2DContext,
  COLOR_NAMES,
  DrawilleCanvas,
  getBgCode,
  getFgCode,
} from "../../src/lib/canvas/index.js";
import { initTestRuntime } from "../helpers/mock.js";

describe("DrawilleCanvas", () => {
  beforeAll(() => {
    initTestRuntime();
  });

  it("should create DrawilleCanvas with valid dimensions", () => {
    const canvas = new DrawilleCanvas(80, 48);
    expect(canvas.width).toBe(80);
    expect(canvas.height).toBe(48);
  });

  it("should throw for invalid dimensions", () => {
    expect(() => new DrawilleCanvas(81, 48)).toThrow(
      "Width must be a multiple of 2",
    );
    expect(() => new DrawilleCanvas(80, 47)).toThrow(
      "Height must be a multiple of 4",
    );
  });

  it("should set and unset pixels", () => {
    const canvas = new DrawilleCanvas(80, 48);

    canvas.set(10, 10);
    canvas.set(20, 20);

    canvas.unset(10, 10);

    // Verify through frame output (pixels set will show as braille chars)
    const frame = canvas.frame();
    expect(frame.length).toBeGreaterThan(0);
  });

  it("should toggle pixels", () => {
    const canvas = new DrawilleCanvas(80, 48);

    canvas.toggle(10, 10);
    canvas.toggle(10, 10);
    canvas.toggle(10, 10);

    // After 3 toggles, pixel should be set
    const frame = canvas.frame();
    expect(frame).toBeDefined();
  });

  it("should ignore out of bounds pixels", () => {
    const canvas = new DrawilleCanvas(80, 48);

    expect(() => canvas.set(-1, 10)).not.toThrow();
    expect(() => canvas.set(10, -1)).not.toThrow();
    expect(() => canvas.set(100, 10)).not.toThrow();
    expect(() => canvas.set(10, 100)).not.toThrow();
  });

  it("should clear the canvas", () => {
    const canvas = new DrawilleCanvas(80, 48);

    canvas.set(10, 10);
    canvas.set(20, 20);
    canvas.clear();

    const frame = canvas.frame();
    // Frame should be all spaces (no braille chars)
    expect(frame.includes(String.fromCharCode(0x2801))).toBe(false);
  });

  it("should write text", () => {
    const canvas = new DrawilleCanvas(80, 48);

    canvas.writeText("Hello", 0, 0);

    const frame = canvas.frame();
    expect(frame).toContain("Hello");
  });

  it("should measure text width", () => {
    const canvas = new DrawilleCanvas(80, 48);

    const measure = canvas.measureText("Hello");
    expect(measure.width).toBe(12); // "Hello".length * 2 + 2
  });

  it("should use colors for set pixels", () => {
    const canvas = new DrawilleCanvas(80, 48);

    canvas.color = "red";
    canvas.set(10, 10);

    const frame = canvas.frame();
    // Should contain ANSI escape codes
    expect(frame).toContain("\x1b[");
  });

  it("should render correct braille characters", () => {
    const canvas = new DrawilleCanvas(4, 8);

    // Set pixel at position that maps to dot 1 (0x01)
    canvas.set(0, 0);

    const frame = canvas.frame();
    // U+2800 + 0x01 = U+2801
    expect(frame).toContain(String.fromCharCode(0x2801));
  });
});

describe("AnsiTermCanvas", () => {
  it("should create AnsiTermCanvas with any dimensions", () => {
    const canvas = new AnsiTermCanvas(40, 12);
    expect(canvas.width).toBe(40);
    expect(canvas.height).toBe(12);
  });

  it("should set pixels as colored spaces", () => {
    const canvas = new AnsiTermCanvas(40, 12);

    canvas.color = "blue";
    canvas.set(5, 5);

    const frame = canvas.frame();
    // Should contain ANSI background color code
    expect(frame).toContain("\x1b[4");
  });

  it("should unset pixels", () => {
    const canvas = new AnsiTermCanvas(40, 12);

    canvas.set(5, 5);
    canvas.unset(5, 5);

    const frame = canvas.frame();
    expect(frame).toBeDefined();
  });

  it("should clear the canvas", () => {
    const canvas = new AnsiTermCanvas(40, 12);

    canvas.set(5, 5);
    canvas.set(10, 10);
    canvas.clear();

    const frame = canvas.frame();
    // Should be all spaces
    expect(frame.trim().replace(/\n/g, "")).toBe("");
  });

  it("should write text", () => {
    const canvas = new AnsiTermCanvas(40, 12);

    canvas.writeText("Test", 0, 0);

    const frame = canvas.frame();
    expect(frame).toContain("Test");
  });

  it("should measure text with 1:1 mapping", () => {
    const canvas = new AnsiTermCanvas(40, 12);

    const measure = canvas.measureText("Hello");
    expect(measure.width).toBe(5); // Same as string length
  });
});

describe("Canvas2DContext", () => {
  it("should create context with DrawilleCanvas by default", () => {
    const ctx = new Canvas2DContext(80, 48);
    expect(ctx._canvas).toBeInstanceOf(DrawilleCanvas);
  });

  it("should create context with AnsiTermCanvas", () => {
    const ctx = new Canvas2DContext(40, 12, AnsiTermCanvas);
    expect(ctx._canvas).toBeInstanceOf(AnsiTermCanvas);
  });

  it("should set and get strokeStyle", () => {
    const ctx = new Canvas2DContext(80, 48);

    ctx.strokeStyle = "yellow";
    expect(ctx.strokeStyle).toBe("yellow");
  });

  it("should set and get fillStyle", () => {
    const ctx = new Canvas2DContext(80, 48);

    ctx.fillStyle = "green";
    expect(ctx.fillStyle).toBe("green");
  });

  describe("Path drawing", () => {
    it("should draw lines with beginPath/moveTo/lineTo/stroke", () => {
      const ctx = new Canvas2DContext(80, 48);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(40, 24);
      ctx.stroke();

      const frame = ctx._canvas.frame();
      // Frame should contain some braille characters
      expect(frame.length).toBeGreaterThan(0);
    });

    it("should close path", () => {
      const ctx = new Canvas2DContext(80, 48);

      ctx.beginPath();
      ctx.moveTo(10, 10);
      ctx.lineTo(30, 10);
      ctx.lineTo(20, 30);
      ctx.closePath();
      ctx.stroke();

      // Should complete without error
      expect(ctx._canvas.frame()).toBeDefined();
    });
  });

  describe("Rectangle methods", () => {
    it("should fill rectangle", () => {
      const ctx = new Canvas2DContext(80, 48);

      ctx.fillRect(10, 10, 20, 20);

      const frame = ctx._canvas.frame();
      expect(frame.length).toBeGreaterThan(0);
    });

    it("should clear rectangle", () => {
      const ctx = new Canvas2DContext(80, 48);

      ctx.fillRect(0, 0, 80, 48);
      ctx.clearRect(20, 20, 10, 10);

      // Should work without error
      expect(ctx._canvas.frame()).toBeDefined();
    });

    it("should stroke rectangle", () => {
      const ctx = new Canvas2DContext(80, 48);

      ctx.strokeRect(10, 10, 30, 20);

      const frame = ctx._canvas.frame();
      expect(frame.length).toBeGreaterThan(0);
    });
  });

  describe("Text methods", () => {
    it("should fill text", () => {
      const ctx = new Canvas2DContext(80, 48);

      ctx.fillStyle = "white";
      ctx.fillText("Hello World", 10, 10);

      const frame = ctx._canvas.frame();
      expect(frame).toContain("Hello World");
    });

    it("should stroke text (same as fill for terminal)", () => {
      const ctx = new Canvas2DContext(80, 48);

      ctx.strokeText("Test", 0, 0);

      const frame = ctx._canvas.frame();
      expect(frame).toContain("Test");
    });

    it("should measure text", () => {
      const ctx = new Canvas2DContext(80, 48);

      const metrics = ctx.measureText("Hello");
      expect(metrics.width).toBe(12); // drawille measureText
    });
  });

  describe("Transformations", () => {
    it("should save and restore state", () => {
      const ctx = new Canvas2DContext(80, 48);

      ctx.save();
      ctx.translate(10, 10);
      ctx.restore();

      // Drawing should be at original position
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(10, 10);
      ctx.stroke();

      expect(ctx._canvas.frame()).toBeDefined();
    });

    it("should translate", () => {
      const ctx = new Canvas2DContext(80, 48);

      ctx.translate(20, 20);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(10, 0);
      ctx.stroke();

      // Points should be translated
      expect(ctx._canvas.frame()).toBeDefined();
    });

    it("should scale", () => {
      const ctx = new Canvas2DContext(80, 48);

      ctx.scale(2, 2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(10, 10);
      ctx.stroke();

      expect(ctx._canvas.frame()).toBeDefined();
    });

    it("should rotate", () => {
      const ctx = new Canvas2DContext(80, 48);

      ctx.rotate(Math.PI / 4); // 45 degrees
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(20, 0);
      ctx.stroke();

      expect(ctx._canvas.frame()).toBeDefined();
    });

    it("should reset transform", () => {
      const ctx = new Canvas2DContext(80, 48);

      ctx.translate(100, 100);
      ctx.rotate(1);
      ctx.scale(3, 3);

      ctx.resetTransform();

      // Should be back to identity
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(10, 10);
      ctx.stroke();

      expect(ctx._canvas.frame()).toBeDefined();
    });
  });

  describe("Line width", () => {
    it("should respect lineWidth = 0 (no stroke)", () => {
      const ctx = new Canvas2DContext(80, 48);

      ctx.lineWidth = 0;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(40, 24);
      ctx.stroke();

      // Nothing should be drawn
      const frame = ctx._canvas.frame();
      // Frame should be all spaces (no braille chars with non-zero codepoint)
      const hasBraille = /[\u2801-\u28FF]/.test(frame);
      expect(hasBraille).toBe(false);
    });
  });
});

describe("Canvas wrapper", () => {
  it("should create canvas with default DrawilleCanvas", () => {
    const canvas = new Canvas(80, 48);
    const ctx = canvas.getContext();

    expect(ctx._canvas).toBeInstanceOf(DrawilleCanvas);
  });

  it("should create canvas with AnsiTermCanvas", () => {
    const canvas = new Canvas(40, 12, AnsiTermCanvas);
    const ctx = canvas.getContext();

    expect(ctx._canvas).toBeInstanceOf(AnsiTermCanvas);
  });

  it("should return same context on multiple calls", () => {
    const canvas = new Canvas(80, 48);

    const ctx1 = canvas.getContext();
    const ctx2 = canvas.getContext();

    expect(ctx1).toBe(ctx2);
  });

  it("should provide width and height", () => {
    const canvas = new Canvas(80, 48);

    expect(canvas.width).toBe(80);
    expect(canvas.height).toBe(48);
  });

  it("should render frame", () => {
    const canvas = new Canvas(80, 48);
    const ctx = canvas.getContext();

    ctx.strokeStyle = "yellow";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(40, 24);
    ctx.stroke();

    const frame = canvas.frame();
    expect(frame.length).toBeGreaterThan(0);
  });

  it("should return empty string if no context", () => {
    const canvas = new Canvas(80, 48);
    // Don't call getContext()

    const frame = canvas.frame();
    expect(frame).toBe("");
  });

  it("should clear canvas", () => {
    const canvas = new Canvas(80, 48);
    const ctx = canvas.getContext();

    ctx.fillRect(0, 0, 80, 48);
    canvas.clear();

    const frame = canvas.frame();
    // Should be clear
    expect(frame).toBeDefined();
  });
});

describe("Color utilities", () => {
  it("should have correct color names", () => {
    expect(COLOR_NAMES.black).toBe(0);
    expect(COLOR_NAMES.red).toBe(1);
    expect(COLOR_NAMES.green).toBe(2);
    expect(COLOR_NAMES.yellow).toBe(3);
    expect(COLOR_NAMES.blue).toBe(4);
    expect(COLOR_NAMES.magenta).toBe(5);
    expect(COLOR_NAMES.cyan).toBe(6);
    expect(COLOR_NAMES.white).toBe(7);
    expect(COLOR_NAMES.normal).toBe(9);
  });

  it("should generate foreground escape codes", () => {
    expect(getFgCode("red")).toBe("\x1b[31m");
    expect(getFgCode("blue")).toBe("\x1b[34m");
    expect(getFgCode("normal")).toBe("\x1b[39m");
  });

  it("should generate background escape codes", () => {
    expect(getBgCode("red")).toBe("\x1b[41m");
    expect(getBgCode("blue")).toBe("\x1b[44m");
    expect(getBgCode("normal")).toBe("\x1b[49m");
  });

  it("should handle 256-color numbers", () => {
    expect(getFgCode(196)).toBe("\x1b[38;5;196m");
    expect(getBgCode(196)).toBe("\x1b[48;5;196m");
  });

  it("should handle RGB arrays", () => {
    const fg = getFgCode([255, 0, 0]);
    expect(fg).toMatch(/\x1b\[38;5;\d+m/);

    const bg = getBgCode([0, 255, 0]);
    expect(bg).toMatch(/\x1b\[48;5;\d+m/);
  });

  it("should handle hex colors", () => {
    const fg = getFgCode("#ff0000");
    expect(fg).toMatch(/\x1b\[38;5;\d+m/);
  });
});

describe("Blessed-contrib compatibility", () => {
  it("should support the full drawing workflow like line chart", () => {
    // Simulate how blessed-contrib line chart uses the canvas
    const canvas = new Canvas(80, 48);
    const ctx = canvas.getContext();

    // Set styles
    ctx.strokeStyle = "yellow";
    ctx.fillStyle = "green";

    // Clear canvas
    ctx.clearRect(0, 0, 80, 48);

    // Draw axis lines
    ctx.beginPath();
    ctx.lineTo(10, 0);
    ctx.lineTo(10, 40);
    ctx.lineTo(80, 40);
    ctx.stroke();

    // Draw data line
    ctx.strokeStyle = "blue";
    ctx.beginPath();
    ctx.moveTo(10, 30);
    ctx.lineTo(20, 20);
    ctx.lineTo(30, 25);
    ctx.lineTo(40, 10);
    ctx.lineTo(50, 15);
    ctx.stroke();

    // Draw labels
    ctx.fillText("0", 2, 40);
    ctx.fillText("50", 2, 20);
    ctx.fillText("100", 2, 0);

    // Get frame
    const frame = canvas.frame();
    expect(frame).toContain("0");
    expect(frame).toContain("50");
    expect(frame).toContain("100");
  });

  it("should support the full drawing workflow like bar chart", () => {
    // Simulate how blessed-contrib bar chart uses the canvas with AnsiTermCanvas
    const canvas = new Canvas(40, 12, AnsiTermCanvas);
    const ctx = canvas.getContext();

    // Draw bars
    ctx.strokeStyle = "blue";
    ctx.fillRect(5, 2, 5, 8);

    ctx.strokeStyle = "green";
    ctx.fillRect(12, 4, 5, 6);

    ctx.strokeStyle = "red";
    ctx.fillRect(19, 6, 5, 4);

    // Draw labels
    ctx.fillStyle = "white";
    ctx.fillText("A", 7, 11);
    ctx.fillText("B", 14, 11);
    ctx.fillText("C", 21, 11);

    const frame = canvas.frame();
    expect(frame).toContain("A");
    expect(frame).toContain("B");
    expect(frame).toContain("C");
  });
});
