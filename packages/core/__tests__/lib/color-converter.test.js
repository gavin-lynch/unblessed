import { describe, expect, it } from "vitest";
import {
  resolveColor,
  toAnsiCode,
  toCellColor,
} from "../../src/lib/color-converter.js";

const caps = {
  maxDepth: 8,
  supports16: true,
  supports256: true,
  supportsTruecolor: false,
};

describe("color-converter", () => {
  it("treats default/normal as none", () => {
    const resolved = resolveColor("default", {
      targetMode: "256",
      capabilities: caps,
    });

    expect(resolved.mode).toBe("none");
    expect(resolved.value).toBe(null);
  });

  it("resolves RGB to 256 index with blessed-contrib compat", () => {
    const resolved = resolveColor([255, 0, 0], {
      targetMode: "256",
      compat: "blessed-contrib",
      capabilities: caps,
    });

    expect(resolved.mode).toBe("256");
    expect(resolved.value).toBe(196);
  });

  it("resolves named color to 16-color index", () => {
    const resolved = resolveColor("red", {
      targetMode: "16",
      capabilities: caps,
    });

    expect(resolved.mode).toBe("16");
    expect(resolved.value).toBe(1);
  });

  it("generates 256-color ANSI codes when requested", () => {
    const code = toAnsiCode([255, 0, 0], "fg", {
      targetMode: "256",
      compat: "blessed-contrib",
      capabilities: caps,
    });

    expect(code).toBe("\x1b[38;5;196m");
  });

  it("generates reset codes for default colors", () => {
    const code = toAnsiCode("default", "bg", {
      targetMode: "256",
      capabilities: caps,
    });

    expect(code).toBe("\x1b[49m");
  });

  it("packs 8-color attributes when requested", () => {
    const result = toCellColor("blue", "fg", {
      targetMode: "8",
      capabilities: caps,
    });

    expect(result.attr).toBe(4 << 9);
    expect(result.truecolor).toBe(null);
  });
});
