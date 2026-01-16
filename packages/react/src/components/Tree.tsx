/**
 * Tree.tsx - Tree component and descriptor for @unblessed/react
 *
 * Provides a collapsible, hierarchical tree view with keyboard and mouse support.
 */

import {
  TreePresets,
  Tree as TreeWidget,
  type Screen,
  type TreeConfig,
  type TreeIconRule,
  type TreeNode,
} from "@unblessed/core";
import { ComputedLayout } from "@unblessed/layout";
import type { ReactNode } from "react";
import { forwardRef } from "react";
import type {
  InteractiveWidgetProps,
  StyleObject,
} from "../widget-descriptors/common-props.js";
import {
  buildFocusableOptions,
  buildItemStyles,
  getComponentDefaults,
} from "../widget-descriptors/helpers.js";
import { BoxDescriptor, COMMON_WIDGET_OPTIONS } from "./Box.js";

/**
 * Props interface for Tree component
 * Provides a simplified, React-friendly API with sensible defaults
 */
export interface TreeProps extends InteractiveWidgetProps {
  /**
   * Tree data structure to display.
   */
  data: TreeNode;

  /**
   * Optional children (not used for tree nodes, but allows wrapper elements)
   */
  children?: ReactNode;

  /**
   * Label for the tree container
   */
  label?: string;

  /**
   * Preset to use for styling: 'modern' or 'classic'
   * - 'modern': Clean, minimal IDE-like style with Nerd Font icons
   * - 'classic': Traditional blessed-contrib style with tree lines
   */
  preset?: "modern" | "classic";

  /**
   * Whether nodes are expanded by default (Default: false)
   */
  extended?: boolean;

  /**
   * Keys to toggle node expansion (Default: ['+', 'space', 'enter'])
   */
  keys?: boolean | string | string[];

  /**
   * Whether double-click toggles node expansion (Default: true when mouse enabled)
   */
  dblclick?: boolean;

  // Template options (override preset)
  /**
   * Whether to show tree lines (├─, └─, │)
   */
  lines?: boolean;

  /**
   * Use spaces instead of line characters
   */
  spaces?: boolean;

  /**
   * Indentation per level (Default: 2)
   */
  indent?: number;

  /**
   * Custom prefix indicator function (shown before icon/name)
   */
  prefixIndicator?: (node: TreeNode) => string;

  /**
   * Custom suffix indicator function (shown after name)
   */
  suffixIndicator?: (node: TreeNode) => string;

  /**
   * Collapse indicator text (Default: ' [+]')
   */
  collapse?: string;

  /**
   * Expand indicator text (Default: ' [-]')
   */
  expand?: string;

  // Events
  /**
   * Called when a node is selected
   */
  onSelect?: (node: TreeNode, index: number) => void;

  /**
   * Called when a node is double-clicked
   */
  onDblclick?: (data: any) => void;

  /**
   * Called when selection is canceled
   */
  onCancel?: () => void;

  // Behavior
  /**
   * Disable interaction (Default: false)
   */
  disabled?: boolean;

  /**
   * Enable vi keybindings (Default: false)
   */
  vi?: boolean;

  // Style props
  /**
   * Style for selected items
   */
  itemSelected?: StyleObject;

  /**
   * Style for normal items
   */
  itemStyle?: StyleObject;

  /**
   * Style for hovered items
   */
  itemHover?: StyleObject;

  /**
   * Color for tree lines
   */
  lineColor?: string;

  /**
   * Color for expand/collapse indicators
   */
  indicatorColor?: string;

  /**
   * Color for node icons
   */
  iconColor?: string;

  /**
   * Rules for automatically assigning icons to nodes
   */
  iconRules?: TreeIconRule[];

  // Scrollbar configuration
  /**
   * Enable/disable scrollbar (Default: true)
   */
  scrollbar?: boolean;

  /**
   * Scrollbar background color
   */
  scrollbarBg?: string;

