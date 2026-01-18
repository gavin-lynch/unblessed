#!/usr/bin/env tsx
/**
 * Bar Chart Demo - @unblessed/contrib Bar widget example
 * 
 * Demonstrates:
 * - Vertical bar chart
 * - Customizable bar colors
 * - Labels and values
 * - Real-time updates
 * 
 * Run with: tsx packages/react/examples/contrib-bar-demo.tsx
 */

import { Bar, type BarData } from "../../contrib/src/index.js";
import { NodeRuntime } from "@unblessed/node";
import { useEffect, useState } from "react";
import { Box, render, Text } from "../src/index.js";
import { ContribWidgetWrapper } from "./contrib-wrapper.js";

function BarChartDemo() {
  const [data, setData] = useState<BarData>({
    titles: ["Q1", "Q2", "Q3", "Q4"],
    data: [45, 67, 89, 34],
  });
  const [frame, setFrame] = useState(0);

  // Animate data
  useEffect(() => {
    const interval = setInterval(() => {
      setData({
        titles: ["Q1", "Q2", "Q3", "Q4"],
        data: Array.from({ length: 4 }, () => Math.floor(Math.random() * 100)),
      });
      setFrame((f) => f + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box flexDirection="column" width="100%" height="100%" padding={1}>
      <Box height={3} justifyContent="center">
        <Text bold color="green">
          Bar Chart Demo - Frame: {frame}
        </Text>
      </Box>

      <Box flexGrow={1}>
        <ContribWidgetWrapper
          createWidget={(opts) => new Bar(opts)}
          widgetOptions={{
            label: " Quarterly Sales ",
            barWidth: 6,
            barSpacing: 9,
            xOffset: 5,
            barBgColor: "green",
            barFgColor: "black",
            labelColor: "white",
            showText: true,
            data,
          }}
          boxProps={{
            width: "100%",
            height: "100%",
            border: 1,
            borderColor: "green",
          }}
          deps={[data]}
        />
      </Box>
    </Box>
  );
}

const instance = render(<BarChartDemo />, {
  runtime: new NodeRuntime(),
});

instance.screen.key(["q", "escape", "C-c"], () => {
  instance.unmount();
  process.exit(0);
});

instance.screen.render();
