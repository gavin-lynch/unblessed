#!/usr/bin/env tsx
/**
 * Sparkline Demo - @unblessed/contrib Sparkline widget example
 *
 * Demonstrates:
 * - Multiple sparkline series
 * - Real-time data streaming
 * - ASCII sparkline characters
 * - Auto-scrolling buffer
 *
 * Run with: tsx packages/react/examples/contrib-sparkline-demo.tsx
 */

import { NodeRuntime } from "@unblessed/node";
import { useEffect, useState } from "react";
import { Sparkline, type SparklineData } from "../../contrib/src/index.js";
import { Box, render, Text } from "../src/index.js";
import { ContribWidgetWrapper } from "./contrib-wrapper.js";

function SparklineDemo() {
  const [data, setData] = useState<SparklineData>({
    titles: ["CPU", "Memory", "Network"],
    data: [
      Array.from({ length: 30 }, () => Math.random() * 100),
      Array.from({ length: 30 }, () => Math.random() * 100),
      Array.from({ length: 30 }, () => Math.random() * 100),
    ],
  });
  const [frame, setFrame] = useState(0);

  // Animate data - add new point, remove old
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => ({
        ...prev,
        data: prev.data.map((series) => [
          ...series.slice(1), // Remove first
          Math.random() * 100, // Add new at end
        ]),
      }));
      setFrame((f) => f + 1);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box flexDirection="column" width="100%" height="100%" padding={1}>
      <Box height={3} justifyContent="center">
        <Text bold color="blue">
          Sparkline Demo - Frame: {frame}
        </Text>
      </Box>

      <Box flexGrow={1}>
        <ContribWidgetWrapper
          createWidget={(opts) => new Sparkline(opts)}
          widgetOptions={{
            label: " System Metrics ",
            bufferLength: 30,
            style: {
              titleFg: "white",
            },
            data,
          }}
          boxProps={{
            width: "100%",
            height: "100%",
            border: 1,
            borderColor: "blue",
          }}
          deps={[data]}
        />
      </Box>

      <Box height={3} paddingTop={1}>
        <Text>
          {data.titles
            .map((title, i) => {
              const last = data.data[i][data.data[i].length - 1];
              return `${title}: ${last.toFixed(1)}`;
            })
            .join(" | ")}
        </Text>
      </Box>
    </Box>
  );
}

const instance = render(<SparklineDemo />, {
  runtime: new NodeRuntime(),
});

instance.screen.key(["q", "escape", "C-c"], () => {
  instance.unmount();
  process.exit(0);
});

instance.screen.render();
