/**
 * map.ts - World map widget
 *
 * Displays a world map with markers.
 * Requires optional peer dependency: map-canvas
 *
 * Based on blessed-contrib's map.js
 */

import { CanvasWidget, DrawilleCanvas, type BoxOptions } from "@unblessed/core";
 
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
  private _initPromise: Promise<void> | null = null;

  constructor(options: MapOptions = {}) {
    super(options, DrawilleCanvas);
    this.options = options;

    // Initialize markers from options immediately
    if (options.markers) {
      this._markers = [...options.markers];
    }

    // Wait for canvas to be ready before initializing
    const initWhenReady = () => {
      // Check if canvas is ready
      if (this.ctx && this._canvas) {
        // Fire and forget - don't block on async init
        // Add timeout to prevent infinite hangs
        const timeout = setTimeout(() => {
          this._drawSimplifiedMap();
        }, 3000);

        this._initMap()
          .then(() => {
            clearTimeout(timeout);
          })
          .catch(() => {
            clearTimeout(timeout);
            // If init fails, fall back to simplified map
            this._drawSimplifiedMap();
          });
        return true; // Canvas ready, initialization started
      }
      return false; // Canvas not ready
    };

    this.on("attach", () => {
      // Try to initialize immediately (canvas might be ready)
      if (initWhenReady()) {
        return; // Canvas was ready, initialization started
      }

      // Canvas not ready yet - poll for it or wait for resize
      // Use a combination of polling and event listening
      let checkCount = 0;
      const maxChecks = 50; // Check up to 5 seconds (50 * 100ms)

      const checkInterval = setInterval(() => {
        checkCount++;
        if (this.ctx && this._canvas) {
          clearInterval(checkInterval);
          initWhenReady();
        } else if (checkCount >= maxChecks) {
          clearInterval(checkInterval);
          this._drawSimplifiedMap();
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
    this.canvasSize = {
      width: this.width * 2 - 12,
      height: this.height * 4,
    };
  }

  private async _initMap(): Promise<void> {
    // Prevent multiple concurrent initializations
    if (this._initPromise) {
      return this._initPromise;
    }

    this._initPromise = (async () => {
      try {
        if (!this.ctx || !this._canvas) {
          this._drawSimplifiedMap();
          return;
        }

        // Validate canvas dimensions before proceeding
        const canvasWidth = this.ctx._canvas.width;
        const canvasHeight = this.ctx._canvas.height;

        if (canvasWidth <= 0 || canvasHeight <= 0) {
          this._drawSimplifiedMap();
          return;
        }

        // MapCanvas is now a normal import, no need to check

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

        this.ctx.strokeStyle = style.stroke || "green";
        this.ctx.fillStyle = style.fill || "green";

        // Create inner map using map-canvas
        // IMPORTANT: Pass this.ctx._canvas (the raw drawille canvas), not this._canvas (our wrapper)
        try {
          // Clear canvas before drawing
          if (this.ctx) {
            this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
          }

          this.innerMap = new MapCanvas(opts, this.ctx._canvas);

          // Try calling draw() - if it blocks, we'll timeout and use simplified map
          if (this.innerMap && typeof this.innerMap.draw === "function") {
            // Call draw() - it's synchronous, so if it blocks we can't interrupt it
            // But we'll try it and see if it works
            try {
              this.innerMap.draw();

              // Add markers after draw()
              for (const marker of this._markers) {
                if (
                  this.innerMap &&
                  typeof this.innerMap.addMarker === "function"
                ) {
                  this.innerMap.addMarker(marker);
                }
              }

              // Update canvas content after drawing
              // IMPORTANT: Get frame from the raw canvas that map-canvas drew on
              // map-canvas draws directly on this.ctx._canvas, so we need to get the frame from there
              if (this.ctx && this.ctx._canvas) {
                const frame = this.ctx._canvas.frame();
                this.content = frame;
                if (this.screen) {
                  this.screen.render();
                }
              }
              // Don't fall back to simplified map - map-canvas should have drawn
            } catch (_err) {
              // If draw() throws, fall back to simplified map
              this.innerMap = null;
              this._drawSimplifiedMap();
            }
          } else {
            // No draw() method, use simplified map
            this.innerMap = null;
            this._drawSimplifiedMap();
          }
        } catch (_err) {
          // If map-canvas fails, fall back to simplified map
          this.innerMap = null;
          this._drawSimplifiedMap();
        }
      } catch (_err) {
        // Any error - fall back to simplified map
        this._drawSimplifiedMap();
      } finally {
        this._initPromise = null;
      }
    })();

    return this._initPromise;
  }

  /**
   * Draw a simplified map when map-canvas is not available
   */
  private _drawSimplifiedMap(): void {
    if (!this.ctx) {
      return;
    }

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

    // Update canvas content after drawing
    if (this._canvas) {
      const frame = this._canvas.frame();
      this.content = frame;
      if (this.screen) {
        this.screen.render();
      }
    }
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
    // Avoid duplicates
    const exists = this._markers.some(
      (m) => m.lon === marker.lon && m.lat === marker.lat,
    );
    if (exists) return;

    this._markers.push(marker);

    if (this.innerMap && typeof this.innerMap.addMarker === "function") {
      try {
        this.innerMap.addMarker(marker);
      } catch (_err) {
        // If addMarker fails, just draw it manually
        if (this.ctx) {
          this._drawSimpleMarker(marker);
        }
      }
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
