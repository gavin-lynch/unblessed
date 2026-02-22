/**
 * table.ts - Contrib table compatibility wrapper
 */

import {
  Table as CoreTable,
  type TableData,
  type TableOptions,
} from "@unblessed/core";

export { type TableData, type TableOptions };

export class Table extends CoreTable {
  override type = "table";
}

export default Table;
