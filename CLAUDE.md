# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Ekko is a headless, native Web Components design system. Written in TypeScript with strict type checking. Zero runtime dependencies, CSS custom properties for theming, and W3C DTCG tokens for design token management.

## Monorepo Structure

Three packages managed by pnpm workspaces + Turborepo:

- **`@ekko-ds/tokens`** — Design tokens pipeline (Style Dictionary v5). DTCG-format JSON sources → CSS custom properties, ES modules, flat JSON. Supports dark mode via `@media (prefers-color-scheme: dark)` and `[data-theme="dark"]`.
- **`@ekko-ds/components`** — Headless Web Components library (TypeScript, Vite 8). Zero runtime deps. Components use Shadow DOM, constructable stylesheets, and consume tokens via CSS custom properties. Publishes `.d.ts` type declarations.
- **`@ekko-ds/docs`** — Storybook 10 documentation site (private, not published).

Build order matters: tokens → components → docs (Turborepo handles this via `dependsOn: ["^build"]`).

## Commands

```bash
pnpm install                # Install dependencies
pnpm build                  # Full build (tokens → components + types)
pnpm build:tokens           # Build tokens only
pnpm build:components       # Build components only
pnpm dev                    # Watch mode for all packages
pnpm docs                   # Start Storybook at :6006
pnpm test                   # Run component tests
pnpm test:a11y              # Run accessibility scans
pnpm lint                   # Biome lint check
pnpm format                 # Biome format (auto-fix)
pnpm typecheck              # TypeScript strict type checking
pnpm changeset              # Create a changeset for versioning
```

Run a single component test:

```bash
cd packages/components && npx web-test-runner 'tests/ekko-button.test.ts'
```

## Dependencies

When adding a new package, always install the latest version unless a specific version is explicitly requested.

## Code Style

- **TypeScript**: Strict mode enabled. No `any` types. All source files are `.ts`.
- **Biome v2**: Handles formatting and linting. Config in `biome.json`. A PostToolUse hook auto-runs `biome check --fix` after every file edit.
- **Comments**: Only where the logic isn't self-evident. No decorative section dividers, no obvious comments, no trailing summaries.

## Versioning & Release

- Changesets manages versioning. `@ekko-ds/components` and `@ekko-ds/tokens` are linked (versioned together).
- `@ekko-ds/docs` is excluded from changesets (private).
- Release flow: `pnpm changeset` → PR → merge → `changeset version` → `changeset publish`.

## Verification

IMPORTANT: After making changes, always verify:
1. `pnpm build` — confirms the full build pipeline passes (including type declarations)
2. `pnpm typecheck` — confirms strict TypeScript passes with zero errors
3. `pnpm test` — confirms component tests pass
4. `pnpm lint` — confirms code style compliance

For token changes, rebuild tokens first: `pnpm build:tokens`
For a specific component: `cd packages/components && npx web-test-runner 'tests/ekko-{name}.test.ts'`
