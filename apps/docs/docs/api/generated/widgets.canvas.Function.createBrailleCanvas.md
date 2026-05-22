# Function: createBrailleCanvas()

> **createBrailleCanvas**(`options`): [`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md)

Defined in: [packages/core/src/widgets/canvas.ts:362](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/canvas.ts#L362)

Create a CanvasWidget with DrawilleCanvas (braille, high-resolution)

## Parameters

### options

[`CanvasWidgetOptions`](widgets.canvas.Interface.CanvasWidgetOptions.md) = `\{\}`

## Returns

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md)

## Example

```ts
const canvas = createBrailleCanvas({
  parent: screen,
  width: 80,
  height: 24,
});
```
