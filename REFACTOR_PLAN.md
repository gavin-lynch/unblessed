# Refactor Plan

This plan captures the agreed next steps for the ongoing refactor.

## Goals

- Keep `@gavin-lynch/unblessed-core` dependency-free.
- Preserve holistic truecolor support and the core color pipeline.
- Keep canvas/drawing primitives in core.
- Rename `packages/contrib` to `packages/blessed-contrib`.
- Introduce `packages/external` for non-compat extra functionality (e.g. refactored markdown/diff).

## Decisions Locked In

- Do not use `x256` in core.
- Defer i18n/RTL/shaping work for now (tracked separately in `I18N_RTL_RESEARCH_PLAN.md`).
- Keep runtime image decoding in core via runtime extensions.
- `packages/external` owns non-compat feature widgets with third-party deps.

## Execution Plan

1. Rename contrib package
   - Move `packages/contrib` -> `packages/blessed-contrib`.
   - Update workspace configs, imports, docs, and examples.
   - Update package names and references to `@gavin-lynch/unblessed-contrib`.

2. Create `packages/external`
   - Scaffold with package.json/tsconfig/entry exports.
   - Intended for non-compat extra functionality (refactored markdown/diff, etc.).

3. Extract third-party widgets from core
   - Move `markdown`, `diff`, `map`, `picture` out of core.
   - Decide target per widget:
     - Non-compat feature work -> `packages/external`.
     - Legacy compat widgets -> `packages/blessed-contrib`.
   - Remove core exports and dependencies for these widgets.

4. Remove `x256` from core
   - Replace any remaining uses with core color matching.
   - If compat parity needs it, keep `x256` in blessed-contrib only.

5. Simplify blessed-contrib organization
   - Prefer a flat `src/widgets/` layout.
   - If needed, split into only:
     - `src/widgets/compat/`
     - `src/widgets/wrappers/`
   - Keep `src/layout/`, `src/utils.ts`, `src/color-utils.ts` at top level.

6. Docs update
   - Update `CORE_DEPENDENCY_EXTRACTION_PLAN.md` and `CONTRIB_TO_CORE_ANALYSIS.md`
     to reflect rename and new `packages/external`.

7. Validation
   - Build core + blessed-contrib + external.
   - Run example smoke tests:
     - `packages/contrib/examples/dashboard.ts` (path update after rename)
     - `packages/contrib/examples/truecolor.ts`
     - `packages/contrib/examples/dashboard-truecolor-dump.ts`

Timestamp: February 22, 2026
