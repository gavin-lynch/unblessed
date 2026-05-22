# Function: mergeClassNameOptions()

> **mergeClassNameOptions**\<`T`\>(`baseOptions`, `parsedClassName`): `T`

Defined in: [packages/core/src/lib/cursedwind.ts:823](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/cursedwind.ts#L823)

Merge parsed className options with existing widget options.
className properties take precedence over existing options.

## Type Parameters

### T

`T` _extends_ `MergeableOptions`

## Parameters

### baseOptions

`T`

Base widget options

### parsedClassName

[`ParsedClassName`](lib.cursedwind.Interface.ParsedClassName.md)

Parsed className result

## Returns

`T`

Merged options object
