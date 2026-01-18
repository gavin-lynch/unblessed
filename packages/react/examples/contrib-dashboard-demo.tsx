#!/usr/bin/env tsx
/**
 * Dashboard Demo - @unblessed/contrib widgets combined
 * 
 * Demonstrates:
 * - Multiple contrib widgets in a dashboard layout
 * - Line chart, bar chart, gauge, donut, sparkline, log
 * - Real-time updates across all widgets
 * - Responsive layout with flexbox
 * 
 * Run with: tsx packages/react/examples/contrib-dashboard-demo.tsx
 */

import {
  Bar,
  Donut,
  Gauge,
  Line,
  Log,
  Sparkline,
  type BarData,
  type DonutData,
  type GaugeStackItem,
  type LineSeriesData,
  type SparklineData,
} from "../../contrib/src/index.js";
import { NodeRuntime } from "@unblessed/node";
import { useEffect, useRef, useState } from "react";
import { Box, render, Text, useScreen } from "../src/index.js";
import { ContribWidgetWrapper } from "./contrib-wrapper.js";

function DashboardDemo() {
  const [lineData, setLineData] = useState<LineSeriesData[]>([]);
  const [barData, setBarData] = useState<BarData>({
    titles: ["Q1", "Q2", "Q3", "Q4"],
    data: [45, 67, 89, 34],
  });
  const [gaugeStack, setGaugeStack] = useState<GaugeStackItem[]>([
    { percent: 30, stroke: "green" },
    { percent: 40, stroke: "yellow" },
    { percent: 20, stroke: "red" },
  ]);
  const [donutData, setDonutData] = useState<DonutData[]>([
    { label: "SSD", percent: 75, color: "green" },
    { label: "HDD", percent: 45, color: "blue" },
  ]);
  const [sparklineData, setSparklineData] = useState<SparklineData>({
    titles: ["CPU", "Mem"],
    data: [
      Array.from({ length: 20 }, () => Math.random() * 100),
      Array.from({ length: 20 }, () => Math.random() * 100),
    ],
  });
  const [frame, setFrame] = useState(0);
  const logRef = useRef<Log | null>(null);
  const screen = useScreen();

  // Initialize line data
  useEffect(() => {
    setLineData([
      {
        title: "CPU",
        x: Array.from({ length: 15 }, (_, i) => `${i}`),
        y: Array.from({ length: 15 }, () => Math.random() * 100),
        style: { line: "green" },
      },
      {
        title: "Memory",
        x: Array.from({ length: 15 }, (_, i) => `${i}`),
        y: Array.from({ length: 15 }, () => Math.random() * 100),
        style: { line: "yellow" },
      },
    ]);
  }, []);

  // Animate all widgets
  useEffect(() => {
    const interval = setInterval(() => {
      // Update line chart
      setLineData((prev) =>
        prev.map((series) => ({
          ...series,
          y: [...series.y.slice(1), Math.random() * 100],
        })),
      );

      // Update bar chart
      setBarData({
        titles: ["Q1", "Q2", "Q3", "Q4"],
        data: Array.from({ length: 4 }, () => Math.floor(Math.random() * 100)),
      });

      // Update gauge
      setGaugeStack([
        { percent: Math.random() * 30, stroke: "green" },
        { percent: Math.random() * 40, stroke: "yellow" },
        { percent: Math.random() * 30, stroke: "red" },
      ]);

      // Update donut
      setDonutData([
        { label: "SSD", percent: Math.random() * 100, color: "green" },
        { label: "HDD", percent: Math.random() * 100, color: "blue" },
      ]);

      // Update sparkline
      setSparklineData((prev) => ({
        ...prev,
        data: prev.data.map((series) => [
          ...series.slice(1),
          Math.random() * 100,
        ]),
      }));

      // Add log message
      if (logRef.current && screen) {
        const level = frame % 3 === 0 ? "ERROR" : frame % 2 === 0 ? "WARN" : "INFO";
        const color = level === "ERROR" ? "red" : level === "WARN" ? "yellow" : "green";
        logRef.current.log(
          `{${color}-fg}[${new Date().toLocaleTimeString()}] ${level}: Update #${frame + 1}{/${color}-fg}`,
        );
        screen.render();
      }

      setFrame((f) => f + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [frame]);

  return (
    <Box flexDirection="column" width="100%" height="100%" padding={1} gap={1}>
      <Box height={3} justifyContent="center">
        <Text bold color="cyan">
          Contrib Dashboard - Frame: {frame}
        </Text>
      </Box>

      {/* Top row: Line and Bar */}
      <Box flexDirection="row" height="35%" gap={1}>
        <Box flexGrow={1} height="100%">
          <ContribWidgetWrapper
            createWidget={(opts) => new Line(opts)}
            widgetOptions={{
              label: " Metrics ",
              style: { line: "yellow", text: "green", baseline: "black" },
              wholeNumbersOnly: false,
              showLegend: true,
              legend: { width: 10 },
              data: lineData,
            }}
            boxProps={{
              width: "100%",
              height: "100%",
              border: 1,
              borderColor: "cyan",
            }}
            deps={[lineData]}
          />
        </Box>
        <Box flexGrow={1} height="100%">
          <ContribWidgetWrapper
            createWidget={(opts) => new Bar(opts)}
            widgetOptions={{
              label: " Sales ",
              barWidth: 4,
              barSpacing: 6,
              barBgColor: "green",
              data: barData,
            }}
            boxProps={{
              width: "100%",
              height: "100%",
              border: 1,
              borderColor: "green",
            }}
            deps={[barData]}
          />
        </Box>
      </Box>

      {/* Middle row: Gauge, Donut, Sparkline */}
      <Box flexDirection="row" height="30%" gap={1}>
        <Box width="33%" height="100%">
          <ContribWidgetWrapper
            createWidget={(opts) => new Gauge(opts)}
            widgetOptions={{
              label: " Resources ",
              stroke: "cyan",
              stack: gaugeStack,
            }}
            boxProps={{
              width: "100%",
              height: "100%",
              border: 1,
              borderColor: "cyan",
            }}
            deps={[gaugeStack]}
          />
        </Box>
        <Box width="33%" height="100%">
          <ContribWidgetWrapper
            createWidget={(opts) => new Donut(opts)}
            widgetOptions={{
              label: " Disks ",
              stroke: "yellow",
              radius: 10,
              data: donutData,
            }}
            boxProps={{
              width: "100%",
              height: "100%",
              border: 1,
              borderColor: "yellow",
            }}
            deps={[donutData]}
          />
        </Box>
        <Box width="34%" height="100%">
          <ContribWidgetWrapper
            createWidget={(opts) => new Sparkline(opts)}
            widgetOptions={{
              label: " Trends ",
              bufferLength: 20,
              data: sparklineData,
            }}
            boxProps={{
              width: "100%",
              height: "100%",
              border: 1,
              borderColor: "blue",
            }}
            deps={[sparklineData]}
          />
        </Box>
      </Box>

      {/* Bottom: Log */}
      <Box flexGrow={1} height="30%">
        <ContribWidgetWrapper
          createWidget={(opts) => {
            const log = new Log(opts);
            logRef.current = log;
            return log;
          }}
          widgetOptions={{
            label: " Log ",
            bufferLength: 20,
            tags: true,
          }}
          boxProps={{
            width: "100%",
            height: "100%",
            border: 1,
            borderColor: "white",
          }}
        />
      </Box>
    </Box>
  );
}

const instance = render(<DashboardDemo />, {
  runtime: new NodeRuntime(),
});

instance.screen.key(["q", "escape", "C-c"], () => {
  instance.unmount();
  process.exit(0);
});

instance.screen.render();
