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

// Layout
export { Grid, type GridOptions, type WidgetConstructor } from "./layout/grid.js";

// Widgets
export { Line, type LineOptions, type LineSeriesData } from "./widgets/line.js";
export { Bar, type BarOptions, type BarData } from "./widgets/bar.js";
export {
  StackedBar,
  type StackedBarOptions,
  type StackedBarData,
} from "./widgets/stacked-bar.js";
export {
  Gauge,
  type GaugeOptions,
  type GaugeStackItem,
} from "./widgets/gauge.js";
export { Donut, type DonutOptions, type DonutData } from "./widgets/donut.js";
export { Log, type LogOptions } from "./widgets/log.js";
export {
  Sparkline,
  type SparklineOptions,
  type SparklineData,
} from "./widgets/sparkline.js";
export { LCD, type LCDOptions } from "./widgets/lcd.js";
export {
  GaugeList,
  type GaugeListOptions,
  type GaugeListItem,
  type GaugeListStackItem,
} from "./widgets/gauge-list.js";
export { Table, type TableOptions, type TableData } from "./widgets/table.js";
export {
  Carousel,
  type CarouselOptions,
  type CarouselPage,
} from "./layout/carousel.js";

// Widgets with optional dependencies
export {
  Markdown,
  type MarkdownOptions,
  type MarkdownStyle,
} from "./widgets/markdown.js";
export {
  WorldMap,
  WorldMap as Map,
  type MapOptions,
  type MapMarker,
} from "./widgets/map.js";
export { Picture, type PictureOptions } from "./widgets/picture.js";

