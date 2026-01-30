import { beforeAll, describe, expect, it } from "vitest";

import { Box } from "../../src/widgets/box.js";
import { Screen } from "../../src/widgets/screen.js";
import { initTestRuntime } from "../helpers/mock.js";

describe("Element render ANSI handling", () => {
  beforeAll(() => {
    initTestRuntime();
  });

  it("should not leak 256-color SGR parameters into rendered text", () => {
    const screen = new Screen({ width: 20, height: 3 });

    // Adjacent SGR reset followed by another SGR is common in canvas output
    // (e.g. `...\x1b[39m\x1b[38;5;Nm...`).
    const content = "\x1b[38;5;1mA\x1b[39m\x1b[38;5;1mB\x1b[39mC";

    new Box({
      parent: screen,
      top: 0,
      left: 0,
      width: 20,
      height: 1,
      tags: false,
      content,
    });

    // Ensure the screen buffer exists before rendering.
    screen.alloc();
    screen.render();

    const line = screen.lines[0];
    const rendered = (line ?? [])
      .slice(0, 10)
      .map((cell: any) => (cell && cell[1] != null ? String(cell[1]) : ""))
      .join("");

    expect(rendered[0]).toBe("A");
    expect(rendered[1]).toBe("B");
    expect(rendered[2]).toBe("C");
    expect(rendered).not.toContain("5;1m");

    screen.destroy();
  });
});
