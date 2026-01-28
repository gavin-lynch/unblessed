/**
 * lcd.ts - LCD (16-segment display) widget
 *
 * Displays characters using 16-segment LED-style display.
 * Uses braille canvas for high-resolution rendering.
 *
 * Based on blessed-contrib's lcd.js and sixteensegment display by Enderer
 */

import {
  CanvasWidget,
  DrawilleCanvas,
  type BoxOptions,
  type Canvas2DContext,
} from "@unblessed/core";

/**
 * LCD display options
 */
export interface LCDOptions extends BoxOptions {
  /** Segment width as percentage of element width (default: 0.06) */
  segmentWidth?: number;
  /** Spacing between segments as percentage (default: 0.11) */
  segmentInterval?: number;
  /** Stroke width (default: 0.11) */
  strokeWidth?: number;
  /** Number of display elements/characters (default: 3) */
  elements?: number;
  /** Initial display value (default: 321) */
  display?: string | number;
  /** Spacing between elements in pixels (default: 4) */
  elementSpacing?: number;
  /** Padding from edges in pixels (default: 2) */
  elementPadding?: number;
  /** Color of active segments (default: 'white') */
  color?: string | number | number[];
}

/**
 * Point for segment drawing
 */
interface Point {
  x: number;
  y: number;
}

/**
 * Character bitmasks for 16-segment display
 */
const CHARACTER_MASKS: Record<string, number> = (() => {
  // Segment bitmasks
  const a1 = 1 << 0;
  const a2 = 1 << 1;
  const b = 1 << 2;
  const c = 1 << 3;
  const d1 = 1 << 4;
  const d2 = 1 << 5;
  const e = 1 << 6;
  const f = 1 << 7;
  const g1 = 1 << 8;
  const g2 = 1 << 9;
  const h = 1 << 10;
  const i = 1 << 11;
  const j = 1 << 12;
  const k = 1 << 13;
  const l = 1 << 14;
  const m = 1 << 15;

  return {
    " ": 0,
    "": 0,
    "0": a1 | a2 | b | c | d1 | d2 | e | f | j | m,
    "1": b | c | j,
    "2": a1 | a2 | b | d1 | d2 | e | g1 | g2,
    "3": a1 | a2 | b | c | d1 | d2 | g2,
    "4": b | c | f | g1 | g2,
    "5": a1 | a2 | c | d1 | d2 | f | g1 | g2,
    "6": a1 | a2 | c | d1 | d2 | e | f | g1 | g2,
    "7": a1 | a2 | b | c,
    "8": a1 | a2 | b | c | d1 | d2 | e | f | g1 | g2,
    "9": a1 | a2 | b | c | f | g1 | g2,
    A: e | f | a1 | a2 | b | c | g1 | g2,
    B: a1 | a2 | b | c | d1 | d2 | g2 | i | l,
    C: a1 | a2 | f | e | d1 | d2,
    D: a1 | a2 | b | c | d1 | d2 | i | l,
    E: a1 | a2 | f | e | d1 | d2 | g1 | g2,
    F: a1 | a2 | e | f | g1,
    G: a1 | a2 | c | d1 | d2 | e | f | g2,
    H: b | c | e | f | g1 | g2,
    I: a1 | a2 | d1 | d2 | i | l,
    J: b | c | d1 | d2 | e,
    K: e | f | g1 | j | k,
    L: d1 | d2 | e | f,
    M: b | c | e | f | h | j,
    N: b | c | e | f | h | k,
    O: a1 | a2 | b | c | d1 | d2 | e | f,
    P: a1 | a2 | b | e | f | g1 | g2,
    Q: a1 | a2 | b | c | d1 | d2 | e | f | k,
    R: a1 | a2 | b | e | f | g1 | g2 | k,
    S: a1 | a2 | c | d1 | d2 | f | g1 | g2,
    T: a1 | a2 | i | l,
    U: b | c | d1 | d2 | e | f,
    V: e | f | j | m,
    W: b | c | e | f | k | m,
    X: h | j | k | m,
    Y: b | f | g1 | g2 | l,
    Z: a1 | a2 | d1 | d2 | j | m,
    "-": g1 | g2,
    "?": a1 | a2 | b | g2 | l,
    "+": g1 | g2 | i | l,
    "*": g1 | g2 | h | i | j | k | l | m,
  };
})();

/**
 * Element array for managing display elements
 */
class ElementArray {
  elements: number[] = [];
  private nullMask = 0x10;

