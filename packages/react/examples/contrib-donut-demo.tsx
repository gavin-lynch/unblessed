#!/usr/bin/env tsx
/**
 * Donut Chart Demo - @unblessed/contrib Donut widget example
 * 
 * Demonstrates:
 * - Multiple donut charts
 * - Custom colors per segment
 * - Labels and percentages
 * - Real-time updates
 * 
 * Run with: tsx packages/react/examples/contrib-donut-demo.tsx
 */

import { Donut, type DonutData } from "../../contrib/src/index.js";
import { NodeRuntime } from "@unblessed/node";
import { useEffect, useState } from "react";
import { Box, render, Text } from "../src/index.js";
import { ContribWidgetWrapper } from "./contrib-wrapper.js";

function DonutChartDemo() {
  const [data, setData] = useState<DonutData[]>([
    { label: "SSD", percent: 75, color: "green" },
    { label: "HDD", percent: 45, color: "blue" },
    { label: "NAS", percent: 90, color: "red" },
  ]);
  const [frame, setFrame] = useState(0);

  // Animate data
  useEffect(() => {
    const interval = setInterval(() => {
      setData([
        { label: "SSD", percent: Math.random() * 100, color: "green" },
        { label: "HDD", percent: Math.random() * 100, color: "blue" },
        { label: "NAS", percent: Math.random() * 100, color: "red" },
      ]);
      setFrame((f) => f + 1);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box flexDirection="column" width="100%" height="100%" padding={1}>
      <Box height={3} justifyContent="center">
        <Text bold color="yellow">
          Donut Chart Demo - Frame: {frame}
        </Text>
      </Box>

      <Box flexGrow={1}>
        <ContribWidgetWrapper
          createWidget={(opts) => new Donut(opts)}
          widgetOptions={{
            label: " Disk Usage ",
            stroke: "yellow",
            fill: "white",
            radius: 14,
            arcWidth: 4,
            spacing: 2,
            yPadding: 2,
            remainColor: "black",
            data,
          }}
          boxProps={{
            width: "100%",
            height: "100%",
            border: 1,
            borderColor: "yellow",
          }}
          deps={[data]}
        />
      </Box>

      <Box height={3} paddingTop={1}>
        <Text>
          {data.map((d) => `${d.label}: ${d.percent.toFixed(1)}%`).join(" | ")}
        </Text>
      </Box>
    </Box>
  );
}

const instance = render(<DonutChartDemo />, {
  runtime: new NodeRuntime(),
});

instance.screen.key(["q", "escape", "C-c"], () => {
  instance.unmount();
  process.exit(0);
});

instance.screen.render();
