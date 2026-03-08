import type { Screen } from "./widgets/screen.js";

export interface RenderObserver {
  renderStart?(screen: Screen, tMs?: number): void;
  renderEnd?(screen: Screen, tMs?: number): void;
  outputFlush?(bytes: number, tMs?: number): void;
}

let renderObserver: RenderObserver | null = null;

export function setRenderObserver(observer: RenderObserver | null): void {
  renderObserver = observer;
}

export function getRenderObserver(): RenderObserver | null {
  return renderObserver;
}
