# Function: parseTreeClass()

> **parseTreeClass**(`cls`): \{ `key`: keyof [`ParsedTreeStyle`](lib.cursedwind.Interface.ParsedTreeStyle.md); `style`: `Partial`\<`Style`\>; `depth?`: `number`; \} \| `null`

Defined in: [packages/core/src/lib/cursedwind.ts:498](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/cursedwind.ts#L498)

Parse tree-specific classes for the Tree widget.

Supports:

- `tree-line-\{color\}` - Color for tree lines (├, └, │, ─)
- `tree-indicator-\{color\}` - Color for expand/collapse indicators
- `tree-expanded-\{color\}` - Foreground color for expanded nodes
- `tree-expanded-bg-\{color\}` - Background color for expanded nodes
- `tree-collapsed-\{color\}` - Foreground color for collapsed nodes
- `tree-collapsed-bg-\{color\}` - Background color for collapsed nodes
- `tree-leaf-\{color\}` - Foreground color for leaf nodes
- `tree-leaf-bg-\{color\}` - Background color for leaf nodes
- `tree-depth-`\{n\}`-\{color\}` - Foreground color for specific depth level
- `tree-depth-`\{n\}`-bg-\{color\}` - Background color for specific depth level

## Parameters

### cls

`string`

## Returns

\{ `key`: keyof [`ParsedTreeStyle`](lib.cursedwind.Interface.ParsedTreeStyle.md); `style`: `Partial`\<`Style`\>; `depth?`: `number`; \} \| `null`
