# Publishing (@gavin-lynch scope)

This fork is published as **`@gavin-lynch/unblessed-*`** packages under [gavin-lynch/unblessed](https://github.com/gavin-lynch/unblessed).

## Published packages (in order)

| npm package | Directory |
|-------------|-----------|
| `@gavin-lynch/unblessed-core` | `packages/core` |
| `@gavin-lynch/unblessed-theme` | `packages/theme` |
| `@gavin-lynch/unblessed-node` | `packages/node` |
| `@gavin-lynch/unblessed-browser` | `packages/browser` |
| `@gavin-lynch/unblessed-layout` | `packages/layout` |
| `@gavin-lynch/unblessed-contrib` | `packages/contrib` |
| `@gavin-lynch/unblessed-react` | `packages/react` |
| `@gavin-lynch/unblessed-vrt` | `packages/vrt` |
| `@gavin-lynch/unblessed-blessed` | `packages/blessed` |
| `@gavin-lynch/unblessed-perf` | `packages/perf` |
| `@gavin-lynch/create-unblessed` | `packages/create-unblessed` |

Install example:

```bash
pnpm add @gavin-lynch/unblessed-node @gavin-lynch/unblessed-contrib @gavin-lynch/unblessed-theme
```

## Prerequisites

1. **GitHub:** `origin` → `git@github.com:gavin-lynch/unblessed.git`
2. **npm:** Log in as a user with permission to publish to scope `@gavin-lynch`:
   ```bash
   npm login
   npm whoami
   ```
   Create the `@gavin-lynch` org on npm if it does not exist.
3. **GitHub Actions secret:** `NPM_TOKEN` with publish access to `@gavin-lynch`

## Metadata sync

Edit [`project.metadata.json`](./project.metadata.json), then:

```bash
pnpm run sync:metadata
```

## Release flow

Releases run via [semantic-release](https://github.com/semantic-release/semantic-release) on push to `main`, `alpha`, or `beta` (see [`.github/workflows/release.yml`](./.github/workflows/release.yml)).

`scripts/publish-packages.js` publishes all packages in dependency order.

### Manual publish (emergency)

```bash
pnpm build
node scripts/publish-packages.js
```

## Docs site

After API or package renames:

```bash
pnpm --filter docs run build:api
```

Deploy from your GitHub repo (e.g. Vercel → `unblessed-docs.vercel.app`).

## Relation to `@unblessed/*` on npm

The original project published `@unblessed/core`, `@unblessed/node`, etc. (alpha.23). **This fork is a separate npm scope** — it includes unreleased work (contrib, theme, core changes) and must not be mixed with old `@unblessed/*` installs without version alignment.
