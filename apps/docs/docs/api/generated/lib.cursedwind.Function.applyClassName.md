# Function: applyClassName()

> **applyClassName**\<`T`\>(`options`): `T`

Defined in: [packages/core/src/lib/cursedwind.ts:949](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/cursedwind.ts#L949)

Apply className to widget options.
Convenience function that combines parsing and merging.

## Type Parameters

### T

`T` _extends_ `object`

## Parameters

### options

`T`

Widget options object (modified in place)

## Returns

`T`

The same options object with className applied

## Example

```typescript
const options = {
  content: "Hello",
  className: "bg-blue fg-white bold p-2",
};
applyClassName(options);
// options now has style, padding, etc. applied
```
