/**
 * tree.ts - collapsible tree widget for blessed
 */

/**
 * Modules
 */

import type {
  KeyEvent,
  TreeIconRule,
  TreeNode,
  TreeOptions,
  TreeStyle,
} from "../types";
import List from "./list.js";

/**
 * Internal node representation used for tracking displayed lines.
 */
interface DisplayNode extends TreeNode {
  name: string;
  extended: boolean;
  depth: number;
  parent: TreeNode | null;
  position: number;
  childrenContent?: Record<string, TreeNode>;
}

/**
 * Tree - A collapsible tree widget for displaying hierarchical data.
 *
 * @remarks
 * Tree extends {@link List} and provides a navigable, collapsible tree structure.
 * Nodes can be expanded/collapsed with configurable keys (default: +, space, enter).
 * Tree lines (├─, └─, │) can be displayed to show hierarchy.
 *
 * @example Basic usage
 * ```typescript
 * import { Screen, Tree } from '@gavin-lynch/unblessed-node';
 *
 * const screen = new Screen();
 *
 * const tree = new Tree({
 *   parent: screen,
 *   top: 0,
 *   left: 0,
 *   width: '50%',
 *   height: '100%',
 *   border: 'line',
 *   style: {
 *     selected: { bg: 'blue' }
 *   },
 *   data: {
 *     name: 'root',
 *     extended: true,
 *     children: {
 *       'folder1': {
 *         children: {
 *           'file1.txt': {},
 *           'file2.txt': {}
 *         }
 *       },
 *       'folder2': {
 *         children: {
 *           'file3.txt': {}
 *         }
 *       }
 *     }
 *   }
 * });
 *
 * tree.on('select', (node, index) => {
 *   console.log('Selected:', node.name);
 * });
 *
 * // Double-click toggles expansion by default (when mouse is enabled)
 * tree.on('dblclick', (data) => {
 *   console.log('Double-clicked at:', data.x, data.y);
 * });
 *
 * screen.render();
 * ```
 *
 * @fires select - Emitted when a node is selected. Receives (node, index).
 * @fires dblclick - Emitted when a node is double-clicked. Receives mouse data.
 *                   By default, double-click toggles node expansion (disable with dblclick: false).
 *
 * @see {@link List} for inherited properties and methods
 * @see {@link TreeOptions} for all available configuration options
 */
class Tree extends List {
  override type = "tree";
  declare style: TreeStyle;
  declare options: TreeOptions;

  /**
   * The tree data structure.
   */
  override data: TreeNode;

  /**
   * Mapping of displayed line indices to tree nodes.
   */
  nodeLines: DisplayNode[];

  /**
   * Current line number during tree traversal.
   */
  private lineNbr: number;

  /**
   * Default node expansion state.
   */
  private defaultExtended: boolean;

  /**
   * Config for tree rendering structure.
   */
  private config: {
    collapse: string;
    expand: string;
    prefixIndicator?: (node: TreeNode) => string;
    suffixIndicator?: (node: TreeNode) => string;
    lines: boolean;
    spaces: boolean;
    indent: number;
  };

  /**
   * Keys used to toggle node expansion.
   */
  private toggleKeys: string[];

  /**
   * Rules for automatically assigning icons to nodes.
   */
  private iconRules: TreeIconRule[];

  /**
   * Resolve a StyleColor value to a concrete string or number.
   * Handles both static values and dynamic functions.
   */
  private resolveColor(
    color:
      | string
      | number
      | ((element: any) => string | number | undefined)
      | undefined,
  ): string | number | undefined {
    if (color === undefined) return undefined;
    if (typeof color === "function") {
      return color(this);
    }
    return color;
  }

  /**
   * Convert a color value to a tag-friendly string.
   */
  private colorToTag(color: string | number | undefined): string | null {
    if (color === undefined || color === -1) return null;
    if (typeof color === "number") {
      // Use 256-color code format
      return `[${color}]`;
    }
    // Named color or hex
    return color;
  }

  /**
   * Wrap text with foreground color tag if a color is specified.
   */
  private wrapFg(text: string, color: string | number | undefined): string {
    const tag = this.colorToTag(color);
    if (!tag) return text;
    return `{${tag}-fg}${text}{/${tag}-fg}`;
  }

