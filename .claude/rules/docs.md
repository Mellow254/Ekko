---
name: Docs package conventions
description: Storybook 10 TypeScript story structure, imports, and story categories for @ekko-ds/docs
type: rules
paths:
  - "packages/docs/**"
---

## Story File Location

`src/stories/{component}/ekko-{component}.stories.ts`

## Imports

```ts
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@ekko-ds/components/{name}';
```

Always import `html` from `lit` (not `lit-html`). Import the component via its subpath export. Use Storybook's `Meta` and `StoryObj` types.

## Type-Safe Story Structure

```ts
interface ButtonArgs {
  variant: string;
  size: string;
  disabled: boolean;
  // ...
}

const meta: Meta = {
  title: 'Components/{PascalName}',
  component: 'ekko-{name}',
  tags: ['autodocs'],
  argTypes: { /* control definitions */ },
  args: { /* sensible defaults */ },
};

export default meta;
type Story = StoryObj<ButtonArgs>;
```

- Define a `{Name}Args` interface for all story args
- Type the default export as `Meta`
- Create a `type Story = StoryObj<{Name}Args>` alias
- Type each named export as `Story`
- `argTypes` should include `control` type, `description`, and `table.defaultValue`
- Boolean attributes use `control: 'boolean'`
- Enum attributes use `control: 'select'` with `options` array

## Story Exports

Include these standard stories (named exports, typed as `Story`):
- **`Default`** — primary variant with all args wired up
- **`Variants`** — all visual variants side by side
- **`Sizes`** — sm, md, lg side by side
- **`States`** — default, disabled, loading for multiple variants
- **`AccessibilityShowcase`** — demonstrates keyboard nav, screen reader announcements, focus ring

Plus component-specific stories as needed (e.g., `WithIcons`, `ToggleButton`, `FullWidth`).

## Render Pattern

Use lit template binding:
```ts
render: (args) => html`
  <ekko-{name}
    variant=${args.variant}
    size=${args.size}
    ?disabled=${args.disabled}
    ?loading=${args.loading}
  >
    Label
  </ekko-{name}>
`
```

Use `?attr=${bool}` for boolean attributes, `attr=${value}` for string attributes.

## Story Descriptions

Place descriptions in `parameters.docs.description.story`, not in code comments. Use markdown for formatting.
