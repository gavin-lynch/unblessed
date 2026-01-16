---
sidebar_position: 6
---

# Styling

Understanding how to style widgets in unblessed.

## Overview

unblessed provides two approaches to styling widgets:

1. **Style object** - Traditional blessed-style object-based configuration
2. **className** - UnblessedWind declarative class strings (Tailwind-inspired, new!)

Both approaches can be combined, with explicit style properties taking precedence over className values.

## Style Object (Traditional)

The classic blessed approach using nested style objects:

```typescript
const box = new Box({
  parent: screen,
  style: {
    fg: "white",
    bg: "blue",
    bold: true,
    border: {
      fg: "cyan",
    },
  },
  border: "line",
});
```

### Available Style Properties

| Property      | Type               | Description             |
| ------------- | ------------------ | ----------------------- |
| `fg`          | `string \| number` | Foreground (text) color |
| `bg`          | `string \| number` | Background color        |
| `bold`        | `boolean`          | Bold text               |
| `dim`         | `boolean`          | Dim/faded text          |
| `underline`   | `boolean`          | Underlined text         |
| `blink`       | `boolean`          | Blinking text           |
| `inverse`     | `boolean`          | Swap fg/bg colors       |
| `invisible`   | `boolean`          | Hidden text             |
| `transparent` | `boolean`          | Transparent background  |
| `border`      | `object`           | Border-specific styles  |

### Color Values

Colors can be specified as:

```typescript
// Named colors
style: { fg: "red", bg: "blue" }

// Terminal color numbers (0-255)
style: { fg: 196, bg: 21 }

// Hex colors (converted to nearest terminal color)
style: { fg: "#ff0000", bg: "#0000ff" }
```

**Named colors:** `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, and light variants (`light-red`, `light-blue`, etc.)

## className (UnblessedWind)

The new declarative approach using space-separated class strings:

```typescript
const box = new Box({
  parent: screen,
  className: "bg-blue fg-white bold border-line border-cyan p-2",
});
```

This is equivalent to the style object example above, but more concise and readable.

### Benefits

- **Concise** - Less nesting, easier to read
- **Composable** - Combine classes easily
- **Familiar** - Tailwind-inspired syntax adapted for terminals
- **Mixable** - Works alongside style objects

### Combining with Style Objects

Explicit style properties take precedence over className:

```typescript
const box = new Box({
  parent: screen,
  className: "bg-blue fg-white", // Base styles from className
  style: { fg: "yellow" }, // Explicit style overrides fg
});
// Result: bg=blue, fg=yellow (explicit wins)
```

## className Reference

### Colors

**Background:**

```
bg-{color}      Background color
bg-red          Named color
bg-blue-500     Color with shade (100-900)
bg-#ff0000      Hex color
bg-[200]        Terminal color number
```

**Foreground (text):**

```
fg-{color}      Foreground color
text-{color}    Alias for fg-{color}
fg-white
text-cyan
fg-green-300
```

**Available named colors:**
`black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`,
`light-black` (gray), `light-red`, `light-green`, `light-yellow`,
`light-blue`, `light-magenta`, `light-cyan`, `light-white`

**Color shades (100-900):**
`red-100` through `red-900`, same for all base colors.

### Text Attributes

```
bold            Bold text
dim             Dim/faded text
underline       Underlined text
blink           Blinking text
inverse         Swap fg/bg
invisible       Hidden text
transparent     Transparent background

no-bold         Disable bold
no-underline    Disable underline
(etc.)
```

### Borders

**Border types:**

```
border          Enable line border (shorthand for border-line)
border-line     Line border (─│┐└)
border-single   Same as line
border-double   Double line border (═║╗╚)
border-round    Rounded corners (─│╮╰)
border-bold     Bold lines
border-classic  Classic ASCII (+--+)
border-arrow    Arrow style
border-none     No border
```

**Border colors:**

```
border-red      Red border
border-cyan     Cyan border
border-#ff0000  Hex color border
```

### Padding

```
p-{n}           All sides (p-2)
px-{n}          Horizontal (left + right)
py-{n}          Vertical (top + bottom)
pt-{n}          Top only
pb-{n}          Bottom only
pl-{n}          Left only
pr-{n}          Right only
```

### Alignment

**Horizontal text alignment:**

```
text-left       Left align
text-center     Center align
text-right      Right align
```

**Vertical alignment:**

```
align-top       Top align
align-middle    Middle align
align-bottom    Bottom align
```

### Size & Position

```
w-{n}           Width in cells (w-20)
h-{n}           Height in cells (h-10)
w-{n}%          Width percentage (w-50%)
h-{n}%          Height percentage (h-100%)
w-full          100% width
h-full          100% height
w-half          50% width
h-half          50% height
w-shrink        Shrink to content

top-{n}         Top position
left-{n}        Left position
right-{n}       Right position
bottom-{n}      Bottom position
top-center      Center vertically
left-center     Center horizontally
```

### Layout

```
shrink          Shrink to content size
hidden          Hide the widget
wrap            Enable text wrapping
shadow          Enable shadow effect
scrollable      Enable scrolling
```

## Examples

### Simple Styled Box

```typescript
const box = new Box({
  parent: screen,
  className: "bg-blue fg-white bold p-1 border-line border-cyan",
  content: "Hello World!",
});
```

### Dashboard Panel

```typescript
const panel = new Box({
  parent: screen,
  className: "w-50% h-50% top-0 left-0 border-round border-green bg-black",
  label: " Status ",
});
```

### Centered Dialog

```typescript
const dialog = new Box({
  parent: screen,
  className:
    "w-40 h-10 top-center left-center border-double border-yellow bg-black fg-white text-center",
  content: "Are you sure?",
});
```

### Combining className with Style Object

```typescript
const box = new Box({
  parent: screen,
  // Base styles via className
  className: "bg-blue border-line p-2",
  // Override/extend with style object
  style: {
    fg: "yellow",
    border: { fg: "white" },
  },
  border: "line",
});
```

## Best Practices

1. **Use className for common patterns** - Quick styling with familiar syntax
2. **Use style objects for complex cases** - When you need computed values or conditional styles
3. **Combine both approaches** - className for base, style for overrides
4. **Keep it readable** - Long className strings can be split across lines in template literals

```typescript
// Long className can use template literals
const box = new Box({
  className: `
    bg-blue fg-white
    border-line border-cyan
    p-2 w-50% h-100%
    text-center
  `,
});
```
