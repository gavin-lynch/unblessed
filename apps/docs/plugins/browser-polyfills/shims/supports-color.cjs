"use strict";

/**
 * Browser shim for the `supports-color` package (used by chalk 4 / @colors/colors).
 * Enables ANSI colors in the xterm-based LiveDemo.
 */

function translateLevel(level) {
  if (level === 0) {
    return false;
  }
  return {
    level,
    hasBasic: true,
    has256: level >= 2,
    has16m: level >= 3,
  };
}

function supportsColor() {
  const env = typeof process !== "undefined" && process.env ? process.env : {};
  if (env.NO_COLOR || env.FORCE_COLOR === "false" || env.FORCE_COLOR === "0") {
    return 0;
  }
  // xterm in the docs demo supports truecolor
  return 3;
}

function getSupportLevel() {
  return translateLevel(supportsColor());
}

const api = {
  supportsColor: getSupportLevel,
  stdout: getSupportLevel(),
  stderr: getSupportLevel(),
};

module.exports = api;
module.exports.default = api;
