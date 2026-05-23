---
sidebar_position: 4
---

# CursedWind

**CursedWind** is unblessed's Tailwind-inspired utility class system for terminal UIs. Instead of spelling out nested `style`, `border`, and `padding` objects on every widget, you pass a space-separated `className` string ? familiar if you've used Tailwind CSS, adapted for ANSI colors, borders, and cell-based layout.

## Quick start

Any widget that extends `Element` accepts `className`:

```typescript
import { Screen, Box } from "@gavin-lynch/unblessed-node";

const screen = new Screen({ smartCSR: true });

const header = new Box({
  parent: screen,
  top: 0,
  left: 0,
  width: "100%",
  height: 3,
  content: " Dashboard ",
  className: "bg-blue fg-white bold border-line border-cyan px-2 text-center",
});

const panel = new Box({
  parent: screen,
  top: 3,
  left: 0,
  width: "50%",
  height: "100%-3",
  content: "Main content",
  className: "bg-black fg-light-gray p-2 border-round border-green",
});

screen.render();
```

Classes are parsed when the widget is constructed and merged into the widget's options (style, border, padding, alignment, size, and more).

## How it works

CursedWind lives in `@gavin-lynch/unblessed-core` as a small parser module:

| Function                              | Purpose                                              |
| ------------------------------------- | ---------------------------------------------------- |
| `parseClassName(className)`           | Parse a class string into a `ParsedClassName` object |
| `mergeClassNameOptions(base, parsed)` | Merge parsed classes into existing options           |
| `applyClassName(options)`             | Parse `options.className` and merge in one step      |

```typescript
import { parseClassName, applyClassName } from "@gavin-lynch/unblessed-core";

const parsed = parseClassName("bg-blue fg-white bold p-2");

const options = applyClassName({
  content: "Hello",
  className: "bg-red fg-white",
});
```

Unknown classes are ignored silently, so you can mix CursedWind utilities with custom class tokens for your own tooling.

## Class reference

### Colors

| Class    | Example                 | Maps to                     |
| -------- | ----------------------- | --------------------------- |
| `bg-*`   | `bg-blue`, `bg-red-500` | Background (`style.bg`)     |
| `fg-*`   | `fg-white`              | Foreground (`style.fg`)     |
| `text-*` | `text-cyan`             | Foreground (alias of `fg-`) |

**Color formats:**

- **Named** ? `red`, `light-blue`, `cyan`, `orange`, `slate`, ?
- **Shades** ? `red-500`, `blue-700`, `gray-300` (256-color palette steps)
- **Hex** ? `bg-#ff0000`, `fg-#00ff00`
- **Arbitrary ANSI index** ? `bg-[200]`, `fg-[44]`

```typescript
new Box({ className: "bg-blue-500 fg-gray-100" });
new Box({ className: "bg-#1e293b fg-#f8fafc" });
new Box({ className: "bg-[39] fg-[15]" });
```

### Text attributes

| Class                            | Effect                        |
| -------------------------------- | ----------------------------- |
| `bold` / `no-bold`               | Bold on/off                   |
| `dim` / `no-dim`                 | Dim on/off                    |
| `underline` / `no-underline`     | Underline on/off              |
| `blink` / `no-blink`             | Blink on/off                  |
| `inverse` / `no-inverse`         | Inverse video on/off          |
| `invisible` / `no-invisible`     | Invisible text on/off         |
| `transparent` / `no-transparent` | Transparent background on/off |

Combine freely: `className: "bold underline dim"`.

### Borders

| Class                                                                                             | Effect                  |
| ------------------------------------------------------------------------------------------------- | ----------------------- |
| `border`, `border-line`                                                                           | Line border             |
| `border-bg`                                                                                       | Background-style border |
| `border-single`, `border-double`, `border-round`, `border-bold`, `border-classic`, `border-arrow` | Border drawing style    |
| `border-cyan`, `border-red-500`, ?                                                                | Border foreground color |

```typescript
new Box({ className: "border-line border-double border-yellow" });
```

### Padding

