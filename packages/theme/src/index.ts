export type ColorToken = string | number | [number, number, number];

export type PaddingValue = number | string;

export type Padding = {
  top?: PaddingValue;
  right?: PaddingValue;
  bottom?: PaddingValue;
  left?: PaddingValue;
};

export type StyleObject = Record<string, unknown>;

export type BorderStyle = {
  type?: string;
  fg?: ColorToken;
  bg?: ColorToken;
};

export type StyleBundle = {
  style?: StyleObject;
  padding?: Padding;
  border?: BorderStyle;
  radius?: number | string;
};

export type ComponentTheme = {
  base?: StyleBundle;
  variants?: Record<string, StyleBundle>;
};

export type ThemeTokens = {
  colors?: Record<string, ColorToken>;
  spacing?: Record<string, number>;
  radii?: Record<string, number>;
  borders?: Record<string, BorderStyle>;
  typography?: Record<string, unknown>;
  components?: Record<string, ComponentTheme>;
};

export type ResolvedStyleBundle = {
  style?: StyleObject;
  padding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  border?: BorderStyle;
  radius?: number;
};

export type Theme = {
  tokens: ThemeTokens;
  get: (path: string, fallback?: unknown) => unknown;
  resolveStyle: (input: StyleBundle | string) => ResolvedStyleBundle;
  component: (name: string, variant?: string) => ResolvedStyleBundle;
  utils: {
    parseClasses: (className: string) => ResolvedStyleBundle;
    merge: (a: StyleBundle, b?: StyleBundle) => StyleBundle;
    cx: (...classes: Array<string | undefined | null | false>) => string;
  };
};

const STYLE_FLAGS = new Set(["bold", "dim", "underline", "blink", "inverse"]);

export function createTheme(tokens: ThemeTokens): Theme {
  const theme: Theme = {
    tokens,
    get: (path: string, fallback?: unknown) => getPath(tokens, path, fallback),
    resolveStyle: (input: StyleBundle | string) =>
      typeof input === "string"
        ? resolveBundle(tokens, parseClasses(tokens, input))
        : resolveBundle(tokens, input),
    component: (name: string, variant?: string) =>
      resolveComponent(tokens, name, variant),
    utils: {
      parseClasses: (className: string) =>
        resolveBundle(tokens, parseClasses(tokens, className)),
      merge: (a: StyleBundle, b?: StyleBundle) => mergeBundles(a, b),
      cx: (...classes: Array<string | undefined | null | false>) =>
        classes.filter(Boolean).join(" "),
    },
  };

  return theme;
}

function getPath(
  obj: Record<string, unknown>,
  path: string,
  fallback?: unknown,
): unknown {
  const parts = path.split(".").filter(Boolean);
  let current: unknown = obj;
  for (const part of parts) {
    if (
      current &&
      typeof current === "object" &&
      part in (current as Record<string, unknown>)
    ) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return fallback;
    }
  }
  return current ?? fallback;
}

function resolveComponent(
  tokens: ThemeTokens,
  name: string,
  variant?: string,
): ResolvedStyleBundle {
  const component = tokens.components?.[name];
  if (!component) return {};
  const base = component.base || {};
  const variantBundle = variant ? component.variants?.[variant] : undefined;
  return resolveBundle(tokens, mergeBundles(base, variantBundle));
}

function resolveBundle(
  tokens: ThemeTokens,
  bundle: StyleBundle,
): ResolvedStyleBundle {
  const resolved: ResolvedStyleBundle = {};

  if (bundle.style) {
    resolved.style = resolveStyleObject(tokens, bundle.style);
  }

  if (bundle.padding) {
    resolved.padding = resolvePadding(tokens, bundle.padding);
  }

  if (bundle.border) {
    resolved.border = resolveBorder(tokens, bundle.border);
  }

  if (bundle.radius != null) {
    resolved.radius = resolveRadius(tokens, bundle.radius);
  }

  return resolved;
}

function resolveStyleObject(
  tokens: ThemeTokens,
  style: StyleObject,
): StyleObject {
  const output: StyleObject = {};
  for (const [key, value] of Object.entries(style)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      output[key] = resolveStyleObject(tokens, value as StyleObject);
      continue;
    }
    output[key] = resolveColorMaybe(tokens, value as ColorToken | undefined);
  }
  return output;
}

function resolvePadding(tokens: ThemeTokens, padding: Padding) {
  return {
    top: resolveSpacing(tokens, padding.top),
    right: resolveSpacing(tokens, padding.right),
    bottom: resolveSpacing(tokens, padding.bottom),
    left: resolveSpacing(tokens, padding.left),
  };
}

function resolveBorder(tokens: ThemeTokens, border: BorderStyle): BorderStyle {
  return {
    type: border.type,
    fg: resolveColorMaybe(tokens, border.fg),
    bg: resolveColorMaybe(tokens, border.bg),
  };
}

