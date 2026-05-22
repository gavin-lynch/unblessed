# Class: AnsiTermCanvas

Defined in: [packages/core/src/lib/canvas/ansi-term.ts:21](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/ansi-term.ts#L21)

AnsiTermCanvas - Character-level canvas

Each "pixel" is one terminal character cell.
Perfect for bar charts, block-based visualizations, etc.

## Constructors

### Constructor

> **new AnsiTermCanvas**(`width`, `height`): `AnsiTermCanvas`

Defined in: [packages/core/src/lib/canvas/ansi-term.ts:48](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/ansi-term.ts#L48)

#### Parameters

##### width

`number`

##### height

`number`

#### Returns

`AnsiTermCanvas`

## Properties

### width

> `readonly` **width**: `number`

Defined in: [packages/core/src/lib/canvas/ansi-term.ts:22](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/ansi-term.ts#L22)

---

### height

> `readonly` **height**: `number`

Defined in: [packages/core/src/lib/canvas/ansi-term.ts:23](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/ansi-term.ts#L23)

---

### color

> **color**: `ColorInput` = `"normal"`

Defined in: [packages/core/src/lib/canvas/ansi-term.ts:29](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/ansi-term.ts#L29)

Current stroke/fill color

---

### fontFg

> **fontFg**: `ColorInput` = `"normal"`

Defined in: [packages/core/src/lib/canvas/ansi-term.ts:32](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/ansi-term.ts#L32)

Current font foreground color

---

### fontBg

> **fontBg**: `ColorInput` = `"normal"`

Defined in: [packages/core/src/lib/canvas/ansi-term.ts:35](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/ansi-term.ts#L35)

Current font background color

---

### targetMode?

> `optional` **targetMode**: `ColorTargetMode`

Defined in: [packages/core/src/lib/canvas/ansi-term.ts:38](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/ansi-term.ts#L38)

Target color mode override

## Methods

### set()

> **set**(`x`, `y`): `void`

Defined in: [packages/core/src/lib/canvas/ansi-term.ts:66](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/ansi-term.ts#L66)

Set a "pixel" (fill a character cell with background color)

#### Parameters

##### x

`number`

##### y

`number`

#### Returns

`void`

---

### unset()

> **unset**(`x`, `y`): `void`

Defined in: [packages/core/src/lib/canvas/ansi-term.ts:80](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/ansi-term.ts#L80)

Unset (clear) a "pixel"

#### Parameters

##### x

`number`

##### y

`number`

#### Returns

`void`

---

### toggle()

> **toggle**(`x`, `y`): `void`

Defined in: [packages/core/src/lib/canvas/ansi-term.ts:92](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/ansi-term.ts#L92)

Toggle a "pixel"

#### Parameters

##### x

`number`

##### y

`number`

#### Returns

`void`

---

### clear()

> **clear**(): `void`

Defined in: [packages/core/src/lib/canvas/ansi-term.ts:104](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/ansi-term.ts#L104)

Clear the entire canvas

#### Returns

`void`

---

### measureText()

> **measureText**(`str`): `object`

Defined in: [packages/core/src/lib/canvas/ansi-term.ts:111](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/ansi-term.ts#L111)

Measure text width in pixel units (1:1 for character canvas)

#### Parameters

##### str

`string`

#### Returns

`object`

##### width

> **width**: `number`

---

### writeText()

> **writeText**(`str`, `x`, `y`): `void`

Defined in: [packages/core/src/lib/canvas/ansi-term.ts:118](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/ansi-term.ts#L118)

Write text at the given position

#### Parameters

##### str

`string`

##### x

`number`

##### y

`number`

#### Returns

`void`

---

### frame()

> **frame**(`delimiter`): `string`

Defined in: [packages/core/src/lib/canvas/ansi-term.ts:146](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/ansi-term.ts#L146)

Render the canvas to a string

#### Parameters

##### delimiter

`string` = "\n"

#### Returns

`string`
