---
name: Token package conventions
description: DTCG format, token tiers, dark mode, file structure, and build pipeline for @ekko-ds/tokens
type: rules
paths:
  - "packages/tokens/**"
---

## DTCG Format

All token files use the W3C Design Token Community Group (DTCG) spec:
- Properties use `$` prefix: `$value`, `$type`, `$description`
- Reference other tokens with curly-brace syntax: `"{color.blue.500}"`
- Group nesting defines the token path (e.g., `color.blue.500`)

## File Structure

Token source files are organized by concern under `tokens/`:

```
tokens/
  base/           ← raw values, never reference other tokens
    colors.json
    spacing.json
    radius.json
    typography.json
    motion.json
    shadows.json
    z-index.json
  semantic/       ← aliases to base tokens only
    colors/
      light.json  ← light theme semantic colors
      dark.json   ← dark theme overrides (same paths, different values)
    spacing.json
    radius.json
    typography.json
    focus.json
    transition.json
  component/      ← aliases to semantic tokens only, one file per component
    button.json
    input.json
```

Build infrastructure:
- `build.js` — build script at package root
- `utils/format.js` — custom Style Dictionary format functions

## Token Tier Hierarchy

Three tiers that MUST stay separated:

1. **Base tokens** (`tokens/base/`) — Raw values only (hex colors, px sizes, font stacks). NEVER reference other tokens.
2. **Semantic tokens** (`tokens/semantic/`) — Aliases to base tokens ONLY. NEVER contain raw values (except dark mode overrides which use resolved hex values). These are the "meaning" layer (e.g., `color.text.primary` → `{color.neutral.900}`).
3. **Component tokens** (`tokens/component/`) — Aliases to semantic tokens ONLY. Named as `{componentName}.{variant}.{property}` (e.g., `button.primary.background`).

## Dark Mode

`tokens/semantic/colors/dark.json` ONLY overrides semantic color and focus tokens. It uses the same token paths as `light.json` with dark-appropriate values. Never override base or component tokens in dark mode. The build script wraps dark overrides in both `@media (prefers-color-scheme: dark)` and `[data-theme="dark"]` selectors automatically.

## CSS Custom Property Naming

Style Dictionary prefixes all tokens with `ekko`. The token path maps directly:
- `button.primary.background` → `--ekko-button-primary-background`
- `button.shared.border-radius` → `--ekko-button-shared-border-radius`

## Unit Policy

Every `dimension` token MUST use one of exactly two units:

- **`rem`** — for anything that should scale with user zoom and root font-size: spacing (`space.*`), component padding/margin/gap, widths/heights, typography (`font.size.*`, `font.tracking.*`), icon sizes. `1rem === 16px` at the browser default.
- **`px`** — for pixel-precise values that must NOT scale with zoom: `border-width`, `border-radius`, `outline-width`/`offset`, focus-ring width/offset, `box-shadow`/`text-shadow` offsets and blur, `text-underline-offset`, spinner/divider stroke widths.

`em` is forbidden in token sources. Durations stay in `ms`. If you're unsure whether a value is "precise pixel" or "scalable layout," default to `rem`.

## Adding Component Tokens

When adding tokens for a new component:
1. Create `tokens/component/{name}.json` with a top-level key matching the component name
2. Reference semantic tokens only — never base tokens directly
3. **Every numeric or color value in the component stylesheet MUST have a corresponding token with a hardcoded fallback in the `var()` call.** No exceptions for "small" values like `2px` borders, `0.125rem` gaps, or `1.4` line-heights — they all get tokens. The only CSS literals allowed without a token are keywords (`auto`, `none`, `transparent`, `currentColor`, `inherit`, `0`, display/layout keywords, and unitless `flex-shrink`/`flex-grow` factors).
4. Follow the unit policy above (rem for layout/typography, px for precision).

## Build Pipeline

`pnpm build:tokens` runs `node build.js`. Three stages:
1. Base build (light-only) → `dist/css/tokens.css`, `dist/js/tokens.mjs`, `dist/json/tokens.flat.json`
2. Dark mode → `dist/css/tokens.dark.css` (dual selectors: `@media (prefers-color-scheme: dark)` + `[data-theme="dark"]`)
3. Combined → `dist/css/tokens.all.css` (light + dark in one file — this is the primary `./css` export)

## Package Exports

- `./css` → `tokens.all.css` (combined light + dark — primary export for consumers)
- `./css/base` → `tokens.css` (light-only, for consumers managing dark mode separately)
- `./css/dark` → `tokens.dark.css` (dark overrides only)
- `./js` → `tokens.mjs` (ES module constants)
- `./json` → `tokens.flat.json` (flat key-value pairs)
