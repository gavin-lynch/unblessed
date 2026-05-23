/**
 * @gavin-lynch/unblessed-core - Platform-agnostic TUI library
 *
 * This package contains all the core TUI logic without any platform-specific dependencies.
 * Platform adapters (@gavin-lynch/unblessed-node, @gavin-lynch/unblessed-browser) inject runtime implementations to provide
 * platform-specific functionality.
 */

export * from "./perf-hooks.js";
export { getRuntime, setRuntime } from "./runtime-context.js";
export * from "./runtime.js";

// Re-export types
export * from "./types/index.js";

// Re-export Program and Tput
export { default as Program } from "./lib/program.js";
export { default as Tput, sprintf, tryRead } from "./lib/tput.js";

// Re-export helpers
export * from "./lib/alias.js";
export * from "./lib/animation-utils.js";
export * from "./lib/border-colors.js";
export * from "./lib/border-styles.js";
export * from "./lib/canvas/index.js";
export * from "./lib/color-capabilities.js";
export * from "./lib/color-converter.js";
export * from "./lib/color-types.js";
export { default as colors } from "./lib/colors.js";
export * from "./lib/cursedwind.js";
export * from "./lib/events.js";
export * from "./lib/helpers.js";
export * from "./lib/image-renderer.js";
export * from "./lib/string-builder.js";
export * from "./lib/text-utils.js";
export { default as unicode } from "./lib/unicode.js";

// Re-export mixins
export * from "./mixins/animatable.js";
export * from "./mixins/scrollable.js";

// Re-export core widgets
export * from "./widgets/box.js";
export * from "./widgets/braille-canvas.js";
export * from "./widgets/canvas.js";
export * from "./widgets/char-canvas.js";
export * from "./widgets/element.js";
export * from "./widgets/line.js";
export * from "./widgets/node.js";
export * from "./widgets/text.js";

// Re-export input widgets
export * from "./widgets/button.js";
export * from "./widgets/checkbox.js";
export * from "./widgets/input.js";
export * from "./widgets/radiobutton.js";
export * from "./widgets/radioset.js";
export * from "./widgets/textarea.js";
export * from "./widgets/textbox.js";

// Re-export scrollable widgets
export * from "./widgets/scrollablebox.js";
export * from "./widgets/scrollabletext.js";

// Re-export list widgets
export * from "./lib/tree-presets.js";
export * from "./widgets/list.js";
export * from "./widgets/listbar.js";
export * from "./widgets/listtable.js";
export * from "./widgets/tree.js";

// Re-export form widget
export * from "./widgets/form.js";

// Re-export layout widgets
export * from "./layout/carousel.js";
export * from "./layout/grid.js";
export * from "./widgets/layout.js";
export * from "./widgets/table.js";

// Re-export UI widgets
export * from "./widgets/bar.js";
export * from "./widgets/dialog.js";
export * from "./widgets/diff.js";
export * from "./widgets/donut.js";
export * from "./widgets/gauge-list.js";
export * from "./widgets/gauge.js";
export * from "./widgets/lcd.js";
export * from "./widgets/linechart.js";
export * from "./widgets/loading.js";
export * from "./widgets/log-list.js";
export * from "./widgets/log.js";
export * from "./widgets/markdown.js";
export * from "./widgets/message.js";
export * from "./widgets/progressbar.js";
export * from "./widgets/prompt.js";
export * from "./widgets/question.js";
export * from "./widgets/sparkline.js";
export * from "./widgets/stacked-bar.js";
export * from "./widgets/static.js";
export * from "./widgets/tabs.js";

// Re-export special widgets
export * from "./widgets/ansiimage.js";
export * from "./widgets/bigtext.js";
export * from "./widgets/filemanager.js";
export * from "./widgets/image.js";
export * from "./widgets/map.js";
export * from "./widgets/overlayimage.js";
export * from "./widgets/picture.js";
export { default as Screen } from "./widgets/screen.js";
