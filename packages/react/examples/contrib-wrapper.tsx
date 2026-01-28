/**
 * contrib-wrapper.tsx - Generic wrapper for @unblessed/contrib widgets
 *
 * This helper component allows using contrib widgets (which are not React components)
 * within React applications by wrapping them in a Box and managing their lifecycle.
 */

import type { Element } from "@unblessed/core";
import { useEffect, useRef } from "react";
import { Box, useScreen, useWidget } from "../src/index.js";

export interface ContribWidgetWrapperProps {
  /** Widget constructor function */
  createWidget: (options: any) => Element;
  /** Widget options */
  widgetOptions?: Record<string, any>;
  /** Box props for the container */
  boxProps?: Record<string, any>;
  /** Callback when widget is created */
  onWidgetCreated?: (widget: Element) => void;
  /** Callback when widget is attached (canvas context available) */
  onWidgetAttached?: (widget: Element) => void;
  /** Dependencies array for useEffect (widget will be recreated when these change) */
  deps?: any[];
}

/**
 * Generic wrapper component for contrib widgets
 *
 * @example
 * ```tsx
 * import { Line } from '@unblessed/contrib';
 *
 * <ContribWidgetWrapper
 *   createWidget={(opts) => new Line(opts)}
 *   widgetOptions={{ label: 'Chart', data: { x: [...], y: [...] } }}
 *   boxProps={{ width: '50%', height: '50%', border: 1 }}
 *   onWidgetAttached={(widget) => {
 *     // Widget is attached, canvas context is available
 *     (widget as Line).setData(data);
 *   }}
 * />
 * ```
 */
export function ContribWidgetWrapper({
  createWidget,
  widgetOptions = {},
  boxProps = {},
  onWidgetCreated,
  onWidgetAttached,
  deps = [],
}: ContribWidgetWrapperProps) {
  const boxRef = useWidget<Element>();
  const widgetRef = useRef<Element | null>(null);
  const isAttachedRef = useRef(false);
  const screen = useScreen();

  // Effect to create/update widget
  useEffect(() => {
    const box = boxRef.current;
    if (!box || !screen) return;

    // Create the widget - it will fill the parent box
    // Use percentages so it inherits from parent's resolved dimensions
    const createWidgetInBox = () => {
      // Clean up existing widget first
      if (widgetRef.current) {
        const oldWidget = widgetRef.current;
        oldWidget.off("attach");
        oldWidget.off("resize");
        if (oldWidget && oldWidget.detach) {
          oldWidget.detach();
        }
        widgetRef.current = null;
        isAttachedRef.current = false;
      }

      // Create the contrib widget - use percentages so it inherits from parent
      // The canvas widget's attach handler will resolve these when it has dimensions
      const widget = createWidget({
        parent: box,
        width: "100%",
        height: "100%",
        ...widgetOptions,
      });

      widgetRef.current = widget;

      // Callback when widget is created
      if (onWidgetCreated) {
        onWidgetCreated(widget);
      }

      // Listen for attach event (when canvas context becomes available)
      const attachHandler = () => {
        // Check if canvas was created
        const hasCanvas = !!(widget as any)._canvas && (widget as any).ctx;

        if (hasCanvas) {
          isAttachedRef.current = true;

          // If widget has setData method and data in options, call it
          if (
            typeof (widget as any).setData === "function" &&
            widgetOptions.data !== undefined
          ) {
            try {
              (widget as any).setData(widgetOptions.data);
            } catch (err) {
              // setData might fail if canvas isn't fully ready, that's ok
              console.warn("setData failed on attach:", err);
            }
          }

          if (onWidgetAttached) {
            onWidgetAttached(widget);
          }

          // Render screen to display the widget
          screen.render();
        }
      };

      widget.on("attach", attachHandler);

      // Also listen for resize in case canvas is created later
      const resizeHandler = () => {
        const hasCanvas = !!(widget as any)._canvas && (widget as any).ctx;
        if (hasCanvas && !isAttachedRef.current) {
          // Canvas was just created, trigger attach handler logic
          attachHandler();
        } else if (hasCanvas) {
          screen.render();
        }
      };
      widget.on("resize", resizeHandler);

      // Render after widget is created
      screen.render();
    };

    // Create widget immediately - it will be attached to box
    // Canvas will be created when widget is attached (if dimensions are ready)
    // or when box gets dimensions (resize event)
    createWidgetInBox();

    // Listen for box resize to ensure canvas is created when dimensions become available
    const boxResizeHandler = () => {
      if (widgetRef.current) {
        // Widget exists - trigger its resize to create canvas if needed
        const widget = widgetRef.current;
        if (!(widget as any)._canvas) {
          // Canvas not created yet - check if dimensions are now available
          if (widget.width > 0 && widget.height > 0) {
            // Dimensions are available - trigger resize to create canvas
            widget.emit("resize");
          }
        }
      }
    };
    box.on("resize", boxResizeHandler);

    // Poll to check if Box has dimensions and create canvas if needed
    // Layout is computed after React commits, so we need to wait for it
    let checkCount = 0;
    const maxChecks = 20; // Check up to 20 times (2 seconds max)
    const checkCanvas = () => {
      checkCount++;
      if (widgetRef.current && checkCount < maxChecks) {
        const widget = widgetRef.current;
        const boxWidth = box.width;
        const boxHeight = box.height;
        const widgetWidth = widget.width;
        const widgetHeight = widget.height;

        // If box has dimensions but canvas doesn't exist, trigger resize to create it
        if (
          !(widget as any)._canvas &&
          boxWidth > 0 &&
          boxHeight > 0 &&
          widgetWidth > 0 &&
          widgetHeight > 0
        ) {
          // Dimensions are available - trigger resize to create canvas
          widget.emit("resize");
        } else if (!(widget as any)._canvas) {
          // Canvas still doesn't exist - keep checking
          setTimeout(checkCanvas, 100);
        }
      }
    };

    // Start checking after a short delay to let layout compute
    const checkTimer = setTimeout(checkCanvas, 50);

    // Cleanup
    return () => {
      clearTimeout(checkTimer);
      box.off("resize", boxResizeHandler);
      if (widgetRef.current) {
        const widget = widgetRef.current;
        widget.off("attach");
        widget.off("resize");
        if (widget && widget.detach) {
          widget.detach();
        }
        widgetRef.current = null;
        isAttachedRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boxRef.current, screen, ...deps]);

  // Separate effect to update data when widget is already attached
  useEffect(() => {
    const widget = widgetRef.current;
    if (!widget || !isAttachedRef.current || !widgetOptions.data) return;

    // Widget is attached and has canvas - update data
    if (typeof (widget as any).setData === "function") {
      try {
        (widget as any).setData(widgetOptions.data);
        if (screen) {
          screen.render();
        }
      } catch (err) {
        console.warn("setData failed on update:", err);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetOptions.data, isAttachedRef.current]);

  return <Box {...boxProps} ref={boxRef} />;
}
