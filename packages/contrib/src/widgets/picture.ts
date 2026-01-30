/**
 * picture.ts - Image display widget
 *
 * Displays images in the terminal using ANSI colors.
 * Requires optional peer dependency: picture-tuber
 *
 * Based on blessed-contrib's picture.js
 */

import { Box, type BoxOptions, getRuntime } from "@unblessed/core";
 
// @ts-ignore - picture-tuber doesn't have type definitions
import pictureTube from "picture-tuber";

/**
 * Picture options
 */
export interface PictureOptions extends BoxOptions {
  /** Path to image file */
  file?: string;
  /** Base64 encoded image data */
  base64?: string;
  /** Number of columns for image width (default: 50) */
  cols?: number;
  /** Callback when image is ready */
  onReady?: () => void;
}

/**
 * Picture - Image display widget
 *
 * Displays images in the terminal using ANSI escape codes.
 * Supports file paths and base64-encoded images.
 * Requires picture-tuber peer dependency.
 *
 * @example
 * ```ts
 * const picture = new Picture({
 *   parent: screen,
 *   width: '50%',
 *   height: '50%',
 *   file: './logo.png',
 *   cols: 40,
 *   onReady: () => screen.render()
 * });
 * ```
 */
export class Picture extends Box {
  override type = "picture";
  declare options: PictureOptions;
  private _imageContent: string = "";
  private _isLoading: boolean = false;

  constructor(options: PictureOptions = {}) {
    options.cols = options.cols ?? 50;

    super(options);
    this.options = options;

    if (options.file || options.base64) {
      this.setImage(options);
    }
  }

  /**
   * Set the image to display
   */
  async setImage(options: {
    file?: string;
    base64?: string;
    cols?: number;
    onReady?: () => void;
  }): Promise<void> {
    if (this._isLoading) return;
    this._isLoading = true;

    const cols = options.cols ?? this.options.cols ?? 50;

    try {
      // pictureTube is now a normal import
      const tube = pictureTube({ cols });

      // Create a promise to collect the output
      const output = await new Promise<string>((resolve, reject) => {
        let data = "";

        tube.on("data", (chunk: Buffer | string) => {
          data += chunk.toString();
        });

        tube.on("end", () => {
          resolve(data);
        });

        tube.on("error", (err: Error) => {
          reject(err);
        });

        // Feed the image data
        if (options.file) {
          const runtime = getRuntime();
          // Read file and pipe to tube
          const fileData = runtime.fs.readFileSync(options.file);
          tube.write(fileData);
          tube.end();
        } else if (options.base64) {
          const buf = Buffer.from(options.base64, "base64");
          tube.write(buf);
          tube.end();
        } else {
          reject(new Error("No image source provided"));
        }
      });

      this._imageContent = output;
      this.setContent(output);

      if (options.onReady) {
        options.onReady();
      }
    } catch {
      // picture-tuber not available or error loading image
      this._imageContent = this._createPlaceholder(
        options.file || "(base64 image)",
      );
      this.setContent(this._imageContent);

      if (options.onReady) {
        options.onReady();
      }
    } finally {
      this._isLoading = false;
    }
  }

  /**
   * Create a placeholder when image loading fails
   */
  private _createPlaceholder(source: string): string {
    const width = Math.max(10, Math.min(this.width - 2, 40));
    const height = Math.max(6, Math.min(this.height - 2, 10));
    const innerWidth = Math.max(1, width - 2);

    let content = "\n";

    // Top border
    content += "┌" + "─".repeat(innerWidth) + "┐\n";

    // Middle rows
    const emptyRows = Math.max(0, Math.floor((height - 4) / 2));
    for (let i = 0; i < emptyRows; i++) {
      content += "│" + " ".repeat(innerWidth) + "│\n";
    }

    // Image text
    const text = "[Image]";
    if (innerWidth >= text.length) {
      const padding = Math.floor((innerWidth - text.length) / 2);
      const rightPad = Math.max(0, innerWidth - padding - text.length);
      content +=
        "│" + " ".repeat(padding) + text + " ".repeat(rightPad) + "│\n";
    } else {
      content += "│" + text.slice(0, innerWidth) + "│\n";
    }

    // Filename (truncated)
    let filename = source;
    if (filename.length > innerWidth) {
      filename = filename.slice(0, innerWidth - 3) + "...";
    }
    const filePadding = Math.floor((innerWidth - filename.length) / 2);
    const fileRightPad = Math.max(
      0,
      innerWidth - filePadding - filename.length,
    );
    content +=
      "│" +
      " ".repeat(filePadding) +
      filename +
      " ".repeat(fileRightPad) +
      "│\n";

    for (let i = 0; i < emptyRows; i++) {
      content += "│" + " ".repeat(innerWidth) + "│\n";
    }

    // Bottom border
    content += "└" + "─".repeat(innerWidth) + "┘\n";

    return content;
  }

  override render(): any {
    if (this._imageContent) {
      this.setContent(this._imageContent);
    }
    return super.render();
  }

  /**
   * Get options prototype (for blessed-contrib compatibility)
   */
  getOptionsPrototype(): PictureOptions {
    return {
      base64: "AAAA",
      cols: 1,
    };
  }
}

export default Picture;
