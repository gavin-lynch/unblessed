# Canvas Rendering System

The `@gavin-lynch/unblessed-core` canvas system provides terminal-based rendering with an HTML5 Canvas-like API. It supports two rendering modes optimized for different use cases.

## What is This? (Virtual Canvas)

**This is NOT a real HTML5 Canvas** - it's a **virtual canvas** that mimics the HTML5 Canvas API surface, but renders to **terminal characters** instead of pixels.

### Key Differences from HTML5 Canvas:

| HTML5 Canvas                      | @unblessed Canvas                            |
| --------------------------------- | -------------------------------------------- |
| Renders to `<canvas>` DOM element | Renders to terminal characters (ANSI)        |
| Pixel-based (1:1 mapping)         | Character-based (2×4 or 1×1 pixels per char) |
| Browser environment               | Terminal environment                         |
| Real graphics context             | Virtual graphics context                     |

### How It Works:

1. **You write code** using the same API as HTML5 Canvas (`fillRect()`, `stroke()`, `beginPath()`, etc.)
2. **The canvas** stores your drawing commands in an internal buffer
3. **On `frame()`**, it converts the buffer to:
   - **Braille characters** (Unicode U+2800-U+28FF) for high-res graphics
   - **ANSI escape codes** for colors and text
4. **The terminal** displays the resulting string as graphics

### Is This How blessed-contrib Worked?

**Yes, exactly!** The original `blessed-contrib` library used:

