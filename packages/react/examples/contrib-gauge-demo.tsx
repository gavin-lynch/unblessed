#!/usr/bin/env tsx
/**
 * Gauge Demo - @gavin-lynch/unblessed-contrib Gauge widget example
 *
 * Demonstrates:
 * - Single value gauge
 * - Stacked gauge with multiple segments
 * - Real-time updates
 * - Color customization
 *
 * Run with: tsx packages/react/examples/contrib-gauge-demo.tsx
 */

import { NodeRuntime } from "@gavin-lynch/unblessed-node";
import { useEffect, useState } from "react";
import { Gauge, type GaugeStackItem } from "../../contrib/src/index.js";
import { Box, render, Text } from "../src/index.js";
import { ContribWidgetWrapper } from "./contrib-wrapper.js";

function GaugeDemo() {
  const [singleValue, setSingleValue] = useState(50);
  const [stackData, setStackData] = useState<GaugeStackItem[]>([
    { percent: 30, stroke: "green" },
    { percent: 40, stroke: "yellow" },
    { percent: 20, stroke: "red" },
  ]);
  const [frame, setFrame] = useState(0);

  // Animate single gauge
  useEffect(() => {
    const interval = setInterval(() => {
      setSingleValue(Math.floor(Math.random() * 100));
      setStackData([
        { percent: Math.random() * 30, stroke: "green" },
        { percent: Math.random() * 40, stroke: "yellow" },
        { percent: Math.random() * 30, stroke: "red" },
      ]);
      setFrame((f) => f + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box flexDirection="row" width="100%" height="100%" padding={1} gap={1}>
      {/* Single Value Gauge */}
      <Box flexDirection="column" width="50%" height="100%">
        <Box height={3} justifyContent="center">
          <Text bold color="magenta">
            Single Gauge - Frame: {frame}
          </Text>
        </Box>
        <Box flexGrow={1}>
          <ContribWidgetWrapper
            createWidget={(opts) => new Gauge(opts)}
            widgetOptions={{
              label: " CPU Usage ",
              stroke: "magenta",
              fill: "white",
              showLabel: true,
              percent: singleValue,
            }}
            boxProps={{
              width: "100%",
              height: "100%",
              border: 1,
              borderColor: "magenta",
            }}
            deps={[singleValue]}
          />
        </Box>
        <Box height={2} justifyContent="center">
          <Text>Value: {singleValue}%</Text>
        </Box>
      </Box>

      {/* Stacked Gauge */}
      <Box flexDirection="column" width="50%" height="100%">
        <Box height={3} justifyContent="center">
          <Text bold color="cyan">
            Stacked Gauge - Frame: {frame}
          </Text>
        </Box>
        <Box flexGrow={1}>
          <ContribWidgetWrapper
            createWidget={(opts) => new Gauge(opts)}
            widgetOptions={{
              label: " Resource Usage ",
              stroke: "cyan",
              fill: "white",
              showLabel: true,
              stack: stackData,
            }}
            boxProps={{
              width: "100%",
              height: "100%",
              border: 1,
              borderColor: "cyan",
            }}
            deps={[stackData]}
          />
        </Box>
        <Box height={2} justifyContent="center">
          <Text>
            {stackData
              .map((s, i) => `${i + 1}: ${s.percent.toFixed(1)}%`)
              .join(" | ")}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

const instance = render(<GaugeDemo />, {
  runtime: new NodeRuntime(),
});

instance.screen.key(["q", "escape", "C-c"], () => {
  instance.unmount();
  process.exit(0);
});

instance.screen.render();
