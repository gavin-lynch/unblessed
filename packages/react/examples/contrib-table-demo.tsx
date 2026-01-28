#!/usr/bin/env tsx
/**
 * Table Demo - @unblessed/contrib Table widget example
 *
 * Demonstrates:
 * - Tabular data display
 * - Headers and rows
 * - Keyboard navigation
 * - Row selection
 * - Scrollable content
 *
 * Run with: tsx packages/react/examples/contrib-table-demo.tsx
 */

import { NodeRuntime } from "@unblessed/node";
import { useState } from "react";
import { Table, type TableData } from "../../contrib/src/index.js";
import { Box, render, Text } from "../src/index.js";
import { ContribWidgetWrapper } from "./contrib-wrapper.js";

function TableDemo() {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const tableData: TableData = {
    headers: ["Name", "Age", "City", "Score"],
    data: [
      ["Alice", 25, "New York", 95],
      ["Bob", 30, "London", 87],
      ["Charlie", 35, "Tokyo", 92],
      ["Diana", 28, "Paris", 88],
      ["Eve", 32, "Berlin", 91],
      ["Frank", 27, "Sydney", 85],
      ["Grace", 29, "Toronto", 93],
      ["Henry", 31, "Mumbai", 89],
      ["Iris", 26, "Dubai", 90],
      ["Jack", 33, "Singapore", 94],
    ],
  };

  return (
    <Box flexDirection="column" width="100%" height="100%" padding={1}>
      <Box height={3} justifyContent="center">
        <Text bold color="cyan">
          Table Demo
        </Text>
      </Box>

      <Box flexGrow={1}>
        <ContribWidgetWrapper
          createWidget={(opts) => {
            const table = new Table(opts);
            table.on("select", (item: any, index: number) => {
              setSelectedRow(index);
            });
            return table;
          }}
          widgetOptions={{
            label: " User Data ",
            columnWidth: [15, 8, 15, 10],
            columnSpacing: 10,
            selectedFg: "white",
            selectedBg: "blue",
            keys: true,
            vi: true,
            mouse: true,
            interactive: true,
            data: tableData,
          }}
          boxProps={{
            width: "100%",
            height: "100%",
            border: 1,
            borderColor: "cyan",
          }}
        />
      </Box>

      <Box height={3} justifyContent="center">
        <Text>
          {selectedRow !== null
            ? `Selected: ${tableData.data[selectedRow][0]} (Row ${selectedRow + 1})`
            : "Use arrow keys or click to select a row"}
        </Text>
      </Box>
    </Box>
  );
}

const instance = render(<TableDemo />, {
  runtime: new NodeRuntime(),
});

instance.screen.key(["q", "escape", "C-c"], () => {
  instance.unmount();
  process.exit(0);
});

instance.screen.render();
