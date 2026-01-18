/**
 * context2d.ts - Canvas 2D rendering context
 *
 * Provides an HTML5 Canvas-like API for terminal rendering.
 * Supports transformation matrices, paths, and basic drawing operations.
 *
 * Based on:
 * - https://github.com/madbence/node-drawille-canvas
 * - https://github.com/yaronn/drawille-canvas-blessed-contrib
 */

import { DrawilleCanvas, type CanvasColor } from "./drawille.js";
import { AnsiTermCanvas } from "./ansi-term.js";

/**
 * Bresenham's line algorithm
 * Yields all points along a line from (x0,y0) to (x1,y1)
 */
function* bresenham(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): Generator<{ x: number; y: number }> {
  x0 = Math.floor(x0);
  y0 = Math.floor(y0);
  x1 = Math.floor(x1);
  y1 = Math.floor(y1);

  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    yield { x: x0, y: y0 };

    if (x0 === x1 && y0 === y1) break;

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
}

/**
 * Simple 2D transformation matrix (3x3 stored as 6 values)
 * | a c e |
 * | b d f |
 * | 0 0 1 |
 */
interface Matrix2D {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

function createIdentityMatrix(): Matrix2D {
  return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
}

function cloneMatrix(m: Matrix2D): Matrix2D {
  return { ...m };
}

function multiplyMatrices(m1: Matrix2D, m2: Matrix2D): Matrix2D {
  return {
    a: m1.a * m2.a + m1.c * m2.b,
    b: m1.b * m2.a + m1.d * m2.b,
    c: m1.a * m2.c + m1.c * m2.d,
    d: m1.b * m2.c + m1.d * m2.d,
    e: m1.a * m2.e + m1.c * m2.f + m1.e,
    f: m1.b * m2.e + m1.d * m2.f + m1.f,
  };
}

function transformPoint(m: Matrix2D, x: number, y: number): [number, number] {
  return [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f];
}

/**
 * Path point with stroke flag
 */
interface PathPoint {
  point: [number, number];
  stroke: boolean;
}

/**
 * Inner canvas type - either DrawilleCanvas or AnsiTermCanvas
 */
export type InnerCanvas = DrawilleCanvas | AnsiTermCanvas;

/**
 * Canvas constructor type
 */
export type CanvasConstructor = new (
  width: number,
  height: number,
) => InnerCanvas;

/**
 * Canvas2DContext - HTML5 Canvas-like rendering context for terminals
 *
 * Provides standard canvas operations like:
 * - Path drawing (beginPath, moveTo, lineTo, stroke)
 * - Filled rectangles (fillRect, clearRect)
 * - Text rendering (fillText, measureText)
 * - Transformations (translate, rotate, scale, save, restore)
 *
 * @example
 * ```ts
 * const ctx = canvas.getContext();
 *
 * ctx.strokeStyle = 'yellow';
 * ctx.beginPath();
 * ctx.moveTo(0, 0);
 * ctx.lineTo(100, 50);
 * ctx.stroke();
 *
 * ctx.fillStyle = 'green';
 * ctx.fillText('Hello', 10, 20);
 * ```
 */
export class Canvas2DContext {
  /** The underlying canvas buffer */
  readonly _canvas: InnerCanvas;

  /** Alias for compatibility */
  get canvas(): InnerCanvas {
    return this._canvas;
  }

  /** Current transformation matrix */
  private _matrix: Matrix2D;

  /** Matrix stack for save/restore */
  private _stack: Matrix2D[];

  /** Current path */
  private _currentPath: PathPoint[];

  /** Line width (0 = no stroke) */
  lineWidth: number = 1;

  constructor(
    width: number,
    height: number,
    CanvasClass: CanvasConstructor = DrawilleCanvas,
  ) {
    this._canvas = new CanvasClass(width, height);
    this._matrix = createIdentityMatrix();
    this._stack = [];
    this._currentPath = [];
  }

  // ==================== Style Properties ====================

  /**
   * Set fill style (foreground color for text)
   */
  set fillStyle(val: CanvasColor) {
    this._canvas.fontFg = val;
  }

  get fillStyle(): CanvasColor {
    return this._canvas.fontFg;
  }

  /**
   * Set stroke style (color for lines and shapes)
   */
  set strokeStyle(val: CanvasColor) {
    this._canvas.color = val;
  }

  get strokeStyle(): CanvasColor {
    return this._canvas.color;
  }

  // ==================== Transformation Methods ====================

  /**
   * Save the current transformation matrix
   */
  save(): void {
    this._stack.push(cloneMatrix(this._matrix));
  }

