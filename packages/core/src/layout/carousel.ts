/**
 * carousel.ts - Page carousel layout
 *
 * Provides a carousel layout for cycling through multiple pages/screens.
 */

import type Screen from "../widgets/screen.js";

export type CarouselPage = (
  screen: Screen,
  pageIndex: number,
) => void | Promise<void>;

export interface CarouselOptions {
  screen: Screen;
  rotate?: boolean;
  interval?: number;
  controlKeys?: boolean;
  onAfterMove?: (pageIndex: number) => void | Promise<void>;
}

export class Carousel {
  private currPage: number = 0;
  private pages: CarouselPage[];
  private options: CarouselOptions;
  private screen: Screen;
  private intervalId: ReturnType<typeof setTimeout> | null = null;

  constructor(pages: CarouselPage[], options: CarouselOptions) {
    this.pages = pages;
    this.options = options;
    this.screen = options.screen;
  }

  get currentPage(): number {
    return this.currPage;
  }

  get pageCount(): number {
    return this.pages.length;
  }

  async move(): Promise<void> {
    let i = this.screen.children.length;
    while (i--) {
      this.screen.children[i].detach();
    }

    await this.pages[this.currPage](this.screen, this.currPage);
    this.screen.render();
    if (this.options.onAfterMove) {
      await this.options.onAfterMove(this.currPage);
    }
  }

  async next(): Promise<void> {
    this.currPage++;

    if (this.currPage === this.pages.length) {
      if (!this.options.rotate) {
        this.currPage--;
        return;
      }
      this.currPage = 0;
    }

    await this.move();
  }

  async prev(): Promise<void> {
    this.currPage--;

    if (this.currPage < 0) {
      if (!this.options.rotate) {
        this.currPage++;
        return;
      }
      this.currPage = this.pages.length - 1;
    }

    await this.move();
  }

  async home(): Promise<void> {
    this.currPage = 0;
    await this.move();
  }

  async end(): Promise<void> {
    this.currPage = this.pages.length - 1;
    await this.move();
  }

  async goto(page: number): Promise<void> {
    if (page >= 0 && page < this.pages.length) {
      this.currPage = page;
      await this.move();
    }
  }

  start(): void {
    void this.move();

    if (this.options.interval) {
      const tick = async () => {
        await this.next();
        if (this.options.interval) {
          this.intervalId = setTimeout(tick, this.options.interval);
        }
      };
      this.intervalId = setTimeout(tick, this.options.interval);
    }

    if (this.options.controlKeys) {
      this.screen.key(
        ["right", "left", "home", "end"],
        (_ch: string, key: { name: string }) => {
          if (key.name === "right") void this.next();
          if (key.name === "left") void this.prev();
          if (key.name === "home") void this.home();
          if (key.name === "end") void this.end();
        },
      );
    }
  }

  stop(): void {
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
  }
}

export default Carousel;
