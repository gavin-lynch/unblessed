import { describe, expect, it } from "vitest";
import {
  alignmentClasses,
  applyClassName,
  colorShades,
  layoutClasses,
  mergeClassNameOptions,
  parseClassName,
  terminalColors,
  textAttributes,
} from "../../src/lib/cursedwind.js";

describe("cursedwind", () => {
  describe("parseClassName", () => {
    describe("empty/invalid input", () => {
      it("should return empty object for empty string", () => {
        const result = parseClassName("");
        expect(result).toEqual({});
      });

      it("should return empty object for null/undefined", () => {
        expect(parseClassName(null)).toEqual({});
        expect(parseClassName(undefined)).toEqual({});
      });

      it("should return empty object for non-string input", () => {
        expect(parseClassName(123)).toEqual({});
        expect(parseClassName({})).toEqual({});
      });

      it("should handle whitespace-only string", () => {
        const result = parseClassName("   ");
        expect(result).toEqual({});
      });
    });

    describe("background colors", () => {
      it("should parse basic bg color", () => {
        const result = parseClassName("bg-red");
        expect(result.style?.bg).toBe(1);
      });

      it("should parse bright/light bg color", () => {
        const result = parseClassName("bg-light-blue");
        expect(result.style?.bg).toBe(12);
      });

      it("should parse bg color with shade", () => {
        const result = parseClassName("bg-blue-500");
        expect(result.style?.bg).toBe(27);
      });

      it("should parse hex bg color", () => {
        const result = parseClassName("bg-#ff0000");
        expect(result.style?.bg).toBe("#ff0000");
      });

      it("should parse arbitrary value bg color", () => {
        const result = parseClassName("bg-[200]");
        expect(result.style?.bg).toBe(200);
      });
    });

    describe("foreground colors", () => {
      it("should parse fg- prefix", () => {
        const result = parseClassName("fg-green");
        expect(result.style?.fg).toBe(2);
      });

      it("should parse text- prefix", () => {
        const result = parseClassName("text-cyan");
        expect(result.style?.fg).toBe(6);
      });

      it("should parse fg color with shade", () => {
        const result = parseClassName("fg-red-500");
        expect(result.style?.fg).toBe(160);
      });

      it("should parse hex fg color", () => {
        const result = parseClassName("fg-#00ff00");
        expect(result.style?.fg).toBe("#00ff00");
      });
    });

    describe("text attributes", () => {
      it("should parse bold", () => {
        const result = parseClassName("bold");
        expect(result.style?.bold).toBe(true);
      });

      it("should parse no-bold", () => {
        const result = parseClassName("no-bold");
        expect(result.style?.bold).toBe(false);
      });

      it("should parse dim", () => {
        const result = parseClassName("dim");
        expect(result.style?.dim).toBe(true);
      });

      it("should parse underline", () => {
        const result = parseClassName("underline");
        expect(result.style?.underline).toBe(true);
      });

      it("should parse blink", () => {
        const result = parseClassName("blink");
        expect(result.style?.blink).toBe(true);
      });

      it("should parse inverse", () => {
        const result = parseClassName("inverse");
        expect(result.style?.inverse).toBe(true);
      });

      it("should parse invisible", () => {
        const result = parseClassName("invisible");
        expect(result.style?.invisible).toBe(true);
      });

      it("should parse transparent", () => {
        const result = parseClassName("transparent");
        expect(result.style?.transparent).toBe(true);
      });

      it("should parse multiple text attributes", () => {
        const result = parseClassName("bold underline dim");
        expect(result.style?.bold).toBe(true);
        expect(result.style?.underline).toBe(true);
        expect(result.style?.dim).toBe(true);
      });
    });

    describe("borders", () => {
      it("should parse border (default line)", () => {
        const result = parseClassName("border");
        expect(result.border?.type).toBe("line");
      });

      it("should parse border-line", () => {
        const result = parseClassName("border-line");
        expect(result.border?.type).toBe("line");
      });

      it("should parse border-bg", () => {
        const result = parseClassName("border-bg");
        expect(result.border?.type).toBe("bg");
      });

      it("should parse border style single", () => {
        const result = parseClassName("border-single");
        expect(result.border?.type).toBe("line");
        expect(result.border?.style).toBe("single");
      });

      it("should parse border style double", () => {
        const result = parseClassName("border-double");
        expect(result.border?.style).toBe("double");
      });

      it("should parse border style round", () => {
        const result = parseClassName("border-round");
        expect(result.border?.style).toBe("round");
      });

      it("should parse border style bold", () => {
        const result = parseClassName("border-bold");
        expect(result.border?.style).toBe("bold");
      });

      it("should parse border style classic", () => {
        const result = parseClassName("border-classic");
        expect(result.border?.style).toBe("classic");
      });

      it("should parse border style arrow", () => {
        const result = parseClassName("border-arrow");
        expect(result.border?.style).toBe("arrow");
      });

      it("should parse border color", () => {
        const result = parseClassName("border-cyan");
        expect(result.border?.fg).toBe(6);
      });

      it("should combine border type and color", () => {
        const result = parseClassName("border-line border-red");
        expect(result.border?.type).toBe("line");
        expect(result.border?.fg).toBe(1);
      });
    });

    describe("padding", () => {
      it("should parse p-{n} for all sides", () => {
        const result = parseClassName("p-2");
        expect(result.padding).toEqual({
          left: 2,
          right: 2,
          top: 2,
          bottom: 2,
        });
      });

      it("should parse px-{n} for horizontal", () => {
        const result = parseClassName("px-3");
        expect(result.padding).toEqual({ left: 3, right: 3 });
      });

      it("should parse py-{n} for vertical", () => {
        const result = parseClassName("py-1");
        expect(result.padding).toEqual({ top: 1, bottom: 1 });
      });

      it("should parse pt-{n} for top", () => {
        const result = parseClassName("pt-2");
        expect(result.padding).toEqual({ top: 2 });
      });

      it("should parse pb-{n} for bottom", () => {
        const result = parseClassName("pb-3");
        expect(result.padding).toEqual({ bottom: 3 });
      });

      it("should parse pl-{n} for left", () => {
        const result = parseClassName("pl-1");
        expect(result.padding).toEqual({ left: 1 });
      });

      it("should parse pr-{n} for right", () => {
        const result = parseClassName("pr-4");
        expect(result.padding).toEqual({ right: 4 });
      });

      it("should merge multiple padding classes", () => {
        const result = parseClassName("pt-1 pb-2 pl-3 pr-4");
        expect(result.padding).toEqual({
          top: 1,
          bottom: 2,
          left: 3,
          right: 4,
        });
      });
    });

    describe("alignment", () => {
      it("should parse text-left", () => {
        const result = parseClassName("text-left");
        expect(result.align).toBe("left");
      });

      it("should parse text-center", () => {
        const result = parseClassName("text-center");
        expect(result.align).toBe("center");
      });

      it("should parse text-right", () => {
        const result = parseClassName("text-right");
        expect(result.align).toBe("right");
      });

      it("should parse align-top", () => {
        const result = parseClassName("align-top");
        expect(result.valign).toBe("top");
      });

      it("should parse align-middle", () => {
        const result = parseClassName("align-middle");
        expect(result.valign).toBe("middle");
      });

      it("should parse align-bottom", () => {
        const result = parseClassName("align-bottom");
        expect(result.valign).toBe("bottom");
      });
    });

    describe("size", () => {
      it("should parse w-{n} for numeric width", () => {
        const result = parseClassName("w-20");
        expect(result.position?.width).toBe(20);
      });

      it("should parse w-{n}% for percentage width", () => {
        const result = parseClassName("w-50%");
        expect(result.position?.width).toBe("50%");
      });

      it("should parse w-full", () => {
        const result = parseClassName("w-full");
        expect(result.position?.width).toBe("100%");
      });

      it("should parse w-half", () => {
        const result = parseClassName("w-half");
        expect(result.position?.width).toBe("50%");
      });

      it("should parse w-shrink", () => {
        const result = parseClassName("w-shrink");
        expect(result.position?.width).toBe("shrink");
      });

      it("should parse h-{n} for numeric height", () => {
        const result = parseClassName("h-10");
        expect(result.position?.height).toBe(10);
      });

      it("should parse h-{n}% for percentage height", () => {
        const result = parseClassName("h-100%");
        expect(result.position?.height).toBe("100%");
      });

      it("should parse h-full", () => {
        const result = parseClassName("h-full");
        expect(result.position?.height).toBe("100%");
      });
    });

    describe("position", () => {
      it("should parse top-{n}", () => {
        const result = parseClassName("top-0");
        expect(result.position?.top).toBe(0);
      });

      it("should parse left-{n}", () => {
        const result = parseClassName("left-10");
        expect(result.position?.left).toBe(10);
      });

      it("should parse right-{n}", () => {
        const result = parseClassName("right-5");
        expect(result.position?.right).toBe(5);
      });

      it("should parse bottom-{n}", () => {
        const result = parseClassName("bottom-2");
        expect(result.position?.bottom).toBe(2);
      });

      it("should parse top-center", () => {
        const result = parseClassName("top-center");
        expect(result.position?.top).toBe("center");
      });

      it("should parse left-50%", () => {
        const result = parseClassName("left-50%");
        expect(result.position?.left).toBe("50%");
      });
    });

    describe("layout", () => {
      it("should parse shrink", () => {
        const result = parseClassName("shrink");
        expect(result.shrink).toBe(true);
      });

      it("should parse no-shrink", () => {
        const result = parseClassName("no-shrink");
        expect(result.shrink).toBe(false);
      });

      it("should parse hidden", () => {
        const result = parseClassName("hidden");
        expect(result.hidden).toBe(true);
      });

      it("should parse visible", () => {
        const result = parseClassName("visible");
        expect(result.hidden).toBe(false);
      });

      it("should parse wrap", () => {
        const result = parseClassName("wrap");
        expect(result.wrap).toBe(true);
      });

      it("should parse no-wrap", () => {
        const result = parseClassName("no-wrap");
        expect(result.wrap).toBe(false);
      });

      it("should parse shadow", () => {
        const result = parseClassName("shadow");
        expect(result.shadow).toBe(true);
      });

      it("should parse scrollable", () => {
        const result = parseClassName("scrollable");
        expect(result.scrollable).toBe(true);
      });
    });

    describe("complex combinations", () => {
      it("should parse multiple classes together", () => {
        const result = parseClassName(
          "bg-blue fg-white bold border-line border-cyan p-2 text-center",
        );
        expect(result.style?.bg).toBe(4);
        expect(result.style?.fg).toBe(7);
        expect(result.style?.bold).toBe(true);
        expect(result.border?.type).toBe("line");
        expect(result.border?.fg).toBe(6);
        expect(result.padding).toEqual({
          left: 2,
          right: 2,
          top: 2,
          bottom: 2,
        });
        expect(result.align).toBe("center");
      });

      it("should handle case insensitivity", () => {
        const result = parseClassName("BG-RED FG-WHITE BOLD");
        expect(result.style?.bg).toBe(1);
        expect(result.style?.fg).toBe(7);
        expect(result.style?.bold).toBe(true);
      });

      it("should handle extra whitespace", () => {
        const result = parseClassName("  bg-blue   bold   p-2  ");
        expect(result.style?.bg).toBe(4);
        expect(result.style?.bold).toBe(true);
        expect(result.padding).toEqual({
          left: 2,
          right: 2,
          top: 2,
          bottom: 2,
        });
      });

      it("should ignore unknown classes silently", () => {
        const result = parseClassName(
          "bg-blue unknown-class custom-thing bold",
        );
        expect(result.style?.bg).toBe(4);
        expect(result.style?.bold).toBe(true);
      });
    });
  });

  describe("mergeClassNameOptions", () => {
    it("should merge style with existing style", () => {
      const base = { style: { fg: 1 } };
      const parsed = { style: { bg: 4 } };
      const result = mergeClassNameOptions(base, parsed);
      expect(result.style).toEqual({ fg: 1, bg: 4 });
    });

    it("should override conflicting style properties", () => {
      const base = { style: { fg: 1, bg: 2 } };
      const parsed = { style: { bg: 4 } };
      const result = mergeClassNameOptions(base, parsed);
      expect(result.style).toEqual({ fg: 1, bg: 4 });
    });

    it("should merge border with existing border", () => {
      const base = { border: { type: "line" } };
      const parsed = { border: { fg: 6 } };
      const result = mergeClassNameOptions(base, parsed);
      expect(result.border).toEqual({ type: "line", fg: 6 });
    });

    it("should convert string border to object before merging", () => {
      const base = { border: "line" };
      const parsed = { border: { fg: 6 } };
      const result = mergeClassNameOptions(base, parsed);
      expect(result.border).toEqual({ type: "line", fg: 6 });
    });

    it("should merge padding with existing padding", () => {
      const base = { padding: { left: 1 } };
      const parsed = { padding: { top: 2, right: 3 } };
      const result = mergeClassNameOptions(base, parsed);
      expect(result.padding).toEqual({ left: 1, top: 2, right: 3 });
    });

    it("should convert numeric padding to object before merging", () => {
      const base = { padding: 1 };
      const parsed = { padding: { top: 5 } };
      const result = mergeClassNameOptions(base, parsed);
      expect(result.padding).toEqual({
        left: 1,
        right: 1,
        top: 5,
        bottom: 1,
      });
    });

    it("should merge position values", () => {
      const base = { top: 0, width: 20 };
      const parsed = { position: { left: 10, height: 10 } };
      const result = mergeClassNameOptions(base, parsed);
      expect(result.top).toBe(0);
      expect(result.left).toBe(10);
      expect(result.width).toBe(20);
      expect(result.height).toBe(10);
    });

    it("should merge simple properties", () => {
      const base = { align: "left" };
      const parsed = { align: "center", shrink: true };
      const result = mergeClassNameOptions(base, parsed);
      expect(result.align).toBe("center");
      expect(result.shrink).toBe(true);
    });

    it("should not modify original objects", () => {
      const base = { style: { fg: 1 } };
      const parsed = { style: { bg: 4 } };
      mergeClassNameOptions(base, parsed);
      expect(base.style).toEqual({ fg: 1 });
      expect(parsed.style).toEqual({ bg: 4 });
    });
  });

  describe("applyClassName", () => {
    it("should apply className to options", () => {
      const options = {
        content: "Hello",
        className: "bg-blue fg-white bold p-2",
      };
      const result = applyClassName(options);
      expect(result.content).toBe("Hello");
      expect(result.style?.bg).toBe(4);
      expect(result.style?.fg).toBe(7);
      expect(result.style?.bold).toBe(true);
      expect(result.padding).toEqual({
        left: 2,
        right: 2,
        top: 2,
        bottom: 2,
      });
    });

    it("should return options unchanged if no className", () => {
      const options = { content: "Hello" };
      const result = applyClassName(options);
      expect(result).toEqual({ content: "Hello" });
    });

    it("should preserve existing options", () => {
      const options = {
        content: "Hello",
        style: { fg: 1 },
        className: "bg-blue bold",
      };
      const result = applyClassName(options);
      expect(result.content).toBe("Hello");
      expect(result.style?.fg).toBe(1);
      expect(result.style?.bg).toBe(4);
      expect(result.style?.bold).toBe(true);
    });
  });

  describe("color exports", () => {
    it("should export terminal colors", () => {
      expect(terminalColors.black).toBe(0);
      expect(terminalColors.red).toBe(1);
      expect(terminalColors.white).toBe(7);
      expect(terminalColors["light-blue"]).toBe(12);
    });

    it("should export color shades", () => {
      expect(colorShades.red[500]).toBe(160);
      expect(colorShades.blue[500]).toBe(27);
      expect(colorShades.gray[500]).toBe(244);
    });
  });

  describe("class exports", () => {
    it("should export text attributes", () => {
      expect(textAttributes.bold).toEqual({ bold: true });
      expect(textAttributes["no-bold"]).toEqual({ bold: false });
      expect(textAttributes.dim).toEqual({ dim: true });
    });

    it("should export alignment classes", () => {
      expect(alignmentClasses["text-center"]).toEqual({ align: "center" });
      expect(alignmentClasses["align-middle"]).toEqual({ valign: "middle" });
    });

    it("should export layout classes", () => {
      expect(layoutClasses.shrink).toEqual({ shrink: true });
      expect(layoutClasses.hidden).toEqual({ hidden: true });
      expect(layoutClasses.shadow).toEqual({ shadow: true });
    });
  });

  describe("tree classes", () => {
    describe("tree-line-*", () => {
      it("should parse tree line color with named color", () => {
        const result = parseClassName("tree-line-cyan");
        expect(result.tree).toBeDefined();
        expect(result.tree.line).toEqual({ fg: 6 });
      });

      it("should parse tree line color with hex color", () => {
        const result = parseClassName("tree-line-#00ff00");
        expect(result.tree).toBeDefined();
        expect(result.tree.line).toEqual({ fg: "#00ff00" });
      });

      it("should parse tree line color with 256-color code", () => {
        const result = parseClassName("tree-line-[208]");
        expect(result.tree).toBeDefined();
        expect(result.tree.line).toEqual({ fg: 208 });
      });

      it("should parse tree line color with color shade", () => {
        const result = parseClassName("tree-line-blue-500");
        expect(result.tree).toBeDefined();
        expect(result.tree.line).toEqual({ fg: 27 });
      });
    });

    describe("tree-indicator-*", () => {
      it("should parse indicator color", () => {
        const result = parseClassName("tree-indicator-yellow");
        expect(result.tree).toBeDefined();
        expect(result.tree.indicator).toEqual({ fg: 3 });
      });

      it("should parse indicator color with hex", () => {
        const result = parseClassName("tree-indicator-#ffff00");
        expect(result.tree).toBeDefined();
        expect(result.tree.indicator).toEqual({ fg: "#ffff00" });
      });
    });

    describe("tree-expanded-*", () => {
      it("should parse expanded node foreground color", () => {
        const result = parseClassName("tree-expanded-green");
        expect(result.tree).toBeDefined();
        expect(result.tree.expanded).toEqual({ fg: 2 });
      });

      it("should parse expanded node background color", () => {
        const result = parseClassName("tree-expanded-bg-blue");
        expect(result.tree).toBeDefined();
        expect(result.tree.expanded).toEqual({ bg: 4 });
      });

      it("should parse both expanded fg and bg colors", () => {
        const result = parseClassName(
          "tree-expanded-green tree-expanded-bg-blue",
        );
        expect(result.tree).toBeDefined();
        expect(result.tree.expanded).toEqual({ fg: 2, bg: 4 });
      });
    });

    describe("tree-collapsed-*", () => {
      it("should parse collapsed node foreground color", () => {
        const result = parseClassName("tree-collapsed-red");
        expect(result.tree).toBeDefined();
        expect(result.tree.collapsed).toEqual({ fg: 1 });
      });

      it("should parse collapsed node background color", () => {
        const result = parseClassName("tree-collapsed-bg-yellow");
        expect(result.tree).toBeDefined();
        expect(result.tree.collapsed).toEqual({ bg: 3 });
      });
    });

    describe("tree-leaf-*", () => {
      it("should parse leaf node foreground color", () => {
        const result = parseClassName("tree-leaf-white");
        expect(result.tree).toBeDefined();
        expect(result.tree.leaf).toEqual({ fg: 7 });
      });

      it("should parse leaf node background color", () => {
        const result = parseClassName("tree-leaf-bg-black");
        expect(result.tree).toBeDefined();
        expect(result.tree.leaf).toEqual({ bg: 0 });
      });
    });

    describe("tree-depth-*", () => {
      it("should parse depth-specific foreground color", () => {
        const result = parseClassName("tree-depth-0-cyan");
        expect(result.tree).toBeDefined();
        expect(result.tree.depth).toHaveLength(1);
        expect(result.tree.depth[0]).toEqual({ fg: 6 });
      });

      it("should parse depth-specific background color", () => {
        const result = parseClassName("tree-depth-0-bg-blue");
        expect(result.tree).toBeDefined();
        expect(result.tree.depth).toHaveLength(1);
        expect(result.tree.depth[0]).toEqual({ bg: 4 });
      });

      it("should parse multiple depth levels", () => {
        const result = parseClassName(
          "tree-depth-0-cyan tree-depth-1-magenta tree-depth-2-yellow",
        );
        expect(result.tree).toBeDefined();
        expect(result.tree.depth).toHaveLength(3);
        expect(result.tree.depth[0]).toEqual({ fg: 6 });
        expect(result.tree.depth[1]).toEqual({ fg: 5 });
        expect(result.tree.depth[2]).toEqual({ fg: 3 });
      });

      it("should handle sparse depth indices", () => {
        const result = parseClassName("tree-depth-2-green");
        expect(result.tree).toBeDefined();
        expect(result.tree.depth).toHaveLength(3);
        expect(result.tree.depth[0]).toEqual({});
        expect(result.tree.depth[1]).toEqual({});
        expect(result.tree.depth[2]).toEqual({ fg: 2 });
      });
    });

    describe("combined tree classes", () => {
      it("should parse multiple tree classes together", () => {
        const result = parseClassName(
          "tree-line-cyan tree-indicator-yellow tree-expanded-green tree-collapsed-red tree-leaf-white",
        );
        expect(result.tree).toBeDefined();
        expect(result.tree.line).toEqual({ fg: 6 });
        expect(result.tree.indicator).toEqual({ fg: 3 });
        expect(result.tree.expanded).toEqual({ fg: 2 });
        expect(result.tree.collapsed).toEqual({ fg: 1 });
        expect(result.tree.leaf).toEqual({ fg: 7 });
      });

      it("should combine tree classes with other classes", () => {
        const result = parseClassName(
          "bg-black fg-white border-line tree-line-cyan p-2",
        );
        expect(result.style).toEqual({ bg: 0, fg: 7 });
        expect(result.border).toEqual({ type: "line" });
        expect(result.padding).toEqual({
          left: 2,
          right: 2,
          top: 2,
          bottom: 2,
        });
        expect(result.tree).toEqual({ line: { fg: 6 } });
      });
    });

    describe("mergeClassNameOptions with tree styles", () => {
      it("should merge tree styles into style object", () => {
        const parsed = parseClassName("tree-line-cyan tree-indicator-yellow");
        const merged = mergeClassNameOptions({ content: "test" }, parsed);

        expect(merged.style).toBeDefined();
        expect(merged.style.line).toEqual({ fg: 6 });
        expect(merged.style.indicator).toEqual({ fg: 3 });
      });

      it("should merge depth styles into style object", () => {
        const parsed = parseClassName("tree-depth-0-cyan tree-depth-1-magenta");
        const merged = mergeClassNameOptions({}, parsed);

        expect(merged.style).toBeDefined();
        expect(merged.style.depth).toHaveLength(2);
        expect(merged.style.depth[0]).toEqual({ fg: 6 });
        expect(merged.style.depth[1]).toEqual({ fg: 5 });
      });

      it("should preserve existing style properties when merging tree styles", () => {
        const parsed = parseClassName("tree-line-cyan");
        const merged = mergeClassNameOptions(
          { style: { fg: "white", bg: "black" } },
          parsed,
        );

        expect(merged.style.fg).toBe("white");
        expect(merged.style.bg).toBe("black");
        expect(merged.style.line).toEqual({ fg: 6 });
      });
    });
  });
});
