#!/usr/bin/env tsx
/**
 * Log Widget Demo - @unblessed/contrib Log widget example
 * 
 * Demonstrates:
 * - Scrolling log display
 * - Auto-scroll to bottom
 * - Color tags support
 * - Buffer management
 * 
 * Run with: tsx packages/react/examples/contrib-log-demo.tsx
 */

import { Log } from "../../contrib/src/index.js";
import { NodeRuntime } from "@unblessed/node";
import { useEffect, useRef, useState } from "react";
import { Box, render, Text, useScreen } from "../src/index.js";
import { ContribWidgetWrapper } from "./contrib-wrapper.js";

function LogDemo() {
  const [logCount, setLogCount] = useState(0);
  const widgetRef = useRef<Log | null>(null);
  const isAttachedRef = useRef(false);
  const screen = useScreen();

  // Generate log messages - only after widget is attached
  useEffect(() => {
    if (!isAttachedRef.current || !screen) return;

    const interval = setInterval(() => {
      if (widgetRef.current && screen) {
        const level = ["INFO", "WARN", "ERROR"][Math.floor(Math.random() * 3)];
        const colors = {
          INFO: "green",
          WARN: "yellow",
          ERROR: "red",
        };
        const color = colors[level as keyof typeof colors];
        const timestamp = new Date().toLocaleTimeString();
        widgetRef.current.log(
          `{${color}-fg}[${timestamp}] {bold}${level}{/bold}: Message #${logCount + 1}{/${color}-fg}`,
        );
        setLogCount((c) => c + 1);
        screen.render();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [logCount, isAttachedRef.current, screen]);

  return (
    <Box flexDirection="column" width="100%" height="100%" padding={1}>
      <Box height={3} justifyContent="center">
        <Text bold color="white">
          Log Widget Demo - Messages: {logCount}
        </Text>
      </Box>

      <Box flexGrow={1}>
        <ContribWidgetWrapper
          createWidget={(opts) => {
            const log = new Log(opts);
            widgetRef.current = log;
            return log;
          }}
          widgetOptions={{
            label: " Application Log ",
            bufferLength: 50,
            tags: true,
            border: { type: "line" },
          }}
          boxProps={{
            width: "100%",
            height: "100%",
            border: 1,
            borderColor: "white",
          }}
          onWidgetAttached={() => {
            isAttachedRef.current = true;
          }}
        />
      </Box>

      <Box height={2} justifyContent="center">
        <Text>Auto-scrolling log with color tags</Text>
      </Box>
    </Box>
  );
}

const instance = render(<LogDemo />, {
  runtime: new NodeRuntime(),
});

instance.screen.key(["q", "escape", "C-c"], () => {
  instance.unmount();
  process.exit(0);
});

instance.screen.render();
