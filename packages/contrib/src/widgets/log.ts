/**
 * log.ts - Contrib log compatibility wrapper
 */

import { LogList as CoreLogList, type LogListOptions } from "@unblessed/core";

export type LogOptions = LogListOptions;

export class Log extends CoreLogList {
  override type = "log";
}

export default Log;
