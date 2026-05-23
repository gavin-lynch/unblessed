# Browser examples

The Vite dev server root is this `example/` directory.

## Dashboard (`index.html`)

Browser (xterm.js) port of
[`packages/contrib/examples/dashboard-truecolor.ts`](../../contrib/examples/dashboard-truecolor.ts):
a dense grid of contrib charts with live updating data and truecolor styling.

Open [http://localhost:8080](http://localhost:8080).

## Tree widget (`tree.html`)

Demonstrates the core [`Tree`](../../core/src/widgets/tree.ts) widget with
[`TreePresets.Modern`](../../core/src/lib/tree-presets.ts), custom `iconRules` for
git-style status markers, and an info panel — see
[`tree.md`](../../core/src/widgets/tree.md) for full API notes.

Open [http://localhost:8080/tree.html](http://localhost:8080/tree.html).

## Lip Gloss / Charm (`charm.html`)

Browser port of [`packages/contrib/examples/charm.ts`](../../contrib/examples/charm.ts):
Lip Gloss–style layout with `@gavin-lynch/unblessed-theme`, truecolor, clickable tabs, and
the same demo content as the Node example.

Open [http://localhost:8080/charm.html](http://localhost:8080/charm.html).

## Run

From the repo root (after a normal `pnpm install` and `pnpm build` so `dist/` artifacts exist):

```bash
pnpm --filter @gavin-lynch/unblessed-browser dev
```

Press **q**, **Escape**, or **Ctrl+C** to tear down the screen (the browser tab stays open).

## Do not run with Bun or Node

`main.ts`, `tree-main.ts`, and `charm-main.ts` are **Vite** entries. **xterm.js expects a real DOM** (`document`, `window`). Running `bun main.ts` / `node main.ts` (or the same for `tree-main.ts` / `charm-main.ts`) from this folder will fail; those files detect that and print instructions instead of a long xterm stack trace.

For the **Node + real TTY** originals, from `packages/contrib` with `@gavin-lynch/unblessed-node`:

```bash
pnpm --filter @gavin-lynch/unblessed-contrib exec tsx examples/charm.ts
pnpm --filter @gavin-lynch/unblessed-contrib exec tsx examples/dashboard-truecolor.ts
```

## Notes

- The app calls `setRuntime(new BrowserRuntime())` before constructing widgets, matching the manual setup used in Playwright fixtures.
- `process.exit` is not used on quit; the browser `process` polyfill would throw.
