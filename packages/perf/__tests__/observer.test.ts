import { describe, expect, it, vi } from "vitest";
import { RenderPerfObserver } from "../src/observer.js";

describe("RenderPerfObserver", () => {
  it("tracks frame timing and bytes", () => {
    const nowSpy = vi
      .spyOn(performance, "now")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(10)
      .mockReturnValueOnce(20)
      .mockReturnValueOnce(40);

    const observer = new RenderPerfObserver({ targetFps: 60, maxSamples: 10 });

    observer.renderStart(undefined, 0);
    observer.outputFlush(120, 5);
    observer.renderEnd(undefined, 10);

    observer.renderStart(undefined, 10);
    observer.outputFlush(80, 15);
    observer.renderEnd(undefined, 30);

    const stats = observer.getStats();

    expect(stats.count).toBe(2);
    expect(stats.minMs).toBe(10);
    expect(stats.maxMs).toBe(20);
    expect(stats.avgMs).toBe(15);
    expect(stats.dropped).toBe(1);
    expect(stats.bytesWritten).toBe(200);
    expect(stats.flushCount).toBe(2);
    expect(stats.bytesPerFrame).toBe(100);
    expect(stats.bytesPerSec).toBeCloseTo(6666.67, 1);
    expect(stats.renderAvgMs).toBe(15);
    expect(stats.outputAvgMs).toBe(0);
    expect(stats.fpsAvg).toBeCloseTo(66.666, 2);

    nowSpy.mockRestore();
  });

  it("resets counters", () => {
    const nowSpy = vi
      .spyOn(performance, "now")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(8);

    const observer = new RenderPerfObserver({ targetFps: 60, maxSamples: 10 });

    observer.renderStart();
    observer.outputFlush(50);
    observer.renderEnd();

    observer.reset();

    const stats = observer.getStats();
    expect(stats.count).toBe(0);
    expect(stats.bytesWritten).toBe(0);

    nowSpy.mockRestore();
  });
});
