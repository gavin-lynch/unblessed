#!/usr/bin/env tsx
/**
 * Simple Canvas Demo - Test basic canvas widget functionality
 * 
 * This is a minimal test to verify the canvas widget works at all.
 */

import { CanvasWidget } from "../src/widgets/canvas.js";
import { Box } from "../src/widgets/box.js";
import { setRuntime } from "../src/index.js";
import * as fs from "fs";
import * as path from "path";
import * as process from "process";
import { EventEmitter } from "events";
import { Buffer } from "buffer";
import * as util from "util";
import * as url from "url";
import { Readable, Writable } from "stream";
import { StringDecoder } from "string_decoder";
import * as tty from "tty";
import type { Runtime } from "../src/runtime-context.js";
import { Screen } from "../src/widgets/screen.js";

// Create a simple NodeRuntime
class NodeRuntime implements Runtime {
  fs = fs;
  path = path;
  process = process;
  buffer = { Buffer };
  url = url;
  util = util;
  stream = { Readable, Writable };
  stringDecoder = { StringDecoder };
  events = { EventEmitter };
  images = { PNG: null as any, GifReader: null as any };
  processes = { childProcess: null as any };
  networking = { net: null as any, tty };
}

// Initialize runtime
const runtime = new NodeRuntime();
setRuntime(runtime);

// Create screen
const screen = new Screen({ smartCSR: true });

// Create a container box with explicit dimensions
const container = new Box({
  parent: screen,
  top: 2,
  left: 2,
  width: 60,
  height: 20,
  border: { type: 'line' },
  label: ' Canvas Test '
});

// Create canvas widget - account for border padding
// Container has border, so we need to account for it
const canvas = new CanvasWidget({
  parent: container,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
});

// Force append to ensure it's attached
container.append(canvas);

// Draw on canvas when ready
const drawOnCanvas = () => {
  if (!canvas.isReady || !canvas.ctx) {
    return false;
  }
  
  // Clear canvas first
  canvas.ctx.clearRect(0, 0, canvas.canvasSize.width, canvas.canvasSize.height);
  
  // Draw a simple filled rectangle that should be very visible
  canvas.ctx.fillStyle = 'blue';
  canvas.ctx.fillRect(5, 5, canvas.canvasSize.width - 10, canvas.canvasSize.height - 10);
  
  // Draw a smaller rectangle inside
  canvas.ctx.fillStyle = 'yellow';
  canvas.ctx.fillRect(15, 15, canvas.canvasSize.width - 30, canvas.canvasSize.height - 30);
  
  // Draw a diagonal line
  canvas.ctx.strokeStyle = 'green';
  canvas.ctx.lineWidth = 2;
  canvas.ctx.beginPath();
  canvas.ctx.moveTo(20, 20);
  canvas.ctx.lineTo(canvas.canvasSize.width - 20, canvas.canvasSize.height - 20);
  canvas.ctx.stroke();
  
  return true;
};

// Listen for attach event
canvas.on('attach', () => {
  drawOnCanvas();
  // Screen render will call canvas.render() which converts canvas to content
  screen.render();
});

// Try drawing after delays to ensure canvas is ready
setTimeout(() => {
  if (drawOnCanvas()) {
    screen.render();
  }
}, 100);

setTimeout(() => {
  if (drawOnCanvas()) {
    screen.render();
  }
}, 500);

screen.key(['q', 'C-c'], () => {
  screen.destroy();
  process.exit(0);
});

screen.render();
