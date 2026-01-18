/**
 * map.ts - World map widget
 *
 * Displays a world map with markers.
 * Requires optional peer dependency: map-canvas
 *
 * Based on blessed-contrib's map.js
 */

import {
  CanvasWidget,
  DrawilleCanvas,
  type BoxOptions,
} from "@unblessed/core";

// Dynamic import for optional map-canvas dependency (use any to avoid type errors)
let MapCanvas: any = null;

// Helper to dynamically import a module by name
async function tryImport(moduleName: string): Promise<any> {
  try {
    // Using Function constructor to avoid static analysis
    const importFn = new Function("m", "return import(m)");
    return await importFn(moduleName);
  } catch {
    return null;
  }
}

// Helper to safely load map-canvas
async function loadMapCanvas(): Promise<any> {
  const mod = await tryImport("map-canvas");
  return mod ? mod.default || mod : null;
}

/**
 * Map marker definition
 */
export interface MapMarker {
  /** Longitude (-180 to 180) */
  lon: string | number;
  /** Latitude (-90 to 90) */
  lat: string | number;
  /** Marker color */
  color?: string | number | number[];
  /** Marker character (default: 'X') */
  char?: string;
}

/**
 * Map options
 */
export interface MapOptions extends BoxOptions {
  /** Starting longitude for map region */
  startLon?: number;
  /** Ending longitude for map region */
  endLon?: number;
  /** Starting latitude for map region */
  startLat?: number;
  /** Ending latitude for map region */
  endLat?: number;
  /** Predefined region: 'world', 'us', 'eu', etc. */
  region?: string;
  /** Exclude Antarctica from display (default: true) */
  excludeAntarctica?: boolean;
  /** Disable background (default: true) */
  disableBackground?: boolean;
  /** Disable map background (default: true) */
  disableMapBackground?: boolean;
  /** Disable graticule/grid lines (default: true) */
  disableGraticule?: boolean;
  /** Disable country fill (default: true) */
  disableFill?: boolean;
  /** Spacing for labels (default: 5) */
  labelSpace?: number;
  /** Style options */
  style?: BoxOptions["style"] & {
    /** Shape/country color */
    shapeColor?: string | number | number[];
    /** Stroke color */
    stroke?: string | number | number[];
    /** Fill color */
    fill?: string | number | number[];
  };
  /** Initial markers */
  markers?: MapMarker[];
}

/**
 * WorldMap - World map display widget
 *
 * Displays a world map with optional markers.
 * Requires map-canvas peer dependency for full functionality.
 *
 * @example
 * ```ts
 * const map = new WorldMap({
 *   parent: screen,
 *   width: '80%',
 *   height: '80%',
 *   label: 'Server Locations',
 *   markers: [
 *     { lon: '-122.4', lat: '37.8', color: 'red', char: 'X' },
 *     { lon: '-73.9', lat: '40.7', color: 'blue', char: 'O' },
 *     { lon: '0.1', lat: '51.5', color: 'green', char: '*' }
 *   ]
 * });
 * ```
 */
export class WorldMap extends CanvasWidget {
  override type = "map";
  declare options: MapOptions;
  private innerMap: any = null;
  private _markers: MapMarker[] = [];

  constructor(options: MapOptions = {}) {
    super(options, DrawilleCanvas);
    this.options = options;

    this.on("attach", () => {
      this._initMap();
    });
  }

  override calcSize(): void {
    this.canvasSize = {
      width: this.width * 2 - 12,
      height: this.height * 4,
    };
  }

