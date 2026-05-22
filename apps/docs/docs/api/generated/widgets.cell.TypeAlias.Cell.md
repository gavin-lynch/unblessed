# Type Alias: Cell

> **Cell** = \[`number`, `string`, \[`number`, `number`, `number`\] \| `null`, \[`number`, `number`, `number`\] \| `null`\]

Defined in: [packages/core/src/widgets/cell.ts:9](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/cell.ts#L9)

Normalized cell structure: [attr, ch, truecolorBg, truecolorFg]
Always 4 elements, with null for "no truecolor" (not undefined)