  /**
   * Restore the previously saved transformation matrix
   */
  restore(): void {
    const top = this._stack.pop();
    if (top) {
      this._matrix = top;
    }
  }

  /**
   * Translate the canvas origin
   */
  translate(x: number, y: number): void {
    this._matrix = multiplyMatrices(this._matrix, {
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      e: x,
      f: y,
    });
  }

  /**
   * Rotate the canvas (angle in radians)
   */
  rotate(angle: number): void {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    this._matrix = multiplyMatrices(this._matrix, {
      a: cos,
      b: sin,
      c: -sin,
      d: cos,
      e: 0,
      f: 0,
    });
  }

  /**
   * Scale the canvas
   */
  scale(x: number, y: number): void {
    this._matrix = multiplyMatrices(this._matrix, {
      a: x,
      b: 0,
      c: 0,
      d: y,
      e: 0,
      f: 0,
    });
  }

  /**
   * Apply a transformation matrix
   */
  transform(
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
  ): void {
    this._matrix = multiplyMatrices(this._matrix, { a, b, c, d, e, f });
  }

  /**
   * Set the transformation matrix directly
   */
  setTransform(
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
  ): void {
    this._matrix = { a, b, c, d, e, f };
  }

  /**
   * Reset the transformation matrix to identity
   */
  resetTransform(): void {
    this._matrix = createIdentityMatrix();
  }

  // ==================== Path Methods ====================

  /**
   * Begin a new path
   */
  beginPath(): void {
    this._currentPath = [];
  }

  /**
   * Close the current path
   */
  closePath(): void {
    // Connect back to start if we have points
    if (this._currentPath.length > 0) {
      const start = this._currentPath[0];
      this._currentPath.push({
        point: start.point,
        stroke: true,
      });
    }
  }

  /**
   * Move to a point without drawing
   */
  moveTo(x: number, y: number): void {
    const [tx, ty] = transformPoint(this._matrix, x, y);
    this._currentPath.push({
      point: [Math.floor(tx), Math.floor(ty)],
      stroke: false,
    });
  }

  /**
   * Draw a line to a point
   */
  lineTo(x: number, y: number): void {
    const [tx, ty] = transformPoint(this._matrix, x, y);
    this._currentPath.push({
      point: [Math.floor(tx), Math.floor(ty)],
      stroke: true,
    });
  }

  /**
   * Stroke the current path
   */
  stroke(): void {
    if (this.lineWidth === 0) return;

    for (let i = 0; i < this._currentPath.length - 1; i++) {
      const cur = this._currentPath[i];
      const nex = this._currentPath[i + 1];

      if (nex.stroke) {
        for (const { x, y } of bresenham(
          cur.point[0],
          cur.point[1],
          nex.point[0],
          nex.point[1],
        )) {
          this._canvas.set(x, y);
        }
      }
    }
  }

  /**
   * Fill the current path (not fully implemented - uses stroke)
   */
  fill(): void {
    // For terminal rendering, fill is typically the same as stroke
    this.stroke();
  }

  // ==================== Rectangle Methods ====================

  /**
   * Fill a rectangle with filled pixels
   */
  fillRect(x: number, y: number, w: number, h: number): void {
    this._fillQuad(x, y, w, h, (px, py) => this._canvas.set(px, py));
  }

  /**
   * Clear a rectangle (unset pixels)
   */
  clearRect(x: number, y: number, w: number, h: number): void {
    this._fillQuad(x, y, w, h, (px, py) => this._canvas.unset(px, py));
  }

  /**
   * Stroke a rectangle outline
   */
  strokeRect(x: number, y: number, w: number, h: number): void {
    this.beginPath();
    this.rect(x, y, w, h);
    this.stroke();
  }

  /**
   * Add a rectangle to the current path
   */
  rect(x: number, y: number, w: number, h: number): void {
    this.moveTo(x, y);
    this.lineTo(x + w, y);
    this.lineTo(x + w, y + h);
    this.lineTo(x, y + h);
    this.closePath();
  }

  /**
   * Fill a quad with transformation applied
   */
  private _fillQuad(
    x: number,
    y: number,
    w: number,
    h: number,
    fn: (x: number, y: number) => void,
  ): void {
    // Transform corners
    const p1 = transformPoint(this._matrix, x, y);
    const p2 = transformPoint(this._matrix, x + w, y);
    const p3 = transformPoint(this._matrix, x, y + h);
    const p4 = transformPoint(this._matrix, x + w, y + h);

    // Fill both triangles
    this._fillTriangle(p1, p2, p3, fn);
    this._fillTriangle(p3, p2, p4, fn);
  }

