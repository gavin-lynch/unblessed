/**
 * Screen-level color policy types.
 *
 * These are types only (no runtime dependencies) and are intended to be used by
 * ScreenOptions and any public APIs that allow configuring color behavior.
 */

import type { ColorMode } from "../lib/color-types.js";

export type ScreenColorMode = "auto" | ColorMode | "mono";

export type ScreenColorPreference = "fidelity" | "compact";

export type ContentTruecolorFallback = "quantize" | "ignore";

export interface ScreenColorPolicy {
  /** Target mode. 'auto' selects the best supported mode at runtime. */
  mode: ScreenColorMode;

  /** Preference for colors originating from widget/element styles. */
  preferForStyle: ScreenColorPreference;

  /** Preference for colors originating from content SGR (when allowed). */
  preferForContent: ScreenColorPreference;

  /**
   * If true, honor truecolor SGR sequences in content (38;2 / 48;2) when the
   * effective mode is truecolor.
   */
  allowTruecolorFromContent: boolean;

  /**
   * Behavior when content requests truecolor but truecolor is not allowed/supported.
   *
   * - 'quantize': convert RGB to nearest palette index and apply to packed attr.
   * - 'ignore': drop the color change.
   */
  contentTruecolorFallback: ContentTruecolorFallback;
}

export type ScreenColorPolicyOptions = Partial<ScreenColorPolicy>;
