# Publishing & ownership

This repository is maintained by **Gavin Brady Lynch** ([@gavin-lynch](https://github.com/gavin-lynch)).

Canonical source:

- **GitHub:** https://github.com/gavin-lynch/unblessed
- **Docs (Vercel):** https://unblessed-docs.vercel.app
- **npm scope:** `@unblessed/*`

Metadata is centralized in [`project.metadata.json`](./project.metadata.json). After editing it, run:

```bash
node scripts/sync-project-metadata.js
```

## Before your first release

### 1. GitHub repository

- Ensure `origin` points at your fork or primary repo (`gavin-lynch/unblessed`).
- Enable GitHub Actions for the repo.
- Add repository secret **`NPM_TOKEN`** (npm access token with publish rights).

### 2. npm organization (`@unblessed`)

Packages publish as `@unblessed/core`, `@unblessed/node`, etc.

To publish from **your** npm account you need one of:

1. **Create** the `@unblessed` npm organization and add your user as owner, or
2. **Transfer** the existing `@unblessed` org from the previous maintainer, or
3. **Republish** under a new scope (e.g. `@gavin-lynch`) — requires renaming packages in every `package.json` (not done by default).

Verify access:

```bash
npm whoami
npm access ls-packages
```

### 3. CI release workflow

Releases run on push to `main`, `alpha`, or `beta` via [`.github/workflows/release.yml`](./.github/workflows/release.yml) and [semantic-release](https://github.com/semantic-release/semantic-release).

Required secrets:

| Secret        | Purpose                          |
|---------------|----------------------------------|
| `NPM_TOKEN`   | Publish to registry.npmjs.org    |
| `GITHUB_TOKEN`| Provided automatically by Actions |

### 4. Documentation site

Update hosting (Vercel/Netlify) to deploy from **your** GitHub repo. Set the production domain in [`apps/docs/docusaurus.config.ts`](./apps/docs/docusaurus.config.ts) (`url` / `baseUrl`) if you use a custom domain.

Regenerate API docs after metadata changes:

```bash
pnpm --filter docs run build:api
```

### 5. npm package pages

The `repository` field in each `package.json` links npm to your GitHub repo. Run `sync-project-metadata.js` before release so npm shows **gavin-lynch/unblessed** as the source.

## Manual publish (emergency)

```bash
pnpm build
node scripts/publish-packages.js
```

Prefer automated releases via semantic-release on the default branch.
