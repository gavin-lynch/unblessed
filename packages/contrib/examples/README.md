# Contrib Examples

Examples demonstrating @gavin-lynch/unblessed-contrib widgets.

## Running Examples

```bash
# Run any example
bun run examples/example-name.ts

# Debug markdown colors (copies output to clipboard)
./examples/debug-markdown.sh
```

## Perf Overlay

Run the FPS overlay example:

```bash
bun run examples/perf-overlay.ts
```

Keys:

- `q` or `Ctrl+C` to quit

## Examples

- `bar.ts` - Bar chart example
- `charm.ts` - Charm-style Bubble Tea layout demo
- `markdown.ts` - Basic markdown rendering
- `markdown-terminal.ts` - Markdown with custom syntax highlighting
- `debug-markdown-colors.ts` - Debug script for markdown color issues
- `perf-overlay.ts` - FPS overlay using @gavin-lynch/unblessed-perf
- `truecolor-animated.ts` - Truecolor gradient with hue rotation + perf overlay
