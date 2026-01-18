#!/usr/bin/env tsx
/**
 * Line Chart Demo - @unblessed/contrib Line widget example
 * 
 * Demonstrates:
 * - Line chart with multiple series
 * - Real-time data updates
 * - Axis labels and legend
 * - Color customization
 * 
 * Run with: tsx packages/react/examples/contrib-line-demo.tsx
 */

import { Line, type LineSeriesData } from "../../contrib/src/index.js";
import { NodeRuntime } from "@unblessed/node";
import { useEffect, useRef, useState } from "react";
import { Box, render, Text, useScreen } from "../src/index.js";
import { ContribWidgetWrapper } from "./contrib-wrapper.js";

function LineChartDemo() {
  const screen = useScreen();
  const [data, setData] = useState<LineSeriesData[]>([]);
  const [frame, setFrame] = useState(0);

  // Initialize data
  useEffect(() => {
    const initialData: LineSeriesData[] = [
      {
        title: "CPU",
        x: Array.from({ length: 20 }, (_, i) => `${i}`),
        y: Array.from({ length: 20 }, () => Math.random() * 100),
        style: { line: "green" },
      },
      {
        title: "Memory",
        x: Array.from({ length: 20 }, (_, i) => `${i}`),
        y: Array.from({ length: 20 }, () => Math.random() * 100),
        style: { line: "yellow" },
      },
      {
        title: "Network",
        x: Array.from({ length: 20 }, (_, i) => `${i}`),
        y: Array.from({ length: 20 }, () => Math.random() * 100),
        style: { line: "cyan" },
      },
    ];
    setData(initialData);
  }, []);

  const lineWidgetRef = useRef<any>(null);
  const isAttachedRef = useRef(false);

  // Update widget data when it changes (after attachment)
  useEffect(() => {
    if (data.length === 0 || !isAttachedRef.current || !lineWidgetRef.current || !screen) return;
    
    const widget = lineWidgetRef.current;
    
    // Ensure canvas exists before setting data
    if (!(widget as any)._canvas || !widget.ctx) {
      // Canvas not ready yet - wait for it
      return;
    }
    
    widget.setData(data);
    // Render the widget to convert canvas to content, then render screen
    if (typeof widget.render === "function") {
      widget.render();
    }
    screen.render();
  }, [data, isAttachedRef.current, screen]);

  // Animate data - only after widget is attached
  useEffect(() => {
    if (data.length === 0 || !isAttachedRef.current) return;

    const interval = setInterval(() => {
      setData((prev) =>
        prev.map((series) => ({
          ...series,
          y: [...series.y.slice(1), Math.random() * 100],
        })),
      );
      setFrame((f) => f + 1);
    }, 500);

    return () => clearInterval(interval);
  }, [data.length, isAttachedRef.current]);

  return (
    <Box flexDirection="column" width="100%" height="100%" padding={1}>
      <Box height={3} justifyContent="center">
        <Text bold color="cyan">
          Line Chart Demo - Frame: {frame}
        </Text>
      </Box>

      <Box flexGrow={1}>
        <ContribWidgetWrapper
          createWidget={(opts) => {
            const line = new Line(opts);
            lineWidgetRef.current = line;
            return line;
          }}
          widgetOptions={{
            label: " System Metrics ",
            style: {
              line: "yellow",
              text: "green",
              baseline: "black",
            },
            wholeNumbersOnly: false,
            showLegend: true,
            legend: { width: 12 },
            data,
          }}
          boxProps={{
            width: "100%",
            height: "100%",
            border: 1,
            borderColor: "cyan",
          }}
          onWidgetAttached={(widget) => {
            isAttachedRef.current = true;
            // Initial data is set by canvas widget's attach handler
            // For updates, we'll use setData when data changes
          }}
          deps={[data]}
        />
      </Box>

      <Box height={3} paddingTop={1}>
        <Text>
          {data.map((s) => `${s.title}: ${s.y[s.y.length - 1].toFixed(1)}%`).join(" | ")}
        </Text>
      </Box>
    </Box>
  );
}

const instance = render(<LineChartDemo />, {
  runtime: new NodeRuntime(),
});

instance.screen.key(["q", "escape", "C-c"], () => {
  instance.unmount();
  process.exit(0);
});

instance.screen.render();
