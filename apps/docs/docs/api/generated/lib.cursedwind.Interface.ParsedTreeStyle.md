# Interface: ParsedTreeStyle

Defined in: [packages/core/src/lib/cursedwind.ts:25](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/cursedwind.ts#L25)

Tree-specific style options parsed from className.

## Properties

### line?

> `optional` **line**: `Partial`\<`Style`\>

Defined in: [packages/core/src/lib/cursedwind.ts:27](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/cursedwind.ts#L27)

Style for tree lines (├, └, │, ─)

---

### indicator?

> `optional` **indicator**: `Partial`\<`Style`\>

Defined in: [packages/core/src/lib/cursedwind.ts:29](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/cursedwind.ts#L29)

Style for expand/collapse indicators ([+], [-])

---

### expanded?

> `optional` **expanded**: `Partial`\<`Style`\>

Defined in: [packages/core/src/lib/cursedwind.ts:31](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/cursedwind.ts#L31)

Style for expanded nodes

---

### collapsed?

> `optional` **collapsed**: `Partial`\<`Style`\>

Defined in: [packages/core/src/lib/cursedwind.ts:33](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/cursedwind.ts#L33)

Style for collapsed nodes

---

### leaf?

> `optional` **leaf**: `Partial`\<`Style`\>

Defined in: [packages/core/src/lib/cursedwind.ts:35](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/cursedwind.ts#L35)

Style for leaf nodes

---

### depth?

> `optional` **depth**: `Partial`\<`Style`\>[]

Defined in: [packages/core/src/lib/cursedwind.ts:37](https://github.com/gavin-lynch/unblessed/blob/main/packages/core/src/lib/cursedwind.ts#L37)

Array of styles for different tree depths