  /**
   * Scrollbar foreground color
   */
  scrollbarFg?: string;

  /**
   * Scrollbar character (Default: ' ')
   */
  scrollbarChar?: string;

  /**
   * Show scrollbar track
   */
  scrollbarTrack?: boolean;

  /**
   * Track background color
   */
  scrollbarTrackBg?: string;

  /**
   * Track foreground color
   */
  scrollbarTrackFg?: string;

  /**
   * Track character
   */
  scrollbarTrackChar?: string;
}

/**
 * Descriptor for Tree widgets
 */
export class TreeDescriptor extends BoxDescriptor<TreeProps> {
  override readonly type = "tree";

  override get widgetOptions() {
    const options = super.widgetOptions;

    // Build focusable options using helper function
    Object.assign(options, buildFocusableOptions(this.props, 0));

    // Get preset configuration
    const preset = this.props.preset
      ? this.props.preset === "modern"
        ? TreePresets.Modern
        : TreePresets.Classic
      : null;

    // Tree data
    options.data = this.props.data;

    // Label
    options.label = this.props.label;

    // Behavior
    options.extended = this.props.extended;
    options.interactive = !this.props.disabled;
    options.vi = this.props.vi ?? false;
    options.dblclick = this.props.dblclick;

    // Keys configuration
    if (this.props.keys !== undefined) {
      options.keys = this.props.keys;
    }

    // Build config - merge preset with explicit props
    const config: TreeConfig = {};

    // Start with preset config if available
    if (preset?.config) {
      Object.assign(config, preset.config);
    }

    // Override with explicit props
    if (this.props.lines !== undefined) config.lines = this.props.lines;
    if (this.props.spaces !== undefined) config.spaces = this.props.spaces;
    if (this.props.indent !== undefined) config.indent = this.props.indent;
    if (this.props.prefixIndicator !== undefined)
      config.prefixIndicator = this.props.prefixIndicator;
    if (this.props.suffixIndicator !== undefined)
      config.suffixIndicator = this.props.suffixIndicator;
    if (this.props.collapse !== undefined)
      config.collapse = this.props.collapse;
    if (this.props.expand !== undefined) config.expand = this.props.expand;

    // Always include config if preset is used or any config props are set
    if (preset || Object.keys(config).length > 0) {
      options.config = config;
    }

    // Icon rules - always include when preset is used or explicitly set
    if (preset || this.props.iconRules !== undefined) {
      options.iconRules = this.props.iconRules ?? preset?.iconRules ?? [];
    }

    // Apply theme defaults for list item styles
    const defaults = getComponentDefaults(this);

    // Build scrollbar configuration
    if (this.props.scrollbar !== false) {
      options.scrollbar = {
        ch: this.props.scrollbarChar || " ",
      };

      if (this.props.scrollbarFg) options.scrollbar.fg = this.props.scrollbarFg;
      if (this.props.scrollbarBg) options.scrollbar.bg = this.props.scrollbarBg;

      // Add track configuration if enabled
      if (this.props.scrollbarTrack) {
        options.scrollbar.track = {
          ch: this.props.scrollbarTrackChar,
        };
        if (this.props.scrollbarTrackFg)
          options.scrollbar.track.fg = this.props.scrollbarTrackFg;
        if (this.props.scrollbarTrackBg)
          options.scrollbar.track.bg = this.props.scrollbarTrackBg;
      }
    }

    // Selected item styling - use helper with theme fallback
    Object.assign(
      options,
      buildItemStyles(this, this.props.itemSelected, defaults.item, {
        optionPrefix: "selected",
        themeFgKey: "selectedFg",
        themeBgKey: "selectedBg",
      }),
    );

    // Normal item styling - use helper with theme fallback
    Object.assign(
      options,
      buildItemStyles(this, this.props.itemStyle, defaults.item, {
        optionPrefix: "item",
        themeFgKey: "fg",
        themeBgKey: "bg",
      }),
    );

    // Item hover styling - use helper with effects object
    Object.assign(
      options,
      buildItemStyles(this, this.props.itemHover, defaults.item, {
        optionPrefix: "itemHover",
        isEffects: true,
        themeFgKey: "hoverFg",
        themeBgKey: "hoverBg",
      }),
    );

    // Build tree-specific style
    const treeStyle: any = options.style || {};

    // Apply preset style
    if (preset?.style) {
      Object.assign(treeStyle, preset.style);
    }

    // Tree-specific colors
    if (this.props.lineColor) {
      treeStyle.line = { fg: this.props.lineColor };
    }
    if (this.props.indicatorColor) {
      treeStyle.indicator = { fg: this.props.indicatorColor };
    }
    if (this.props.iconColor) {
      treeStyle.icon = { fg: this.props.iconColor };
    }

    if (Object.keys(treeStyle).length > 0) {
      options.style = treeStyle;
    }

    // Enable tags for color formatting
    options.tags = true;

    return options;
  }

