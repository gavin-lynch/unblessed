# Function: createCharCanvas()

> **createCharCanvas**(`options`): [`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md)

Defined in: [packages/core/src/widgets/canvas.ts:380](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/canvas.ts#L380)

Create a CanvasWidget with AnsiTermCanvas (character blocks)

## Parameters

### options

[`CanvasWidgetOptions`](widgets.canvas.Interface.CanvasWidgetOptions.md) = `\{\}`

## Returns

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md)

## Example

```ts
const canvas = createCharCanvas({
  parent: screen,
  width: 40,
  height: 12,
});
```
