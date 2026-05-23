"use strict";

/**
 * Browser shim for @colors/colors/lib/system/supports-colors.js
 * (same API as the supports-color package shim).
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