  /**
   * Get the line color from style.
   */
  private getLineColor(): string | number | undefined {
    return this.resolveColor(this.style?.line?.fg);
  }

  /**
   * Get the indicator color from style.
   */
  private getIndicatorColor(): string | number | undefined {
    return this.resolveColor(this.style?.indicator?.fg);
  }

  /**
   * Get the icon color from style.
   */
  private getIconColor(): string | number | undefined {
    return this.resolveColor(this.style?.icon?.fg);
  }

  /**
   * Get the color for a node based on its state and depth.
   */
  private getNodeColor(
    hasChildren: boolean,
    isExpanded: boolean,
    depth: number,
  ): string | number | undefined {
    const style = this.style;
    if (!style) return undefined;

    // Check depth-specific color first
    if (style.depth && style.depth.length > 0) {
      const depthIndex = depth % style.depth.length;
      const depthColor = this.resolveColor(style.depth[depthIndex]?.fg);
      if (depthColor !== undefined) {
        return depthColor;
      }
    }

    // Check node type colors
    if (!hasChildren) {
      const leafColor = this.resolveColor(style.leaf?.fg);
      if (leafColor !== undefined) return leafColor;
    }
    if (hasChildren && isExpanded) {
      const expandedColor = this.resolveColor(style.expanded?.fg);
      if (expandedColor !== undefined) return expandedColor;
    }
    if (hasChildren && !isExpanded) {
      const collapsedColor = this.resolveColor(style.collapsed?.fg);
      if (collapsedColor !== undefined) return collapsedColor;
    }

    return undefined;
  }

  /**
   * Match a glob pattern against a string.
   * Supports * (any characters) and ? (single character).
   */
  private matchGlob(pattern: string, str: string): boolean {
    // Convert glob to regex
    const regexStr = pattern
      .replace(/[.+^${}()|[\]\\]/g, "\\$&") // Escape special regex chars
      .replace(/\*/g, ".*") // * -> .*
      .replace(/\?/g, "."); // ? -> .
    const regex = new RegExp(`^${regexStr}$`, "i");
    return regex.test(str);
  }

  /**
   * Get the prefix indicator for a node with children (left side, before icon).
   * Returns empty string if prefixIndicator is not set.
   */
  private getPrefixIndicator(node: TreeNode): string {
    if (this.config.prefixIndicator) {
      return this.config.prefixIndicator(node);
    }
    return "";
  }

  /**
   * Get the suffix indicator for a node with children (right side, after name).
   * Uses suffixIndicator function if set, otherwise falls back to collapse/expand strings.
   */
  private getSuffixIndicator(node: TreeNode): string {
    if (this.config.suffixIndicator) {
      return this.config.suffixIndicator(node);
    }
    // Fall back to collapse/expand strings
    return node.extended ? this.config.expand : this.config.collapse;
  }

  /**
   * Get the icon for a node, either from the node's explicit icon property
   * or by matching against iconRules.
   *
   * Priority order:
   * 1. icon (explicit - string or function)
   * 2. iconRules (pattern/function matching)
   */
  private getNodeIcon(node: TreeNode): string | undefined {
    // Explicit icon takes precedence - can be string or function
    if (node.icon) {
      if (typeof node.icon === "function") {
        return node.icon(node);
      }
      return node.icon;
    }

    // Check icon rules
    if (this.iconRules && this.iconRules.length > 0) {
      for (const rule of this.iconRules) {
        let matches = false;

        if (typeof rule.test === "function") {
          // Function test
          matches = rule.test(node);
        } else if (typeof rule.test === "string") {
          // Glob pattern test against node name
          matches = this.matchGlob(rule.test, node.name || "");
        }

        if (matches) {
          return rule.icon;
        }
      }
    }

    return undefined;
  }

  /**
   * Format a node's icon with optional color styling.
   * Returns the icon with a trailing space if present, or empty string.
   */
  private formatIcon(node: TreeNode): string {
    const icon = this.getNodeIcon(node);
    if (!icon) return "";
    const iconColor = this.getIconColor();
    const coloredIcon = this.wrapFg(icon, iconColor);
    return coloredIcon + " ";
  }