- [`drawille-canvas-blessed-contrib`](https://github.com/yaronn/drawille-canvas-blessed-contrib) - which provided the same HTML5 Canvas-like API
- [`node-drawille`](https://github.com/madbence/node-drawille) - for the braille character rendering

We've reimplemented this system in `@gavin-lynch/unblessed-core` to be:

- ✅ Platform-agnostic (works in Node.js and browsers)
- ✅ TypeScript-first with full type safety
- ✅ Better integrated with the unblessed architecture

**Example from blessed-contrib:**

```javascript
// blessed-contrib (original)
var Canvas = require("blessed-contrib").canvas;
var canvas = new Canvas(options);
canvas.ctx.fillRect(10, 10, 20, 20);
```

**Same API in @unblessed:**

```typescript
// @unblessed (modern)
import { CanvasWidget } from "@gavin-lynch/unblessed-core";
class MyWidget extends CanvasWidget {
  draw() {
    this.ctx.fillRect(10, 10, 20, 20);
  }
}
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CanvasWidget (Box)                       │
│  - Widget that can be added to Screen                       │
│  - Manages lifecycle (attach, resize, render)               │
│  - Creates Canvas when dimensions are available             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ uses
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      Canvas (Wrapper)                       │
│  - High-level API for creating canvas instances             │
│  - Lazy initialization of Canvas2DContext                   │
│  - Provides frame() and clear() methods                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ creates
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   Canvas2DContext                           │
│  - HTML5 Canvas-like API (fillRect, stroke, fillText, etc.) │
│  - Transformation matrices (translate, rotate, scale)       │
│  - Path drawing (beginPath, moveTo, lineTo, stroke)         │
│  - Wraps InnerCanvas with high-level operations             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ wraps
                        ▼
        ┌───────────────────────────────┐
        │      InnerCanvas (Abstract)   │
        └───────────┬───────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐        ┌──────────────┐
│ DrawilleCanvas│        │AnsiTermCanvas│
│               │        │              │
│ - Braille     │        │ - Character  │
│ - 2x4 pixels  │        │ - 1x1 pixel  │
│ - High res    │        │ - Block fill │
│ - Lines/curves│        │ - Bar charts │
└───────────────┘        └──────────────┘
```

## Canvas Modes

### 1. DrawilleCanvas (Braille Mode)

**Resolution:** 2×4 pixels per character  
**Use Cases:** Line charts, maps, high-resolution graphics, smooth curves  
**Requirements:** Width must be multiple of 2, height must be multiple of 4

**How it works:**

- Uses Unicode braille characters (U+2800-U+28FF)
- Each braille character represents an 8-dot pattern in a 2×4 grid
- Provides 8× higher resolution than character-based rendering
- Perfect for drawing smooth lines, curves, and detailed graphics

**Example:**

```typescript
import { Canvas, DrawilleCanvas } from "@gavin-lynch/unblessed-core";

// Create a braille canvas (default)
const canvas = new Canvas(80, 48); // 80×48 pixels = 40×12 characters
const ctx = canvas.getContext();

// Draw a smooth line
ctx.strokeStyle = "yellow";
ctx.beginPath();
ctx.moveTo(0, 0);
ctx.lineTo(80, 48);
ctx.stroke();

// Output the frame
console.log(canvas.frame());
```

### 2. AnsiTermCanvas (Character Mode)

**Resolution:** 1×1 pixel per character  
**Use Cases:** Bar charts, block-based visualizations, solid fills  
**Requirements:** Any width/height

**How it works:**

- Each "pixel" is one terminal character cell
- Uses ANSI background colors for filled areas
- Perfect for bar charts where you need solid blocks
- More efficient for simple rectangular shapes

**Example:**

```typescript
import { Canvas, AnsiTermCanvas } from "@gavin-lynch/unblessed-core";

// Create a character canvas
const canvas = new Canvas(40, 12, AnsiTermCanvas);
const ctx = canvas.getContext();

// Draw a solid bar
ctx.strokeStyle = "blue";
ctx.fillRect(5, 2, 10, 8); // x, y, width, height

// Output the frame
console.log(canvas.frame());
```

## Usage in Widgets

### CanvasWidget Base Class

All canvas-based widgets extend `CanvasWidget`, which handles:

- Canvas creation when widget is attached
- Automatic content updates during render cycle
- Resize handling

**Example Widget:**

```typescript
import { CanvasWidget, DrawilleCanvas } from "@gavin-lynch/unblessed-core";

export class MyChart extends CanvasWidget {
  constructor(options = {}) {
    // Choose canvas mode: DrawilleCanvas (default) or AnsiTermCanvas
    super(options, DrawilleCanvas);

    this.on("attach", () => {
      // Canvas is ready, start drawing
      this.drawChart();
    });
  }

  override calcSize(): void {
    // Calculate canvas pixel dimensions
    // For DrawilleCanvas: width*2, height*4
    // For AnsiTermCanvas: width*1, height*1
    this.canvasSize = {
      width: this.width * 2 - 12,
      height: this.height * 4,
    };
  }

  private drawChart(): void {
    if (!this.ctx) return;

    const c = this.ctx;
    c.strokeStyle = "green";
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(100, 50);
    c.stroke();
  }
}
```

## Canvas2DContext API

The `Canvas2DContext` provides a familiar HTML5 Canvas API:

### Drawing Operations

```typescript
const ctx = canvas.getContext();

// Paths
ctx.beginPath();
ctx.moveTo(10, 10);
ctx.lineTo(50, 50);
ctx.stroke();

// Rectangles
ctx.fillRect(5, 5, 20, 10);
ctx.clearRect(10, 10, 5, 5);

// Text
ctx.fillStyle = "white";
ctx.fillText("Hello", 10, 20);
```

### Transformations

```typescript
ctx.save(); // Push current state
ctx.translate(10, 10); // Move origin
ctx.rotate(Math.PI / 4); // Rotate
ctx.scale(2, 2); // Scale
// ... draw ...
ctx.restore(); // Pop state
```

### Colors

```typescript
// Color names
ctx.strokeStyle = "red";
ctx.fillStyle = "blue";

// 256-color codes
ctx.strokeStyle = 196; // Bright red

// RGB arrays
ctx.fillStyle = [255, 0, 0]; // Red

// Text colors (for AnsiTermCanvas)
ctx._canvas.fontFg = "white";
ctx._canvas.fontBg = "blue";
```

### Compatibility Notes

- `Canvas2DContext.canvas` is writable to support canvas shims that wrap a real context.
- `stroke()` treats any `lineWidth > 0` as at least 1 pixel so thin strokes still render.
- `moveTo`/`lineTo` skip non-finite coordinates to avoid invalid path segments.

## Complete Example

```typescript
import { Screen } from "@gavin-lynch/unblessed-node";
import { CanvasWidget, DrawilleCanvas } from "@gavin-lynch/unblessed-core";

class SimpleChart extends CanvasWidget {
  constructor(options = {}) {
    super(options, DrawilleCanvas);

    this.on("attach", () => {
      this.draw();
    });
  }

  override calcSize(): void {
    this.canvasSize = {
      width: this.width * 2 - 12,
      height: this.height * 4,
    };
  }

  private draw(): void {
    if (!this.ctx) return;

    const c = this.ctx;
    const w = this.canvasSize.width;
    const h = this.canvasSize.height;

    // Draw axes
    c.strokeStyle = "white";
    c.beginPath();
    c.moveTo(10, 10);
    c.lineTo(10, h - 10);
    c.lineTo(w - 10, h - 10);
    c.stroke();

    // Draw data line
    c.strokeStyle = "green";
    c.beginPath();
    c.moveTo(10, h - 10);
    for (let i = 0; i < 10; i++) {
      const x = 10 + (i * (w - 20)) / 10;
      const y = h - 10 - Math.random() * (h - 20);
      c.lineTo(x, y);
    }
    c.stroke();
  }
}

const screen = new Screen({ smartCSR: true });
const chart = new SimpleChart({
  parent: screen,
  width: "50%",
  height: "50%",
  border: { type: "line" },
});

screen.append(chart);
screen.render();
```

## When to Use Each Mode

### Use DrawilleCanvas when:

- ✅ Drawing smooth lines and curves (line charts, maps)
- ✅ Need high resolution (2×4 pixels per character)
- ✅ Drawing complex shapes
- ✅ Widgets: Line, Map, LCD, Donut, Sparkline

### Use AnsiTermCanvas when:

- ✅ Drawing solid bars (bar charts)
- ✅ Simple rectangular fills
- ✅ Block-based visualizations
- ✅ Widgets: Bar, StackedBar, Gauge, GaugeList

## Technical Details

### DrawilleCanvas Pixel Mapping

Each braille character represents 8 dots in a 2×4 grid:

```
Dot positions:
1 4
2 5
3 6
7 8

Bit mapping:
0x01 0x08  (top row)
0x02 0x10  (second row)
0x04 0x20  (third row)
0x40 0x80  (bottom row)
```

### AnsiTermCanvas Character Mapping

Each character cell is one "pixel":

- Empty cells: `null` or space
- Filled cells: ANSI background color + space character
- Text cells: ANSI foreground/background + character

### Frame Generation

Both canvas types provide a `frame()` method that:

1. Converts internal buffer to ANSI-encoded string
2. Adds line delimiters
3. Returns ready-to-display terminal output

The `CanvasWidget.render()` method automatically:

1. Calls `canvas.frame()` to get latest content
2. Truncates lines to fit widget width
3. Sets widget content for display
