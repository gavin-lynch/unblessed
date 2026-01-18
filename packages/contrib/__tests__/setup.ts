/**
 * Test setup for @unblessed/contrib
 *
 * Uses the same runtime initialization as @unblessed/core tests
 */

import { Buffer } from "buffer";
import { EventEmitter } from "events";
import fs from "fs";
import path, { dirname } from "path";
import process from "process";
import { Readable, Writable } from "stream";
import { StringDecoder } from "string_decoder";
import { fileURLToPath } from "url";
import * as util from "util";
import * as url from "url";
import { beforeAll, vi } from "vitest";
import { setRuntime } from "@unblessed/core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Create mock environment
 */
function createMockEnv() {
  return {
    HOME: process.env.HOME || "/home/test",
    USER: process.env.USER || "test",
    PATH: process.env.PATH || "/usr/bin:/bin",
    TERM: "screen-256color",
    TERM_PROGRAM: undefined,
    ITERM_SESSION_ID: undefined,
    VTE_VERSION: undefined,
    COLORTERM: undefined,
    TERMINATOR_UUID: undefined,
    TMUX: undefined,
    COLUMNS: undefined,
    LINES: undefined,
  };
}

/**
 * Create a Node.js-like runtime for tests
 */
function createNodeRuntimeForTests() {
  const mockEnv = createMockEnv();

  return {
    fs: {
      ...fs,
      readFileSync: vi.fn((filePath, encoding) => {
        let correctedPath = filePath;
        if (typeof filePath === "string") {
          if (filePath.includes("/data/")) {
            correctedPath = filePath.replace("/data/", "/../../data/");
          }
        }
        return fs.readFileSync(correctedPath, encoding);
      }),
    },
    path: {
      join: path.join,
      resolve: path.resolve,
      dirname: path.dirname,
      basename: path.basename,
      normalize: path.normalize,
      extname: path.extname,
      sep: path.sep,
      delimiter: path.delimiter,
    },
    process: {
      stdin: process.stdin,
      stdout: process.stdout,
      stderr: process.stderr,
      platform: process.platform,
      arch: process.arch,
      env: mockEnv,
      cwd: process.cwd.bind(process),
      exit: process.exit.bind(process),
      pid: process.pid,
      title: process.title,
      version: process.version,
      on: process.on.bind(process),
      once: process.once.bind(process),
      removeListener: process.removeListener.bind(process),
      removeAllListeners: process.removeAllListeners?.bind(process),
      listeners: process.listeners.bind(process),
      nextTick: process.nextTick.bind(process),
      kill: process.kill.bind(process),
    },
    buffer: {
      Buffer,
    },
    url: {
      parse: url.parse,
      format: url.format,
      fileURLToPath: url.fileURLToPath,
    },
    util: {
      inspect: util.inspect,
      format: util.format,
    },
    stream: {
      Readable,
      Writable,
    },
    stringDecoder: {
      StringDecoder,
    },
    events: {
      EventEmitter,
    },
    processes: {
      childProcess: {
        spawn: vi.fn(),
        execSync: vi.fn(),
        execFileSync: vi.fn(),
      },
    },
    networking: {
      tty: {
        isatty: vi.fn(() => true),
      },
      net: {
        createConnection: vi.fn(),
      },
    },
    images: {
      png: {
        PNG: class MockPNG {},
      },
      gif: {
        GifReader: class MockGifReader {},
      },
    },
  };
}

beforeAll(() => {
  const runtime = createNodeRuntimeForTests();
  setRuntime(runtime as any);
});
