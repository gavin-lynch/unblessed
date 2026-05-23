# @gavin-lynch/unblessed-react Examples

Interactive examples demonstrating @gavin-lynch/unblessed-react features.

## Running Examples

From the monorepo root:

```bash
# Build packages first
pnpm build

# Run an example
cd packages/react/examples
tsx hello-react.tsx
tsx interactive-demo.tsx
tsx keyboard-game.tsx
tsx text-wrap-demo.tsx
tsx theme-demo.tsx
tsx declarative-animations-demo.tsx
tsx tree-demo.tsx

# Run contrib widget examples
tsx contrib-line-demo.tsx
tsx contrib-bar-demo.tsx
tsx contrib-gauge-demo.tsx
tsx contrib-donut-demo.tsx
tsx contrib-sparkline-demo.tsx
tsx contrib-log-demo.tsx
tsx contrib-table-demo.tsx
tsx contrib-lcd-demo.tsx
tsx contrib-dashboard-demo.tsx
```

## Examples

### hello-react.tsx

Basic demonstration of components and layouts:

- Box layouts with flexbox
- Border styles and colors (per-side)
- Text styling
- BigText for large ASCII text
- Button and Input components
- Gap and padding

**Features:**

- Static layout showcase
- Border color examples
- Component composition

### text-wrap-demo.tsx

Text truncation and wrapping demonstration:

- All 4 textWrap modes (wrap, truncate-end, truncate-middle, truncate-start)
- ANSI code preservation during truncation
- Multi-line content handling
- Backward compatibility with legacy wrap boolean
- Side-by-side visual comparisons

**Features:**

- Ink-style text truncation
- Visual comparison of all modes
- Colored text truncation
- Width constraint examples

### interactive-demo.tsx 🎮

Comprehensive interactive demo showcasing event handling:

**Panels:**

1. **Mouse Tracker** 🖱️
   - `onMouseMove` - Real-time mouse position tracking
   - `onClick` - Click counting with position
   - Visual feedback

2. **Color Picker** 🎨
   - Multiple clickable color buttons
   - `onClick` handlers on each button
   - Visual selection state (double border, background)
   - Dynamic border colors

3. **Counter** 🔢
   - Increment/decrement buttons
   - Button hover effects (`hoverBg`)
   - State management with React hooks

4. **Keyboard Input** ⌨️
   - `onKeyPress` - Capture any key
   - `onFocus`/`onBlur` - Visual focus state
   - Real-time key display

5. **Message Board** 💬
   - Text input with `onSubmit`
   - `onCancel` on Escape
   - Display submitted message with selected color
   - Ctrl+C handling

**Controls:**

- Move mouse to track position
- Click anywhere in mouse tracker
- Click color swatches to select
- Click +/- buttons for counter
- Type in any panel to see keys
- Type message and press Enter
- Press Ctrl+C to exit

### keyboard-game.tsx 🎮

A simple game demonstrating keyboard event handling:

**Gameplay:**

- Move player (🎮) around grid
- Collect stars (⭐) for points
- Real-time score tracking
- New stars spawn after collection

**Controls:**

- **Arrow Keys** or **WASD** - Move player
- **R** - Reset game
- **Q** or **Ctrl+C** - Quit

**Event Features:**

- `onKeyPress` for movement and controls
- `useState` for game state
- `useEffect` for collision detection
- Dynamic message updates
- Real-time grid rendering

### contrib-\*-demo.tsx - @gavin-lynch/unblessed-contrib Widget Examples

Examples demonstrating the use of @gavin-lynch/unblessed-contrib widgets within React:

**contrib-line-demo.tsx** - Line chart with multiple series, real-time updates, axis labels, and legend

**contrib-bar-demo.tsx** - Vertical bar chart with customizable colors, labels, and real-time updates

**contrib-gauge-demo.tsx** - Single value and stacked gauge widgets with progress indicators

**contrib-donut-demo.tsx** - Donut/pie charts with multiple segments, custom colors, and labels

**contrib-sparkline-demo.tsx** - ASCII sparklines with multiple series and auto-scrolling buffer

**contrib-log-demo.tsx** - Scrolling log display with color tags and buffer management

**contrib-table-demo.tsx** - Tabular data display with headers, keyboard navigation, and row selection

**contrib-lcd-demo.tsx** - 16-segment LED display with multiple elements and real-time updates

**contrib-dashboard-demo.tsx** - Comprehensive dashboard combining multiple contrib widgets in a single layout

**Features:**

- Integration of non-React widgets via `ContribWidgetWrapper` helper
- Real-time data updates and animations
- Responsive layouts with flexbox
- Event handling and state management

## Development

## Creating New Examples

Template:

```tsx
import { NodeRuntime } from "@gavin-lynch/unblessed-node";
import { render, Box, Text } from "../src/index.js";

const MyExample = () => {
  return (
    <Box padding={2}>
      <Text>Hello World!</Text>
    </Box>
  );
};

const screen = new Screen({
  smartCSR: true,
  fullUnicode: true,
  mouse: true, // Enable if using mouse events
  keys: true, // Enable if using keyboard events
});

screen.key(["C-c"], () => process.exit(0));

render(<MyExample />, { runtime: new NodeRuntime() });
screen.render();
```

## Tips

- Enable `mouse: true` in Screen options for click/hover events
- Enable `keys: true` for keyboard event handling
- Always provide a way to exit (Ctrl+C handler)
- Use React state hooks for interactive UIs
- Check `screen.width` and `screen.height` for responsive layouts

### Using Contrib Widgets in React

Contrib widgets (from @gavin-lynch/unblessed-contrib) are not React components, but can be used via the `ContribWidgetWrapper` helper:

```tsx
import { Line } from "@gavin-lynch/unblessed-contrib";
import { ContribWidgetWrapper } from "./contrib-wrapper";

function MyChart() {
  const [data, setData] = useState(/* ... */);

  return (
    <ContribWidgetWrapper
      createWidget={(opts) => new Line(opts)}
      widgetOptions={{
        label: "Chart",
        data: data,
      }}
      boxProps={{
        width: "50%",
        height: "50%",
        border: 1,
      }}
      deps={[data]} // Recreate widget when data changes
    />
  );
}
```

The wrapper manages the widget lifecycle and integrates it into React's rendering system.

## Troubleshooting

**Events not firing:**

- Verify `mouse: true` in Screen options for mouse events
- Verify `keys: true` in Screen options for keyboard events
- Check that widgets have `mouse: true` and `keys: true` (automatically set in widget-sync)

**Display issues:**

- Run `screen.render()` after the initial render
- Use `smartCSR: true` for better performance
- Set explicit width/height on root Box for consistent layouts
