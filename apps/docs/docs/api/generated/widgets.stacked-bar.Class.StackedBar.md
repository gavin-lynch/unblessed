# Class: StackedBar

Defined in: [packages/core/src/widgets/stacked-bar.ts:35](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/stacked-bar.ts#L35)

CanvasWidget - A Box with Canvas2D rendering capabilities

Provides a blessed widget that wraps a Canvas2D context for drawing
charts, maps, and other visualizations.

The canvas is created when the widget is attached to a screen,
as the actual dimensions aren't known until then.

## Example

```ts
const canvas = new CanvasWidget({
  parent: screen,
  width: "50%",
  height: "50%",
  border: { type: "line" },
});

// After attach, you can draw:
canvas.on("attach", () => {
  const ctx = canvas.ctx;
  ctx.strokeStyle = "yellow";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(100, 50);
  ctx.stroke();
});
```

## Extends

- [`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md)

## Constructors

### Constructor

> **new StackedBar**(`options`): `StackedBar`

Defined in: [packages/core/src/widgets/stacked-bar.ts:43](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/stacked-bar.ts#L43)

#### Parameters

##### options

[`StackedBarOptions`](widgets.stacked-bar.Interface.StackedBarOptions.md) = `\{\}`

#### Returns

`StackedBar`

#### Overrides

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`constructor`](widgets.canvas.Class.CanvasWidget.md#constructor)

## Properties

### \_events

> **\_events**: `any`

Defined in: [packages/core/src/lib/events.ts:10](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/events.ts#L10)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_events`](widgets.canvas.Class.CanvasWidget.md#_events)

---

### \_maxListeners?

> `optional` **\_maxListeners**: `number`

Defined in: [packages/core/src/lib/events.ts:11](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/events.ts#L11)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_maxListeners`](widgets.canvas.Class.CanvasWidget.md#_maxlisteners)

---

### \_canvas

> `protected` **\_canvas**: `Canvas` \| `null` = `null`

Defined in: [packages/core/src/widgets/canvas.ts:76](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/canvas.ts#L76)

The internal canvas instance

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_canvas`](widgets.canvas.Class.CanvasWidget.md#_canvas)

---

### ctx

> **ctx**: `Canvas2DContext` \| `null` = `null`

Defined in: [packages/core/src/widgets/canvas.ts:79](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/canvas.ts#L79)

The 2D rendering context

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`ctx`](widgets.canvas.Class.CanvasWidget.md#ctx)

---

### canvasSize

> **canvasSize**: [`CanvasSize`](widgets.canvas.Interface.CanvasSize.md)

Defined in: [packages/core/src/widgets/canvas.ts:89](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/canvas.ts#L89)

Calculated canvas size in pixels

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`canvasSize`](widgets.canvas.Class.CanvasWidget.md#canvassize)

---

### \_lastData

> `protected` **\_lastData**: `unknown` = `undefined`

Defined in: [packages/core/src/widgets/canvas.ts:92](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/canvas.ts#L92)

Last data passed to setData() so resize can redraw (subclasses set this)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_lastData`](widgets.canvas.Class.CanvasWidget.md#_lastdata)

---

### canvasType

> `protected` **canvasType**: `CanvasConstructor`

Defined in: [packages/core/src/widgets/canvas.ts:95](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/canvas.ts#L95)

Canvas constructor to use

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`canvasType`](widgets.canvas.Class.CanvasWidget.md#canvastype)

---

### name?

> `optional` **name**: `string`

Defined in: [packages/core/src/widgets/element.ts:56](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L56)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`name`](widgets.canvas.Class.CanvasWidget.md#name)

---

### position

> **position**: `any`

Defined in: [packages/core/src/widgets/element.ts:61](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L61)

Position specification. Can be relative coordinates or keywords.
Kept as any due to complex internal position calculation system.

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`position`](widgets.canvas.Class.CanvasWidget.md#position)

---

### noOverflow?

> `optional` **noOverflow**: `boolean`

Defined in: [packages/core/src/widgets/element.ts:62](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L62)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`noOverflow`](widgets.canvas.Class.CanvasWidget.md#nooverflow)

---

### dockBorders?

> `optional` **dockBorders**: `boolean`

Defined in: [packages/core/src/widgets/element.ts:63](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L63)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`dockBorders`](widgets.canvas.Class.CanvasWidget.md#dockborders)

---

### shadow?

> `optional` **shadow**: `boolean`

Defined in: [packages/core/src/widgets/element.ts:64](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L64)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`shadow`](widgets.canvas.Class.CanvasWidget.md#shadow)

---

### style

> **style**: `Style`

Defined in: [packages/core/src/widgets/element.ts:66](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L66)

Element style configuration (colors, attributes, hover/focus effects)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`style`](widgets.canvas.Class.CanvasWidget.md#style)

---

### colorMode?

> `optional` **colorMode**: `ScreenColorMode`

Defined in: [packages/core/src/widgets/element.ts:68](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L68)

Per-element color mode override

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`colorMode`](widgets.canvas.Class.CanvasWidget.md#colormode)

---

### hidden

> **hidden**: `boolean`

Defined in: [packages/core/src/widgets/element.ts:69](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L69)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`hidden`](widgets.canvas.Class.CanvasWidget.md#hidden)

---

### fixed

> **fixed**: `boolean`

Defined in: [packages/core/src/widgets/element.ts:70](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L70)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`fixed`](widgets.canvas.Class.CanvasWidget.md#fixed)

---

### align

> **align**: `string`

Defined in: [packages/core/src/widgets/element.ts:71](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L71)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`align`](widgets.canvas.Class.CanvasWidget.md#align)

---

### valign

> **valign**: `string`

Defined in: [packages/core/src/widgets/element.ts:72](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L72)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`valign`](widgets.canvas.Class.CanvasWidget.md#valign)

---

### wrap

> **wrap**: `boolean`

Defined in: [packages/core/src/widgets/element.ts:73](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L73)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`wrap`](widgets.canvas.Class.CanvasWidget.md#wrap)

---

### textWrap?

> `optional` **textWrap**: `TextWrapMode`

Defined in: [packages/core/src/widgets/element.ts:74](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L74)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`textWrap`](widgets.canvas.Class.CanvasWidget.md#textwrap)

---

### shrink?

> `optional` **shrink**: `boolean`

Defined in: [packages/core/src/widgets/element.ts:75](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L75)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`shrink`](widgets.canvas.Class.CanvasWidget.md#shrink)

---

### ch

> **ch**: `string`

Defined in: [packages/core/src/widgets/element.ts:76](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L76)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`ch`](widgets.canvas.Class.CanvasWidget.md#ch)

---

### padding

> **padding**: `Padding`

Defined in: [packages/core/src/widgets/element.ts:78](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L78)

Padding configuration for all sides

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`padding`](widgets.canvas.Class.CanvasWidget.md#padding)

---

### border?

> `optional` **border**: `Border`

Defined in: [packages/core/src/widgets/element.ts:80](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L80)

Border configuration

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`border`](widgets.canvas.Class.CanvasWidget.md#border)

---

### parseTags?

> `optional` **parseTags**: `boolean`

Defined in: [packages/core/src/widgets/element.ts:81](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L81)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`parseTags`](widgets.canvas.Class.CanvasWidget.md#parsetags)

---

### content

> **content**: `string` = `""`

Defined in: [packages/core/src/widgets/element.ts:82](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L82)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`content`](widgets.canvas.Class.CanvasWidget.md#content)

---

### lpos?

> `optional` **lpos**: `RenderCoords`

Defined in: [packages/core/src/widgets/element.ts:84](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L84)

Last rendered position coordinates

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`lpos`](widgets.canvas.Class.CanvasWidget.md#lpos)

---

### \_clines?

> `optional` **\_clines**: `any`

Defined in: [packages/core/src/widgets/element.ts:85](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L85)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_clines`](widgets.canvas.Class.CanvasWidget.md#_clines)

---

### \_pcontent?

> `optional` **\_pcontent**: `string`

Defined in: [packages/core/src/widgets/element.ts:86](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L86)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_pcontent`](widgets.canvas.Class.CanvasWidget.md#_pcontent)

---

### \_borderColors?

> `optional` **\_borderColors**: (`string` \| `number`)[]

Defined in: [packages/core/src/widgets/element.ts:87](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L87)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_borderColors`](widgets.canvas.Class.CanvasWidget.md#_bordercolors)

---

### \_slisteners?

> `optional` **\_slisteners**: `any`[]

Defined in: [packages/core/src/widgets/element.ts:88](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L88)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_slisteners`](widgets.canvas.Class.CanvasWidget.md#_slisteners)

---

### \_label?

> `optional` **\_label**: `any`

Defined in: [packages/core/src/widgets/element.ts:89](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L89)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_label`](widgets.canvas.Class.CanvasWidget.md#_label)

---

### \_labelScroll()?

> `optional` **\_labelScroll**: () => `void`

Defined in: [packages/core/src/widgets/element.ts:90](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L90)

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_labelScroll`](widgets.canvas.Class.CanvasWidget.md#_labelscroll)

---

### \_labelResize()?

> `optional` **\_labelResize**: () => `void`

Defined in: [packages/core/src/widgets/element.ts:91](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L91)

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_labelResize`](widgets.canvas.Class.CanvasWidget.md#_labelresize)

---

### \_hoverOptions?

> `optional` **\_hoverOptions**: `any`

Defined in: [packages/core/src/widgets/element.ts:92](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L92)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_hoverOptions`](widgets.canvas.Class.CanvasWidget.md#_hoveroptions)

---

### \_draggable?

> `optional` **\_draggable**: `boolean`

Defined in: [packages/core/src/widgets/element.ts:93](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L93)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_draggable`](widgets.canvas.Class.CanvasWidget.md#_draggable)

---

### \_dragMD()?

> `optional` **\_dragMD**: (`data`) => `void`

Defined in: [packages/core/src/widgets/element.ts:94](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L94)

#### Parameters

##### data

`MouseEvent`

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_dragMD`](widgets.canvas.Class.CanvasWidget.md#_dragmd)

---

### \_dragM()?

> `optional` **\_dragM**: (`data`) => `void`

Defined in: [packages/core/src/widgets/element.ts:95](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L95)

#### Parameters

##### data

`MouseEvent`

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_dragM`](widgets.canvas.Class.CanvasWidget.md#_dragm)

---

### \_drag?

> `optional` **\_drag**: `any`

Defined in: [packages/core/src/widgets/element.ts:96](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L96)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_drag`](widgets.canvas.Class.CanvasWidget.md#_drag)

---

### \_noFill?

> `optional` **\_noFill**: `boolean`

Defined in: [packages/core/src/widgets/element.ts:97](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L97)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_noFill`](widgets.canvas.Class.CanvasWidget.md#_nofill)

---

### \_isLabel?

> `optional` **\_isLabel**: `boolean`

Defined in: [packages/core/src/widgets/element.ts:98](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L98)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_isLabel`](widgets.canvas.Class.CanvasWidget.md#_islabel)

---

### \_isList?

> `optional` **\_isList**: `boolean`

Defined in: [packages/core/src/widgets/element.ts:99](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L99)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_isList`](widgets.canvas.Class.CanvasWidget.md#_islist)

---

### childBase?

> `optional` **childBase**: `number`

Defined in: [packages/core/src/widgets/element.ts:100](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L100)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`childBase`](widgets.canvas.Class.CanvasWidget.md#childbase)

---

### childOffset?

> `optional` **childOffset**: `number`

Defined in: [packages/core/src/widgets/element.ts:101](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L101)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`childOffset`](widgets.canvas.Class.CanvasWidget.md#childoffset)

---

### alwaysScroll?

> `optional` **alwaysScroll**: `boolean`

Defined in: [packages/core/src/widgets/element.ts:102](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L102)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`alwaysScroll`](widgets.canvas.Class.CanvasWidget.md#alwaysscroll)

---

### baseLimit?

> `optional` **baseLimit**: `number`

Defined in: [packages/core/src/widgets/element.ts:103](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L103)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`baseLimit`](widgets.canvas.Class.CanvasWidget.md#baselimit)

---

### track?

> `optional` **track**: `TrackConfig`

Defined in: [packages/core/src/widgets/element.ts:104](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L104)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`track`](widgets.canvas.Class.CanvasWidget.md#track)

---

### scrollbar?

> `optional` **scrollbar**: `ScrollbarConfig`

Defined in: [packages/core/src/widgets/element.ts:105](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L105)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`scrollbar`](widgets.canvas.Class.CanvasWidget.md#scrollbar)

---

### items?

> `optional` **items**: `any`[]

Defined in: [packages/core/src/widgets/element.ts:106](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L106)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`items`](widgets.canvas.Class.CanvasWidget.md#items)

---

### scrollable?

> `optional` **scrollable**: `boolean`

Defined in: [packages/core/src/widgets/element.ts:109](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L109)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`scrollable`](widgets.canvas.Class.CanvasWidget.md#scrollable)

---

### scroll()?

> `optional` **scroll**: (`offset`, `always?`) => `any`

Defined in: [packages/core/src/widgets/element.ts:112](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L112)

Scroll the content by a relative offset.

#### Parameters

##### offset

`number`

The number of lines/items to scroll (positive = down, negative = up)

##### always?

`boolean`

Force the scroll operation even if position hasn't changed

#### Returns

`any`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`scroll`](widgets.canvas.Class.CanvasWidget.md#scroll)

---

### scrollTo()?

> `optional` **scrollTo**: (`offset`, `always?`) => `void`

Defined in: [packages/core/src/widgets/element.ts:113](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L113)

Scroll the content to an absolute index.

#### Parameters

##### offset

`number`

The absolute scroll position (line/item index)

##### always?

`boolean`

Force the scroll operation even if position hasn't changed

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`scrollTo`](widgets.canvas.Class.CanvasWidget.md#scrollto)

---

### setScroll()?

> `optional` **setScroll**: (`offset`, `always?`) => `void`

Defined in: [packages/core/src/widgets/element.ts:114](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L114)

Scroll the content to an absolute index (alias for scrollTo).

#### Parameters

##### offset

`number`

The absolute scroll position (line/item index)

##### always?

`boolean`

Force the scroll operation even if position hasn't changed

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`setScroll`](widgets.canvas.Class.CanvasWidget.md#setscroll)

---

### getScroll()?

> `optional` **getScroll**: () => `number`

Defined in: [packages/core/src/widgets/element.ts:115](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L115)

Get the current scroll index in lines.

#### Returns

`number`

The current absolute scroll position

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`getScroll`](widgets.canvas.Class.CanvasWidget.md#getscroll)

---

### getScrollHeight()?

> `optional` **getScrollHeight**: () => `number`

Defined in: [packages/core/src/widgets/element.ts:116](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L116)

Get the actual height of the scrolling area (total content height).

#### Returns

`number`

The total scrollable content height in lines

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`getScrollHeight`](widgets.canvas.Class.CanvasWidget.md#getscrollheight)

---

### getScrollPerc()?

> `optional` **getScrollPerc**: (`s?`) => `number`

Defined in: [packages/core/src/widgets/element.ts:117](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L117)

Get the current scroll index in percentage (0-100).

#### Parameters

##### s?

`boolean`

Internal flag for special return values

#### Returns

`number`

The scroll position as a percentage (0-100), or -1 if not scrollable

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`getScrollPerc`](widgets.canvas.Class.CanvasWidget.md#getscrollperc)

---

### setScrollPerc()?

> `optional` **setScrollPerc**: (`i`) => `void`

Defined in: [packages/core/src/widgets/element.ts:118](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L118)

Set the current scroll index in percentage (0-100).

#### Parameters

##### i

`number`

The target scroll percentage (0-100)

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`setScrollPerc`](widgets.canvas.Class.CanvasWidget.md#setscrollperc)

---

### resetScroll()?

> `optional` **resetScroll**: () => `any`

Defined in: [packages/core/src/widgets/element.ts:119](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L119)

Reset the scroll index to its initial state (top).

#### Returns

`any`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`resetScroll`](widgets.canvas.Class.CanvasWidget.md#resetscroll)

---

### \_scrollBottom()?

> `optional` **\_scrollBottom**: () => `number`

Defined in: [packages/core/src/widgets/element.ts:120](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L120)

#### Returns

`number`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_scrollBottom`](widgets.canvas.Class.CanvasWidget.md#_scrollbottom)

---

### \_recalculateIndex()?

> `optional` **\_recalculateIndex**: () => `number`

Defined in: [packages/core/src/widgets/element.ts:121](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L121)

#### Returns

`number`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_recalculateIndex`](widgets.canvas.Class.CanvasWidget.md#_recalculateindex)

---

### animatable?

> `optional` **animatable**: `boolean`

Defined in: [packages/core/src/widgets/element.ts:124](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L124)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`animatable`](widgets.canvas.Class.CanvasWidget.md#animatable)

---

### animateBorderColors()?

> `optional` **animateBorderColors**: (`generator`, `options?`) => () => `void`

Defined in: [packages/core/src/widgets/element.ts:127](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L127)

Animate border colors over time using a generator function.
Returns a function to stop the animation.

#### Parameters

##### generator

(`length`, `frame`) => (`string` \| `number`)[]

Function that generates color array for each frame.
Receives border length and frame number as parameters.

##### options?

Animation options

###### fps?

`number`

Frames per second (default: 30)

#### Returns

Function to stop the animation

> (): `void`

##### Returns

`void`

#### Example

```ts
// Rainbow animation
const stop = element.animateBorderColors(
  (length, frame) => {
    const colors = generateRainbow(length);
    return rotateColors(colors, frame);
  },
  { fps: 30 },
);

// Later, stop the animation
stop();
```

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`animateBorderColors`](widgets.canvas.Class.CanvasWidget.md#animatebordercolors)

---

### pulse()?

> `optional` **pulse**: (`property`, `values`, `options?`) => () => `void`

Defined in: [packages/core/src/widgets/element.ts:128](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L128)

Pulse effect - oscillate a style property between values.
Returns a function to stop the animation.

#### Parameters

##### property

Style property to animate ('fg', 'bg', or 'dim')

`"bg"` | `"fg"` | `"dim"`

##### values

`any`[]

Array of values to cycle through

##### options?

Animation options

###### duration?

`number`

Duration of one complete cycle in milliseconds (default: 1000)

###### fps?

`number`

Frames per second (default: 30)

#### Returns

Function to stop the animation and restore original value

> (): `void`

##### Returns

`void`

#### Example

```ts
// Pulse foreground color
const stop = element.pulse("fg", ["red", "yellow", "red"], {
  duration: 1000,
});

// Pulse dim property for fade effect
element.pulse("dim", [false, true, false], { duration: 1000 });
```

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`pulse`](widgets.canvas.Class.CanvasWidget.md#pulse)

---

### uid

> `static` **uid**: `number` = `0`

Defined in: [packages/core/src/widgets/node.ts:30](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L30)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`uid`](widgets.canvas.Class.CanvasWidget.md#uid)

---

### ScreenRegistry

> `static` **ScreenRegistry**: `any`

Defined in: [packages/core/src/widgets/node.ts:31](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L31)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`ScreenRegistry`](widgets.canvas.Class.CanvasWidget.md#screenregistry)

---

### screen

> **screen**: `any`

Defined in: [packages/core/src/widgets/node.ts:47](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L47)

Reference to the parent Screen instance.
Type: Screen (subclass of Node)

Kept as any due to circular dependency between Node and Screen,
and to preserve access to Screen-specific methods like clearRegion(),
render(), and the program property without complex generic typing.

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`screen`](widgets.canvas.Class.CanvasWidget.md#screen)

---

### parent

> **parent**: `any`

Defined in: [packages/core/src/widgets/node.ts:56](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L56)

Reference to the parent element in the widget tree.
Type: Node (can be any Element/Box/List/etc subclass)

Kept as any to avoid complex generic typing and preserve access
to subclass-specific methods. Attempting to type as Node loses
methods from subclasses like Box, List, Form, etc.

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`parent`](widgets.canvas.Class.CanvasWidget.md#parent)

---

### children

> **children**: `any`[]

Defined in: [packages/core/src/widgets/node.ts:63](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L63)

Array of child elements.
Type: Node[] (can contain any Node subclasses)

Kept as any[] to preserve flexibility with mixed widget types.

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`children`](widgets.canvas.Class.CanvasWidget.md#children)

---

### $

> **$**: `Record`\<`string`, `unknown`\>

Defined in: [packages/core/src/widgets/node.ts:68](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L68)

An object for any miscellaneous user data.

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`$`](widgets.canvas.Class.CanvasWidget.md#)

---

### \_

> **\_**: `Record`\<`string`, `unknown`\>

Defined in: [packages/core/src/widgets/node.ts:73](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L73)

An object for any miscellaneous user data.

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_`](widgets.canvas.Class.CanvasWidget.md#_)

---

### data

> **data**: `Record`\<`string`, `unknown`\>

Defined in: [packages/core/src/widgets/node.ts:78](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L78)

An object for any miscellaneous user data.

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`data`](widgets.canvas.Class.CanvasWidget.md#data)

---

### uid

> **uid**: `number`

Defined in: [packages/core/src/widgets/node.ts:80](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L80)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`uid`](widgets.canvas.Class.CanvasWidget.md#uid-1)

---

### index

> **index**: `number` = `-1`

Defined in: [packages/core/src/widgets/node.ts:86](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L86)

Render index (document order index) of the last render call.
Indicates the order in which this element was rendered relative to others.
Set to -1 initially, updated during rendering.

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`index`](widgets.canvas.Class.CanvasWidget.md#index)

---

### detached?

> `optional` **detached**: `boolean`

Defined in: [packages/core/src/widgets/node.ts:87](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L87)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`detached`](widgets.canvas.Class.CanvasWidget.md#detached)

---

### destroyed?

> `optional` **destroyed**: `boolean`

Defined in: [packages/core/src/widgets/node.ts:88](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L88)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`destroyed`](widgets.canvas.Class.CanvasWidget.md#destroyed)

---

### runtime

> **runtime**: [`Runtime`](runtime.Interface.Runtime.md)

Defined in: [packages/core/src/widgets/node.ts:90](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L90)

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`runtime`](widgets.canvas.Class.CanvasWidget.md#runtime)

---

### type

> **type**: `string` = `"stacked-bar"`

Defined in: [packages/core/src/widgets/stacked-bar.ts:36](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/stacked-bar.ts#L36)

Type of the node (e.g. box, list, form, etc.).
Used to identify the widget type at runtime.

#### Overrides

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`type`](widgets.canvas.Class.CanvasWidget.md#type)

---

### options

> **options**: [`StackedBarOptions`](widgets.stacked-bar.Interface.StackedBarOptions.md)

Defined in: [packages/core/src/widgets/stacked-bar.ts:37](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/stacked-bar.ts#L37)

#### Overrides

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`options`](widgets.canvas.Class.CanvasWidget.md#options)

## Accessors

### isReady

#### Get Signature

> **get** **isReady**(): `boolean`

Defined in: [packages/core/src/widgets/canvas.ts:84](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/canvas.ts#L84)

Check if the canvas is initialized and ready for drawing

##### Returns

`boolean`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`isReady`](widgets.canvas.Class.CanvasWidget.md#isready)

---

### focused

#### Get Signature

> **get** **focused**(): `boolean`

Defined in: [packages/core/src/widgets/element.ts:130](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L130)

##### Returns

`boolean`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`focused`](widgets.canvas.Class.CanvasWidget.md#focused)

---

### visible

#### Get Signature

> **get** **visible**(): `boolean`

Defined in: [packages/core/src/widgets/element.ts:1126](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1126)

##### Returns

`boolean`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`visible`](widgets.canvas.Class.CanvasWidget.md#visible)

---

### \_detached

#### Get Signature

> **get** **\_detached**(): `boolean`

Defined in: [packages/core/src/widgets/element.ts:1137](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1137)

##### Returns

`boolean`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_detached`](widgets.canvas.Class.CanvasWidget.md#_detached)

---

### draggable

#### Get Signature

> **get** **draggable**(): `boolean`

Defined in: [packages/core/src/widgets/element.ts:1170](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1170)

##### Returns

`boolean`

#### Set Signature

> **set** **draggable**(`draggable`): `void`

Defined in: [packages/core/src/widgets/element.ts:1174](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1174)

##### Parameters

###### draggable

`any`

##### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`draggable`](widgets.canvas.Class.CanvasWidget.md#draggable)

---

### width

#### Get Signature

> **get** **width**(): `number`

Defined in: [packages/core/src/widgets/element.ts:1571](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1571)

##### Returns

`number`

#### Set Signature

> **set** **width**(`val`): `void`

Defined in: [packages/core/src/widgets/element.ts:1775](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1775)

Position Setters

##### Parameters

###### val

`any`

##### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`width`](widgets.canvas.Class.CanvasWidget.md#width)

---

### height

#### Get Signature

> **get** **height**(): `number`

Defined in: [packages/core/src/widgets/element.ts:1622](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1622)

##### Returns

`number`

#### Set Signature

> **set** **height**(`val`): `void`

Defined in: [packages/core/src/widgets/element.ts:1783](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1783)

##### Parameters

###### val

`any`

##### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`height`](widgets.canvas.Class.CanvasWidget.md#height)

---

### aleft

#### Get Signature

> **get** **aleft**(): `number`

Defined in: [packages/core/src/widgets/element.ts:1659](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1659)

##### Returns

`number`

#### Set Signature

> **set** **aleft**(`val`): `void`

Defined in: [packages/core/src/widgets/element.ts:1791](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1791)

##### Parameters

###### val

`any`

##### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`aleft`](widgets.canvas.Class.CanvasWidget.md#aleft)

---

### aright

#### Get Signature

> **get** **aright**(): `number`

Defined in: [packages/core/src/widgets/element.ts:1684](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1684)

##### Returns

`number`

#### Set Signature

> **set** **aright**(`val`): `void`

Defined in: [packages/core/src/widgets/element.ts:1812](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1812)

##### Parameters

###### val

`any`

##### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`aright`](widgets.canvas.Class.CanvasWidget.md#aright)

---

### atop

#### Get Signature

> **get** **atop**(): `number`

Defined in: [packages/core/src/widgets/element.ts:1721](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1721)

##### Returns

`number`

#### Set Signature

> **set** **atop**(`val`): `void`

Defined in: [packages/core/src/widgets/element.ts:1820](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1820)

##### Parameters

###### val

`any`

##### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`atop`](widgets.canvas.Class.CanvasWidget.md#atop)

---

### abottom

#### Get Signature

> **get** **abottom**(): `number`

Defined in: [packages/core/src/widgets/element.ts:1746](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1746)

##### Returns

`number`

#### Set Signature

> **set** **abottom**(`val`): `void`

Defined in: [packages/core/src/widgets/element.ts:1841](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1841)

##### Parameters

###### val

`any`

##### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`abottom`](widgets.canvas.Class.CanvasWidget.md#abottom)

---

### rleft

#### Get Signature

> **get** **rleft**(): `number`

Defined in: [packages/core/src/widgets/element.ts:1750](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1750)

##### Returns

`number`

#### Set Signature

> **set** **rleft**(`val`): `void`

Defined in: [packages/core/src/widgets/element.ts:1849](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1849)

##### Parameters

###### val

`any`

##### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`rleft`](widgets.canvas.Class.CanvasWidget.md#rleft)

---

### rright

#### Get Signature

> **get** **rright**(): `number`

Defined in: [packages/core/src/widgets/element.ts:1754](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1754)

##### Returns

`number`

#### Set Signature

> **set** **rright**(`val`): `void`

Defined in: [packages/core/src/widgets/element.ts:1857](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1857)

##### Parameters

###### val

`any`

##### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`rright`](widgets.canvas.Class.CanvasWidget.md#rright)

---

### rtop

#### Get Signature

> **get** **rtop**(): `number`

Defined in: [packages/core/src/widgets/element.ts:1758](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1758)

##### Returns

`number`

#### Set Signature

> **set** **rtop**(`val`): `void`

Defined in: [packages/core/src/widgets/element.ts:1864](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1864)

##### Parameters

###### val

`any`

##### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`rtop`](widgets.canvas.Class.CanvasWidget.md#rtop)

---

### rbottom

#### Get Signature

> **get** **rbottom**(): `number`

Defined in: [packages/core/src/widgets/element.ts:1762](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1762)

##### Returns

`number`

#### Set Signature

> **set** **rbottom**(`val`): `void`

Defined in: [packages/core/src/widgets/element.ts:1872](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1872)

##### Parameters

###### val

`any`

##### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`rbottom`](widgets.canvas.Class.CanvasWidget.md#rbottom)

---

### ileft

#### Get Signature

> **get** **ileft**(): `number`

Defined in: [packages/core/src/widgets/element.ts:1879](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1879)

##### Returns

`number`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`ileft`](widgets.canvas.Class.CanvasWidget.md#ileft)

---

### itop

#### Get Signature

> **get** **itop**(): `number`

Defined in: [packages/core/src/widgets/element.ts:1884](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1884)

##### Returns

`number`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`itop`](widgets.canvas.Class.CanvasWidget.md#itop)

---

### iright

#### Get Signature

> **get** **iright**(): `number`

Defined in: [packages/core/src/widgets/element.ts:1889](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1889)

##### Returns

`number`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`iright`](widgets.canvas.Class.CanvasWidget.md#iright)

---

### ibottom

#### Get Signature

> **get** **ibottom**(): `number`

Defined in: [packages/core/src/widgets/element.ts:1894](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1894)

##### Returns

`number`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`ibottom`](widgets.canvas.Class.CanvasWidget.md#ibottom)

---

### iwidth

#### Get Signature

> **get** **iwidth**(): `number`

Defined in: [packages/core/src/widgets/element.ts:1899](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1899)

##### Returns

`number`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`iwidth`](widgets.canvas.Class.CanvasWidget.md#iwidth)

---

### iheight

#### Get Signature

> **get** **iheight**(): `number`

Defined in: [packages/core/src/widgets/element.ts:1906](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1906)

##### Returns

`number`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`iheight`](widgets.canvas.Class.CanvasWidget.md#iheight)

---

### tpadding

#### Get Signature

> **get** **tpadding**(): `number`

Defined in: [packages/core/src/widgets/element.ts:1913](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1913)

##### Returns

`number`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`tpadding`](widgets.canvas.Class.CanvasWidget.md#tpadding)

---

### left

#### Get Signature

> **get** **left**(): `number`

Defined in: [packages/core/src/widgets/element.ts:1926](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1926)

Relative coordinates as default properties

##### Returns

`number`

#### Set Signature

> **set** **left**(`val`): `void`

Defined in: [packages/core/src/widgets/element.ts:1942](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1942)

##### Parameters

###### val

`any`

##### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`left`](widgets.canvas.Class.CanvasWidget.md#left)

---

### right

#### Get Signature

> **get** **right**(): `number`

Defined in: [packages/core/src/widgets/element.ts:1930](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1930)

##### Returns

`number`

#### Set Signature

> **set** **right**(`val`): `void`

Defined in: [packages/core/src/widgets/element.ts:1946](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1946)

##### Parameters

###### val

`any`

##### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`right`](widgets.canvas.Class.CanvasWidget.md#right)

---

### top

#### Get Signature

> **get** **top**(): `number`

Defined in: [packages/core/src/widgets/element.ts:1934](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1934)

##### Returns

`number`

#### Set Signature

> **set** **top**(`val`): `void`

Defined in: [packages/core/src/widgets/element.ts:1950](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1950)

##### Parameters

###### val

`any`

##### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`top`](widgets.canvas.Class.CanvasWidget.md#top)

---

### bottom

#### Get Signature

> **get** **bottom**(): `number`

Defined in: [packages/core/src/widgets/element.ts:1938](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1938)

##### Returns

`number`

#### Set Signature

> **set** **bottom**(`val`): `void`

Defined in: [packages/core/src/widgets/element.ts:1954](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1954)

##### Parameters

###### val

`any`

##### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`bottom`](widgets.canvas.Class.CanvasWidget.md#bottom)

## Methods

### setMaxListeners()

> **setMaxListeners**(`n`): `void`

Defined in: [packages/core/src/lib/events.ts:19](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/events.ts#L19)

#### Parameters

##### n

`number`

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`setMaxListeners`](widgets.canvas.Class.CanvasWidget.md#setmaxlisteners)

---

### addListener()

> **addListener**(`type`, `listener`): `void`

Defined in: [packages/core/src/lib/events.ts:23](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/events.ts#L23)

#### Parameters

##### type

`string`

##### listener

`Function`

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`addListener`](widgets.canvas.Class.CanvasWidget.md#addlistener)

---

### on()

> **on**(`type`, `listener`): `any`

Defined in: [packages/core/src/lib/events.ts:34](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/events.ts#L34)

#### Parameters

##### type

`string`

##### listener

`Function`

#### Returns

`any`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`on`](widgets.canvas.Class.CanvasWidget.md#on)

---

### removeListener()

> **removeListener**(`type`, `listener`): `void`

Defined in: [packages/core/src/lib/events.ts:38](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/events.ts#L38)

#### Parameters

##### type

`string`

##### listener

`Function`

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`removeListener`](widgets.canvas.Class.CanvasWidget.md#removelistener)

---

### off()

> **off**(`type`, `listener`): `any`

Defined in: [packages/core/src/lib/events.ts:57](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/events.ts#L57)

#### Parameters

##### type

`string`

##### listener

`Function`

#### Returns

`any`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`off`](widgets.canvas.Class.CanvasWidget.md#off)

---

### removeAllListeners()

> **removeAllListeners**(`type?`): `void`

Defined in: [packages/core/src/lib/events.ts:61](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/events.ts#L61)

#### Parameters

##### type?

`string`

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`removeAllListeners`](widgets.canvas.Class.CanvasWidget.md#removealllisteners)

---

### once()

> **once**(`type`, `listener`): `any`

Defined in: [packages/core/src/lib/events.ts:69](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/events.ts#L69)

#### Parameters

##### type

`string`

##### listener

`Function`

#### Returns

`any`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`once`](widgets.canvas.Class.CanvasWidget.md#once)

---

### listeners()

> **listeners**(`type`): `Function`[]

Defined in: [packages/core/src/lib/events.ts:79](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/events.ts#L79)

#### Parameters

##### type

`string`

#### Returns

`Function`[]

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`listeners`](widgets.canvas.Class.CanvasWidget.md#listeners)

---

### \_emit()

> **\_emit**(`type`, `args`): `any`

Defined in: [packages/core/src/lib/events.ts:85](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/events.ts#L85)

#### Parameters

##### type

`string`

##### args

`any`[]

#### Returns

`any`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_emit`](widgets.canvas.Class.CanvasWidget.md#_emit)

---

### emit()

> **emit**(`type`, ...`rest`): `boolean`

Defined in: [packages/core/src/lib/events.ts:113](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/events.ts#L113)

#### Parameters

##### type

`string`

##### rest

...`any`[]

#### Returns

`boolean`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`emit`](widgets.canvas.Class.CanvasWidget.md#emit)

---

### clear()

> **clear**(): `void`

Defined in: [packages/core/src/widgets/canvas.ts:268](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/canvas.ts#L268)

Clear the canvas

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`clear`](widgets.canvas.Class.CanvasWidget.md#clear)

---

### render()

> **render**(): `any`

Defined in: [packages/core/src/widgets/canvas.ts:279](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/canvas.ts#L279)

Render the canvas widget

Converts the canvas buffer to content and renders as a Box.

#### Returns

`any`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`render`](widgets.canvas.Class.CanvasWidget.md#render)

---

### getFrameFromCanvas()

> `protected` **getFrameFromCanvas**(): `string`

Defined in: [packages/core/src/widgets/canvas.ts:312](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/canvas.ts#L312)

Return the frame string to use as content. Subclasses (e.g. Line) can override
to prepend a blank line so the box label gets its own row above the chart.

#### Returns

`string`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`getFrameFromCanvas`](widgets.canvas.Class.CanvasWidget.md#getframefromcanvas)

---

### sattr()

> **sattr**(`style`, `fg?`, `bg?`): `number`

Defined in: [packages/core/src/widgets/element.ts:353](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L353)

#### Parameters

##### style

`any`

##### fg?

`any`

##### bg?

`any`

#### Returns

`number`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`sattr`](widgets.canvas.Class.CanvasWidget.md#sattr)

---

### onScreenEvent()

> **onScreenEvent**(`type`, `handler`): `void`

Defined in: [packages/core/src/widgets/element.ts:409](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L409)

Same as el.on('screen', ...) except this will automatically keep track of which listeners
are bound to the screen object. For use with removeScreenEvent(), free(), and destroy().

#### Parameters

##### type

`string`

Event type

##### handler

(...`args`) => `void`

Event handler function

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`onScreenEvent`](widgets.canvas.Class.CanvasWidget.md#onscreenevent)

---

### onceScreenEvent()

> **onceScreenEvent**(`type`, `handler`): `void`

Defined in: [packages/core/src/widgets/element.ts:420](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L420)

Same as onScreenEvent() but fires only once.

#### Parameters

##### type

`string`

Event type

##### handler

(...`args`) => `void`

Event handler function

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`onceScreenEvent`](widgets.canvas.Class.CanvasWidget.md#oncescreenevent)

---

### removeScreenEvent()

> **removeScreenEvent**(`type`, `handler`): `void`

Defined in: [packages/core/src/widgets/element.ts:437](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L437)

Same as el.removeListener('screen', ...) except this will automatically keep track of which
listeners are bound to the screen object. For use with onScreenEvent(), free(), and destroy().

#### Parameters

##### type

`string`

Event type

##### handler

(...`args`) => `void`

Event handler function

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`removeScreenEvent`](widgets.canvas.Class.CanvasWidget.md#removescreenevent)

---

### free()

> **free**(): `void`

Defined in: [packages/core/src/widgets/element.ts:457](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L457)

Free up the element. Automatically unbind all events that may have been bound to the screen
object. This prevents memory leaks. For use with onScreenEvent(), removeScreenEvent(),
and destroy().

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`free`](widgets.canvas.Class.CanvasWidget.md#free)

---

### hide()

> **hide**(): `void`

Defined in: [packages/core/src/widgets/element.ts:469](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L469)

Hide element.

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`hide`](widgets.canvas.Class.CanvasWidget.md#hide)

---

### show()

> **show**(): `void`

Defined in: [packages/core/src/widgets/element.ts:482](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L482)

Show element.

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`show`](widgets.canvas.Class.CanvasWidget.md#show)

---

### toggle()

> **toggle**(): `void`

Defined in: [packages/core/src/widgets/element.ts:491](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L491)

Toggle hidden/shown.

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`toggle`](widgets.canvas.Class.CanvasWidget.md#toggle)

---

### focus()

> **focus**(): `any`

Defined in: [packages/core/src/widgets/element.ts:498](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L498)

Focus element.

#### Returns

`any`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`focus`](widgets.canvas.Class.CanvasWidget.md#focus)

---

### isFocusable()

> **isFocusable**(): `boolean`

Defined in: [packages/core/src/widgets/element.ts:506](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L506)

Check if this element can receive keyboard focus.
Elements are focusable if they have tabIndex >= -1.

#### Returns

`boolean`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`isFocusable`](widgets.canvas.Class.CanvasWidget.md#isfocusable)

---

### isInTabOrder()

> **isInTabOrder**(): `boolean`

Defined in: [packages/core/src/widgets/element.ts:514](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L514)

Check if element participates in Tab key navigation.
Elements with tabIndex=-1 are focusable but excluded from Tab order.

#### Returns

`boolean`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`isInTabOrder`](widgets.canvas.Class.CanvasWidget.md#isintaborder)

---

### getTabIndex()

> **getTabIndex**(): `number`

Defined in: [packages/core/src/widgets/element.ts:523](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L523)

Get effective tab index for focus navigation ordering.

#### Returns

`number`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`getTabIndex`](widgets.canvas.Class.CanvasWidget.md#gettabindex)

---

### setContent()

> **setContent**(`content`, `noClear?`, `noTags?`): `void`

Defined in: [packages/core/src/widgets/element.ts:535](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L535)

Set or get the content. Note: When text is input, it will be stripped of all non-SGR
escape codes, tabs will be replaced with 8 spaces, and tags will be replaced
with SGR codes (if enabled).

#### Parameters

##### content

`string`

##### noClear?

`boolean`

##### noTags?

`boolean`

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`setContent`](widgets.canvas.Class.CanvasWidget.md#setcontent)

---

### getContent()

> **getContent**(): `string`

Defined in: [packages/core/src/widgets/element.ts:545](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L545)

Return content, slightly different from el.content. Assume the above formatting.

#### Returns

`string`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`getContent`](widgets.canvas.Class.CanvasWidget.md#getcontent)

---

### getBorderLength()

> **getBorderLength**(): `number`

Defined in: [packages/core/src/widgets/element.ts:558](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L558)

Get the border perimeter length (number of border cells).
Useful for creating colors arrays for addressable border animations.

#### Returns

`number`

Number of border cells, or 0 if no border

#### Example

```ts
const box = new Box({ width: 20, height: 10, border: { type: "line" } });
console.log(box.getBorderLength()); // 56 (2 * (20 + 10) - 4)
```

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`getBorderLength`](widgets.canvas.Class.CanvasWidget.md#getborderlength)

---

### getBorderColors()

> **getBorderColors**(): (`string` \| `number`)[]

Defined in: [packages/core/src/widgets/element.ts:574](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L574)

Get the current border colors array (for addressable border animations).
Returns a copy to prevent external mutations.

#### Returns

(`string` \| `number`)[]

Copy of colors array, or empty array if not set

#### Example

```ts
const colors = box.getBorderColors();
const rotated = rotateColors(colors, 1);
box.setBorderColors(rotated);
```

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`getBorderColors`](widgets.canvas.Class.CanvasWidget.md#getbordercolors)

---

### setBorderColors()

> **setBorderColors**(`colors`): `void`

Defined in: [packages/core/src/widgets/element.ts:596](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L596)

Set border colors array for addressable border animations.
Stores an internal copy to prevent external mutations.
Call screen.render() after to see changes.

#### Parameters

##### colors

(`string` \| `number`)[]

Array of colors (names, hex codes, or numeric codes)

#### Returns

`void`

#### Example

```ts
// Rainbow animation
const colors = generateRainbow(box.getBorderLength());
box.setBorderColors(colors);
screen.render();

// Later, animate
setInterval(() => {
  const rotated = rotateColors(box.getBorderColors(), 1);
  box.setBorderColors(rotated);
  screen.render();
}, 100);
```

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`setBorderColors`](widgets.canvas.Class.CanvasWidget.md#setbordercolors)

---

### setText()

> **setText**(`content`, `noClear?`): `void`

Defined in: [packages/core/src/widgets/element.ts:603](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L603)

Similar to setContent, but ignore tags and remove escape codes.

#### Parameters

##### content

`string`

##### noClear?

`boolean`

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`setText`](widgets.canvas.Class.CanvasWidget.md#settext)

---

### getText()

> **getText**(): `string`

Defined in: [packages/core/src/widgets/element.ts:612](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L612)

Similar to getContent, but return content with tags and escape codes removed.

#### Returns

`string`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`getText`](widgets.canvas.Class.CanvasWidget.md#gettext)

---

### parseContent()

> **parseContent**(`noTags?`): `boolean`

Defined in: [packages/core/src/widgets/element.ts:616](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L616)

#### Parameters

##### noTags?

`boolean`

#### Returns

`boolean`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`parseContent`](widgets.canvas.Class.CanvasWidget.md#parsecontent)

---

### \_parseTags()

> **\_parseTags**(`text`): `string`

Defined in: [packages/core/src/widgets/element.ts:696](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L696)

#### Parameters

##### text

`string`

#### Returns

`string`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_parseTags`](widgets.canvas.Class.CanvasWidget.md#_parsetags)

---

### \_parseAttr()

> **\_parseAttr**(`lines`): `any`

Defined in: [packages/core/src/widgets/element.ts:801](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L801)

#### Parameters

##### lines

`any`

#### Returns

`any`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_parseAttr`](widgets.canvas.Class.CanvasWidget.md#_parseattr)

---

### \_align()

> **\_align**(`line`, `width`, `align?`): `string`

Defined in: [packages/core/src/widgets/element.ts:830](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L830)

#### Parameters

##### line

`string`

##### width

`number`

##### align?

`string`

#### Returns

`string`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_align`](widgets.canvas.Class.CanvasWidget.md#_align)

---

### \_wrapContent()

> **\_wrapContent**(`content`, `width`): `WrappedContent`

Defined in: [packages/core/src/widgets/element.ts:862](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L862)

#### Parameters

##### content

`string`

##### width

`number`

#### Returns

`WrappedContent`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_wrapContent`](widgets.canvas.Class.CanvasWidget.md#_wrapcontent)

---

### enableMouse()

> **enableMouse**(): `void`

Defined in: [packages/core/src/widgets/element.ts:1150](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1150)

Enable mouse events for the element (automatically called when a form of on('mouse') is bound).
Registers the element as clickable with the screen.

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`enableMouse`](widgets.canvas.Class.CanvasWidget.md#enablemouse)

---

### enableKeys()

> **enableKeys**(): `void`

Defined in: [packages/core/src/widgets/element.ts:1158](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1158)

Enable keypress events for the element (automatically called when a form of on('keypress') is bound).
Registers the element as keyable with the screen.

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`enableKeys`](widgets.canvas.Class.CanvasWidget.md#enablekeys)

---

### enableInput()

> **enableInput**(): `void`

Defined in: [packages/core/src/widgets/element.ts:1165](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1165)

Enable key and mouse events. Calls both enableMouse() and enableKeys().

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`enableInput`](widgets.canvas.Class.CanvasWidget.md#enableinput)

---

### enableDrag()

> **enableDrag**(`verify?`): `boolean`

Defined in: [packages/core/src/widgets/element.ts:1188](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1188)

Enable dragging of the element.
Allows the element to be dragged with the mouse. Automatically calls enableMouse().

#### Parameters

##### verify?

`any`

Optional callback function to verify if dragging should start (receives mouse data)

#### Returns

`boolean`

True if dragging was enabled

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`enableDrag`](widgets.canvas.Class.CanvasWidget.md#enabledrag)

---

### disableDrag()

> **disableDrag**(): `boolean`

Defined in: [packages/core/src/widgets/element.ts:1262](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1262)

Disable dragging of the element.
Removes drag event handlers and resets dragging state.

#### Returns

`boolean`

True if dragging was disabled

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`disableDrag`](widgets.canvas.Class.CanvasWidget.md#disabledrag)

---

### key()

> **key**(...`args`): `any`

Defined in: [packages/core/src/widgets/element.ts:1276](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1276)

Bind a key event handler.

#### Parameters

##### args

...`any`[]

Arguments to pass to program.key()

#### Returns

`any`

The bound key handler

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`key`](widgets.canvas.Class.CanvasWidget.md#key)

---

### onceKey()

> **onceKey**(...`args`): `any`

Defined in: [packages/core/src/widgets/element.ts:1285](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1285)

Bind a key event handler that fires only once.

#### Parameters

##### args

...`any`[]

Arguments to pass to program.onceKey()

#### Returns

`any`

The bound key handler

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`onceKey`](widgets.canvas.Class.CanvasWidget.md#oncekey)

---

### unkey()

> **unkey**(...`args`): `any`

Defined in: [packages/core/src/widgets/element.ts:1294](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1294)

Unbind a key event handler.

#### Parameters

##### args

...`any`[]

Arguments to pass to program.unkey()

#### Returns

`any`

Result of unbinding

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`unkey`](widgets.canvas.Class.CanvasWidget.md#unkey)

---

### removeKey()

> **removeKey**(...`args`): `any`

Defined in: [packages/core/src/widgets/element.ts:1304](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1304)

Remove a key event handler.
Alias for unkey().

#### Parameters

##### args

...`any`[]

Arguments to pass to program.unkey()

#### Returns

`any`

Result of removing

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`removeKey`](widgets.canvas.Class.CanvasWidget.md#removekey)

---

### setIndex()

> **setIndex**(`index`): `void`

Defined in: [packages/core/src/widgets/element.ts:1313](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1313)

Set the z-index of the element (changes rendering order).
Higher indices are rendered later (on top). Negative indices count from the end.

#### Parameters

##### index

`number`

New z-index value

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`setIndex`](widgets.canvas.Class.CanvasWidget.md#setindex)

---

### setFront()

> **setFront**(): `void`

Defined in: [packages/core/src/widgets/element.ts:1334](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1334)

Put the element in front of its siblings.
Sets the element's z-index to the highest value (renders last/on top).

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`setFront`](widgets.canvas.Class.CanvasWidget.md#setfront)

---

### setBack()

> **setBack**(): `void`

Defined in: [packages/core/src/widgets/element.ts:1342](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1342)

Put the element in back of its siblings.
Sets the element's z-index to the lowest value (renders first/at bottom).

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`setBack`](widgets.canvas.Class.CanvasWidget.md#setback)

---

### clearPos()

> **clearPos**(`get?`, `override?`): `void`

Defined in: [packages/core/src/widgets/element.ts:1352](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1352)

Clear the element's position in the screen buffer.
Fills the region with spaces, used when moving or hiding elements.

#### Parameters

##### get?

`boolean`

Whether to use \_getCoords (default: false)

##### override?

`any`

If true, always clear even if cell hasn't changed

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`clearPos`](widgets.canvas.Class.CanvasWidget.md#clearpos)

---

### setLabel()

> **setLabel**(`options`): `void`

Defined in: [packages/core/src/widgets/element.ts:1367](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1367)

Set the label text for the top-left (or top-right) corner.
Creates or updates a label that appears on the top border of the element.

#### Parameters

##### options

`any`

Label text (string) or options object with text and side properties

#### Returns

`void`

#### Example

```ts
element.setLabel("My Label");
element.setLabel({ text: "My Label", side: "right" });
```

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`setLabel`](widgets.canvas.Class.CanvasWidget.md#setlabel)

---

### removeLabel()

> **removeLabel**(): `void`

Defined in: [packages/core/src/widgets/element.ts:1446](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1446)

Remove the label completely.
Detaches the label element and removes associated event listeners.

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`removeLabel`](widgets.canvas.Class.CanvasWidget.md#removelabel)

---

### setHover()

> **setHover**(`options`): `void`

Defined in: [packages/core/src/widgets/element.ts:1463](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1463)

Set a hover text box to follow the cursor. Similar to the "title" DOM attribute in the browser.

#### Parameters

##### options

`any`

Hover text (string) or options object with text property

#### Returns

`void`

#### Example

```ts
element.setHover("Hover text here");
element.setHover({ text: "Hover text here" });
```

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`setHover`](widgets.canvas.Class.CanvasWidget.md#sethover)

---

### removeHover()

> **removeHover**(): `void`

Defined in: [packages/core/src/widgets/element.ts:1477](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1477)

Remove the hover label completely.
Detaches the hover text box if it's currently displayed.

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`removeHover`](widgets.canvas.Class.CanvasWidget.md#removehover)

---

### \_getPos()

> **\_getPos**(): `any`

Defined in: [packages/core/src/widgets/element.ts:1503](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1503)

Positioning

#### Returns

`any`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_getPos`](widgets.canvas.Class.CanvasWidget.md#_getpos)

---

### \_getWidth()

> **\_getWidth**(`get?`): `number`

Defined in: [packages/core/src/widgets/element.ts:1524](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1524)

Position Getters

#### Parameters

##### get?

`boolean`

#### Returns

`number`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_getWidth`](widgets.canvas.Class.CanvasWidget.md#_getwidth)

---

### \_getHeight()

> **\_getHeight**(`get?`): `number`

Defined in: [packages/core/src/widgets/element.ts:1575](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1575)

#### Parameters

##### get?

`boolean`

#### Returns

`number`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_getHeight`](widgets.canvas.Class.CanvasWidget.md#_getheight)

---

### \_getLeft()

> **\_getLeft**(`get?`): `number`

Defined in: [packages/core/src/widgets/element.ts:1626](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1626)

#### Parameters

##### get?

`boolean`

#### Returns

`number`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_getLeft`](widgets.canvas.Class.CanvasWidget.md#_getleft)

---

### \_getRight()

> **\_getRight**(`get?`): `number`

Defined in: [packages/core/src/widgets/element.ts:1663](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1663)

#### Parameters

##### get?

`boolean`

#### Returns

`number`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_getRight`](widgets.canvas.Class.CanvasWidget.md#_getright)

---

### \_getTop()

> **\_getTop**(`get?`): `number`

Defined in: [packages/core/src/widgets/element.ts:1688](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1688)

#### Parameters

##### get?

`boolean`

#### Returns

`number`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_getTop`](widgets.canvas.Class.CanvasWidget.md#_gettop)

---

### \_getBottom()

> **\_getBottom**(`get?`): `number`

Defined in: [packages/core/src/widgets/element.ts:1725](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1725)

#### Parameters

##### get?

`boolean`

#### Returns

`number`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_getBottom`](widgets.canvas.Class.CanvasWidget.md#_getbottom)

---

### \_getShrinkBox()

> **\_getShrinkBox**(`xi`, `xl`, `yi`, `yl`, `get?`): `any`

Defined in: [packages/core/src/widgets/element.ts:1962](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L1962)

Rendering - here be dragons

#### Parameters

##### xi

`number`

##### xl

`number`

##### yi

`number`

##### yl

`number`

##### get?

`boolean`

#### Returns

`any`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_getShrinkBox`](widgets.canvas.Class.CanvasWidget.md#_getshrinkbox)

---

### \_getShrinkContent()

> **\_getShrinkContent**(`xi`, `xl`, `yi`, `yl`, `_get?`): `any`

Defined in: [packages/core/src/widgets/element.ts:2113](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L2113)

#### Parameters

##### xi

`number`

##### xl

`number`

##### yi

`number`

##### yl

`number`

##### \_get?

`boolean`

#### Returns

`any`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_getShrinkContent`](widgets.canvas.Class.CanvasWidget.md#_getshrinkcontent)

---

### \_getShrink()

> **\_getShrink**(`xi`, `xl`, `yi`, `yl`, `get?`): `any`

Defined in: [packages/core/src/widgets/element.ts:2149](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L2149)

#### Parameters

##### xi

`number`

##### xl

`number`

##### yi

`number`

##### yl

`number`

##### get?

`boolean`

#### Returns

`any`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_getShrink`](widgets.canvas.Class.CanvasWidget.md#_getshrink)

---

### \_getCoords()

> **\_getCoords**(`get?`, `noscroll?`): `RenderCoords` \| `undefined`

Defined in: [packages/core/src/widgets/element.ts:2194](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L2194)

#### Parameters

##### get?

`boolean`

##### noscroll?

`boolean`

#### Returns

`RenderCoords` \| `undefined`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_getCoords`](widgets.canvas.Class.CanvasWidget.md#_getcoords)

---

### \_render()

> **\_render**(): `any`

Defined in: [packages/core/src/widgets/element.ts:3218](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L3218)

Internal alias for render().

#### Returns

`any`

Rendered coordinates object

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`_render`](widgets.canvas.Class.CanvasWidget.md#_render)

---

### insertLine()

> **insertLine**(`i`, `line`): `void`

Defined in: [packages/core/src/widgets/element.ts:3232](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L3232)

Insert a line into the box's content.
Handles wrapped content by inserting at the specified fake line index.

#### Parameters

##### i

`number`

Line index to insert at (fake line number)

##### line

Line or array of lines to insert

`string` | `string`[]

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`insertLine`](widgets.canvas.Class.CanvasWidget.md#insertline)

---

### deleteLine()

> **deleteLine**(`i`, `n?`): `void`

Defined in: [packages/core/src/widgets/element.ts:3293](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L3293)

Delete a line from the box's content.
Handles wrapped content by deleting at the specified fake line index.

#### Parameters

##### i

`number`

Line index to delete (fake line number)

##### n?

`number`

Number of lines to delete (default: 1)

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`deleteLine`](widgets.canvas.Class.CanvasWidget.md#deleteline)

---

### insertTop()

> **insertTop**(`line`): `void`

Defined in: [packages/core/src/widgets/element.ts:3349](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L3349)

Insert a line at the top of the box.
Inserts at the first visible line based on childBase.

#### Parameters

##### line

Line or array of lines to insert

`string` | `string`[]

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`insertTop`](widgets.canvas.Class.CanvasWidget.md#inserttop)

---

### insertBottom()

> **insertBottom**(`line`): `void`

Defined in: [packages/core/src/widgets/element.ts:3359](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L3359)

Insert a line at the bottom of the box.
Inserts after the last visible line based on height and childBase.

#### Parameters

##### line

Line or array of lines to insert

`string` | `string`[]

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`insertBottom`](widgets.canvas.Class.CanvasWidget.md#insertbottom)

---

### deleteTop()

> **deleteTop**(`n?`): `void`

Defined in: [packages/core/src/widgets/element.ts:3372](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L3372)

Delete a line at the top of the box.
Deletes from the first visible line based on childBase.

#### Parameters

##### n?

`number`

Number of lines to delete (default: 1)

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`deleteTop`](widgets.canvas.Class.CanvasWidget.md#deletetop)

---

### deleteBottom()

> **deleteBottom**(`n?`): `void`

Defined in: [packages/core/src/widgets/element.ts:3382](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L3382)

Delete a line at the bottom of the box.
Deletes from the last visible line based on height and childBase.

#### Parameters

##### n?

`number`

Number of lines to delete (default: 1)

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`deleteBottom`](widgets.canvas.Class.CanvasWidget.md#deletebottom)

---

### setLine()

> **setLine**(`i`, `line`): `void`

Defined in: [packages/core/src/widgets/element.ts:3397](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L3397)

Set a line in the box's content.

#### Parameters

##### i

`number`

Line index to set (fake line number)

##### line

`string`

Line content to set

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`setLine`](widgets.canvas.Class.CanvasWidget.md#setline)

---

### setBaseLine()

> **setBaseLine**(`i`, `line`): `void`

Defined in: [packages/core/src/widgets/element.ts:3411](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L3411)

Set a line in the box's content from the visible top.

#### Parameters

##### i

`number`

Line offset from visible top

##### line

`string`

Line content to set

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`setBaseLine`](widgets.canvas.Class.CanvasWidget.md#setbaseline)

---

### getLine()

> **getLine**(`i`): `string`

Defined in: [packages/core/src/widgets/element.ts:3421](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L3421)

Get a line from the box's content.

#### Parameters

##### i

`number`

Line index to get (fake line number)

#### Returns

`string`

Line content

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`getLine`](widgets.canvas.Class.CanvasWidget.md#getline)

---

### getBaseLine()

> **getBaseLine**(`i`): `string`

Defined in: [packages/core/src/widgets/element.ts:3432](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L3432)

Get a line from the box's content from the visible top.

#### Parameters

##### i

`number`

Line offset from visible top

#### Returns

`string`

Line content

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`getBaseLine`](widgets.canvas.Class.CanvasWidget.md#getbaseline)

---

### clearLine()

> **clearLine**(`i`): `void`

Defined in: [packages/core/src/widgets/element.ts:3441](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L3441)

Clear a line from the box's content.

#### Parameters

##### i

`number`

Line index to clear (fake line number)

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`clearLine`](widgets.canvas.Class.CanvasWidget.md#clearline)

---

### clearBaseLine()

> **clearBaseLine**(`i`): `void`

Defined in: [packages/core/src/widgets/element.ts:3450](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L3450)

Clear a line from the box's content from the visible top.

#### Parameters

##### i

`number`

Line offset from visible top

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`clearBaseLine`](widgets.canvas.Class.CanvasWidget.md#clearbaseline)

---

### unshiftLine()

> **unshiftLine**(`line`): `void`

Defined in: [packages/core/src/widgets/element.ts:3459](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L3459)

Unshift a line onto the top of the content.

#### Parameters

##### line

Line or array of lines to insert

`string` | `string`[]

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`unshiftLine`](widgets.canvas.Class.CanvasWidget.md#unshiftline)

---

### shiftLine()

> **shiftLine**(`i?`, `n?`): `void`

Defined in: [packages/core/src/widgets/element.ts:3468](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L3468)

Shift a line off the top of the content.

#### Parameters

##### i?

`number`

Line index to remove (default: 0)

##### n?

`number`

Number of lines to remove (default: 1)

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`shiftLine`](widgets.canvas.Class.CanvasWidget.md#shiftline)

---

### pushLine()

> **pushLine**(`line`): `void`

Defined in: [packages/core/src/widgets/element.ts:3476](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L3476)

Push a line onto the bottom of the content.

#### Parameters

##### line

Line or array of lines to insert

`string` | `string`[]

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`pushLine`](widgets.canvas.Class.CanvasWidget.md#pushline)

---

### popLine()

> **popLine**(`n?`): `void`

Defined in: [packages/core/src/widgets/element.ts:3485](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L3485)

Pop a line off the bottom of the content.

#### Parameters

##### n?

`number`

Number of lines to remove (default: 1)

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`popLine`](widgets.canvas.Class.CanvasWidget.md#popline)

---

### getLines()

> **getLines**(): `string`[]

Defined in: [packages/core/src/widgets/element.ts:3493](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L3493)

An array containing the content lines.

#### Returns

`string`[]

Array of fake (unwrapped) lines

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`getLines`](widgets.canvas.Class.CanvasWidget.md#getlines)

---

### getScreenLines()

> **getScreenLines**(): `string`[]

Defined in: [packages/core/src/widgets/element.ts:3501](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L3501)

An array containing the lines as they are displayed on the screen.

#### Returns

`string`[]

Array of real (wrapped) lines

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`getScreenLines`](widgets.canvas.Class.CanvasWidget.md#getscreenlines)

---

### strWidth()

> **strWidth**(`text`): `number`

Defined in: [packages/core/src/widgets/element.ts:3511](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L3511)

Get a string's displayed width, taking into account double-width, surrogate pairs,
combining characters, tags, and SGR escape codes.

#### Parameters

##### text

`string`

Text to measure

#### Returns

`number`

Displayed width in cells

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`strWidth`](widgets.canvas.Class.CanvasWidget.md#strwidth)

---

### screenshot()

> **screenshot**(`xi?`, `xl?`, `yi?`, `yl?`): `string`

Defined in: [packages/core/src/widgets/element.ts:3527](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/element.ts#L3527)

Take an SGR screenshot of the element within the region. Returns a string containing only
characters and SGR codes. Can be displayed by simply echoing it in a terminal.

#### Parameters

##### xi?

`number`

Left X offset from element's inner left (default: 0)

##### xl?

`number`

Right X offset from element's inner left (default: element width)

##### yi?

`number`

Top Y offset from element's inner top (default: 0)

##### yl?

`number`

Bottom Y offset from element's inner top (default: element height)

#### Returns

`string`

SGR-encoded screenshot string

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`screenshot`](widgets.canvas.Class.CanvasWidget.md#screenshot)

---

### insert()

> **insert**(`element`, `i`): `void`

Defined in: [packages/core/src/widgets/node.ts:154](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L154)

Insert a node to this node's children at index i.

#### Parameters

##### element

`any`

##### i

`number`

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`insert`](widgets.canvas.Class.CanvasWidget.md#insert)

---

### prepend()

> **prepend**(`element`): `void`

Defined in: [packages/core/src/widgets/node.ts:191](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L191)

Prepend a node to this node's children.

#### Parameters

##### element

`any`

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`prepend`](widgets.canvas.Class.CanvasWidget.md#prepend)

---

### append()

> **append**(`element`): `void`

Defined in: [packages/core/src/widgets/node.ts:198](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L198)

Append a node to this node's children.

#### Parameters

##### element

`any`

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`append`](widgets.canvas.Class.CanvasWidget.md#append)

---

### insertBefore()

> **insertBefore**(`element`, `other`): `void`

Defined in: [packages/core/src/widgets/node.ts:205](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L205)

Insert a node to this node's children before the reference node.

#### Parameters

##### element

`any`

##### other

`any`

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`insertBefore`](widgets.canvas.Class.CanvasWidget.md#insertbefore)

---

### insertAfter()

> **insertAfter**(`element`, `other`): `void`

Defined in: [packages/core/src/widgets/node.ts:213](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L213)

Insert a node from node after the reference node.

#### Parameters

##### element

`any`

##### other

`any`

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`insertAfter`](widgets.canvas.Class.CanvasWidget.md#insertafter)

---

### remove()

> **remove**(`element`): `void`

Defined in: [packages/core/src/widgets/node.ts:221](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L221)

Remove child node from node.

#### Parameters

##### element

`any`

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`remove`](widgets.canvas.Class.CanvasWidget.md#remove)

---

### detach()

> **detach**(): `void`

Defined in: [packages/core/src/widgets/node.ts:255](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L255)

Remove node from its parent.

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`detach`](widgets.canvas.Class.CanvasWidget.md#detach)

---

### destroy()

> **destroy**(): `void`

Defined in: [packages/core/src/widgets/node.ts:271](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L271)

Same as the detach() method, except this will automatically call free() and unbind any screen
events to prevent memory leaks. For use with onScreenEvent(), removeScreenEvent(), and free().

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`destroy`](widgets.canvas.Class.CanvasWidget.md#destroy)

---

### forDescendants()

> **forDescendants**(`iter`, `s?`): `void`

Defined in: [packages/core/src/widgets/node.ts:283](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L283)

Iterate over all descendants, calling iter(el) for each.

#### Parameters

##### iter

(`el`) => `void`

##### s?

`any`

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`forDescendants`](widgets.canvas.Class.CanvasWidget.md#fordescendants)

---

### forAncestors()

> **forAncestors**(`iter`, `s?`): `void`

Defined in: [packages/core/src/widgets/node.ts:294](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L294)

Iterate over all ancestors, calling iter(el) for each.

#### Parameters

##### iter

(`el`) => `void`

##### s?

`any`

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`forAncestors`](widgets.canvas.Class.CanvasWidget.md#forancestors)

---

### collectDescendants()

> **collectDescendants**(`s?`): `any`[]

Defined in: [packages/core/src/widgets/node.ts:305](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L305)

Collect all descendants into an array.

#### Parameters

##### s?

`any`

#### Returns

`any`[]

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`collectDescendants`](widgets.canvas.Class.CanvasWidget.md#collectdescendants)

---

### collectAncestors()

> **collectAncestors**(`s?`): `any`[]

Defined in: [packages/core/src/widgets/node.ts:316](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L316)

Collect all ancestors into an array.

#### Parameters

##### s?

`any`

#### Returns

`any`[]

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`collectAncestors`](widgets.canvas.Class.CanvasWidget.md#collectancestors)

---

### emitDescendants()

> **emitDescendants**(...`args`): `void`

Defined in: [packages/core/src/widgets/node.ts:327](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L327)

Emit event for element, and recursively emit same event for all descendants.

#### Parameters

##### args

...`any`[]

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`emitDescendants`](widgets.canvas.Class.CanvasWidget.md#emitdescendants)

---

### emitAncestors()

> **emitAncestors**(...`args`): `void`

Defined in: [packages/core/src/widgets/node.ts:343](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L343)

Emit event for element, and recursively emit same event for all ancestors.

#### Parameters

##### args

...`any`[]

#### Returns

`void`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`emitAncestors`](widgets.canvas.Class.CanvasWidget.md#emitancestors)

---

### hasDescendant()

> **hasDescendant**(`target`): `boolean`

Defined in: [packages/core/src/widgets/node.ts:359](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L359)

Check if target is a descendant of this node.

#### Parameters

##### target

`any`

#### Returns

`boolean`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`hasDescendant`](widgets.canvas.Class.CanvasWidget.md#hasdescendant)

---

### hasAncestor()

> **hasAncestor**(`target`): `boolean`

Defined in: [packages/core/src/widgets/node.ts:377](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L377)

Check if target is an ancestor of this node.

#### Parameters

##### target

`any`

#### Returns

`boolean`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`hasAncestor`](widgets.canvas.Class.CanvasWidget.md#hasancestor)

---

### get()

> **get**(`name`, `value?`): `any`

Defined in: [packages/core/src/widgets/node.ts:388](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L388)

Get user property with a potential default value.

#### Parameters

##### name

`string`

##### value?

`any`

#### Returns

`any`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`get`](widgets.canvas.Class.CanvasWidget.md#get)

---

### set()

> **set**(`name`, `value`): `any`

Defined in: [packages/core/src/widgets/node.ts:398](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/node.ts#L398)

Set user property to value.

#### Parameters

##### name

`string`

##### value

`any`

#### Returns

`any`

#### Inherited from

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`set`](widgets.canvas.Class.CanvasWidget.md#set)

---

### calcSize()

> **calcSize**(): `void`

Defined in: [packages/core/src/widgets/stacked-bar.ts:66](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/stacked-bar.ts#L66)

Calculate the canvas size based on widget dimensions

Override this in subclasses to adjust the canvas size calculation.
By default, uses braille resolution (width*2 - padding, height*4)

#### Returns

`void`

#### Overrides

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`calcSize`](widgets.canvas.Class.CanvasWidget.md#calcsize)

---

### setData()

> **setData**(`data`): `void`

Defined in: [packages/core/src/widgets/stacked-bar.ts:80](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/stacked-bar.ts#L80)

Set data on the canvas

Override this in subclasses to handle specific data formats.

#### Parameters

##### data

`unknown`

#### Returns

`void`

#### Overrides

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`setData`](widgets.canvas.Class.CanvasWidget.md#setdata)

---

### getOptionsPrototype()

> **getOptionsPrototype**(): [`StackedBarOptions`](widgets.stacked-bar.Interface.StackedBarOptions.md)

Defined in: [packages/core/src/widgets/stacked-bar.ts:256](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/stacked-bar.ts#L256)

#### Returns

[`StackedBarOptions`](widgets.stacked-bar.Interface.StackedBarOptions.md)

---

### getCanvasTargetMode()

> `protected` **getCanvasTargetMode**(): `ColorTargetMode`

Defined in: [packages/core/src/widgets/stacked-bar.ts:294](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/stacked-bar.ts#L294)

#### Returns

`ColorTargetMode`

#### Overrides

[`CanvasWidget`](widgets.canvas.Class.CanvasWidget.md).[`getCanvasTargetMode`](widgets.canvas.Class.CanvasWidget.md#getcanvastargetmode)
