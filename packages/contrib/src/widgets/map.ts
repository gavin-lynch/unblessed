/**
 * map.ts - World map widget
 *
 * Displays a world map with markers.
 * Requires optional peer dependency: map-canvas
 *
 * Based on blessed-contrib's map.js
 */

import { CanvasWidget, DrawilleCanvas, type BoxOptions } from "@unblessed/core";
import { truncateAnsiLines } from "../utils.js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - map-canvas doesn't have type definitions
import MapCanvas from "map-canvas";

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
  /** Horizontal map padding in braille pixels (default: 12) */
  mapPaddingX?: number;
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
    options.mapPaddingX = options.mapPaddingX ?? 12;
    super(options, DrawilleCanvas);
    this.options = options;

    // Initialize markers from options immediately
    if (options.markers) {
      this._markers = [...options.markers];
    }

    // Wait for canvas to be ready before initializing
    const initWhenReady = () => {
      if (!this.ctx || !this._canvas) return false;
      void this._initMap();
      return true;
    };

    this.on("attach", () => {
      // Try to initialize immediately (canvas might be ready)
      if (initWhenReady()) {
        return; // Canvas was ready, initialization started
      }

      // Canvas not ready yet - poll for it or wait for resize
      let checkCount = 0;
      const maxChecks = 50; // Check up to 5 seconds (50 * 100ms)

      const checkInterval = setInterval(() => {
        checkCount++;
        if (this.ctx && this._canvas) {
          clearInterval(checkInterval);
          initWhenReady();
        } else if (checkCount >= maxChecks) {
          clearInterval(checkInterval);
        }
      }, 100);

      // Also listen for resize events as a backup
      const resizeHandler = () => {
        if (this.ctx && this._canvas) {
          clearInterval(checkInterval);
          this.off("resize", resizeHandler);
          initWhenReady();
        }
      };
      this.on("resize", resizeHandler);
    });
  }

  override calcSize(): void {
    const outerWidthChars = Math.max(1, Math.floor(this.width));
    const outerHeightChars = Math.max(1, Math.floor(this.height));
    const mapPaddingX = Math.max(0, this.options.mapPaddingX ?? 0);
    this.canvasSize = {
      width: Math.max(2, outerWidthChars * 2 - mapPaddingX),
      height: Math.max(4, outerHeightChars * 4),
    };
  }

  protected override getFrameFromCanvas(): string {
    if (!this._canvas) return "";
    const frame = this._canvas.frame();
    const availableWidth = Math.max(
      1,
      Math.floor(this.width - (this.border ? 2 : 0)),
    );
    return truncateAnsiLines(frame, availableWidth);
  }

  private async _initMap(): Promise<void> {
    if (!this.ctx || !this._canvas) {
      return;
    }

    const canvasWidth = this.ctx._canvas.width;
    const canvasHeight = this.ctx._canvas.height;

    if (canvasWidth <= 0 || canvasHeight <= 0) {
      return;
    }

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
        this.options.disableFill !== undefined
          ? this.options.disableFill
          : true,
      width: canvasWidth,
      height: canvasHeight,
      shapeColor: style.shapeColor || "green",
      startLon: this.options.startLon,
      endLon: this.options.endLon,
      startLat: this.options.startLat,
      endLat: this.options.endLat,
      region: this.options.region,
      labelSpace: this.options.labelSpace ?? 5,
    };

    try {
      this.ctx.strokeStyle = style.stroke || "green";
      this.ctx.fillStyle = style.fill || "green";

      this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      const canvasShim = {
        width: canvasWidth,
        height: canvasHeight,
        getContext: (type?: string) => {
          if (type && type !== "2d") return null;
          return this.ctx;
        },
      };
      (this.ctx as any).canvas = canvasShim;

      const MapCanvasCtor = (MapCanvas as any).default ?? MapCanvas;
      this.innerMap = new MapCanvasCtor(opts, canvasShim);
      this.innerMap.draw();

      for (const marker of this._markers) {
        if (this.innerMap && typeof this.innerMap.addMarker === "function") {
          this.innerMap.addMarker(marker);
        }
      }
      if (this.ctx && this.ctx._canvas) {
        const frame = this.ctx._canvas.frame();
        this.content = frame;
        if (this.screen) {
          this.screen.render();
        }
      }
    } catch (err) {
      console.error("[map] init failed", err);
      throw err;
    }
  }

  /**
   * Add a marker to the map
   */
  addMarker(marker: MapMarker): void {
    // Avoid duplicates
    const exists = this._markers.some(
      (m) => m.lon === marker.lon && m.lat === marker.lat,
    );
    if (exists) return;

    this._markers.push(marker);
    if (this.innerMap && typeof this.innerMap.addMarker === "function") {
      this.innerMap.addMarker(marker);
    }
  }

  /**
   * Clear all markers
   */
  clearMarkers(): void {
    this._markers = [];
    if (this.innerMap && typeof this.innerMap.draw === "function") {
      this.innerMap.draw();
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
