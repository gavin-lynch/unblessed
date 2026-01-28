/**
 * @unblessed/contrib - Dashboard widgets and charts
 *
 * A port of blessed-contrib providing dashboard widgets and chart components
 * for terminal user interfaces.
 *
 * @example
 * ```ts
 * import { Screen } from '@unblessed/node';
 * import { Grid, Line, Bar, Gauge, Donut, Log, Sparkline } from '@unblessed/contrib';
 *
 * const screen = new Screen({ smartCSR: true });
 *
 * const grid = new Grid({
 *   screen: screen,
 *   rows: 12,
 *   cols: 12
 * });
 *
 * const line = grid.set(0, 0, 6, 6, (opts) => new Line(opts), {
 *   label: 'Network Traffic',
 *   data: [...]
 * });
 *
 * screen.render();
 * ```
 */

// Utilities
export * from "./utils.js";
// Note: color-utils exports are already re-exported via utils.js wrappers

// Layout
export {
  Grid,
  type GridOptions,
  type WidgetConstructor,
} from "./layout/grid.js";

// Widgets
export {
  Carousel,
  type CarouselOptions,
  type CarouselPage,
} from "./layout/carousel.js";
export { Bar, type BarData, type BarOptions } from "./widgets/bar.js";
export { Donut, type DonutData, type DonutOptions } from "./widgets/donut.js";
export {
  GaugeList,
  type GaugeListItem,
  type GaugeListOptions,
  type GaugeListStackItem,
} from "./widgets/gauge-list.js";
export {
  Gauge,
  type GaugeOptions,
  type GaugeStackItem,
} from "./widgets/gauge.js";
export { LCD, type LCDOptions } from "./widgets/lcd.js";
export { Line, type LineOptions, type LineSeriesData } from "./widgets/line.js";
export { Log, type LogOptions } from "./widgets/log.js";
export {
  Sparkline,
  type SparklineData,
  type SparklineOptions,
} from "./widgets/sparkline.js";
export {
  StackedBar,
  type StackedBarData,
  type StackedBarOptions,
} from "./widgets/stacked-bar.js";
export { Table, type TableData, type TableOptions } from "./widgets/table.js";

// Widgets with optional dependencies
export { Diff, type DiffOptions } from "./widgets/diff.js";
export {
  WorldMap as Map,
  WorldMap,
  type MapMarker,
  type MapOptions,
} from "./widgets/map.js";
export {
  Markdown,
  type HighlightTheme,
  type MarkdownOptions,
  type MarkdownStyle,
} from "./widgets/markdown.js";
export { Picture, type PictureOptions } from "./widgets/picture.js";
