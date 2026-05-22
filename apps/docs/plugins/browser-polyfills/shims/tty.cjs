"use strict";

/** Minimal `tty` shim for browser bundles (chalk, supports-color, charm). */
function isatty(fd) {
  return fd === 1 || fd === 2;
}

module.exports = {
  isatty,
  ReadStream: class ReadStream {
    isTTY = true;
    isRaw = false;
    setRawMode() {
      return this;
    }
  },
  WriteStream: class WriteStream {
    isTTY = true;
    columns = 80;
    rows = 24;
    getWindowSize() {
      return [this.columns, this.rows];
    }
  },
};
