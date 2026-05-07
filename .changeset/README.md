# Changesets

This directory holds [changesets](https://github.com/changesets/changesets) — small markdown files describing the changes that should be included in the next release.

## Adding a changeset

```bash
pnpm changeset
```

Pick the affected packages and a bump type (`patch` / `minor` / `major`), then write a one-line summary. Commit the generated file with your PR.

`@ekko-ds/components` and `@ekko-ds/tokens` are **linked** — bumping one bumps the other to the same version. `@ekko-ds/docs` is private and ignored by changesets.

## Release flow

1. PR with a changeset → merged into `main`.
2. The `Release` job on CI opens (or updates) a **Version PR** titled `chore: release packages`. It applies pending changesets, bumps versions, and updates the changelog.
3. Merge the Version PR into `main`. CI publishes the bumped packages to npm.

Releases are gated to pushes on `main` only. PRs and pushes to other branches never publish.
