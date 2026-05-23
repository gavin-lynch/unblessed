"use strict";

/**
 * Browser stub for cli-highlight (used by Diff widget in @gavin-lynch/unblessed-core).
 * Avoids chalk 4 + supports-color / @colors/colors in the docs client bundle.
 */

function highlight(code) {
  return typeof code === "string" ? code : String(code ?? "");
}

function listLanguages() {
  return [];
}

function supportsLanguage() {
  return false;
}

const api = {
  highlight,
  listLanguages,
  supportsLanguage,
  default: highlight,
};

module.exports = api;
module.exports.default = highlight;
