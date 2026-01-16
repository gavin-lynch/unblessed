import { beforeEach, describe, expect, it, vi } from "vitest";
import Tree from "../../src/widgets/tree.js";
import { createMockScreen } from "../helpers/mock.js";

describe("Tree", () => {
  let screen;

  beforeEach(() => {
    screen = createMockScreen();
  });

  describe("constructor", () => {
    it("should create a tree instance", () => {
      const tree = new Tree({ screen });

      expect(tree).toBeDefined();
      expect(tree.type).toBe("tree");
    });

    it("should inherit from List", () => {
      const tree = new Tree({ screen });

      expect(tree.screen).toBe(screen);
      expect(typeof tree.render).toBe("function");
      expect(typeof tree.select).toBe("function");
    });

    it("should initialize with empty data", () => {
      const tree = new Tree({ screen });

      expect(tree.data).toEqual({});
      expect(tree.nodeLines).toEqual([]);
    });

    it("should accept initial data", () => {
      const tree = new Tree({
        screen,
        data: {
          name: "root",
          children: {
            child1: {},
            child2: {},
          },
        },
      });

      expect(tree.data.name).toBe("root");
    });

    it("should default extended to false", () => {
      const tree = new Tree({
        screen,
        data: {
          name: "root",
          children: { child1: {} },
        },
      });

      // Root should not be expanded by default
      expect(tree.data.extended).toBe(false);
    });

    it("should accept extended option", () => {
      const tree = new Tree({
        screen,
        extended: true,
        data: {
          name: "root",
          children: { child1: {} },
        },
      });

      expect(tree.data.extended).toBe(true);
    });

    it("should accept custom toggle keys as array", () => {
      const tree = new Tree({
        screen,
        keys: ["space", "o"],
      });

      expect(tree).toBeDefined();
    });

    it("should accept custom toggle keys as string", () => {
      const tree = new Tree({
        screen,
        keys: "space",
      });

      expect(tree).toBeDefined();
    });

    it("should accept template options", () => {
      const tree = new Tree({
        screen,
        template: {
          collapse: " (+)",
          expand: " (-)",
          lines: false,
        },
      });

      expect(tree).toBeDefined();
    });
  });

  describe("setData()", () => {
    it("should set tree data", () => {
      const tree = new Tree({ screen });
      screen.append(tree);

      tree.setData({
        name: "root",
        children: {
          child1: {},
          child2: {},
        },
      });

      expect(tree.data.name).toBe("root");
    });

    it("should update items list", () => {
      const tree = new Tree({ screen });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          child1: {},
          child2: {},
        },
      });

      // Should have root + 2 children = 3 items
      expect(tree.ritems.length).toBe(3);
    });

    it("should only show root when collapsed", () => {
      const tree = new Tree({ screen });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: false,
        children: {
          child1: {},
          child2: {},
        },
      });

      // Should only have root
      expect(tree.ritems.length).toBe(1);
    });

    it("should show children when expanded", () => {
      const tree = new Tree({ screen });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          child1: {},
          child2: {},
        },
      });

      // Should have root + 2 children
      expect(tree.ritems.length).toBe(3);
    });
  });

  describe("walk()", () => {
    it("should populate nodeLines array", () => {
      const tree = new Tree({ screen });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          child1: {},
          child2: {},
        },
      });

      expect(tree.nodeLines.length).toBe(3);
      expect(tree.nodeLines[0].name).toBe("root");
      expect(tree.nodeLines[1].name).toBe("child1");
      expect(tree.nodeLines[2].name).toBe("child2");
    });

    it("should set parent references", () => {
      const tree = new Tree({ screen });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          child1: {},
        },
      });

      expect(tree.nodeLines[1].parent).toBe(tree.data);
    });

    it("should set depth values", () => {
      const tree = new Tree({ screen });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          child1: {
            extended: true,
            children: {
              grandchild1: {},
            },
          },
        },
      });

      expect(tree.nodeLines[0].depth).toBe(0);
      expect(tree.nodeLines[2].depth).toBeGreaterThan(0);
    });

    it("should render tree lines when lines option is true", () => {
      const tree = new Tree({
        screen,
        template: { lines: true },
      });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          child1: {},
          child2: {},
        },
      });

      // Check that tree lines are present
      expect(tree.ritems[1]).toMatch(/[├└]/);
      expect(tree.ritems[2]).toMatch(/[├└]/);
    });

    it("should not render tree lines when lines option is false", () => {
      const tree = new Tree({
        screen,
        template: { lines: false },
      });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          child1: {},
          child2: {},
        },
      });

      // Should use simple prefix
      expect(tree.ritems[1]).toMatch(/\|-/);
    });

    it("should use spaces when spaces option is true", () => {
      const tree = new Tree({
        screen,
        template: { spaces: true },
      });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          child1: {},
        },
      });

      // Should have space prefix
      expect(tree.ritems[1]).toMatch(/^\s/);
    });

    it("should add extend suffix for collapsed nodes", () => {
      const tree = new Tree({
        screen,
        template: { collapse: " [+]" },
      });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          folder: {
            extended: false,
            children: {
              file: {},
            },
          },
        },
      });

      expect(tree.ritems[1]).toContain("[+]");
    });

    it("should add retract suffix for expanded nodes", () => {
      const tree = new Tree({
        screen,
        template: { expand: " [-]" },
      });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          folder: {
            extended: true,
            children: {
              file: {},
            },
          },
        },
      });

      expect(tree.ritems[1]).toContain("[-]");
    });

    it("should handle function children", () => {
      const tree = new Tree({ screen });
      screen.append(tree);

      const childrenFn = vi.fn(() => ({
        dynamicChild: {},
      }));

      tree.setData({
        name: "root",
        extended: true,
        children: childrenFn,
      });

      expect(childrenFn).toHaveBeenCalled();
      expect(tree.ritems.length).toBe(2);
    });
  });

  describe("getSelectedNode()", () => {
    it("should return the selected node", () => {
      const tree = new Tree({ screen });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          child1: {},
          child2: {},
        },
      });

      tree.select(1);
      const node = tree.getSelectedNode();

      expect(node.name).toBe("child1");
    });

    it("should return undefined when nothing selected", () => {
      const tree = new Tree({ screen });
      const node = tree.getSelectedNode();

      expect(node).toBeUndefined();
    });
  });

  describe("toggleSelected()", () => {
    it("should toggle node expansion", () => {
      const tree = new Tree({ screen });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          folder: {
            extended: false,
            children: {
              file: {},
            },
          },
        },
      });

      // Select the folder
      tree.select(1);
      const initialCount = tree.ritems.length;

      // Toggle to expand
      tree.toggleSelected();

      expect(tree.ritems.length).toBeGreaterThan(initialCount);
    });

    it("should emit select event", () => {
      const tree = new Tree({ screen });
      screen.append(tree);
      const spy = vi.fn();

      tree.setData({
        name: "root",
        extended: true,
        children: { child1: {} },
      });

      tree.on("select", spy);
      tree.select(1);
      tree.toggleSelected();

      expect(spy).toHaveBeenCalled();
    });

    it("should emit select event with node and index", () => {
      const tree = new Tree({ screen });
      screen.append(tree);
      let selectedNode, selectedIndex;

      tree.setData({
        name: "root",
        extended: true,
        children: { child1: {} },
      });

      tree.on("select", (node, index) => {
        selectedNode = node;
        selectedIndex = index;
      });

      tree.select(1);
      tree.toggleSelected();

      expect(selectedNode.name).toBe("child1");
      expect(selectedIndex).toBe(1);
    });

    it("should not expand leaf nodes", () => {
      const tree = new Tree({ screen });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          leaf: {},
        },
      });

      tree.select(1);
      const initialCount = tree.ritems.length;
      tree.toggleSelected();

      expect(tree.ritems.length).toBe(initialCount);
    });
  });

  describe("expand()", () => {
    it("should expand a node by index", () => {
      const tree = new Tree({ screen });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          folder: {
            extended: false,
            children: { file: {} },
          },
        },
      });

      tree.expand(1);

      expect(tree.nodeLines[1].extended).toBe(true);
    });

    it("should expand a node by reference", () => {
      const tree = new Tree({ screen });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          folder: {
            extended: false,
            children: { file: {} },
          },
        },
      });

      const folderNode = tree.nodeLines[1];
      tree.expand(folderNode);

      expect(folderNode.extended).toBe(true);
    });

    it("should not affect already expanded nodes", () => {
      const tree = new Tree({ screen });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          folder: {
            extended: true,
            children: { file: {} },
          },
        },
      });

      const initialCount = tree.ritems.length;
      tree.expand(1);

      expect(tree.ritems.length).toBe(initialCount);
    });
  });

  describe("collapse()", () => {
    it("should collapse a node by index", () => {
      const tree = new Tree({ screen });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          folder: {
            extended: true,
            children: { file: {} },
          },
        },
      });

      tree.collapse(1);

      expect(tree.nodeLines[1].extended).toBe(false);
    });

    it("should collapse a node by reference", () => {
      const tree = new Tree({ screen });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          folder: {
            extended: true,
            children: { file: {} },
          },
        },
      });

      const folderNode = tree.nodeLines[1];
      tree.collapse(folderNode);

      expect(folderNode.extended).toBe(false);
    });

    it("should not affect already collapsed nodes", () => {
      const tree = new Tree({ screen });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          folder: {
            extended: false,
            children: { file: {} },
          },
        },
      });

      const initialCount = tree.ritems.length;
      tree.collapse(1);

      expect(tree.ritems.length).toBe(initialCount);
    });
  });

  describe("expandAll()", () => {
    it("should expand all nodes", () => {
      const tree = new Tree({ screen });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: false,
        children: {
          folder1: {
            extended: false,
            children: { file1: {} },
          },
          folder2: {
            extended: false,
            children: { file2: {} },
          },
        },
      });

      tree.expandAll();

      // All nodes should be expanded
      expect(tree.data.extended).toBe(true);
      expect(tree.ritems.length).toBe(5); // root + 2 folders + 2 files
    });
  });

  describe("collapseAll()", () => {
    it("should collapse all nodes", () => {
      const tree = new Tree({ screen });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          folder1: {
            extended: true,
            children: { file1: {} },
          },
          folder2: {
            extended: true,
            children: { file2: {} },
          },
        },
      });

      tree.collapseAll();

      // All nodes should be collapsed
      expect(tree.data.extended).toBe(false);
      expect(tree.ritems.length).toBe(1); // Only root
    });
  });

  describe("keyboard navigation", () => {
    it("should toggle on space key", () => {
      const tree = new Tree({
        screen,
        keys: true,
      });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          folder: {
            extended: false,
            children: { file: {} },
          },
        },
      });

      tree.select(1);
      tree.emit("keypress", " ", { name: "space", full: "space" });

      expect(tree.nodeLines[1].extended).toBe(true);
    });

    it("should toggle on enter key", () => {
      const tree = new Tree({
        screen,
        keys: true,
      });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          folder: {
            extended: false,
            children: { file: {} },
          },
        },
      });

      tree.select(1);
      tree.emit("keypress", "\r", { name: "enter", full: "enter" });

      expect(tree.nodeLines[1].extended).toBe(true);
    });

    it("should toggle on + key", () => {
      const tree = new Tree({
        screen,
        keys: true,
      });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          folder: {
            extended: false,
            children: { file: {} },
          },
        },
      });

      tree.select(1);
      tree.emit("keypress", "+", { name: "+", full: "+" });

      expect(tree.nodeLines[1].extended).toBe(true);
    });

    it("should inherit up/down navigation from List", () => {
      const tree = new Tree({
        screen,
        keys: true,
      });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          child1: {},
          child2: {},
        },
      });

      tree.select(0);
      tree.emit("keypress", null, { name: "down" });

      expect(tree.selected).toBe(1);
    });
  });

  describe("nested trees", () => {
    it("should handle deeply nested structures", () => {
      const tree = new Tree({ screen });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          level1: {
            extended: true,
            children: {
              level2: {
                extended: true,
                children: {
                  level3: {
                    extended: true,
                    children: {
                      level4: {},
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Should have all levels
      expect(tree.ritems.length).toBe(5);
    });

    it("should properly indent nested items", () => {
      const tree = new Tree({
        screen,
        template: { lines: true },
      });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          level1: {
            extended: true,
            children: {
              level2: {},
            },
          },
        },
      });

      // Level 2 should have more indentation
      const level1Line = tree.ritems[1];
      const level2Line = tree.ritems[2];

      // Level 2 line should be longer due to indentation
      expect(level2Line.length).toBeGreaterThan(level1Line.length - 10);
    });
  });

  describe("tree line rendering", () => {
    it("should render last child with └", () => {
      const tree = new Tree({
        screen,
        template: { lines: true },
      });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          child1: {},
          child2: {}, // Last child
        },
      });

      expect(tree.ritems[2]).toContain("└");
    });

    it("should render non-last child with ├", () => {
      const tree = new Tree({
        screen,
        template: { lines: true },
      });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          child1: {}, // Not last
          child2: {},
        },
      });

      expect(tree.ritems[1]).toContain("├");
    });

    it("should render expanded nodes with ┬", () => {
      const tree = new Tree({
        screen,
        template: { lines: true },
      });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          folder: {
            extended: true,
            children: { file: {} },
          },
        },
      });

      expect(tree.ritems[1]).toContain("┬");
    });

    it("should render vertical lines for continued hierarchy", () => {
      const tree = new Tree({
        screen,
        template: { lines: true },
      });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          folder1: {
            extended: true,
            children: { file1: {} },
          },
          folder2: {},
        },
      });

      // file1 line should have │ for continuation
      expect(tree.ritems[2]).toContain("│");
    });
  });

  describe("common use cases", () => {
    it("should create a file tree", () => {
      const tree = new Tree({
        screen,
        border: "line",
        style: {
          selected: { bg: "blue" },
        },
        data: {
          name: "/",
          extended: true,
          children: {
            home: {
              extended: true,
              children: {
                user: {
                  children: {
                    documents: {},
                    pictures: {},
                  },
                },
              },
            },
            etc: {
              children: {
                hosts: {},
                passwd: {},
              },
            },
          },
        },
      });

      expect(tree).toBeDefined();
      expect(tree.ritems.length).toBeGreaterThan(1);
    });

    it("should create a config tree", () => {
      const tree = new Tree({
        screen,
        data: {
          name: "Config",
          extended: true,
          children: {
            database: {
              children: {
                host: {},
                port: {},
              },
            },
            server: {
              children: {
                port: {},
                ssl: {},
              },
            },
          },
        },
      });

      expect(tree).toBeDefined();
    });
  });

  describe("child name inference", () => {
    it("should use key as name when name not provided", () => {
      const tree = new Tree({ screen });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          inferredName: {},
        },
      });

      expect(tree.nodeLines[1].name).toBe("inferredName");
    });

    it("should prefer explicit name over key", () => {
      const tree = new Tree({ screen });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          key: { name: "explicit" },
        },
      });

      expect(tree.nodeLines[1].name).toBe("explicit");
    });
  });

  describe("List integration", () => {
    it("should support List selection methods", () => {
      const tree = new Tree({ screen });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          child1: {},
          child2: {},
          child3: {},
        },
      });

      tree.select(2);
      expect(tree.selected).toBe(2);

      tree.up();
      expect(tree.selected).toBe(1);

      tree.down();
      expect(tree.selected).toBe(2);
    });

    it("should support List value property", () => {
      const tree = new Tree({ screen });
      screen.append(tree);

      tree.setData({
        name: "root",
        extended: true,
        children: {
          child1: {},
          child2: {},
        },
      });

      tree.select(1);

      // Value should contain the display text
      expect(tree.value).toBeDefined();
    });
  });

  describe("styling", () => {
    it("should accept tree line style", () => {
      const tree = new Tree({
        screen,
        style: {
          line: { fg: "cyan" },
        },
      });

      expect(tree.style.line).toEqual({ fg: "cyan" });
    });

    it("should accept indicator style", () => {
      const tree = new Tree({
        screen,
        style: {
          indicator: { fg: "yellow" },
        },
      });

      expect(tree.style.indicator).toEqual({ fg: "yellow" });
    });

    it("should accept expanded/collapsed/leaf styles", () => {
      const tree = new Tree({
        screen,
        style: {
          expanded: { fg: "green" },
          collapsed: { fg: "red" },
          leaf: { fg: "white" },
        },
      });

      expect(tree.style.expanded).toEqual({ fg: "green" });
      expect(tree.style.collapsed).toEqual({ fg: "red" });
      expect(tree.style.leaf).toEqual({ fg: "white" });
    });

    it("should accept depth-based styles", () => {
      const tree = new Tree({
        screen,
        style: {
          depth: [{ fg: "cyan" }, { fg: "magenta" }, { fg: "yellow" }],
        },
      });

      expect(tree.style.depth).toHaveLength(3);
      expect(tree.style.depth[0]).toEqual({ fg: "cyan" });
      expect(tree.style.depth[1]).toEqual({ fg: "magenta" });
      expect(tree.style.depth[2]).toEqual({ fg: "yellow" });
    });

    it("should apply line color to tree lines", () => {
      const tree = new Tree({
        screen,
        style: {
          line: { fg: "cyan" },
        },
        data: {
          name: "root",
          extended: true,
          children: {
            child1: {},
          },
        },
      });
      screen.append(tree);

      // The tree line should be colored with cyan
      expect(tree.ritems.length).toBe(2);
      // Line should contain the cyan color tag
      expect(tree.ritems[1]).toContain("{cyan-fg}");
      expect(tree.ritems[1]).toContain("{/cyan-fg}");
    });

    it("should apply indicator color to expand/collapse indicators", () => {
      const tree = new Tree({
        screen,
        style: {
          indicator: { fg: "yellow" },
        },
        data: {
          name: "root",
          extended: true,
          children: {
            folder: {
              extended: false,
              children: {
                file: {},
              },
            },
          },
        },
      });
      screen.append(tree);

      // Root should have retract indicator [-] (expanded) - Classic style default
      expect(tree.ritems[0]).toContain("{yellow-fg}");
      expect(tree.ritems[0]).toContain(" [-]");
      // Folder should have extend indicator [+] (collapsed)
      expect(tree.ritems[1]).toContain(" [+]");
    });

    it("should apply depth colors cyclically", () => {
      const tree = new Tree({
        screen,
        style: {
          depth: [{ fg: "cyan" }, { fg: "magenta" }],
        },
        data: {
          name: "root",
          extended: true,
          children: {
            level1: {
              extended: true,
              children: {
                level2: {
                  extended: true,
                  children: {
                    level3: {},
                  },
                },
              },
            },
          },
        },
      });
      screen.append(tree);

      // Depth 0 (root) - cyan
      expect(tree.ritems[0]).toContain("{cyan-fg}");
      // Depth 1 (level1) - magenta (index 1)
      expect(tree.ritems[1]).toContain("{magenta-fg}");
      // Depth 2 (level2) - cyan (index 2 % 2 = 0)
      expect(tree.ritems[2]).toContain("{cyan-fg}");
      // Depth 3 (level3) - magenta (index 3 % 2 = 1)
      expect(tree.ritems[3]).toContain("{magenta-fg}");
    });

    it("should apply node type styles (leaf/expanded/collapsed)", () => {
      const tree = new Tree({
        screen,
        style: {
          expanded: { fg: "green" },
          collapsed: { fg: "red" },
          leaf: { fg: "white" },
        },
        data: {
          name: "root",
          extended: true,
          children: {
            folder_open: {
              extended: true,
              children: {
                file: {},
              },
            },
            folder_closed: {
              extended: false,
              children: {
                hidden: {},
              },
            },
          },
        },
      });
      screen.append(tree);

      // Root is expanded - green
      expect(tree.ritems[0]).toContain("{green-fg}root{/green-fg}");
      // folder_open is expanded - green
      expect(tree.ritems[1]).toContain("{green-fg}folder_open{/green-fg}");
      // file is a leaf - white
      expect(tree.ritems[2]).toContain("{white-fg}file{/white-fg}");
      // folder_closed is collapsed - red
      expect(tree.ritems[3]).toContain("{red-fg}folder_closed{/red-fg}");
    });

    it("should support 256-color codes", () => {
      const tree = new Tree({
        screen,
        style: {
          line: { fg: 208 }, // Orange in 256-color palette
        },
        data: {
          name: "root",
          extended: true,
          children: {
            child: {},
          },
        },
      });
      screen.append(tree);

      // Line should use 256-color format
      expect(tree.ritems[1]).toContain("{[208]-fg}");
    });

    it("should apply spacer between lines and text", () => {
      const tree = new Tree({
        screen,
        style: {
          spacer: " ",
        },
        data: {
          name: "root",
          extended: true,
          children: {
            child: {},
          },
        },
      });
      screen.append(tree);

      // Should have space between tree line and name
      expect(tree.ritems[1]).toContain("─ child");
    });

    it("should render node icons before names", () => {
      const tree = new Tree({
        screen,
        data: {
          name: "root",
          icon: "[R]",
          extended: true,
          children: {
            folder: { icon: "[F]", children: { file: {} } },
            readme: { icon: "[D]" },
            modified: { icon: "* +" },
          },
        },
      });
      screen.append(tree);

      // Root should have icon
      expect(tree.ritems[0]).toContain("[R] root");

      // Children should have icons
      expect(tree.ritems[1]).toContain("[F] folder");
      expect(tree.ritems[2]).toContain("[D] readme");
      expect(tree.ritems[3]).toContain("* + modified");
    });

    it("should style icons with icon color", () => {
      const tree = new Tree({
        screen,
        style: {
          icon: { fg: "yellow" },
        },
        data: {
          name: "root",
          icon: "[R]",
          extended: true,
          children: {
            folder: { icon: "[F]" },
          },
        },
      });
      screen.append(tree);

      // Icons should have yellow color
      expect(tree.ritems[0]).toContain("{yellow-fg}[R]{/yellow-fg}");
      expect(tree.ritems[1]).toContain("{yellow-fg}[F]{/yellow-fg}");
    });

    it("should handle nodes without icons", () => {
      const tree = new Tree({
        screen,
        data: {
          name: "root",
          extended: true,
          children: {
            "no-icon": {},
            "has-icon": { icon: "[X]" },
          },
        },
      });
      screen.append(tree);

      // Node without icon should not have extra space
      expect(tree.ritems[1]).toMatch(/─no-icon/);
      // Node with icon should have icon and space
      expect(tree.ritems[2]).toContain("[X] has-icon");
    });

    it("should support unicode emoji icons", () => {
      const tree = new Tree({
        screen,
        data: {
          name: "root",
          icon: "📁",
          extended: true,
          children: {
            docs: { icon: "📄" },
            star: { icon: "⭐" },
          },
        },
      });
      screen.append(tree);

      // Should render unicode icons
      expect(tree.ritems[0]).toContain("📁 root");
      expect(tree.ritems[1]).toContain("📄 docs");
      expect(tree.ritems[2]).toContain("⭐ star");
    });
  });

  describe("icon as function", () => {
    it("should call icon function with node when expanded", () => {
      const tree = new Tree({
        screen,
        data: {
          name: "root",
          icon: (node) => (node.extended ? "[OPEN]" : "[CLOSED]"),
          extended: true,
          children: {
            "file.txt": {},
          },
        },
      });
      screen.append(tree);

      // Root is expanded, function should return [OPEN]
      expect(tree.ritems[0]).toContain("[OPEN] root");
    });

    it("should call icon function with node when collapsed", () => {
      const tree = new Tree({
        screen,
        data: {
          name: "root",
          icon: (node) => (node.extended ? "[OPEN]" : "[CLOSED]"),
          extended: false,
          children: {
            "file.txt": {},
          },
        },
      });
      screen.append(tree);

      // Root is collapsed, function should return [CLOSED]
      expect(tree.ritems[0]).toContain("[CLOSED] root");
    });

    it("should toggle icons when node state changes", () => {
      const tree = new Tree({
        screen,
        data: {
          name: "root",
          icon: (node) => (node.extended ? "[OPEN]" : "[CLOSED]"),
          extended: true,
          children: {
            "file.txt": {},
          },
        },
      });
      screen.append(tree);

      // Initially expanded
      expect(tree.ritems[0]).toContain("[OPEN] root");

      // Collapse the root node
      tree.collapse(0);
      expect(tree.ritems[0]).toContain("[CLOSED] root");

      // Expand again
      tree.expand(0);
      expect(tree.ritems[0]).toContain("[OPEN] root");
    });

    it("should work with nested folders using functions", () => {
      const tree = new Tree({
        screen,
        data: {
          name: "root",
          icon: (node) => (node.extended ? "[ROOT-OPEN]" : "[ROOT-CLOSED]"),
          extended: true,
          children: {
            folder: {
              icon: (node) =>
                node.extended ? "[FOLDER-OPEN]" : "[FOLDER-CLOSED]",
              extended: false,
              children: {
                "file.txt": {},
              },
            },
          },
        },
      });
      screen.append(tree);

      // Root is expanded, nested folder is collapsed
      expect(tree.ritems[0]).toContain("[ROOT-OPEN] root");
      expect(tree.ritems[1]).toContain("[FOLDER-CLOSED] folder");
    });

    it("should work with string icons (backward compat)", () => {
      const tree = new Tree({
        screen,
        data: {
          name: "root",
          icon: "[FOLDER]",
          extended: true,
          children: {
            "file.txt": { icon: "[FILE]" },
          },
        },
      });
      screen.append(tree);

      expect(tree.ritems[0]).toContain("[FOLDER] root");
      expect(tree.ritems[1]).toContain("[FILE] file.txt");
    });

    it("should access node properties in icon function", () => {
      const tree = new Tree({
        screen,
        data: {
          name: "root",
          customProp: "special",
          icon: (node) =>
            node.customProp === "special" ? "[SPECIAL]" : "[NORMAL]",
          extended: true,
          children: {
            "file.txt": {},
          },
        },
      });
      screen.append(tree);

      expect(tree.ritems[0]).toContain("[SPECIAL] root");
    });
  });

  describe("prefixIndicator and suffixIndicator", () => {
    it("should use prefixIndicator for left-side symbols", () => {
      const tree = new Tree({
        screen,
        template: {
          prefixIndicator: (node) => (node.extended ? "[OPEN] " : "[CLOSED] "),
          collapse: "", // Disable suffix
          expand: "",
        },
        data: {
          name: "root",
          extended: true,
          children: {
            "file.txt": {},
          },
        },
      });
      screen.append(tree);

      // Root is expanded, should show [OPEN] BEFORE the name
      expect(tree.ritems[0]).toContain("[OPEN]");
      expect(tree.ritems[0]).toMatch(/\[OPEN\].*root/); // prefix before name
    });

    it("should show prefixIndicator BEFORE icon and name", () => {
      const tree = new Tree({
        screen,
        template: {
          lines: false,
          spaces: true,
          prefixIndicator: (node) => (node.extended ? "▾ " : "▸ "),
          collapse: "", // Disable suffix
          expand: "",
        },
        data: {
          name: "root",
          icon: "[ICON]",
          extended: true,
          children: {
            folder: {
              icon: "[FOLDER]",
              extended: false,
              children: { "file.txt": {} },
            },
          },
        },
      });
      screen.append(tree);

      // Root: prefix indicator before icon before name
      expect(tree.ritems[0]).toMatch(/▾.*\[ICON\].*root/);
      // Child folder: prefix indicator before icon before name
      expect(tree.ritems[1]).toMatch(/▸.*\[FOLDER\].*folder/);
    });

    it("should toggle prefixIndicator when node state changes", () => {
      const tree = new Tree({
        screen,
        template: {
          prefixIndicator: (node) => (node.extended ? "▾ " : "▸ "),
          collapse: "", // Disable suffix
          expand: "",
        },
        data: {
          name: "root",
          extended: true,
          children: {
            "file.txt": {},
          },
        },
      });
      screen.append(tree);

      // Initially expanded
      expect(tree.ritems[0]).toContain("▾");

      // Collapse
      tree.collapse(0);
      expect(tree.ritems[0]).toContain("▸");

      // Expand again
      tree.expand(0);
      expect(tree.ritems[0]).toContain("▾");
    });

    it("should use suffixIndicator for right-side symbols (classic style)", () => {
      const tree = new Tree({
        screen,
        template: {
          collapse: " [+]",
          expand: " [-]",
        },
        data: {
          name: "root",
          extended: true,
          children: {
            "file.txt": {},
          },
        },
      });
      screen.append(tree);

      // Suffix indicator appears after name
      expect(tree.ritems[0]).toContain("[-]");
      expect(tree.ritems[0]).toMatch(/root.*\[-\]/); // suffix after name
    });

    it("should work with no indicators (clean style)", () => {
      const tree = new Tree({
        screen,
        template: {
          collapse: "",
          expand: "",
          lines: false,
          spaces: true,
        },
        data: {
          name: "root",
          extended: true,
          children: {
            "file.txt": {},
          },
        },
      });
      screen.append(tree);

      // No indicators at all
      expect(tree.ritems[0]).not.toContain("[");
      expect(tree.ritems[0]).not.toContain("▾");
      expect(tree.ritems[0]).not.toContain("▸");
    });

    it("should support both prefix and suffix indicators", () => {
      const tree = new Tree({
        screen,
        template: {
          prefixIndicator: (node) => (node.extended ? "▾ " : "▸ "),
          suffixIndicator: (node) => (node.extended ? " (open)" : " (closed)"),
        },
        data: {
          name: "root",
          extended: true,
          children: {
            "file.txt": {},
          },
        },
      });
      screen.append(tree);

      // Both prefix and suffix
      expect(tree.ritems[0]).toContain("▾");
      expect(tree.ritems[0]).toContain("(open)");
      expect(tree.ritems[0]).toMatch(/▾.*root.*(open)/);
    });
  });

  describe("iconRules", () => {
    it("should apply icons based on glob pattern rules", () => {
      const tree = new Tree({
        screen,
        iconRules: [
          { test: "*.ts", icon: "[TS]" },
          { test: "*.md", icon: "[MD]" },
          { test: "*.json", icon: "[JSON]" },
        ],
        data: {
          name: "root",
          extended: true,
          children: {
            "index.ts": {},
            "README.md": {},
            "package.json": {},
            "other.txt": {},
          },
        },
      });
      screen.append(tree);

      expect(tree.ritems[1]).toContain("[TS] index.ts");
      expect(tree.ritems[2]).toContain("[MD] README.md");
      expect(tree.ritems[3]).toContain("[JSON] package.json");
      // No matching rule, no icon
      expect(tree.ritems[4]).toMatch(/─other\.txt$/);
    });

    it("should apply icons based on function rules", () => {
      const tree = new Tree({
        screen,
        iconRules: [
          { test: (node) => !!node.children, icon: "[DIR]" },
          { test: (node) => node.name?.startsWith("."), icon: "[DOT]" },
          { test: () => true, icon: "[FILE]" }, // Default
        ],
        data: {
          name: "root",
          extended: true,
          children: {
            src: {
              children: {
                "index.ts": {},
              },
            },
            ".gitignore": {},
            "README.md": {},
          },
        },
      });
      screen.append(tree);

      // Folder rule matches first
      expect(tree.ritems[1]).toContain("[DIR] src");
      // Dot file rule
      expect(tree.ritems[2]).toContain("[DOT] .gitignore");
      // Default file rule
      expect(tree.ritems[3]).toContain("[FILE] README.md");
    });

    it("should prefer explicit node icon over rules", () => {
      const tree = new Tree({
        screen,
        iconRules: [{ test: "*.ts", icon: "[TS]" }],
        data: {
          name: "root",
          extended: true,
          children: {
            "index.ts": { icon: "[CUSTOM]" }, // Explicit icon
            "utils.ts": {}, // Will use rule
          },
        },
      });
      screen.append(tree);

      // Explicit icon takes precedence
      expect(tree.ritems[1]).toContain("[CUSTOM] index.ts");
      // Rule applies
      expect(tree.ritems[2]).toContain("[TS] utils.ts");
    });

    it("should match first rule that applies", () => {
      const tree = new Tree({
        screen,
        iconRules: [
          { test: "*.test.ts", icon: "[TEST]" },
          { test: "*.ts", icon: "[TS]" },
        ],
        data: {
          name: "root",
          extended: true,
          children: {
            "utils.test.ts": {},
            "utils.ts": {},
          },
        },
      });
      screen.append(tree);

      // More specific rule matches first
      expect(tree.ritems[1]).toContain("[TEST] utils.test.ts");
      expect(tree.ritems[2]).toContain("[TS] utils.ts");
    });

    it("should support wildcard patterns", () => {
      const tree = new Tree({
        screen,
        iconRules: [
          { test: ".git*", icon: "[GIT]" },
          { test: "*rc", icon: "[RC]" },
          { test: "*", icon: "[ANY]" }, // Catch-all
        ],
        data: {
          name: "root",
          extended: true,
          children: {
            ".gitignore": {},
            ".gitconfig": {},
            ".bashrc": {},
            ".zshrc": {},
            readme: {},
          },
        },
      });
      screen.append(tree);

      expect(tree.ritems[1]).toContain("[GIT] .gitignore");
      expect(tree.ritems[2]).toContain("[GIT] .gitconfig");
      expect(tree.ritems[3]).toContain("[RC] .bashrc");
      expect(tree.ritems[4]).toContain("[RC] .zshrc");
      expect(tree.ritems[5]).toContain("[ANY] readme");
    });

    it("should work with combined function and pattern rules", () => {
      const tree = new Tree({
        screen,
        iconRules: [
          { test: (node) => node.name === "special", icon: "[SPECIAL]" },
          { test: "*.md", icon: "[MD]" },
          { test: (node) => !!node.children, icon: "[DIR]" },
        ],
        data: {
          name: "root",
          extended: true,
          children: {
            special: {},
            "docs.md": {},
            folder: { children: {} },
          },
        },
      });
      screen.append(tree);

      expect(tree.ritems[1]).toContain("[SPECIAL] special");
      expect(tree.ritems[2]).toContain("[MD] docs.md");
      expect(tree.ritems[3]).toContain("[DIR] folder");
    });
  });

  describe("TreePresets", () => {
    it("should import TreePresets from core", async () => {
      const { TreePresets } = await import("../../src/lib/tree-presets.js");
      expect(TreePresets).toBeDefined();
      expect(TreePresets.Modern).toBeDefined();
    });

    it("Modern preset should have required properties", async () => {
      const { TreePresets } = await import("../../src/lib/tree-presets.js");
      const modern = TreePresets.Modern;

      // Check template
      expect(modern.template).toBeDefined();
      expect(modern.template.lines).toBe(false);
      expect(modern.template.spaces).toBe(true);
      expect(modern.template.indent).toBe(2);
      // Modern uses empty strings for collapse/expand (no suffix indicators)
      expect(modern.template.collapse).toBe("");
      expect(modern.template.expand).toBe("");
      // Modern uses prefixIndicator for NERDTree-style triangles
      expect(typeof modern.template.prefixIndicator).toBe("function");

      // Check style
      expect(modern.style).toBeDefined();
      expect(modern.style.icon).toBeDefined();
      expect(modern.style.selected).toBeDefined();

      // Check iconRules
      expect(modern.iconRules).toBeDefined();
      expect(Array.isArray(modern.iconRules)).toBe(true);
      expect(modern.iconRules.length).toBeGreaterThan(0);
    });

    it("should create tree with Modern preset using spread", async () => {
      const { TreePresets } = await import("../../src/lib/tree-presets.js");

      const tree = new Tree({
        screen,
        ...TreePresets.Modern,
        data: {
          extended: true,
          children: {
            "index.ts": {},
            src: { children: {} },
          },
        },
      });
      screen.append(tree);

      // Should use Modern preset's template (space-based, no indicators)
      expect(tree.ritems.length).toBeGreaterThan(0);

      // Lines should use spaces, not tree characters
      const srcLine = tree.ritems.find((item) => item.includes("src"));
      expect(srcLine).toBeDefined();
      // Modern preset uses spaces, so no tree line characters
      expect(srcLine).not.toContain("├");
      expect(srcLine).not.toContain("└");
    });

    it("should allow overriding preset options", async () => {
      const { TreePresets } = await import("../../src/lib/tree-presets.js");

      const tree = new Tree({
        screen,
        ...TreePresets.Modern,
        template: {
          ...TreePresets.Modern.template,
          indent: 2, // Override indent
        },
        data: {
          extended: true,
          children: {
            child1: {},
          },
        },
      });
      screen.append(tree);

      // Tree should work with overridden indent
      expect(tree.ritems.length).toBeGreaterThan(0);
    });

    it("should export NerdIcons and UnicodeIcons", async () => {
      const { NerdIcons, UnicodeIcons } = await import(
        "../../src/lib/tree-presets.js"
      );

      // NerdIcons should have common icons
      expect(NerdIcons.folder).toBeDefined();
      expect(NerdIcons.file).toBeDefined();
      expect(NerdIcons.typescript).toBeDefined();
      expect(NerdIcons.javascript).toBeDefined();
      expect(NerdIcons.markdown).toBeDefined();
      expect(NerdIcons.git).toBeDefined();

      // UnicodeIcons should have common indicators
      expect(UnicodeIcons.collapsed).toBe("\u25b8"); // ▸
      expect(UnicodeIcons.expanded).toBe("\u25be"); // ▾
      expect(UnicodeIcons.modified).toBe("\u2717"); // ✗
      expect(UnicodeIcons.staged).toBe("\u2605"); // ★
    });

    it("Classic preset should have blessed-contrib compatible properties", async () => {
      const { TreePresets } = await import("../../src/lib/tree-presets.js");
      const classic = TreePresets.Classic;

      // Check template - traditional blessed-contrib style
      expect(classic.template).toBeDefined();
      expect(classic.template.lines).toBe(true); // Tree lines enabled
      expect(classic.template.spaces).toBe(false); // Not space-based
      expect(classic.template.indent).toBe(2); // 2-space indent
      expect(classic.template.collapse).toBe(" [+]"); // Suffix when collapsed
      expect(classic.template.expand).toBe(" [-]"); // Suffix when expanded

      // Check style
      expect(classic.style).toBeDefined();
      expect(classic.style.line).toBeDefined(); // Tree line styling
      expect(classic.style.indicator).toBeDefined(); // Indicator styling

      // Classic has no iconRules (manual icons only)
      expect(classic.iconRules).toEqual([]);
    });

    it("should create tree with Classic preset showing tree lines", async () => {
      const { TreePresets } = await import("../../src/lib/tree-presets.js");

      const tree = new Tree({
        screen,
        ...TreePresets.Classic,
        data: {
          name: "root",
          extended: true,
          children: {
            folder1: { children: {} },
            "file.txt": {},
          },
        },
      });
      screen.append(tree);

      // Classic preset should use tree lines
      expect(tree.ritems.length).toBeGreaterThan(0);

      // Should have tree line characters
      const hasTreeLines = tree.ritems.some(
        (item) =>
          item.includes("├") || item.includes("└") || item.includes("│"),
      );
      expect(hasTreeLines).toBe(true);

      // Should have [+] or [-] indicators
      const hasIndicators = tree.ritems.some(
        (item) => item.includes("[+]") || item.includes("[-]"),
      );
      expect(hasIndicators).toBe(true);
    });
  });
});
