import type { RenderObserver } from "@unblessed/core";
import { setRenderObserver } from "@unblessed/core";

export interface RenderPerfObserverOptions {
  maxSamples?: number;
  targetFps?: number;
}

export interface RenderPerfStats {
  count: number;
  renderAvgMs: number;
  outputAvgMs: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  fpsAvg: number;
  dropped: number;
  bytesWritten: number;
  bytesPerFrame: number;
  bytesPerSec: number;
  flushCount: number;
  flushAvg: number;
}

function nowMs(): number {
  if (
    typeof performance !== "undefined" &&
    typeof performance.now === "function"
  ) {
    return performance.now();
  }

  if (typeof process !== "undefined" && typeof process.hrtime === "function") {
    const [seconds, nanoseconds] = process.hrtime();
    return seconds * 1000 + nanoseconds / 1e6;
  }

  return Date.now();
}

function percentile(samples: number[], p: number): number {
  if (samples.length === 0) return 0;
  const sorted = [...samples].sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.floor((p / 100) * (sorted.length - 1))),
  );
  return sorted[index];
}

export class RenderPerfObserver implements RenderObserver {
  private readonly maxSamples: number;
  private readonly targetFrameMs: number;
  private samples: number[] = [];
  private sampleIndex = 0;
  private totalMs = 0;
  private totalRenderMs = 0;
  private totalOutputMs = 0;
  private minMs = Number.POSITIVE_INFINITY;
  private maxMs = 0;
  private dropped = 0;
  private count = 0;
  private bytesWritten = 0;
  private bytesThisFrame = 0;
  private flushCount = 0;
  private flushThisFrame = 0;
  private frameStart: number | null = null;
  private renderStartTime: number | null = null;
  private renderEndTime: number | null = null;
  private outputFirstTime: number | null = null;
  private outputLastTime: number | null = null;

  constructor(options: RenderPerfObserverOptions = {}) {
    this.maxSamples = options.maxSamples ?? 300;
    this.targetFrameMs = 1000 / (options.targetFps ?? 60);
  }

  renderStart(_screen?: unknown, tMs?: number): void {
    const start = tMs ?? nowMs();
    this.frameStart = start;
    this.renderStartTime = start;
    this.renderEndTime = null;
    this.outputFirstTime = null;
    this.outputLastTime = null;
    this.bytesThisFrame = 0;
    this.flushThisFrame = 0;
  }

  renderEnd(_screen?: unknown, tMs?: number): void {
    if (this.frameStart === null) return;
    const end = tMs ?? nowMs();
    const duration = end - this.frameStart;
    this.frameStart = null;
    this.renderEndTime = end;
    this.bytesWritten += this.bytesThisFrame;

    if (this.samples.length < this.maxSamples) {
      this.samples.push(duration);
    } else {
      this.samples[this.sampleIndex] = duration;
      this.sampleIndex = (this.sampleIndex + 1) % this.maxSamples;
    }

    this.count += 1;
    this.totalMs += duration;
    this.minMs = Math.min(this.minMs, duration);
    this.maxMs = Math.max(this.maxMs, duration);

    if (this.renderStartTime !== null && this.renderEndTime !== null) {
      this.totalRenderMs += this.renderEndTime - this.renderStartTime;
    }

    if (this.outputFirstTime !== null && this.outputLastTime !== null) {
      this.totalOutputMs += this.outputLastTime - this.outputFirstTime;
    }

    if (duration > this.targetFrameMs) {
      this.dropped += 1;
    }
  }

  outputFlush(bytes: number, tMs?: number): void {
    if (this.frameStart === null) return;
    const ts = tMs ?? nowMs();
    this.bytesThisFrame += bytes;
    this.flushCount += 1;
    this.flushThisFrame += 1;
    if (this.outputFirstTime === null) {
      this.outputFirstTime = ts;
    }
    this.outputLastTime = ts;
  }

  getStats(): RenderPerfStats {
    const avgMs = this.count > 0 ? this.totalMs / this.count : 0;
    const renderAvgMs = this.count > 0 ? this.totalRenderMs / this.count : 0;
    const outputAvgMs = this.count > 0 ? this.totalOutputMs / this.count : 0;
    const bytesPerFrame = this.count > 0 ? this.bytesWritten / this.count : 0;
    const bytesPerSec = avgMs > 0 ? (bytesPerFrame * 1000) / avgMs : 0;
    const flushAvg = this.count > 0 ? this.flushCount / this.count : 0;
    return {
      count: this.count,
      renderAvgMs,
      outputAvgMs,
      avgMs,
      minMs: this.count > 0 ? this.minMs : 0,
      maxMs: this.count > 0 ? this.maxMs : 0,
      p50Ms: percentile(this.samples, 50),
      p95Ms: percentile(this.samples, 95),
      p99Ms: percentile(this.samples, 99),
      fpsAvg: avgMs > 0 ? 1000 / avgMs : 0,
      dropped: this.dropped,
      bytesWritten: this.bytesWritten,
      bytesPerFrame,
      bytesPerSec,
      flushCount: this.flushCount,
      flushAvg,
    };
  }

  reset(): void {
    this.samples = [];
    this.sampleIndex = 0;
    this.totalMs = 0;
    this.totalRenderMs = 0;
    this.totalOutputMs = 0;
    this.minMs = Number.POSITIVE_INFINITY;
    this.maxMs = 0;
    this.dropped = 0;
    this.count = 0;
    this.bytesWritten = 0;
    this.bytesThisFrame = 0;
    this.flushCount = 0;
    this.flushThisFrame = 0;
    this.frameStart = null;
    this.renderStartTime = null;
    this.renderEndTime = null;
    this.outputFirstTime = null;
    this.outputLastTime = null;
  }
}

export function installRenderPerfObserver(
  options: RenderPerfObserverOptions = {},
): RenderPerfObserver {
  const observer = new RenderPerfObserver(options);
  setRenderObserver(observer);
  return observer;
}

export function removeRenderObserver(): void {
  setRenderObserver(null);
}
