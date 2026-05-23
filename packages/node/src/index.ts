/**
 * @gavin-lynch/unblessed-node - Node.js runtime adapter for @gavin-lynch/unblessed-core
 *
 * This package provides Node.js-specific implementations and makes it easy
 * to use @gavin-lynch/unblessed-core in Node.js environments.
 *
 * ## Usage
 *
 * Simply import widgets and use them - runtime auto-initializes:
 *
 * ```typescript
 * import { Screen, Box } from '@gavin-lynch/unblessed-node';
 *
 * const screen = new Screen({ smartCSR: true });
 * const box = new Box({ screen, content: 'Hello!' });
 * screen.render();
 * ```
 */

import type { Runtime } from "@gavin-lynch/unblessed-core";
import { setRuntime } from "@gavin-lynch/unblessed-core";
import { Buffer } from "buffer";
import * as child_process from "child_process";
import { EventEmitter } from "events";
import fs from "fs";
import net from "net";
import { GifReader } from "omggif";
import path from "path";
import { PNG } from "pngjs";
import process from "process";
import { Readable, Writable } from "stream";
import { StringDecoder } from "string_decoder";
import tty from "tty";
import * as url from "url";
import * as util from "util";

/**
 * Node.js runtime implementation (internal)
 * @internal
 */
export class NodeRuntime implements Runtime {
  fs = fs;
  path = path;
  process = process;
  buffer = { Buffer };
  url = url;
  util = util;
  stream = { Readable, Writable };
  stringDecoder = { StringDecoder };
  events = { EventEmitter };

  images = {
    png: { PNG },
    gif: { GifReader },
  };

  processes = {
    childProcess: child_process,
  };

  networking = {
    net: net,
    tty: tty,
  };
}

// Auto-initialize runtime when this module is imported
// This allows users to simply import and use widgets without manual initialization
// Skip auto-init in test environments to allow tests to use mock runtimes
if (typeof process !== "undefined" && process.env.NODE_ENV !== "test") {
  // Initialize the runtime - setRuntime is safe to call even if already set
  // In Node.js, we always want to use NodeRuntime, so it's fine to set it
  setRuntime(new NodeRuntime());
}

// Re-export all from @gavin-lynch/unblessed-core
export * from "@gavin-lynch/unblessed-core";