| Class                          | Effect                                 |
| ------------------------------ | -------------------------------------- |
| `p-2`                          | All sides (value is in terminal cells) |
| `px-3`                         | Left + right                           |
| `py-1`                         | Top + bottom                           |
| `pt-2`, `pb-3`, `pl-1`, `pr-4` | Single side                            |

### Alignment

| Class                                       | Effect                       |
| ------------------------------------------- | ---------------------------- |
| `text-left`, `text-center`, `text-right`    | Horizontal content alignment |
| `align-top`, `align-middle`, `align-bottom` | Vertical alignment           |

### Size and position

| Class                                     | Effect                          |
| ----------------------------------------- | ------------------------------- |
| `w-20`, `h-10`                            | Fixed width/height in cells     |
| `w-50%`, `h-100%`                         | Percentage of parent            |
| `w-full`, `h-full`                        | 100%                            |
| `w-half`, `h-half`                        | 50%                             |
| `w-shrink`, `h-shrink`                    | Shrink to content               |
| `top-0`, `left-10`, `right-5`, `bottom-2` | Edge offsets                    |
| `top-center`, `left-50%`                  | Center / percentage positioning |

### Layout

| Class                          | Effect             |
| ------------------------------ | ------------------ |
| `shrink` / `no-shrink`         | Shrink to content  |
| `hidden` / `visible`           | Hide or show       |
| `wrap` / `no-wrap`             | Text wrapping      |
| `shadow` / `no-shadow`         | Drop shadow        |
| `scrollable` / `no-scrollable` | Scrollable content |

## Tree widget classes

The `Tree` widget has dedicated utilities for lines, indicators, and per-depth styling:

| Class                                            | Styles                       |
| ------------------------------------------------ | ---------------------------- |
| `tree-line-cyan`                                 | Connector lines (?, ?, ?, ?) |
| `tree-indicator-yellow`                          | Expand/collapse indicators   |
| `tree-expanded-green`, `tree-expanded-bg-blue`   | Expanded nodes               |
| `tree-collapsed-red`, `tree-collapsed-bg-yellow` | Collapsed nodes              |
| `tree-leaf-white`, `tree-leaf-bg-black`          | Leaf nodes                   |
| `tree-depth-0-cyan`, `tree-depth-1-bg-magenta`   | Per-depth overrides          |

```typescript
import { Tree } from "@gavin-lynch/unblessed-node";

new Tree({
  parent: screen,
  className:
    "tree-line-cyan tree-indicator-yellow tree-expanded-green tree-leaf-white",
  data: {},
});
```

## Combining with explicit options

You can mix `className` with normal widget options. Non-conflicting fields compose together ? for example, `className: "bg-blue bold"` plus an explicit `style.fg` keeps your foreground while adding background and bold from classes.

When both set the same style key, the **class wins**. Use either classes or explicit `style` for a given property, not both.

## Dashboard example

```typescript
import { Screen, Box, List } from "@gavin-lynch/unblessed-node";

const screen = new Screen({ smartCSR: true, title: "CursedWind demo" });

new Box({
  parent: screen,
  top: 0,
  left: 0,
  width: "100%",
  height: 3,
  content: " CursedWind ",
  className:
    "bg-indigo fg-white bold border-line border-light-cyan text-center",
});

new List({
  parent: screen,
  top: 3,
  left: 0,
  width: 24,
  height: "100%-3",
  className: "bg-slate fg-light-gray border-line border-zinc p-1",
  items: ["Overview", "Metrics", "Settings"],
});

new Box({
  parent: screen,
  top: 3,
  left: 24,
  width: "100%-24",
  height: "100%-3",
  content: "Content area",
  className: "bg-black fg-white p-2 wrap",
});

screen.key(["q", "C-c"], () => process.exit(0));
screen.render();
```

## API reference

Generated TypeDoc entries for `parseClassName`, `applyClassName`, `mergeClassNameOptions`, and `ParsedClassName` are listed under **API Reference ? CursedWind** in the sidebar.

## See also

- [Widgets](./widgets) ? widget hierarchy and options
- [Rendering](./rendering) ? how styled widgets draw to the terminal
- [Element API](/docs/api/generated/widgets.element.Class.Element) ? base class that applies `className`
