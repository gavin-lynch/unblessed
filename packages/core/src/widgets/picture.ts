/**
 * picture.ts - Image display widget
 */

import { getInnerBoxSize } from "../lib/helpers.js";
import type { BoxOptions } from "../types/options.js";
import { Box } from "./box.js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - picture-tuber doesn't have type definitions
import pictureTube from "picture-tuber";

export interface PictureOptions extends BoxOptions {
  file?: string;
  base64?: string;
  cols?: number;
  onReady?: () => void;
}

export class Picture extends Box {
  override type = "picture";
  declare options: PictureOptions;
  private _imageContent: string = "";
  private _isLoading: boolean = false;
  private static readonly MIN_PLACEHOLDER_WIDTH = 10;
  private static readonly MAX_PLACEHOLDER_WIDTH = 40;
  private static readonly MIN_PLACEHOLDER_HEIGHT = 6;
  private static readonly MAX_PLACEHOLDER_HEIGHT = 10;

  constructor(options: PictureOptions = {}) {
    options.cols = options.cols ?? 50;

    super(options);
    this.options = options;

    if (options.file || options.base64) {
      void this.setImage(options);
    }
  }

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
      const tube = pictureTube({ cols });

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

        if (options.file) {
          const fileData = this.runtime.fs.readFileSync(options.file);
          tube.write(fileData);
          tube.end();
        } else if (options.base64) {
          const BufferCtor = this.runtime.buffer.Buffer;
          const buf = BufferCtor.from(options.base64, "base64");
          tube.write(buf);
          tube.end();
        } else {
          reject(new Error("No image source provided"));
        }
      });

      this._imageContent = output;
      this.setContent(output);

      options.onReady?.();
    } catch {
      this._imageContent = this._createPlaceholder(
        options.file || "(base64 image)",
      );
      this.setContent(this._imageContent);
      options.onReady?.();
    } finally {
      this._isLoading = false;
    }
  }

  private _createPlaceholder(source: string): string {
    const { innerWidthChars, innerHeightChars } = getInnerBoxSize(this);
    const width = Math.max(
      Picture.MIN_PLACEHOLDER_WIDTH,
      Math.min(innerWidthChars, Picture.MAX_PLACEHOLDER_WIDTH),
    );
    const height = Math.max(
      Picture.MIN_PLACEHOLDER_HEIGHT,
      Math.min(innerHeightChars, Picture.MAX_PLACEHOLDER_HEIGHT),
    );
    const innerWidth = Math.max(1, width - 2);

    let content = "\n";

    content += "┌" + "─".repeat(innerWidth) + "┐\n";

    const emptyRows = Math.max(0, Math.floor((height - 4) / 2));
    for (let i = 0; i < emptyRows; i++) {
      content += "│" + " ".repeat(innerWidth) + "│\n";
    }

    const text = "[Image]";
    if (innerWidth >= text.length) {
      const padding = Math.floor((innerWidth - text.length) / 2);
      const rightPad = Math.max(0, innerWidth - padding - text.length);
      content +=
        "│" + " ".repeat(padding) + text + " ".repeat(rightPad) + "│\n";
    } else {
      content += "│" + text.slice(0, innerWidth) + "│\n";
    }

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

    content += "└" + "─".repeat(innerWidth) + "┘\n";

    return content;
  }

  override render(): any {
    if (this._imageContent) {
      this.setContent(this._imageContent);
    }
    return super.render();
  }

  getOptionsPrototype(): PictureOptions {
    return {
      base64: "AAAA",
      cols: 1,
    };
  }
}

export default Picture;