  constructor(count: number) {
    this.setCount(count);
  }

  setCount(count: number): void {
    const c = parseInt(String(count), 10);
    if (isNaN(c)) {
      throw new Error("Invalid element count: " + count);
    }
    this.elements = [];
    for (let i = 0; i < c; i++) {
      this.elements[i] = 0;
    }
  }

  setText(value: string | null): void {
    if (value === null) {
      value = "";
    }
    value = value.toString();

    // Clear elements
    for (let i = 0; i < this.elements.length; i++) {
      this.elements[i] = 0;
    }

    if (value.length === 0) {
      return;
    }

    // Set bitmask for each character
    for (let e = 0; e < this.elements.length && e < value.length; e++) {
      const c = value[e];
      let mask = CHARACTER_MASKS[c] ?? CHARACTER_MASKS[c.toUpperCase()];
      if (mask === null || mask === undefined) {
        mask = this.nullMask;
      }
      this.elements[e] = parseInt(String(mask), 10);
    }
  }
}

/**
 * 16-segment display renderer
 */
class SixteenSegment {
  private elementArray: ElementArray;
  private segmentWidth: number;
  private segmentInterval: number;
  private bevelWidth = 0.01;
  private sideBevelEnabled = true;
  private strokeLight: string | number | number[];
  private strokeWidth: number;
  private padding: number;
  private spacing: number;
  private elementWidth: number;
  private elementHeight: number;
  private fillLight = "red";
  private fillDark = "cyan";
  private strokeDark = "black";
  private x = 0;
  private y = 0;
  private elementCount: number;
  private width: number;
  private height: number;
  private canvas: Canvas2DContext;
  private points: Point[][] = [];

  constructor(
    count: number,
    canvas: Canvas2DContext,
    width: number,
    height: number,
    _x: number,
    _y: number,
    options: LCDOptions,
  ) {
    this.elementArray = new ElementArray(count);
    this.elementCount = count;
    this.canvas = canvas;
    this.width = width;
    this.height = height;

    this.segmentWidth = options.segmentWidth ?? 0.06;
    this.segmentInterval = options.segmentInterval ?? 0.11;
    this.strokeLight = options.color ?? "white";
    this.strokeWidth = options.strokeWidth ?? 0.11;
    this.padding = options.elementPadding ?? 2;
    this.spacing = options.elementSpacing ?? 4;

    this.elementWidth = (width - this.spacing * count) / count;
    this.elementHeight = height - this.padding * 2;

    this.calcPoints();
  }

  setOptions(options: LCDOptions): void {
    if (options.elements) {
      this.elementArray.setCount(options.elements);
    }

    this.segmentWidth = options.segmentWidth ?? this.segmentWidth;
    this.segmentInterval = options.segmentInterval ?? this.segmentInterval;
    this.strokeLight = options.color ?? this.strokeLight;
    this.strokeWidth = options.strokeWidth ?? this.strokeWidth;
    this.padding = options.elementPadding ?? this.padding;
    this.spacing = options.elementSpacing ?? this.spacing;

    this.elementWidth =
      (this.width - this.spacing * this.elementCount) / this.elementCount;
    this.elementHeight = this.height - this.padding * 2;
  }

  displayText(value: string): void {
    this.elementArray.setText(value);
    this.calcPoints();
    this.draw(this.canvas, this.elementArray.elements);
  }

  private calcElementDimensions(): { width: number; height: number } {
    let h = this.elementHeight;
    h -= this.padding * 2;

    let w = this.width;
    w -= this.spacing * (this.elementCount - 1);
    w -= this.padding * 2;
    w /= this.elementCount;

    return { width: w, height: h };
  }

  private flipVertical(points: Point[], height: number): Point[] {
    return points.map((p) => ({ x: p.x, y: height - p.y }));
  }

  private flipHorizontal(points: Point[], width: number): Point[] {
    return points.map((p) => ({ x: width - p.x, y: p.y }));
  }

