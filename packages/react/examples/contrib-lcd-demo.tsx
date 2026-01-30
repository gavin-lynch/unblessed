#!/usr/bin/env tsx
/**
 * LCD Demo - @unblessed/contrib LCD widget example
 *
 * Demonstrates:
 * - 16-segment LED display
 * - Multiple display elements
 * - Real-time updates
 * - Custom colors
 *
 * Run with: tsx packages/react/examples/contrib-lcd-demo.tsx
 */

import { NodeRuntime } from "@unblessed/node";
import { useEffect, useRef, useState } from "react";
import { LCD } from "../../contrib/src/index.js";
import { Box, render, Text, useScreen } from "../src/index.js";
import { ContribWidgetWrapper } from "./contrib-wrapper.js";

function LCDDemo() {
  const [display, setDisplay] = useState("321");
  const [frame, setFrame] = useState(0);
  const widgetRef = useRef<LCD | null>(null);
  const isAttachedRef = useRef(false);

  const screen = useScreen();

  // Animate display - only after widget is attached
  useEffect(() => {
    if (!isAttachedRef.current || !screen) return;

    const interval = setInterval(() => {
      // Count up
      const num = (parseInt(display) + 1) % 1000;
      const newDisplay = num.toString().padStart(3, "0");
      setDisplay(newDisplay);
      if (widgetRef.current && screen) {
        widgetRef.current.setDisplay(newDisplay);
        screen.render();
      }
      setFrame((f) => f + 1);
    }, 500);

    return () => clearInterval(interval);
  }, [display, isAttachedRef.current, screen]);

  return (
    <Box flexDirection="column" width="100%" height="100%" padding={1}>
      <Box height={3} justifyContent="center">
        <Text bold color="green">
          LCD Display Demo - Frame: {frame}
        </Text>
      </Box>

      <Box flexGrow={1} justifyContent="center" alignItems="center">
        <Box width={60} height={20}>
          <ContribWidgetWrapper
            createWidget={(opts) => {
              const lcd = new LCD(opts);
              widgetRef.current = lcd;
              return lcd;
            }}
            widgetOptions={{
              label: " Counter ",
              segmentWidth: 0.06,
              segmentInterval: 0.11,
              strokeWidth: 0.11,
              elements: 3,
              display,
              elementSpacing: 4,
              elementPadding: 2,
              color: "green",
            }}
            boxProps={{
              width: "100%",
              height: "100%",
              border: 1,
              borderColor: "green",
            }}
            onWidgetAttached={() => {
              isAttachedRef.current = true;
              // Set initial display after attachment
              if (widgetRef.current) {
                widgetRef.current.setDisplay(display);
              }
            }}
            deps={[display]}
          />
        </Box>
      </Box>

      <Box height={3} justifyContent="center">
        <Text>16-segment LED display - Auto-incrementing counter</Text>
      </Box>
    </Box>
  );
}

const instance = render(<LCDDemo />, {
  runtime: new NodeRuntime(),
});

instance.screen.key(["q", "escape", "C-c"], () => {
  instance.unmount();
  process.exit(0);
});

instance.screen.render();