  override get eventHandlers() {
    const handlers: Record<string, Function> = super.eventHandlers;

    // Tree-specific events
    if (this.props.onSelect) handlers.select = this.props.onSelect;
    if (this.props.onDblclick) handlers.dblclick = this.props.onDblclick;
    if (this.props.onCancel) handlers.cancel = this.props.onCancel;

    return handlers;
  }

  override createWidget(layout: ComputedLayout, screen: Screen): TreeWidget {
    return new TreeWidget({
      screen,
      ...COMMON_WIDGET_OPTIONS,
      top: layout.top,
      left: layout.left,
      width: layout.width,
      height: layout.height,
      ...this.widgetOptions,
    });
  }

  override updateWidget(widget: TreeWidget, layout: ComputedLayout): void {
    // Call base implementation for position and options update
    super.updateWidget(widget, layout);

    const options = this.widgetOptions;

    // Update config if changed (supports preset switching)
    // Use replace=true to fully reset config when switching presets
    if (options.config) {
      widget.setConfig(options.config, true);
    }

    // Update icon rules if changed
    if (options.iconRules !== undefined) {
      widget.setIconRules(options.iconRules);
    }

    // Update style properties on the widget
    if (options.style) {
      Object.assign(widget.style, options.style);
    }

    // Tree-specific: Update data if changed
    if (options.data) {
      widget.setData(options.data);
    }
  }
}

/**
 * Tree component - Collapsible, hierarchical tree view with keyboard and mouse support
 *
 * Provides a simplified API with preset support for common tree styles.
 * Mouse, keyboard, and tags are always enabled.
 *
 * @example Basic tree with Classic preset
 * ```tsx
 * <Tree
 *   preset="classic"
 *   data={{
 *     name: 'root',
 *     extended: true,
 *     children: {
 *       'src': { children: { 'index.ts': {} } },
 *       'package.json': {},
 *     }
 *   }}
 *   width={40}
 *   height={20}
 *   onSelect={(node, index) => console.log('Selected:', node.name)}
 * />
 * ```
 *
 * @example Modern preset with custom options
 * ```tsx
 * <Tree
 *   preset="modern"
 *   data={fileTree}
 *   label="File Explorer"
 *   extended={true}
 *   iconRules={[
 *     { test: '*.ts', icon: '' },
 *     { test: '*.md', icon: '󰂺' },
 *   ]}
 *   onSelect={handleSelect}
 *   onDblclick={handleDblclick}
 * />
 * ```
 *
 * @example Custom config overrides
 * ```tsx
 * <Tree
 *   data={data}
 *   lines={true}
 *   indent={4}
 *   prefixIndicator={(node) => node.extended ? '▾ ' : '▸ '}
 *   lineColor="cyan"
 *   indicatorColor="green"
 * />
 * ```
 */
export const Tree = forwardRef<any, TreeProps>(({ ...props }, ref) => {
  return <tree ref={ref} border={1} minHeight={5} {...props} />;
});

Tree.displayName = "Tree";