  private draw(context: Canvas2DContext, elements: number[]): void {
    context.clearRect(this.x, this.y, this.width, this.height);
    context.save();

    const elementWidth = this.calcElementDimensions().width;

    context.translate(this.x, this.y);
    context.translate(this.padding, this.padding);

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      for (let s = 0; s < this.points.length; s++) {
        const color = element & (1 << s) ? this.fillLight : this.fillDark;
        const stroke = element & (1 << s) ? this.strokeLight : this.strokeDark;
        if (stroke === this.strokeDark) continue;

        context.lineWidth = this.strokeWidth;
        context.strokeStyle = stroke;
        context.fillStyle = color;
        context.moveTo(0, 0);
        context.beginPath();
        context.moveTo(this.points[s][0].x, this.points[s][0].y);

        for (let p = 1; p < this.points[s].length; p++) {
          context.lineTo(
            Math.round(this.points[s][p].x),
            Math.round(this.points[s][p].y),
          );
        }

        context.closePath();
        context.fill();
        context.stroke();
        if (this.strokeWidth > 0) {
          context.stroke();
        }
      }
      context.translate(elementWidth + this.spacing, 0);
    }
    context.restore();
  }

  private calcPoints(): void {
    const w = this.elementWidth;
    const h = this.elementHeight;
    const sw = this.segmentWidth * w;
    const si = this.segmentInterval * w;
    const bw = this.bevelWidth * sw;
    const ib = this.sideBevelEnabled ? 1 : 0;
    const sqrt2 = Math.SQRT2;
    const sqrt3 = Math.sqrt(3);

    // Base positions
    const w0 = w / 2 - sw / 2;
    const h0 = 0;
    const w1 = w / 2;
    const h1 = sw / 2;
    const w2 = w / 2 + sw / 2;
    const h2 = sw;
    const w3 = w - sw;
    const h3 = h / 2 - sw / 2;
    const w4 = w - sw / 2;
    const h4 = h / 2;
    const w5 = w;
    const h5 = h / 2 + sw / 2;
    const sf = sw * 0.8;
    const slope = h / w;

    // Segment indices
    const A1 = 0,
      A2 = 1,
      B = 2,
      C = 3,
      D1 = 4,
      D2 = 5,
      E = 6,
      F = 7;
    const G1 = 8,
      G2 = 9,
      H = 10,
      I = 11,
      J = 12,
      K = 13,
      L = 14,
      M = 15;

    const points: Point[][] = [];

    points[A1] = [
      { x: bw * 2 + si / sqrt2, y: h0 },
      { x: w1 - si / 2 - (sw / 2) * ib, y: h0 },
      { x: w1 - si / 2, y: h1 },
      { x: w0 - si / 2, y: h2 },
      { x: sw + si / sqrt2, y: h2 },
      { x: bw + si / sqrt2, y: h0 + bw },
    ];

    points[G2] = [
      { x: w2 + si / sqrt2, y: h3 },
      { x: w3 - (si / 2) * sqrt3, y: h3 },
      { x: w4 - (si / 2) * sqrt3, y: h4 },
      { x: w3 - (si / 2) * sqrt3, y: h5 },
      { x: w2 + si / sqrt2, y: h5 },
      { x: w1 + si / sqrt2, y: h4 },
    ];

    points[B] = [
      { x: w5, y: h0 + bw * 2 + si / sqrt2 },
      { x: w5, y: h4 - si / 2 - (sw / 2) * ib },
      { x: w4, y: h4 - si / 2 },
      { x: w3, y: h3 - si / 2 },
      { x: w3, y: h2 + si / sqrt2 },
      { x: w5 - bw, y: h0 + bw + si / sqrt2 },
    ];

    points[I] = [
      { x: w2, y: h2 + (si / 2) * sqrt3 },
      { x: w2, y: h3 - si / sqrt2 },
      { x: w1, y: h4 - si / sqrt2 },
      { x: w0, y: h3 - si / sqrt2 },
      { x: w0, y: h2 + (si / 2) * sqrt3 },
      { x: w1, y: h1 + (si / 2) * sqrt3 },
    ];

    points[H] = [
      { x: (sw + sf) / slope + si, y: h2 + si },
      { x: w0 - si, y: w0 * slope - sf - si },
      { x: w0 - si, y: h3 - si },
      { x: (h3 - sf) / slope - si, y: h3 - si },
      { x: sw + si, y: h2 * slope + sf + si },
      { x: sw + si, y: h2 + si },
    ];

    points[A2] = this.flipHorizontal(points[A1], w);
    points[C] = this.flipVertical(points[B], h);
    points[D1] = this.flipVertical(points[A1], h);
    points[D2] = this.flipHorizontal(points[D1], w);
    points[E] = this.flipHorizontal(points[C], w);
    points[F] = this.flipHorizontal(points[B], w);
    points[G1] = this.flipHorizontal(points[G2], w);
    points[J] = this.flipHorizontal(points[H], w);
    points[K] = this.flipVertical(points[J], h);
    points[L] = this.flipVertical(points[I], h);
    points[M] = this.flipVertical(points[H], h);

    this.points = points;
  }
}

