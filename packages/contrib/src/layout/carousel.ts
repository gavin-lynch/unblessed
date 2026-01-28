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
export type CarouselPage = (screen: Screen, pageIndex: number) => void;

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
  private intervalId: ReturnType<typeof setInterval> | null = null;

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
  move(): void {
    // Detach all children
    let i = this.screen.children.length;
    while (i--) {
      this.screen.children[i].detach();
    }

    // Render current page
    this.pages[this.currPage](this.screen, this.currPage);
    this.screen.render();
  }

  /**
   * Go to next page
   */
  next(): void {
    this.currPage++;

    if (this.currPage === this.pages.length) {
      if (!this.options.rotate) {
        this.currPage--;
        return;
      } else {
        this.currPage = 0;
      }
    }

    this.move();
  }

  /**
   * Go to previous page
   */
  prev(): void {
    this.currPage--;

    if (this.currPage < 0) {
      if (!this.options.rotate) {
        this.currPage++;
        return;
      } else {
        this.currPage = this.pages.length - 1;
      }
    }

    this.move();
  }

  /**
   * Go to first page
   */
  home(): void {
    this.currPage = 0;
    this.move();
  }

  /**
   * Go to last page
   */
  end(): void {
    this.currPage = this.pages.length - 1;
    this.move();
  }

  /**
   * Go to a specific page
   */
  goto(page: number): void {
    if (page >= 0 && page < this.pages.length) {
      this.currPage = page;
      this.move();
    }
  }

  /**
   * Start the carousel
   */
  start(): void {
    this.move();

    // Auto-advance if interval specified
    if (this.options.interval) {
      this.intervalId = setInterval(() => this.next(), this.options.interval);
    }

    // Bind control keys
    if (this.options.controlKeys) {
      this.screen.key(
        ["right", "left", "home", "end"],
        (_ch: string, key: { name: string }) => {
          if (key.name === "right") this.next();
          if (key.name === "left") this.prev();
          if (key.name === "home") this.home();
          if (key.name === "end") this.end();
        },
      );
    }
  }

  /**
   * Stop the carousel auto-advance
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export default Carousel;