  private async _initMap(): Promise<void> {
    // Try to load map-canvas
    if (!MapCanvas) {
      MapCanvas = await loadMapCanvas();
    }

    if (!MapCanvas) {
      // map-canvas not available, draw simplified map
      this._drawSimplifiedMap();
      return;
    }

    if (!this.ctx) return;

    const style = this.options.style || {};

    const opts = {
      excludeAntartica:
        this.options.excludeAntarctica !== undefined
          ? this.options.excludeAntarctica
          : true,
      disableBackground:
        this.options.disableBackground !== undefined
          ? this.options.disableBackground
          : true,
      disableMapBackground:
        this.options.disableMapBackground !== undefined
          ? this.options.disableMapBackground
          : true,
      disableGraticule:
        this.options.disableGraticule !== undefined
          ? this.options.disableGraticule
          : true,
      disableFill:
        this.options.disableFill !== undefined ? this.options.disableFill : true,
      width: this.ctx._canvas.width,
      height: this.ctx._canvas.height,
      shapeColor: style.shapeColor || "green",
      startLon: this.options.startLon,
      endLon: this.options.endLon,
      startLat: this.options.startLat,
      endLat: this.options.endLat,
      region: this.options.region,
      labelSpace: this.options.labelSpace ?? 5,
    };

    this.ctx.strokeStyle = style.stroke || "green";
    this.ctx.fillStyle = style.fill || "green";

    // Create inner map using map-canvas
    this.innerMap = new MapCanvas(opts, this._canvas);
    this.innerMap.draw();

    // Add initial markers
    if (this.options.markers) {
      for (const marker of this.options.markers) {
        this.addMarker(marker);
      }
    }
  }

  /**
   * Draw a simplified map when map-canvas is not available
   */
  private _drawSimplifiedMap(): void {
    if (!this.ctx) return;

    const c = this.ctx;
    const w = this.canvasSize.width;
    const h = this.canvasSize.height;
    const style = this.options.style || {};

    c.strokeStyle = style.stroke || "green";
    c.fillStyle = style.fill || "green";

    // Draw border
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(w - 1, 0);
    c.lineTo(w - 1, h - 1);
    c.lineTo(0, h - 1);
    c.lineTo(0, 0);
    c.stroke();

    // Draw simple grid
    const gridSpacing = 30;
    c.strokeStyle = "normal";

    for (let x = gridSpacing; x < w; x += gridSpacing) {
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, h);
      c.stroke();
    }

    for (let y = gridSpacing; y < h; y += gridSpacing) {
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(w, y);
      c.stroke();
    }

    // Draw equator
    c.strokeStyle = style.stroke || "green";
    c.beginPath();
    c.moveTo(0, h / 2);
    c.lineTo(w, h / 2);
    c.stroke();

    // Add markers
    for (const marker of this._markers) {
      this._drawSimpleMarker(marker);
    }

    // Add text indicating simplified mode
    c.fillText("Map (simplified mode)", 4, h - 4);
  }

  /**
   * Draw a marker on the simplified map
   */
  private _drawSimpleMarker(marker: MapMarker): void {
    if (!this.ctx) return;

    const c = this.ctx;
    const w = this.canvasSize.width;
    const h = this.canvasSize.height;

    // Convert lon/lat to screen coordinates
    const lon = parseFloat(String(marker.lon));
    const lat = parseFloat(String(marker.lat));

    const x = Math.round(((lon + 180) / 360) * w);
    const y = Math.round(((90 - lat) / 180) * h);

    c.strokeStyle = marker.color || "red";
    c.fillStyle = marker.color || "red";

    // Draw marker character
    const char = marker.char || "X";
    c.fillText(char, x, y);
  }

  /**
   * Add a marker to the map
   */
  addMarker(marker: MapMarker): void {
    this._markers.push(marker);

    if (this.innerMap) {
      this.innerMap.addMarker(marker);
    } else if (this.ctx) {
      this._drawSimpleMarker(marker);
    }
  }

  /**
   * Clear all markers
   */
  clearMarkers(): void {
    this._markers = [];

    if (this.innerMap) {
      this.innerMap.draw();
    } else {
      this._drawSimplifiedMap();
    }
  }

  /**
   * Get options prototype (for blessed-contrib compatibility)
   */
  getOptionsPrototype(): MapOptions {
    return {
      startLon: 10,
      endLon: 10,
      startLat: 10,
      endLat: 10,
      region: "us",
      markers: [
        { lon: "-79.0000", lat: "37.5000", color: "red", char: "X" },
        { lon: "79.0000", lat: "37.5000", color: "blue", char: "O" },
      ],
    };
  }
}

// Export as Map for blessed-contrib compatibility
export { WorldMap as Map };
export default WorldMap;