  /**
   * Fill a triangle using scanline algorithm
   */
  private _fillTriangle(
    pa: [number, number],
    pb: [number, number],
    pc: [number, number],
    fn: (x: number, y: number) => void,
  ): void {
    // Get all edge points
    const a = Array.from(bresenham(pb[0], pb[1], pc[0], pc[1]));
    const b = Array.from(bresenham(pa[0], pa[1], pc[0], pc[1]));
    const c = Array.from(bresenham(pa[0], pa[1], pb[0], pb[1]));

    // Combine and sort by Y, then X
    const points = [...a, ...b, ...c].sort((a, b) => {
      if (a.y === b.y) return a.x - b.x;
      return a.y - b.y;
    });

    // Fill scanlines
    for (let i = 0; i < points.length - 1; i++) {
      const cur = points[i];
      const nex = points[i + 1];

      if (cur.y === nex.y) {
        for (let j = cur.x; j <= nex.x; j++) {
          fn(j, cur.y);
        }
      } else {
        fn(cur.x, cur.y);
      }
    }
  }

  // ==================== Text Methods ====================

  /**
   * Draw filled text
   */
  fillText(str: string, x: number, y: number): void {
    const [tx, ty] = transformPoint(this._matrix, x, y);
    this._canvas.writeText(str, Math.floor(tx), Math.floor(ty));
  }

  /**
   * Draw stroked text (same as fillText for terminal)
   */
  strokeText(str: string, x: number, y: number): void {
    this.fillText(str, x, y);
  }

  /**
   * Measure text width
   */
  measureText(str: string): { width: number } {
    return this._canvas.measureText(str);
  }

  // ==================== Arc/Curve Methods (Stubs) ====================

  /**
   * Draw an arc (stub - not fully implemented)
   */
  arc(
    _x: number,
    _y: number,
    _radius: number,
    _startAngle: number,
    _endAngle: number,
    _counterclockwise?: boolean,
  ): void {
    // TODO: Implement arc drawing
  }

  /**
   * Draw an ellipse (stub - not fully implemented)
   */
  ellipse(
    _x: number,
    _y: number,
    _radiusX: number,
    _radiusY: number,
    _rotation: number,
    _startAngle: number,
    _endAngle: number,
    _counterclockwise?: boolean,
  ): void {
    // TODO: Implement ellipse drawing
  }

  /**
   * Draw a quadratic curve (stub)
   */
  quadraticCurveTo(
    _cpx: number,
    _cpy: number,
    _x: number,
    _y: number,
  ): void {
    // TODO: Implement quadratic curves
  }

  /**
   * Draw a bezier curve (stub)
   */
  bezierCurveTo(
    _cp1x: number,
    _cp1y: number,
    _cp2x: number,
    _cp2y: number,
    _x: number,
    _y: number,
  ): void {
    // TODO: Implement bezier curves
  }

  /**
   * Draw an arc to a point (stub)
   */
  arcTo(
    _x1: number,
    _y1: number,
    _x2: number,
    _y2: number,
    _radius: number,
  ): void {
    // TODO: Implement arcTo
  }

  // ==================== Other Methods (Stubs) ====================

  clip(): void {}
  isPointInPath(_x: number, _y: number): boolean {
    return false;
  }
  isPointInStroke(_x: number, _y: number): boolean {
    return false;
  }
  drawFocusIfNeeded(_element: unknown): void {}
  createLinearGradient(
    _x0: number,
    _y0: number,
    _x1: number,
    _y1: number,
  ): unknown {
    return {};
  }
  createRadialGradient(
    _x0: number,
    _y0: number,
    _r0: number,
    _x1: number,
    _y1: number,
    _r1: number,
  ): unknown {
    return {};
  }
  createPattern(_image: unknown, _repetition: string): unknown {
    return {};
  }
  drawImage(_image: unknown, ..._args: number[]): void {}
  createImageData(_width: number, _height?: number): unknown {
    return {};
  }
  getImageData(
    _sx: number,
    _sy: number,
    _sw: number,
    _sh: number,
  ): unknown {
    return {};
  }
  putImageData(
    _imageData: unknown,
    _dx: number,
    _dy: number,
    ..._args: number[]
  ): void {}
  getContextAttributes(): unknown {
    return {};
  }
  setLineDash(_segments: number[]): void {}
  getLineDash(): number[] {
    return [];
  }
}

export default Canvas2DContext;
