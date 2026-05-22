# Core Dependency Extraction Plan

This document summarizes how we will remove third-party dependencies from
`@unblessed/core` while preserving core capabilities like truecolor, canvas
rendering, and runtime-driven image decoding. It also captures the expected
organization for `@unblessed/contrib` after extraction.

## Goals

- Keep `@unblessed/core` dependency-free.
- Preserve holistic truecolor support and the core color pipeline.
- Keep canvas/drawing primitives in core as foundational infrastructure.
- Move widget-specific third-party dependencies into `@unblessed/contrib`.
- Keep compatibility surface stable for contrib/blessed users.

## Non-negotiables (Core Must Keep)

- Canvas/drawing stack: `AnsiTermCanvas`, `DrawilleCanvas`, `CharCanvas`,
  `CanvasWidget`, `BrailleCanvas`.
- Color system: `color-converter`, `color-capabilities`, `colors`, SGR parsing
  and truecolor handling.
- Text utilities: ANSI-safe truncation/wrapping.
- Runtime injection pattern and platform abstraction.
- Layout primitives: grid, carousel, base layout widget.
- Animation and border utilities.

## Third-party Dependencies in Core (Current)

Widgets in core that import third-party libraries today:

- `packages/core/src/widgets/markdown.ts`
  - `marked`, `marked-terminal`, `chalk`
- `packages/core/src/widgets/diff.ts`
  - `diff`, `cli-highlight`, `chalk`, `x256`
- `packages/core/src/widgets/map.ts`
  - `map-canvas`
- `packages/core/src/widgets/picture.ts`
  - `picture-tuber`

Other node-specific behavior in core:

- `packages/core/src/widgets/terminal.ts` (spawns shells via runtime)
- `packages/core/src/widgets/overlayimage.ts` (w3mimgdisplay binary)
- `packages/core/src/widgets/ansiimage.ts` (curl/wget via runtime for URLs)

## Policy Decisions (Confirmed)

- Do not use `x256` in core. Use core color matching instead.
- Defer i18n/RTL/shaping work for now (see `I18N_RTL_RESEARCH_PLAN.md`).
- Core keeps image rendering infrastructure via runtime extensions.
- Contrib carries widget-specific third-party dependencies.

## Runtime Extensions (Keep in Core)

Core remains dependency-free by delegating optional capabilities to runtime
adapters through `getRuntime()` feature detection:

- `runtime.images` (PNG/GIF decoding)
  - `pngjs` / `omggif` provided by the runtime adapter
- `runtime.processes` (child process spawning)
- `runtime.networking` (tty/net for rare features)

Core’s `image-renderer.ts` already uses `runtime.images` and is kept as a
foundational primitive (not contrib-only).

## Extraction Strategy

### 1) Move widget-specific dependencies into contrib

Move the following widgets out of core and keep them in contrib only:

- `markdown`
- `diff`
- `map`
- `picture`

In contrib, keep their public API stable. In core, remove their
implementations and exports.

### 2) Replace remaining compat-only deps in core

Remove `x256` from core (used in `diff`). Core should only use its own
color matching (`colors.match`, `resolveColor`, etc.). If blessed-contrib
parity needs `x256`, keep it in contrib only.

### 3) Keep image decoding in core via runtime

Image rendering stays in core because it is foundational. Decoding is
performed by runtime adapters (`@unblessed/node`, `@unblessed/browser`)
via `runtime.images`. This keeps core dependency-free while enabling
future image-based widgets.

## Contrib Organization (Agreed)

Organize contrib to make wrappers vs optional-deps obvious:

```
packages/contrib/src/
  widgets/
    wrappers/    # thin re-exports to core widgets
    compat/      # contrib-specific behaviors when diverged
    external/    # widgets that require 3rd-party deps
  layout/        # wrapper exports (grid, carousel)
  utils.ts       # thin wrappers over core utils + compat helpers
  color-utils.ts # compat helpers only
```

This keeps contrib’s role clear: compatibility surface + optional deps.

## Validation

Run these after extraction to verify no regressions:

- `pnpm --filter @unblessed/core build`
- `pnpm --filter @unblessed/contrib build`
- `pnpm exec tsx packages/contrib/examples/dashboard.ts`
- `pnpm exec tsx packages/contrib/examples/truecolor.ts`
- `pnpm exec tsx packages/contrib/examples/dashboard-truecolor-dump.ts`

Inspect outputs in `packages/contrib/examples/out/*` for proof.

## Outcome

Core remains clean and dependency-free while still providing the
foundational capabilities required by contrib and future widget packs.
