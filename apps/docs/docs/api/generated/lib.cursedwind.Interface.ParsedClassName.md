# Interface: ParsedClassName

Defined in: [packages/core/src/lib/cursedwind.ts:44](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/cursedwind.ts#L44)

Result of parsing a className string.
Contains all the style-related properties that can be applied to an element.

## Properties

### style?

> `optional` **style**: `Partial`\<`Style`\>

Defined in: [packages/core/src/lib/cursedwind.ts:46](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/cursedwind.ts#L46)

Style object with colors and attributes

---

### border?

> `optional` **border**: `object`

Defined in: [packages/core/src/lib/cursedwind.ts:48](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/cursedwind.ts#L48)

Border configuration

#### type?

> `optional` **type**: `"bg"` \| `"line"`

#### style?

> `optional` **style**: `BorderStyleName`

#### fg?

> `optional` **fg**: `string` \| `number`

#### bg?

> `optional` **bg**: `string` \| `number`

#### ch?

> `optional` **ch**: `string`

---

### padding?

> `optional` **padding**: `Partial`\<`Padding`\>

Defined in: [packages/core/src/lib/cursedwind.ts:56](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/cursedwind.ts#L56)

Padding configuration

---

### align?

> `optional` **align**: `"left"` \| `"center"` \| `"right"`

Defined in: [packages/core/src/lib/cursedwind.ts:58](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/cursedwind.ts#L58)

Text alignment

---

### valign?

> `optional` **valign**: `"middle"` \| `"top"` \| `"bottom"`

Defined in: [packages/core/src/lib/cursedwind.ts:60](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/cursedwind.ts#L60)

Vertical alignment

---

### shrink?

> `optional` **shrink**: `boolean`

Defined in: [packages/core/src/lib/cursedwind.ts:62](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/cursedwind.ts#L62)

Whether to shrink to content

---

### hidden?

> `optional` **hidden**: `boolean`

Defined in: [packages/core/src/lib/cursedwind.ts:64](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/cursedwind.ts#L64)

Whether element is hidden

---

### wrap?

> `optional` **wrap**: `boolean`

Defined in: [packages/core/src/lib/cursedwind.ts:66](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/cursedwind.ts#L66)

Whether to wrap text

---

### shadow?

> `optional` **shadow**: `boolean`

Defined in: [packages/core/src/lib/cursedwind.ts:68](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/cursedwind.ts#L68)

Shadow effect

---

### scrollable?

> `optional` **scrollable**: `boolean`

Defined in: [packages/core/src/lib/cursedwind.ts:70](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/cursedwind.ts#L70)

Whether element is scrollable

---

### position?

> `optional` **position**: `object`

Defined in: [packages/core/src/lib/cursedwind.ts:72](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/cursedwind.ts#L72)

Positioning values

#### top?

> `optional` **top**: `string` \| `number`

#### left?

> `optional` **left**: `string` \| `number`

#### right?

> `optional` **right**: `string` \| `number`

#### bottom?

> `optional` **bottom**: `string` \| `number`

#### width?

> `optional` **width**: `string` \| `number`

#### height?

> `optional` **height**: `string` \| `number`

---

### tree?

> `optional` **tree**: [`ParsedTreeStyle`](lib.cursedwind.Interface.ParsedTreeStyle.md)

Defined in: [packages/core/src/lib/cursedwind.ts:81](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/cursedwind.ts#L81)

Tree-specific styles (for Tree widget)