function resolveRadius(tokens: ThemeTokens, value: number | string): number {
  if (typeof value === "number") return value;
  const tokenValue = tokens.radii?.[value];
  if (tokenValue != null) return tokenValue;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function resolveColorMaybe(
  tokens: ThemeTokens,
  value?: ColorToken,
): ColorToken | undefined {
  if (value == null) return value;
  if (typeof value === "string") {
    const color = tokens.colors?.[value];
    if (color !== undefined) return color;
  }
  return value;
}

function resolveSpacing(
  tokens: ThemeTokens,
  value?: PaddingValue,
): number | undefined {
  if (value == null) return undefined;
  if (typeof value === "number") return value;
  const tokenValue = tokens.spacing?.[value];
  if (tokenValue != null) return tokenValue;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseClasses(tokens: ThemeTokens, className: string): StyleBundle {
  const bundle: StyleBundle = {};
  const tokensList = className.split(/\s+/).filter(Boolean);

  for (const token of tokensList) {
    if (STYLE_FLAGS.has(token)) {
      bundle.style = bundle.style || {};
      bundle.style[token] = true;
      continue;
    }

    if (token.startsWith("fg-")) {
      const name = token.slice(3);
      bundle.style = bundle.style || {};
      bundle.style.fg = name;
      continue;
    }

    if (token.startsWith("bg-")) {
      const name = token.slice(3);
      bundle.style = bundle.style || {};
      bundle.style.bg = name;
      continue;
    }

    if (token.startsWith("border-bg-")) {
      const name = token.slice("border-bg-".length);
      bundle.border = bundle.border || {};
      bundle.border.bg = name;
      continue;
    }

    if (token.startsWith("border-")) {
      const name = token.slice("border-".length);
      bundle.border = bundle.border || {};
      bundle.border.fg = name;
      continue;
    }

    if (token.startsWith("rounded-")) {
      const name = token.slice("rounded-".length);
      bundle.radius = resolveRadius(tokens, name);
      continue;
    }

    if (token.startsWith("p-")) {
      const value = token.slice(2);
      bundle.padding = bundle.padding || {};
      const spacing = resolveSpacing(tokens, value);
      bundle.padding.top = spacing;
      bundle.padding.right = spacing;
      bundle.padding.bottom = spacing;
      bundle.padding.left = spacing;
      continue;
    }

    if (token.startsWith("px-")) {
      const value = token.slice(3);
      bundle.padding = bundle.padding || {};
      const spacing = resolveSpacing(tokens, value);
      bundle.padding.left = spacing;
      bundle.padding.right = spacing;
      continue;
    }

    if (token.startsWith("py-")) {
      const value = token.slice(3);
      bundle.padding = bundle.padding || {};
      const spacing = resolveSpacing(tokens, value);
      bundle.padding.top = spacing;
      bundle.padding.bottom = spacing;
      continue;
    }

    if (token.startsWith("pt-")) {
      const value = token.slice(3);
      bundle.padding = bundle.padding || {};
      bundle.padding.top = resolveSpacing(tokens, value);
      continue;
    }

    if (token.startsWith("pr-")) {
      const value = token.slice(3);
      bundle.padding = bundle.padding || {};
      bundle.padding.right = resolveSpacing(tokens, value);
      continue;
    }

    if (token.startsWith("pb-")) {
      const value = token.slice(3);
      bundle.padding = bundle.padding || {};
      bundle.padding.bottom = resolveSpacing(tokens, value);
      continue;
    }

    if (token.startsWith("pl-")) {
      const value = token.slice(3);
      bundle.padding = bundle.padding || {};
      bundle.padding.left = resolveSpacing(tokens, value);
      continue;
    }
  }

  return bundle;
}

function mergeBundles(a: StyleBundle, b?: StyleBundle): StyleBundle {
  if (!b) return { ...a };
  return {
    style: mergeObjects(a.style, b.style),
    padding: mergeObjects(a.padding, b.padding),
    border: mergeObjects(a.border, b.border),
    radius: b.radius ?? a.radius,
  };
}

function mergeObjects<T extends Record<string, unknown> | undefined>(
  a?: T,
  b?: T,
): T | undefined {
  if (!a && !b) return undefined;
  if (!a) return { ...(b as Record<string, unknown>) } as T;
  if (!b) return { ...(a as Record<string, unknown>) } as T;
  const merged: Record<string, unknown> = { ...a };
  for (const [key, value] of Object.entries(b)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof merged[key] === "object" &&
      merged[key] !== null
    ) {
      merged[key] = mergeObjects(
        merged[key] as Record<string, unknown>,
        value as Record<string, unknown>,
      );
    } else {
      merged[key] = value;
    }
  }
  return merged as T;
}