  /**
   * Creates a new Tree widget.
   *
   * @param options - Configuration options for the tree
   * @see {@link TreeOptions} for available options
   */
  constructor(options: TreeOptions = {}) {
    // Set default options for List parent
    options.tags = options.tags ?? true;

    super(options);

    this.data = {};
    this.nodeLines = [];
    this.lineNbr = 0;

    this.defaultExtended = options.extended ?? false;

    // Parse toggle keys
    if (options.keys === true || options.keys === undefined) {
      this.toggleKeys = ["+", "space", "enter"];
    } else if (typeof options.keys === "string") {
      this.toggleKeys = [options.keys];
    } else if (Array.isArray(options.keys)) {
      this.toggleKeys = options.keys;
    } else {
      this.toggleKeys = ["+", "space", "enter"];
    }

    // Config defaults - Classic style (blessed-contrib compatible)
    // Support both `template` (classic blessed-contrib name) and `config` (alias).
    const template = options.template ?? options.config;
    this.config = {
      collapse: template?.collapse ?? " [+]", // Suffix when collapsed
      expand: template?.expand ?? " [-]", // Suffix when expanded
      prefixIndicator: template?.prefixIndicator, // Left side indicator
      suffixIndicator: template?.suffixIndicator, // Right side indicator
      lines: template?.lines ?? true,
      spaces: template?.spaces ?? false,
      indent: template?.indent ?? 2,
    };

    // Icon rules for automatic icon assignment
    this.iconRules = options.iconRules ?? [];

    // Set initial data if provided
    if (options.data) {
      this.setData(options.data);
    }

    // Setup key handlers for toggling nodes
    this.on("keypress", (_ch: string, key: KeyEvent) => {
      const keyName = key.name ?? "";
      const keyFull = key.full ?? "";
      if (
        this.toggleKeys.includes(keyName) ||
        this.toggleKeys.includes(keyFull)
      ) {
        this.toggleSelected();
      }
    });

    // Handle mouse click to toggle
    if (options.mouse) {
      this.on("select", () => {
        // Select event from List will be emitted, we handle toggle separately
      });

      // Handle double-click to toggle node expansion (default: enabled)
      // Only toggle when double-click is on an actual item (not empty space)
      if (options.dblclick !== false) {
        this.on("dblclick", (_data: any, item: any, index: number) => {
          // Only toggle if the dblclick was on an item (item and index are provided by List)
          if (item !== undefined && index !== undefined) {
            this.toggleSelected();
          }
        });
      }
    }
  }

  /**
   * Set the tree data and refresh the display.
   *
   * @param data - The tree data structure to display
   * @example
   * tree.setData({
   *   name: 'root',
   *   extended: true,
   *   children: { 'item1': {}, 'item2': {} }
   * });
   */
  setData(data: TreeNode): void {
    this.data = data;
    const lines = this.walk(data, "", 0);
    this.setItems(lines);
  }

  /**
   * Get the currently selected tree node.
   *
   * @returns The selected tree node, or undefined if none selected
   */
  getSelectedNode(): DisplayNode | undefined {
    return this.nodeLines[this.selected];
  }

  /**
   * Toggle the expansion state of the currently selected node.
   * If the node has children, it will be expanded or collapsed.
   * Emits 'select' event with the node and index.
   */
  toggleSelected(): void {
    const selectedNode = this.nodeLines[this.selected];
    if (!selectedNode) return;

    if (selectedNode.children || selectedNode.childrenContent) {
      selectedNode.extended = !selectedNode.extended;
      this.setData(this.data);
      this.screen.render();
    }

    this.emit("select", selectedNode, this.selected);
  }

  /**
   * Expand a specific node by index or node reference.
   *
   * @param target - Index or node to expand
   */
  expand(target: number | DisplayNode): void {
    const node = typeof target === "number" ? this.nodeLines[target] : target;
    if (node && (node.children || node.childrenContent) && !node.extended) {
      node.extended = true;
      this.setData(this.data);
      this.screen.render();
    }
  }

  /**
   * Collapse a specific node by index or node reference.
   *
   * @param target - Index or node to collapse
   */
  collapse(target: number | DisplayNode): void {
    const node = typeof target === "number" ? this.nodeLines[target] : target;
    if (node && (node.children || node.childrenContent) && node.extended) {
      node.extended = false;
      this.setData(this.data);
      this.screen.render();
    }
  }

