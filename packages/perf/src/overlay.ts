import type { Screen as UnblessedScreen } from "@unblessed/core";
import { Box } from "@unblessed/core";
import type { RenderPerfObserver } from "./observer.js";

export interface PerfOverlayOptions {
  refreshMs?: number;
  label?: string;
  top?: number | string;
  right?: number | string;
  width?: number | string;
}

export interface PerfOverlayHandle {
  box: Box;
  stop: () => void;
}

function formatStats(observer: RenderPerfObserver, label: string): string {
  const stats = observer.getStats();
  const fps = stats.fpsAvg.toFixed(1);
  const avg = stats.avgMs.toFixed(2);
  const renderAvg = stats.renderAvgMs.toFixed(2);
  const outputAvg = stats.outputAvgMs.toFixed(2);
  const p95 = stats.p95Ms.toFixed(2);
  const dropped = stats.dropped;
  const bytes = stats.bytesPerSec.toFixed(0);
  return [
    label,
    `fps ${fps}`,
    `avg ${avg}ms`,
    `render ${renderAvg}ms`,
    `output ${outputAvg}ms`,
    `p95 ${p95}ms`,
    `drop ${dropped}`,
    `bytes/s ${bytes}`,
  ].join("\n");
}

export function createPerfOverlay(
  screen: UnblessedScreen,
  observer: RenderPerfObserver,
  options: PerfOverlayOptions = {},
): PerfOverlayHandle {
  const refreshMs = options.refreshMs ?? 250;
  const label = options.label ?? "perf";

  const box = new Box({
    parent: screen,
    top: options.top ?? 0,
    right: options.right ?? 0,
    width: options.width ?? 18,
    height: 8,
    content: formatStats(observer, label),
    border: { type: "line" },
    style: {
      fg: "black",
      bg: "yellow",
      border: { fg: "white" },
    },
    tags: false,
  });

  box.setFront();

  const timer = setInterval(() => {
    box.setContent(formatStats(observer, label));
    box.setFront();
    screen.renderThrottled();
  }, refreshMs);

  const stop = () => {
    clearInterval(timer);
    box.destroy();
  };

  return { box, stop };
}
