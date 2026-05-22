# Function: parseClassName()

> **parseClassName**(`className`): [`ParsedClassName`](lib.cursedwind.Interface.ParsedClassName.md)

Defined in: [packages/core/src/lib/cursedwind.ts:656](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/cursedwind.ts#L656)

Parse a className string into widget options.

CursedWind supports Tailwind-like class names adapted for terminal UIs:

**Colors:**

- `bg-\{color\}` - Background color (bg-red, bg-blue-500, bg-#ff0000, bg-[200])
- `fg-\{color\}` or `text-\{color\}` - Foreground color

**Text Attributes:**

- `bold`, `no-bold` - Bold text
- `dim`, `no-dim` - Dimmed text
- `underline`, `no-underline` - Underlined text
- `blink`, `no-blink` - Blinking text
- `inverse`, `no-inverse` - Inverse colors
- `invisible`, `no-invisible` - Hidden text
- `transparent`, `no-transparent` - Transparent background

**Border:**

- `border` or `border-line` - Line border
- `border-bg` - Background border
- `border-\{style\}` - Border style (single, double, round, bold, classic, arrow)
- `border-\{color\}` - Border color

**Padding:**

- `p-\{n\}` - All sides padding
- `px-\{n\}` - Horizontal padding
- `py-\{n\}` - Vertical padding
- `pt-\{n\}`, `pb-\{n\}`, `pl-\{n\}`, `pr-\{n\}` - Individual side padding

**Alignment:**

- `text-left`, `text-center`, `text-right` - Horizontal alignment
- `align-top`, `align-middle`, `align-bottom` - Vertical alignment

**Size:**

- `w-\{n\}`, `w-`\{n\}`%`, `w-full`, `w-half`, `w-shrink` - Width
- `h-\{n\}`, `h-`\{n\}`%`, `h-full`, `h-half`, `h-shrink` - Height

**Position:**

- `top-\{n\}`, `left-\{n\}`, `right-\{n\}`, `bottom-\{n\}` - Position

**Layout:**

- `shrink`, `no-shrink` - Shrink to content
- `hidden`, `visible` - Visibility
- `wrap`, `no-wrap` - Text wrapping
- `shadow`, `no-shadow` - Shadow effect
- `scrollable`, `no-scrollable` - Scrollable content

## Parameters

### className

`string`

Space-separated class names

## Returns

[`ParsedClassName`](lib.cursedwind.Interface.ParsedClassName.md)

Parsed options that can be merged with widget options

## Example

```typescript
const parsed = parseClassName(
  "bg-blue fg-white bold border-line p-2 text-center",
);
// => {
//   style: { bg: 4, fg: 7, bold: true },
//   border: { type: 'line' },
//   padding: { left: 2, right: 2, top: 2, bottom: 2 },
//   align: 'center'
// }
```