  /**
   * Expand all nodes in the tree.
   */
  expandAll(): void {
    this.setExtendedRecursive(this.data, true);
    this.setData(this.data);
    this.screen.render();
  }

  /**
   * Collapse all nodes in the tree.
   */
  collapseAll(): void {
    this.setExtendedRecursive(this.data, false);
    this.setData(this.data);
    this.screen.render();
  }

  /**
   * Update the config at runtime.
   * Triggers a re-render of the tree.
   *
   * @param config - Partial config to merge
   * @param replace - If true, reset to defaults first then apply (for preset switching)
   * @example
   * tree.setConfig({ lines: false, spaces: true, indent: 4 });
   * // Full replacement for preset switching:
   * tree.setConfig({ ...TreePresets.Modern.config }, true);
   */
  setConfig(
    config: Partial<typeof this.config>,
    replace: boolean = false,
  ): void {
    if (replace) {
      // Reset to defaults first, then apply new config
      this.config = {
        collapse: " [+]",
        expand: " [-]",
        prefixIndicator: undefined,
        suffixIndicator: undefined,
        lines: true,
        spaces: false,
        indent: 2,
      };
    }
    Object.assign(this.config, config);
    if (this.data) {
      this.setData(this.data);
    }
  }

  /**
   * Update the icon rules at runtime.
   * Triggers a re-render of the tree.
   *
   * @param iconRules - New icon rules array
   * @example
   * tree.setIconRules([
   *   { test: '*.ts', icon: '' },
   *   { test: '*', icon: '' },
   * ]);
   */
  setIconRules(iconRules: TreeIconRule[]): void {
    this.iconRules = iconRules;
    if (this.data) {
      this.setData(this.data);
    }
  }

  /**
   * Get the current config.
   */
  getConfig(): typeof this.config {
    return { ...this.config };
  }

  /**
   * Get the current icon rules.
   */
  getIconRules(): TreeIconRule[] {
    return [...this.iconRules];
  }

  /**
   * Recursively set the extended state of all nodes.
   */
  private setExtendedRecursive(node: TreeNode, extended: boolean): void {
    node.extended = extended;

    const children = node.childrenContent || node.children;
    if (children && typeof children === "object") {
      for (const key of Object.keys(children)) {
        this.setExtendedRecursive(children[key], extended);
      }
    }
  }

