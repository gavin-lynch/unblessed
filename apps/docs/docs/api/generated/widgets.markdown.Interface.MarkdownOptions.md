# Interface: MarkdownOptions

Defined in: [packages/core/src/widgets/markdown.ts:40](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/markdown.ts#L40)

## Extends

- `BoxOptions`

## Properties

### name?

> `optional` **name**: `string`

Defined in: [packages/core/src/types/options.ts:35](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L35)

#### Inherited from

`BoxOptions.name`

---

### screen?

> `optional` **screen**: `any`

Defined in: [packages/core/src/types/options.ts:36](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L36)

#### Inherited from

`BoxOptions.screen`

---

### parent?

> `optional` **parent**: [`Node`](widgets.node.Class.Node.md)

Defined in: [packages/core/src/types/options.ts:37](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L37)

#### Inherited from

`BoxOptions.parent`

---

### children?

> `optional` **children**: [`Node`](widgets.node.Class.Node.md)[]

Defined in: [packages/core/src/types/options.ts:38](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L38)

#### Inherited from

`BoxOptions.children`

---

### focusable?

> `optional` **focusable**: `boolean`

Defined in: [packages/core/src/types/options.ts:39](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L39)

#### Inherited from

`BoxOptions.focusable`

---

### \_isScreen?

> `optional` **\_isScreen**: `boolean`

Defined in: [packages/core/src/types/options.ts:40](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L40)

#### Inherited from

`BoxOptions._isScreen`

---

### scrollable?

> `optional` **scrollable**: `boolean`

Defined in: [packages/core/src/types/options.ts:71](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L71)

Whether the element is scrollable or not.

#### Inherited from

`BoxOptions.scrollable`

---

### baseLimit?

> `optional` **baseLimit**: `number`

Defined in: [packages/core/src/types/options.ts:76](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L76)

A limit to the childBase. Default is Infinity.

#### Inherited from

`BoxOptions.baseLimit`

---

### alwaysScroll?

> `optional` **alwaysScroll**: `boolean`

Defined in: [packages/core/src/types/options.ts:82](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L82)

A option which causes the ignoring of childOffset. This in turn causes the
childBase to change every time the element is scrolled.

#### Inherited from

`BoxOptions.alwaysScroll`

---

### scrollbar?

> `optional` **scrollbar**: `ScrollbarConfig`

Defined in: [packages/core/src/types/options.ts:88](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L88)

Object enabling a scrollbar.
Style of the scrollbar track if present (takes regular style options).

#### Inherited from

`BoxOptions.scrollbar`

---

### track?

> `optional` **track**: `TrackConfig`

Defined in: [packages/core/src/types/options.ts:90](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L90)

#### Inherited from

`BoxOptions.track`

---

### mouse?

> `optional` **mouse**: `boolean`

Defined in: [packages/core/src/types/options.ts:95](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L95)

Whether to enable automatic mouse support for this element.

#### Inherited from

`BoxOptions.mouse`

---

### keys?

> `optional` **keys**: `string` \| `boolean` \| `string`[]

Defined in: [packages/core/src/types/options.ts:100](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L100)

Use pre-defined keys (i or enter for insert, e for editor, C-e for editor while inserting).

#### Inherited from

`BoxOptions.keys`

---

### vi?

> `optional` **vi**: `boolean`

Defined in: [packages/core/src/types/options.ts:105](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L105)

Use vi keys with the keys option.

#### Inherited from

`BoxOptions.vi`

---

### ignoreKeys?

> `optional` **ignoreKeys**: `boolean` \| `string`[]

Defined in: [packages/core/src/types/options.ts:107](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L107)

#### Inherited from

`BoxOptions.ignoreKeys`

---

### animatable?

> `optional` **animatable**: `boolean`

Defined in: [packages/core/src/types/options.ts:115](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L115)

Whether the element supports animations (animateBorderColors, pulse, fade).
When true, adds animation methods via makeAnimatable mixin.

#### Inherited from

`BoxOptions.animatable`

---

### colorMode?

> `optional` **colorMode**: `ScreenColorMode`

Defined in: [packages/core/src/types/options.ts:126](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L126)

Per-element color mode override.
Defaults to the screen's color policy when omitted.

#### Inherited from

`BoxOptions.colorMode`

---

### tags?

> `optional` **tags**: `boolean`

Defined in: [packages/core/src/types/options.ts:130](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L130)

Parse tags in content (e.g. `\{bold\}`text\{/bold\}).

#### Inherited from

`BoxOptions.tags`

---

### parseTags?

> `optional` **parseTags**: `boolean`

Defined in: [packages/core/src/types/options.ts:135](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L135)

Parse tags in content (alias for tags).

#### Inherited from

`BoxOptions.parseTags`

---

### className?

> `optional` **className**: `string`

Defined in: [packages/core/src/types/options.ts:153](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L153)

Tailwind-style utility classes for terminal styling (CursedWind).

Space-separated class names are parsed into style, border, padding, layout,
and position options. Works on any widget that extends Element.

#### Example

```typescript
const box = new Box({
  parent: screen,
  className: "bg-blue fg-white bold border-line border-cyan p-2 text-center",
});
```

#### See

[CursedWind guide](https://unblessed-docs.vercel.app/docs/concepts/cursedwind)

#### Inherited from

`BoxOptions.className`

---

### fg?

> `optional` **fg**: `string`

Defined in: [packages/core/src/types/options.ts:158](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L158)

Foreground color.

#### Inherited from

`BoxOptions.fg`

---

### bg?

> `optional` **bg**: `string`

Defined in: [packages/core/src/types/options.ts:163](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L163)

Background color.

#### Inherited from

`BoxOptions.bg`

---

### bold?

> `optional` **bold**: `boolean`

Defined in: [packages/core/src/types/options.ts:168](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L168)

Bold text attribute.

#### Inherited from

`BoxOptions.bold`

---

### underline?

> `optional` **underline**: `boolean`

Defined in: [packages/core/src/types/options.ts:173](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L173)

Underline text attribute.

#### Inherited from

`BoxOptions.underline`

---

### blink?

> `optional` **blink**: `boolean`

Defined in: [packages/core/src/types/options.ts:178](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L178)

Blinking text attribute.

#### Inherited from

`BoxOptions.blink`

---

### inverse?

> `optional` **inverse**: `boolean`

Defined in: [packages/core/src/types/options.ts:183](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L183)

Inverse/reverse video attribute (swap foreground and background).

#### Inherited from

`BoxOptions.inverse`

---

### invisible?

> `optional` **invisible**: `boolean`

Defined in: [packages/core/src/types/options.ts:188](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L188)

Invisible text attribute.

#### Inherited from

`BoxOptions.invisible`

---

### transparent?

> `optional` **transparent**: `boolean`

Defined in: [packages/core/src/types/options.ts:198](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L198)

Lower element opacity to 50% using naive color blending.
Displays dimmed content with parent's background visible behind it.
Works best with 256-color terminals.

#### Example

```ts
const box = blessed.box({ transparent: true });
```

#### Inherited from

`BoxOptions.transparent`

---

### style?

> `optional` **style**: `any`

Defined in: [packages/core/src/types/options.ts:203](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L203)

Style object containing colors and attributes.

#### Inherited from

`BoxOptions.style`

---

### border?

> `optional` **border**: `"bg"` \| `Border` \| `"line"`

Defined in: [packages/core/src/types/options.ts:208](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L208)

Border object, see below.

#### Inherited from

`BoxOptions.border`

---

### content?

> `optional` **content**: `string`

Defined in: [packages/core/src/types/options.ts:213](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L213)

Element's text content.

#### Inherited from

`BoxOptions.content`

---

### clickable?

> `optional` **clickable**: `boolean`

Defined in: [packages/core/src/types/options.ts:218](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L218)

Element is clickable.

#### Inherited from

`BoxOptions.clickable`

---

### input?

> `optional` **input**: `boolean`

Defined in: [packages/core/src/types/options.ts:223](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L223)

Element is focusable and can receive key input.

#### Inherited from

`BoxOptions.input`

---

### keyable?

> `optional` **keyable**: `boolean`

Defined in: [packages/core/src/types/options.ts:228](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L228)

Element is focusable and can receive key input (alias for input).

#### Inherited from

`BoxOptions.keyable`

---

### tabIndex?

> `optional` **tabIndex**: `number`

Defined in: [packages/core/src/types/options.ts:248](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L248)

Controls keyboard focus navigation (similar to HTML tabindex attribute).

- `undefined`: Not focusable (default for Box, Text, etc.)
- `-1`: Programmatically focusable only, excluded from Tab order
- `0`: Focusable in natural document order (default for Input and List widgets)
- `1+`: Explicit tab order (focused before natural order elements)

#### Example

```ts
// Make a box focusable in natural order
const box = new Box({ parent: screen, tabIndex: 0 });

// Programmatic focus only (excluded from Tab navigation)
const modal = new Box({ parent: screen, tabIndex: -1 });

// Explicit order (focused before natural order elements)
const importantBox = new Box({ parent: screen, tabIndex: 1 });
```

#### Inherited from

`BoxOptions.tabIndex`

---

### focused?

> `optional` **focused**: `any`

Defined in: [packages/core/src/types/options.ts:253](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L253)

Element is focused.

#### Inherited from

`BoxOptions.focused`

---

### hidden?

> `optional` **hidden**: `boolean`

Defined in: [packages/core/src/types/options.ts:258](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L258)

Whether the element is hidden.

#### Inherited from

`BoxOptions.hidden`

---

### label?

> `optional` **label**: `string`

Defined in: [packages/core/src/types/options.ts:263](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L263)

A simple text label for the element.

#### Inherited from

`BoxOptions.label`

---

### hoverText?

> `optional` **hoverText**: `string`

Defined in: [packages/core/src/types/options.ts:268](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L268)

A floating text label for the element which appears on mouseover.

#### Inherited from

`BoxOptions.hoverText`

---

### hoverBg?

> `optional` **hoverBg**: `string`

Defined in: [packages/core/src/types/options.ts:273](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L273)

Background color when element is hovered.

#### Inherited from

`BoxOptions.hoverBg`

---

### hoverEffects?

> `optional` **hoverEffects**: `any`

Defined in: [packages/core/src/types/options.ts:278](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L278)

Effects to apply when element is hovered.

#### Inherited from

`BoxOptions.hoverEffects`

---

### focusEffects?

> `optional` **focusEffects**: `any`

Defined in: [packages/core/src/types/options.ts:283](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L283)

Effects to apply when element is focused.

#### Inherited from

`BoxOptions.focusEffects`

---

### effects?

> `optional` **effects**: `any`

Defined in: [packages/core/src/types/options.ts:288](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L288)

General effects to apply to the element.

#### Inherited from

`BoxOptions.effects`

---

### align?

> `optional` **align**: `"left"` \| `"center"` \| `"right"`

Defined in: [packages/core/src/types/options.ts:293](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L293)

Text alignment: left, center, or right.

#### Inherited from

`BoxOptions.align`

---

### valign?

> `optional` **valign**: `"middle"` \| `"top"` \| `"bottom"`

Defined in: [packages/core/src/types/options.ts:298](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L298)

Vertical text alignment: top, middle, or bottom.

#### Inherited from

`BoxOptions.valign`

---

### shrink?

> `optional` **shrink**: `boolean`

Defined in: [packages/core/src/types/options.ts:303](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L303)

Shrink/flex/grow to content and child elements. Width/height during render.

#### Inherited from

`BoxOptions.shrink`

---

### wrap?

> `optional` **wrap**: `boolean`

Defined in: [packages/core/src/types/options.ts:308](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L308)

Wrap text if it exceeds width.

#### Inherited from

`BoxOptions.wrap`

---

### textWrap?

> `optional` **textWrap**: `TextWrapMode`

Defined in: [packages/core/src/types/options.ts:321](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L321)

Text wrapping/truncation mode (ink-style).
Takes precedence over wrap property if set.

- 'wrap': Word wrap text to multiple lines (default behavior)
- 'truncate-end': Truncate at end with ellipsis: "Hello W…"
- 'truncate-middle': Truncate in middle with ellipsis: "Hel…rld"
- 'truncate-start': Truncate at start with ellipsis: "…World"

If undefined, uses legacy wrap boolean behavior.

#### Inherited from

`BoxOptions.textWrap`

---

### padding?

> `optional` **padding**: `number` \| `Partial`\<`Padding`\>

Defined in: [packages/core/src/types/options.ts:327](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L327)

Amount of padding on the inside of the element. Can be a number or an object containing
the properties: left, right, top, and bottom.

#### Inherited from

`BoxOptions.padding`

---

### top?

> `optional` **top**: `PositionValue`

Defined in: [packages/core/src/types/options.ts:334](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L334)

Offsets of the element relative to its parent. Can be a number, percentage (0-100%), or
keyword (center). right and bottom do not accept keywords. Percentages can also have
offsets (50%+1, 50%-1).

#### Inherited from

`BoxOptions.top`

---

### left?

> `optional` **left**: `PositionValue`

Defined in: [packages/core/src/types/options.ts:341](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L341)

Offsets of the element relative to its parent. Can be a number, percentage (0-100%), or
keyword (center). right and bottom do not accept keywords. Percentages can also have
offsets (50%+1, 50%-1).

#### Inherited from

`BoxOptions.left`

---

### right?

> `optional` **right**: `PositionValue`

Defined in: [packages/core/src/types/options.ts:347](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L347)

Right offset of the element relative to its parent. Can be a number or percentage (0-100%).
Percentages can also have offsets (50%+1, 50%-1).

#### Inherited from

`BoxOptions.right`

---

### bottom?

> `optional` **bottom**: `PositionValue`

Defined in: [packages/core/src/types/options.ts:353](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L353)

Bottom offset of the element relative to its parent. Can be a number or percentage (0-100%).
Percentages can also have offsets (50%+1, 50%-1).

#### Inherited from

`BoxOptions.bottom`

---

### width?

> `optional` **width**: `string` \| `number`

Defined in: [packages/core/src/types/options.ts:359](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L359)

Width/height of the element, can be a number, percentage (0-100%), or keyword (half or shrink).
Percentages can also have offsets (50%+1, 50%-1).

#### Inherited from

`BoxOptions.width`

---

### height?

> `optional` **height**: `string` \| `number`

Defined in: [packages/core/src/types/options.ts:365](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L365)

Width/height of the element, can be a number, percentage (0-100%), or keyword (half or shrink).
Percentages can also have offsets (50%+1, 50%-1).

#### Inherited from

`BoxOptions.height`

---

### position?

> `optional` **position**: `Position`

Defined in: [packages/core/src/types/options.ts:370](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L370)

Can contain the above options.

#### Inherited from

`BoxOptions.position`

---

### ch?

> `optional` **ch**: `string`

Defined in: [packages/core/src/types/options.ts:375](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L375)

Background character (default is whitespace ).

#### Inherited from

`BoxOptions.ch`

---

### draggable?

> `optional` **draggable**: `boolean`

Defined in: [packages/core/src/types/options.ts:380](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L380)

Allow the element to be dragged with the mouse.

#### Inherited from

`BoxOptions.draggable`

---

### shadow?

> `optional` **shadow**: `boolean`

Defined in: [packages/core/src/types/options.ts:389](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L389)

Draw a translucent offset shadow behind the element.
Automatically darkens the background behind the shadow.

#### Example

```ts
const box = blessed.box({ shadow: true });
```

#### Inherited from

`BoxOptions.shadow`

---

### noOverflow?

> `optional` **noOverflow**: `boolean`

Defined in: [packages/core/src/types/options.ts:394](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L394)

Prevent content from overflowing the element boundaries.

#### Inherited from

`BoxOptions.noOverflow`

---

### dockBorders?

> `optional` **dockBorders**: `boolean`

Defined in: [packages/core/src/types/options.ts:404](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L404)

Automatically "dock" borders with adjacent elements.
Instead of overlapping, borders connect seamlessly to neighboring elements.

#### Example

```ts
const box1 = blessed.box({
  dockBorders: true,
  top: 0,
  left: 0,
  width: 10,
  height: 5,
});
const box2 = blessed.box({
  dockBorders: true,
  top: 0,
  left: 10,
  width: 10,
  height: 5,
});
```

#### Inherited from

`BoxOptions.dockBorders`

---

### fixed?

> `optional` **fixed**: `boolean`

Defined in: [packages/core/src/types/options.ts:409](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L409)

Fixed position (does not scroll with parent).

#### Inherited from

`BoxOptions.fixed`

---

### type?

> `optional` **type**: `string`

Defined in: [packages/core/src/types/options.ts:414](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L414)

Type identifier for the element.

#### Inherited from

`BoxOptions.type`

---

### bindings?

> `optional` **bindings**: `any`

Defined in: [packages/core/src/types/options.ts:426](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/types/options.ts#L426)

#### Inherited from

`BoxOptions.bindings`

---

### markdown?

> `optional` **markdown**: `string`

Defined in: [packages/core/src/widgets/markdown.ts:41](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/markdown.ts#L41)

---

### markdownStyle?

> `optional` **markdownStyle**: [`MarkdownStyle`](widgets.markdown.Interface.MarkdownStyle.md)

Defined in: [packages/core/src/widgets/markdown.ts:42](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/markdown.ts#L42)

---

### highlightTheme?

> `optional` **highlightTheme**: [`HighlightTheme`](widgets.markdown.Interface.HighlightTheme.md)

Defined in: [packages/core/src/widgets/markdown.ts:43](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/widgets/markdown.ts#L43)