/**
 * LCD - 16-segment LED display widget
 *
 * Displays characters using a 16-segment display style,
 * similar to digital LCD/LED displays.
 *
 * @example
 * ```ts
 * const lcd = new LCD({
 *   parent: screen,
 *   width: 30,
 *   height: 12,
 *   label: 'Counter',
 *   elements: 5,
 *   display: 12345,
 *   color: 'green'
 * });
 *
 * // Update display
 * lcd.setDisplay('HELLO');
 * ```
 */
export class LCD extends CanvasWidget {
  override type = "lcd";
  declare options: LCDOptions;
  private segment16: SixteenSegment | null = null;

  constructor(options: LCDOptions = {}) {
    super(options, DrawilleCanvas);

    this.options = options;
    this.options.segmentWidth = options.segmentWidth ?? 0.06;
    this.options.segmentInterval = options.segmentInterval ?? 0.11;
    this.options.strokeWidth = options.strokeWidth ?? 0.11;
    this.options.elements = options.elements ?? 3;
    this.options.display = options.display ?? 321;
    this.options.elementSpacing = options.elementSpacing ?? 4;
    this.options.elementPadding = options.elementPadding ?? 2;
    this.options.color = options.color ?? "white";

    this.on("attach", () => {
      const display = String(this.options.display ?? 1234);
      if (!this.segment16) {
        this.segment16 = new SixteenSegment(
          this.options.elements!,
          this.ctx!,
          this.canvasSize.width,
          this.canvasSize.height,
          0,
          0,
          this.options,
        );
      }
      this.setDisplay(display);
    });
  }

  override calcSize(): void {
    this.canvasSize = {
      width: this.width * 2 - 8,
      height: this.height * 4 - 12,
    };
  }

  override setData(data: unknown): void {
    this.setDisplay(String(data));
  }

  /**
   * Set the display text
   */
  setDisplay(display: string | number): void {
    if (!this.ctx) {
      throw new Error(
        "Canvas context does not exist. setDisplay() must be called after the widget has been added to the screen via screen.append()",
      );
    }

    this.ctx.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);
    this.segment16?.displayText(String(display));
  }

  /**
   * Update LCD options
   */
  setOptions(options: LCDOptions): void {
    this.segment16?.setOptions(options);
  }

  /**
   * Increase segment width
   */
  increaseWidth(): void {
    if (this.segment16) {
      this.options.segmentWidth = (this.options.segmentWidth ?? 0.06) + 0.01;
      this.segment16.setOptions(this.options);
    }
  }

  /**
   * Decrease segment width
   */
  decreaseWidth(): void {
    if (this.segment16) {
      this.options.segmentWidth = (this.options.segmentWidth ?? 0.06) - 0.01;
      this.segment16.setOptions(this.options);
    }
  }

  /**
   * Increase segment interval
   */
  increaseInterval(): void {
    if (this.segment16) {
      this.options.segmentInterval =
        (this.options.segmentInterval ?? 0.11) + 0.01;
      this.segment16.setOptions(this.options);
    }
  }

  /**
   * Decrease segment interval
   */
  decreaseInterval(): void {
    if (this.segment16) {
      this.options.segmentInterval =
        (this.options.segmentInterval ?? 0.11) - 0.01;
      this.segment16.setOptions(this.options);
    }
  }

  /**
   * Increase stroke width
   */
  increaseStroke(): void {
    if (this.segment16) {
      this.options.strokeWidth = (this.options.strokeWidth ?? 0.11) + 0.05;
      this.segment16.setOptions(this.options);
    }
  }

  /**
   * Decrease stroke width
   */
  decreaseStroke(): void {
    if (this.segment16) {
      this.options.strokeWidth = (this.options.strokeWidth ?? 0.11) - 0.05;
      this.segment16.setOptions(this.options);
    }
  }

  /**
   * Get options prototype (for blessed-contrib compatibility)
   */
  getOptionsPrototype(): LCDOptions {
    return {
      label: "LCD Test",
      segmentWidth: 0.06,
      segmentInterval: 0.11,
      strokeWidth: 0.1,
      elements: 5,
      display: 3210,
      elementSpacing: 4,
      elementPadding: 2,
    };
  }
}

export default LCD;
