/**
 * Style type definitions for blessed
 */

/**
 * Type for style color properties that can be static values or dynamic functions.
 * Dynamic functions are evaluated at render time with the element as context.
 * Colors can be strings (color names) or numbers (color codes).
 */
export type StyleColor =
  | string
  | number
  | ((element: any) => string | number | undefined);

/**
 * Type for style boolean properties that can be static values or dynamic functions.
 * Dynamic functions are evaluated at render time with the element as context.
 */
export type StyleBoolean = boolean | ((element: any) => boolean | undefined);

export interface StyleBorder {
  bg?: StyleColor;
  fg?: StyleColor;
}

export interface Effects {
  bg?: StyleColor;
  fg?: StyleColor;
  border?: StyleBorder;
}

export interface Style {
  /** Background color - can be static or a function evaluated at render time */
  bg?: StyleColor;
  /** Foreground color - can be static or a function evaluated at render time */
  fg?: StyleColor;
  ch?: string;
  /** Bold attribute - can be static or a function evaluated at render time */
  bold?: StyleBoolean;
  /** Dim attribute - can be static or a function evaluated at render time */
  dim?: StyleBoolean;
  /** Underline attribute - can be static or a function evaluated at render time */
  underline?: StyleBoolean;
  /** Blink attribute - can be static or a function evaluated at render time */
  blink?: StyleBoolean;
  /** Inverse attribute - can be static or a function evaluated at render time */
  inverse?: StyleBoolean;
  /** Invisible attribute - can be static or a function evaluated at render time */
  invisible?: StyleBoolean;
  transparent?: boolean;
  border?: StyleBorder;
  hover?: Effects;
  focus?: Effects;
  label?: Partial<Style>;
  track?: { bg?: StyleColor; fg?: StyleColor };
  scrollbar?: { bg?: StyleColor; fg?: StyleColor };
  /** Progress bar fill style (for ProgressBar widget). Style object with fg/bg properties. */
  bar?: Partial<Style>;
  /** Prefix style (for Listbar widget). Style object with fg/bg properties. */
  prefix?: Partial<Style>;
}

export interface ListElementStyle extends Style {
  /**
   * Style for selected list item.
   * Kept as any to support truly dynamic styling properties.
   * Community @types/blessed also uses any for this property.
   */
  selected?: any;
  /**
   * Style for regular (unselected) list items.
   * Kept as any to support truly dynamic styling properties.
   * Community @types/blessed also uses any for this property.
   */
  item?: any;
}

export interface StyleListTable extends ListElementStyle {
  /**
   * Style for table header row.
   * Kept as any to support dynamic styling configurations.
   */
  header?: any;
  /**
   * Style for table cells.
   * Kept as any to support dynamic styling configurations.
   */
  cell?: any;
}

/**
 * Style for Tree widget with tree-specific styling options.
 */
export interface TreeStyle extends ListElementStyle {
  /**
   * Style for tree lines (├, └, │, ─).
   * Use fg to set the color of the tree lines.
   */
  line?: Partial<Style>;

  /**
   * Style for expand/collapse indicators ([+], [-]).
   */
  indicator?: Partial<Style>;

  /**
   * Style for node icons (emoji, nerd fonts, etc.).
   * Applied to the icon property of each TreeNode.
   */
  icon?: Partial<Style>;

  /**
   * Style for expanded (branch) nodes that have children and are open.
   */
  expanded?: Partial<Style>;

  /**
   * Style for collapsed nodes that have children but are closed.
   */
  collapsed?: Partial<Style>;

  /**
   * Style for leaf nodes (nodes without children).
   */
  leaf?: Partial<Style>;

  /**
   * Array of styles for different tree depths.
   * Index 0 is for root level, 1 for first child level, etc.
   * If a depth exceeds the array length, it cycles back.
   */
  depth?: Partial<Style>[];

  /**
   * Spacer character(s) between tree lines and node text.
   * Default is '' (no spacer). Common values: ' ', '─ ', '── '.
   */
  spacer?: string;
}

/**
 * Style for ProgressBar widget
 */
export interface ProgressBarStyle extends Style {
  // Inherits bar from base Style interface
}
