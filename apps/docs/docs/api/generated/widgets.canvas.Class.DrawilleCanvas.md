# Class: DrawilleCanvas

Defined in: [packages/core/src/lib/canvas/drawille.ts:98](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/drawille.ts#L98)

DrawilleCanvas - Low-level braille pixel buffer

Provides direct pixel manipulation using Unicode braille characters.
Width must be a multiple of 2, height must be a multiple of 4.

## Constructors

### Constructor

> **new DrawilleCanvas**(`width`, `height`): `DrawilleCanvas`

Defined in: [packages/core/src/lib/canvas/drawille.ts:157](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/drawille.ts#L157)

#### Parameters

##### width

`number`

##### height

`number`

#### Returns

`DrawilleCanvas`

## Properties

### width

> `readonly` **width**: `number`

Defined in: [packages/core/src/lib/canvas/drawille.ts:99](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/drawille.ts#L99)

---

### height

> `readonly` **height**: `number`

Defined in: [packages/core/src/lib/canvas/drawille.ts:100](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/drawille.ts#L100)

---

### color

> **color**: `ColorInput` = `"normal"`

Defined in: [packages/core/src/lib/canvas/drawille.ts:112](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/drawille.ts#L112)

Current stroke color

---

### fontFg

> **fontFg**: `ColorInput` = `"normal"`

Defined in: [packages/core/src/lib/canvas/drawille.ts:115](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/drawille.ts#L115)

Current font foreground color

---

### fontBg

> **fontBg**: `ColorInput` = `"normal"`

Defined in: [packages/core/src/lib/canvas/drawille.ts:118](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/drawille.ts#L118)

Current font background color

---

### targetMode?

> `optional` **targetMode**: `ColorTargetMode`

Defined in: [packages/core/src/lib/canvas/drawille.ts:121](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/drawille.ts#L121)

Target color mode override

## Methods

### debugStats()

> **debugStats**(): `object`

Defined in: [packages/core/src/lib/canvas/drawille.ts:131](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/drawille.ts#L131)

#### Returns

`object`

##### width

> **width**: `number`

##### height

> **height**: `number`

##### cellCount

> **cellCount**: `number`

##### nonZeroCells

> **nonZeroCells**: `number`

##### colorCells

> **colorCells**: `number`

##### textCells

> **textCells**: `number`

---

### set()

> **set**(`x`, `y`, `colorOverride?`): `void`

Defined in: [packages/core/src/lib/canvas/drawille.ts:191](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/drawille.ts#L191)

Set a pixel at the given position.
Uses colorOverride for this pixel when provided (so stroke() can freeze color at stroke time);
otherwise uses this.color (current stroke/fill style).

#### Parameters

##### x

`number`

##### y

`number`

##### colorOverride?

`ColorInput`

#### Returns

`void`

---

### unset()

> **unset**(`x`, `y`): `void`

Defined in: [packages/core/src/lib/canvas/drawille.ts:208](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/drawille.ts#L208)

Unset (clear) a pixel at the given position

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

Defined in: [packages/core/src/lib/canvas/drawille.ts:224](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/drawille.ts#L224)

Toggle a pixel at the given position

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

Defined in: [packages/core/src/lib/canvas/drawille.ts:240](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/drawille.ts#L240)

Clear the entire canvas

#### Returns

`void`

---

### measureText()

> **measureText**(`str`): `object`

Defined in: [packages/core/src/lib/canvas/drawille.ts:249](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/drawille.ts#L249)

Measure text width in pixel units

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

Defined in: [packages/core/src/lib/canvas/drawille.ts:257](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/drawille.ts#L257)

Write text at the given pixel position
Text is rendered at character cell granularity

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

Defined in: [packages/core/src/lib/canvas/drawille.ts:281](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/canvas/drawille.ts#L281)

Render the canvas to a string with ANSI escape codes

#### Parameters

##### delimiter

`string` = "\n"

#### Returns

`string`
