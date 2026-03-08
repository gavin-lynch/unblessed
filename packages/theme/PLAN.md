# Theme Extraction Plan

Goal: extract all theming logic from core into `@unblessed/theme`, keep core
focused on rendering and widget behavior, and make theming available to all
widgets (core + contrib) through a single, framework-agnostic API.

## Scope

- Move token resolution, utility class parsing, and variant resolution to
  `@unblessed/theme`.
- Keep core responsible only for applying resolved style objects.
- Widgets own state (hover/focus/active) and choose which variant bundle to
  apply.

## Inventory (current state)

- Core renders with `style` objects and parses inline tags.
- Color conversion is handled in core (color-converter, program attr parsing).
- Examples use ad-hoc colors; no shared theme tokens yet.

## Extraction Steps

1. Catalog theming touchpoints
   - Identify where core resolves colors from names/hex/arrays.
   - Identify any theme-like logic or style conventions in widgets.

2. Define `@unblessed/theme` API (source of truth)
   - Token schema: colors, spacing, borders, radii, typography, components.
   - Resolver: tokens -> resolved style objects.
   - Utilities: Tailwind-like class parser + variants (hover/focus/active).

3. Move and centralize logic
   - Keep token and utility logic in `@unblessed/theme` only.
   - Core takes resolved values; no token lookup in core.

4. Update widget integration
   - Add simple hooks for applying resolved styles on widgets.
   - Widgets manage state (hover/focus/active) and choose variants.

5. Documentation and examples
   - Add theme usage docs and migration notes.
   - Update at least one example to use theme tokens + utilities.

## Non-Goals

- No automatic state tracking in core.
- No React-specific theming in this package (optional integration only).

## Risks

- Duplication if core keeps any token resolution.
- Inconsistent widget styling if examples remain ad-hoc.

## Milestones

1. MVP theme package in place (tokens + utilities).
2. Widget integration path defined (resolved styles only).
3. One example migrated to tokens + utilities.
4. Docs published.
