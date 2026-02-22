/**
 * map.ts - World map widget
 */

import { DrawilleCanvas } from "../lib/canvas/index.js";
import { truncateAnsiLines } from "../lib/text-utils.js";
import type { BoxOptions } from "../types/options.js";
import { CanvasWidget } from "./canvas.js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - map-canvas doesn't have type definitions
import MapCanvas from "map-canvas";

export interface MapMarker {
  lon: string | number;
  lat: string | number;
  color?: string | number | number[];
  char?: string;
}

export interface MapOptions extends BoxOptions {
  startLon?: number;
  endLon?: number;
  startLat?: number;
  endLat?: number;
  region?: string;
  excludeAntarctica?: boolean;
  disableBackground?: boolean;
  disableMapBackground?: boolean;
  disableGraticule?: boolean;
  disableFill?: boolean;
  labelSpace?: number;
  style?: BoxOptions["style"] & {
    shapeColor?: string | number | number[];
    stroke?: string | number | number[];
    fill?: string | number | number[];
  };
  markers?: MapMarker[];
  mapPaddingX?: number;
}

export class WorldMap extends CanvasWidget {
  override type = "map";
  declare options: MapOptions;
  private innerMap: any = null;
  private _markers: MapMarker[] = [];

  constructor(options: MapOptions = {}) {
    options.mapPaddingX = options.mapPaddingX ?? 12;
    super(options, DrawilleCanvas);
    this.options = options;

    if (options.markers) {
      this._markers = [...options.markers];
    }

    const initWhenReady = () => {
      if (!this.ctx || !this._canvas) return false;
      void this._initMap();
      return true;
    };

    this.on("attach", () => {
      if (initWhenReady()) {
        return;
      }

      let checkCount = 0;
      const maxChecks = 50;

      const checkInterval = setInterval(() => {
        checkCount++;
        if (this.ctx && this._canvas) {
          clearInterval(checkInterval);
          initWhenReady();
        } else if (checkCount >= maxChecks) {
          clearInterval(checkInterval);
        }
      }, 100);

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
      const message =
        err instanceof Error ? err.message : "Map initialization failed";
      this.runtime.process.stderr?.write?.(`[map] init failed ${message}\n`);
      throw err;
    }
  }

  addMarker(marker: MapMarker): void {
    const exists = this._markers.some(
      (m) => m.lon === marker.lon && m.lat === marker.lat,
    );
    if (exists) return;

    this._markers.push(marker);
    if (this.innerMap && typeof this.innerMap.addMarker === "function") {
      this.innerMap.addMarker(marker);
    }
  }

  clearMarkers(): void {
    this._markers = [];
    if (this.innerMap && typeof this.innerMap.draw === "function") {
      this.innerMap.draw();
    }
  }

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

export { WorldMap as Map };
export default WorldMap;
