# Function: createCell()

> **createCell**(`attr`, `ch`, `truecolorBg`, `truecolorFg`): [`Cell`](widgets.cell.TypeAlias.Cell.md)

Defined in: [packages/core/src/widgets/cell.ts:26](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/cell.ts#L26)

Create a normalized cell with consistent 4-element structure.

## Parameters

### attr

`number`

Packed attribute integer

### ch

`string`

Character to display

### truecolorBg

Truecolor background RGB [r, g, b] or null

\[`number`, `number`, `number`\] | `null`

### truecolorFg

Truecolor foreground RGB [r, g, b] or null

\[`number`, `number`, `number`\] | `null`

## Returns

[`Cell`](widgets.cell.TypeAlias.Cell.md)

Normalized 4-element cell array