  /**
   * Walk the tree and generate display lines.
   * This method traverses the tree structure and creates a flat array
   * of strings for display in the list.
   *
   * @param node - The current node being processed
   * @param treePrefix - The current prefix string for indentation (may contain color tags)
   * @param depth - The current depth level (0 = root)
   * @returns Array of formatted strings for display
   */
  private walk(
    node: TreeNode,
    treePrefix: string,
    depth: number = 0,
  ): string[] {
    const lines: string[] = [];

    // Get style colors
    const lineColor = this.getLineColor();
    const indicatorColor = this.getIndicatorColor();

    // Reset tracking at root
    if (!node.parent) {
      this.lineNbr = 0;
      this.nodeLines = [];
      node.parent = null;
    }

    // Handle root node with a name
    if (depth === 0 && node.name) {
      this.lineNbr = 0;
      const displayNode = node as DisplayNode;
      displayNode.depth = 0;
      displayNode.position = 0;
      displayNode.extended = node.extended ?? this.defaultExtended;
      this.nodeLines[this.lineNbr++] = displayNode;

      // Get indicators for root if it has children
      let prefixIndicator = "";
      let suffixIndicator = "";
      const rootChildren = this.getChildrenContent(node);
      const hasChildren = rootChildren && Object.keys(rootChildren).length > 0;

      if (hasChildren) {
        prefixIndicator = this.wrapFg(
          this.getPrefixIndicator(displayNode),
          indicatorColor,
        );
        suffixIndicator = this.wrapFg(
          this.getSuffixIndicator(displayNode),
          indicatorColor,
        );
      }

      // Apply node color to root name
      const nodeColor = this.getNodeColor(
        !!hasChildren,
        displayNode.extended,
        0,
      );
      const nodeIcon = this.formatIcon(node);
      const nodeName = this.wrapFg(node.name, nodeColor);

      // Prefix indicator before icon, suffix indicator after name
      lines.push(prefixIndicator + nodeIcon + nodeName + suffixIndicator);
      treePrefix = " ";
      depth = 1;
    }

    node.depth = depth - 1;

    // Process children if node is extended
    if (this.getChildrenContent(node) && node.extended) {
      const childrenContent = this.getChildrenContent(node)!;
      const childKeys = Object.keys(childrenContent);
      const numChildren = childKeys.length;

      for (let i = 0; i < childKeys.length; i++) {
        const childKey = childKeys[i];
        let child = childrenContent[childKey];

        // Ensure child has a name
        if (!child.name) {
          child.name = childKey;
        }

        // Set parent and position
        child.parent = node;
        child.position = i;

        // Initialize extended state
        if (child.extended === undefined) {
          child.extended = this.defaultExtended;
        }

        // Get children content for this child
        const childChildrenContent = this.getChildrenContent(child);
        const hasChildren =
          !!childChildrenContent &&
          Object.keys(childChildrenContent).length > 0;
        const isLastChild = i === numChildren - 1;

        // Build tree connector
        let connector: string;

        // Get indicators for nodes with children
        let prefixIndicator = "";
        let suffixIndicator = "";
        if (hasChildren) {
          prefixIndicator = this.wrapFg(
            this.getPrefixIndicator(child),
            indicatorColor,
          );
          suffixIndicator = this.wrapFg(
            this.getSuffixIndicator(child),
            indicatorColor,
          );
        }

        if (this.config.spaces) {
          // In spaces mode: first level (depth=0 means children at level 1) gets full indent
          // Nested levels get no extra connector (indentation handled by treePrefix)
          connector = depth === 0 ? " ".repeat(this.config.indent || 2) : "";
        } else if (!this.config.lines) {
          connector = this.wrapFg("|-", lineColor);
        } else {
          let rawConnector: string;
          if (isLastChild) {
            rawConnector = "└";
          } else {
            rawConnector = "├";
          }

          if (!hasChildren) {
            rawConnector += "─";
          } else if (child.extended) {
            rawConnector += "┬";
          } else {
            rawConnector += "─";
          }

          // Apply line color to connector
          connector = this.wrapFg(rawConnector, lineColor);
        }

        // Apply node color to child name
        const nodeColor = this.getNodeColor(
          hasChildren,
          child.extended ?? false,
          depth,
        );
        const childIcon = this.formatIcon(child);
        const childName = this.wrapFg(child.name, nodeColor);

        // Get spacer (simple string property)
        const spacer = this.style?.spacer || "";

        // Build line: prefix indicator before icon, suffix indicator after name
        lines.push(
          treePrefix +
            connector +
            spacer +
            prefixIndicator +
            childIcon +
            childName +
            suffixIndicator,
        );
        this.nodeLines[this.lineNbr++] = child as DisplayNode;

        // Calculate prefix for children
        // Box drawing chars connect: │ at column X connects to ├ or └ at column X
        let childPrefix: string;
        const indent = this.config.indent || 2;

        if (this.config.spaces) {
          // Spaces mode (no lines)
          if (depth === 0) {
            childPrefix = " ".repeat(indent) + " ";
          } else {
            childPrefix = treePrefix + " ";
          }
        } else if (!this.config.lines) {
          // No lines mode
          childPrefix = treePrefix + " ".repeat(indent);
        } else {
          // Lines mode - │ connects directly to child connectors
          if (isLastChild) {
            // Last child: space for alignment (no continuation line needed)
            childPrefix = treePrefix + " ";
          } else {
            // Not last: │ continues down, connects to next ├ or └
            childPrefix = treePrefix + this.wrapFg("│", lineColor);
          }
        }

        // Recursively process children
        const childLines = this.walk(child, childPrefix, depth + 1);
        lines.push(...childLines);
      }
    }

    return lines;
  }

  /**
   * Get the children content for a node, handling function children.
   */
  private getChildrenContent(node: TreeNode): Record<string, TreeNode> | null {
    if (typeof node.children === "function") {
      if (!node.childrenContent) {
        node.childrenContent = node.children(node);
      }
      return node.childrenContent || null;
    }

    if (node.childrenContent) {
      return node.childrenContent;
    }

    if (node.children && typeof node.children === "object") {
      node.childrenContent = node.children;
      return node.children;
    }

    return null;
  }
}

/**
 * Expose
 */

export default Tree;
export { Tree };
