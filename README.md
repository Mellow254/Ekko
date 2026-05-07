# Ekko Design System

> Headless · Multi-brand · Native Web Components · WCAG 2.2 AA

**[Documentation →](https://mellow254.github.io/Ekko/)**

Ekko is a design system built entirely on native web platform features. Components are Web Components. Styling is driven by CSS custom properties. Design tokens follow the W3C DTCG specification. Nothing requires a framework to consume.

---

## Philosophy

**Native web first.** If the browser can do it, we use the browser. No framework abstractions, no runtime overhead, no lock-in.

**Headless by design.** Components own behaviour and accessibility. Tokens own visual style. The two never mix.

**Multi-brand from the ground up.** A brand overrides a single CSS file. Every component updates. Zero code changes required.

---

## Packages

| Package | Description |
|---|---|
| `@ekko-ds/tokens` | DTCG design tokens → CSS custom properties, JS constants |
| `@ekko-ds/components` | Headless Web Components |
| `@ekko-ds/docs` | Storybook 10 documentation |

---

## Getting started

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9

### Install

```bash
git clone https://github.com/your-org/ekko-ds.git
cd ekko-ds
pnpm install
```

### Build the token pipeline

```bash
pnpm build:tokens
```

This runs Style Dictionary v5 and outputs:
- `packages/tokens/dist/css/tokens.css` — CSS custom properties (light)
- `packages/tokens/dist/css/tokens.dark.css` — dark mode overrides
- `packages/tokens/dist/css/tokens.all.css` — combined light + dark
- `packages/tokens/dist/js/tokens.mjs` — JS constants
- `packages/tokens/dist/json/tokens.flat.json` — flat JSON for tooling

### Start Storybook

```bash
pnpm docs
```

Opens Storybook at `http://localhost:6006`.

### Run tests

```bash
pnpm test
```

Runs component tests in real Chromium via Web Test Runner + Playwright.

### Build everything

```bash
pnpm build
```

---

## Using components

### In any HTML file

```html
<!-- 1. Load tokens -->
<link rel="stylesheet" href="https://unpkg.com/@ekko-ds/tokens/css">

<!-- 2. Load components -->
<script type="module" src="https://unpkg.com/@ekko-ds/components"></script>

<!-- 3. Use them -->
<ekko-button variant="primary">Save changes</ekko-button>
```

### In a React / Next.js project

```bash
pnpm add @ekko-ds/tokens @ekko-ds/components
```

```jsx
// app/layout.jsx (or _app.jsx)
import '@ekko-ds/tokens/css';
import '@ekko-ds/components';

// Then use anywhere:
<ekko-button variant="primary" onClick={handleSave}>
  Save changes
</ekko-button>
```

### In a Vue project

```js
// main.js
import '@ekko-ds/tokens/css';
import '@ekko-ds/components';
```

```html
<!-- template -->
<ekko-button variant="primary" @ekko-click="handleSave">
  Save changes
</ekko-button>
```

---

## Applying a brand

Create a CSS file that overrides semantic tokens:

```css
/* sauti-brand.css */
:root {
  --ekko-color-action-primary: #0D9488;
  --ekko-color-action-primary-hover: #0F766E;
  --ekko-button-shared-border-radius: 4px;
  --ekko-font-body-family: 'Poppins', system-ui, sans-serif;
}
```

Load it after the default tokens:

```html
<link rel="stylesheet" href="@ekko-ds/tokens/css">
<link rel="stylesheet" href="./sauti-brand.css">
```

Done. Every component in the system reflects the new brand.

---

## Development workflow

```
main           ← stable, always releasable
  └─ dev       ← integration branch
       └─ feat/component-name
       └─ fix/issue-id
       └─ tokens/update-name
```

### Creating a changeset

```bash
pnpm changeset
```

Follow the prompts to describe the change. Changesets are committed alongside code. The CI release job converts them into version bumps and changelogs automatically.

### Commit convention

```
feat(button):   add loading state with aria-busy
fix(dialog):    restore focus to trigger on close
a11y(select):   fix roving tabindex in listbox
tokens(color):  add neutral-950 to primitive scale
docs(tooltip):  add screen reader expectation notes
chore:          update dependencies
```

---

## Project structure

```
ekko-ds/
├── packages/
│   ├── tokens/
│   │   ├── tokens/
│   │   │   ├── base/        ← primitive values (colors, spacing, etc.)
│   │   │   ├── semantic/    ← aliases to base (light/dark color schemes)
│   │   │   └── component/   ← component-level tokens
│   │   ├── utils/
│   │   │   └── format.js    ← Style Dictionary custom formats
│   │   ├── build.js         ← token build script
│   │   └── dist/            ← generated, do not edit
│   ├── components/
│   │   ├── src/
│   │   │   ├── button/
│   │   │   │   ├── index.ts
│   │   │   │   └── index.css
│   │   │   └── index.ts
│   │   ├── tests/
│   │   ├── vite.config.ts
│   │   └── dist/            ← generated, do not edit
│   └── docs/
│       ├── .storybook/
│       └── src/stories/
├── .changeset/
├── .github/workflows/
├── turbo.json
├── biome.json
├── tsconfig.json
└── pnpm-workspace.yaml
```

---

## Accessibility

All components target **WCAG 2.2 Level AA** minimum. Every component ships with:

- Full keyboard navigation (per APG patterns)
- Correct ARIA roles, states, and properties
- Visible focus indicators driven by tokens
- Screen reader testing against NVDA + Firefox and VoiceOver + Safari

Automated accessibility scanning runs on every PR via axe-core in Storybook.

---

## License

MIT
