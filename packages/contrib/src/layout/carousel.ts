/**
 * carousel.ts - Page carousel layout
 *
 * Provides a carousel layout for cycling through multiple pages/screens.
 *
 * Based on blessed-contrib's carousel.js
 */

import type { Screen } from "@unblessed/core";

/**
 * Page function type - called to render a page
 */
export type CarouselPage = (
  screen: Screen,
  pageIndex: number,
) => void | Promise<void>;

/**
 * Carousel options
 */
export interface CarouselOptions {
  /** Screen to attach to */
  screen: Screen;
  /** Rotate from end to beginning (default: false) */
  rotate?: boolean;
  /** Auto-advance interval in milliseconds */
  interval?: number;
  /** Enable control keys (left/right/home/end) */
  controlKeys?: boolean;
  /** Called after a page finishes rendering */
  onAfterMove?: (pageIndex: number) => void | Promise<void>;
}

/**
 * Carousel - Page carousel layout
 *
 * Allows cycling through multiple pages of widgets.
 * Each page is a function that sets up the screen content.
 *
 * @example
 * ```ts
 * const pages = [
 *   (screen, index) => {
 *     // Page 1: Dashboard
 *     const line = new Line({ parent: screen, ... });
 *   },
 *   (screen, index) => {
 *     // Page 2: Detailed view
 *     const bar = new Bar({ parent: screen, ... });
 *   }
 * ];
 *
 * const carousel = new Carousel(pages, {
 *   screen: screen,
 *   rotate: true,
 *   controlKeys: true
 * });
 *
 * carousel.start();
 * ```
 */
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

  /**
   * Get current page index
   */
  get currentPage(): number {
    return this.currPage;
  }

  /**
   * Get total number of pages
   */
  get pageCount(): number {
    return this.pages.length;
  }

  /**
   * Move to current page (renders the page)
   */
  async move(): Promise<void> {
    // Detach all children
    let i = this.screen.children.length;
    while (i--) {
      this.screen.children[i].detach();
    }

    // Render current page
    await this.pages[this.currPage](this.screen, this.currPage);
    this.screen.render();
    if (this.options.onAfterMove) {
      await this.options.onAfterMove(this.currPage);
    }
  }

  /**
   * Go to next page
   */
  async next(): Promise<void> {
    this.currPage++;

    if (this.currPage === this.pages.length) {
      if (!this.options.rotate) {
        this.currPage--;
        return;
      } else {
        this.currPage = 0;
      }
    }

    await this.move();
  }

  /**
   * Go to previous page
   */
  async prev(): Promise<void> {
    this.currPage--;

    if (this.currPage < 0) {
      if (!this.options.rotate) {
        this.currPage++;
        return;
      } else {
        this.currPage = this.pages.length - 1;
      }
    }

    await this.move();
  }

  /**
   * Go to first page
   */
  async home(): Promise<void> {
    this.currPage = 0;
    await this.move();
  }

  /**
   * Go to last page
   */
  async end(): Promise<void> {
    this.currPage = this.pages.length - 1;
    await this.move();
  }

  /**
   * Go to a specific page
   */
  async goto(page: number): Promise<void> {
    if (page >= 0 && page < this.pages.length) {
      this.currPage = page;
      await this.move();
    }
  }

  /**
   * Start the carousel
   */
  start(): void {
    void this.move();

    // Auto-advance if interval specified
    if (this.options.interval) {
      const tick = async () => {
        await this.next();
        if (this.options.interval) {
          this.intervalId = setTimeout(tick, this.options.interval);
        }
      };
      this.intervalId = setTimeout(tick, this.options.interval);
    }

    // Bind control keys
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

  /**
   * Stop the carousel auto-advance
   */
  stop(): void {
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
  }
}

export default Carousel;
