---
name: Component package conventions
description: TypeScript Web Component class structure, ARIA contract, styling patterns, event naming, and test expectations for @ekko-ds/components
type: rules
paths:
  - "packages/components/**"
---

## File Structure

Every component lives at `src/{name}/` with exactly two files:
- `index.ts` — HTMLElement subclass, type exports, and self-registration
- `index.css` — Native CSS stylesheet (imported via `?inline` for Shadow DOM adoption)

A shared `src/css.d.ts` declares the `*.css?inline` module type.

## TypeScript Conventions

- Strict mode enabled (`strict: true` in tsconfig)
- No `any` types — use proper interfaces and type aliases
- Export type aliases for attribute values (e.g., `ButtonVariant`, `ButtonSize`)
- Export an interface for custom event detail (e.g., `EkkoClickEventDetail`)
- Type all private fields, method params, and return values
- Cast DOM queries with `as HTMLButtonElement` etc.
- Only add comments where the logic isn't self-evident — avoid decorative section dividers and obvious comments

## Class Structure (exact order)

Follow this order to match the established pattern in `src/button/index.ts`:

1. `import css from './index.css?inline'` — CSS imported as string via Vite's `?inline` suffix
2. Constructable stylesheet setup — `new CSSStyleSheet()` + `replaceSync(css)`
3. **Type exports** — `ButtonVariant`, `ButtonSize`, event detail interfaces
4. `export class Ekko{Name} extends HTMLElement`
5. `static get observedAttributes(): string[]` — include all reflected attributes AND forwarded ARIA attributes (`aria-label`, `aria-describedby`)
6. **Private fields** — use `#` prefix with explicit types (e.g., `#shadow: ShadowRoot`)
7. **`constructor()`** — `attachShadow({mode:'open'})` → `adoptedStyleSheets = [styles]` → `innerHTML = this.#template()` → cache element refs with type assertions
8. **`connectedCallback(): void`** — call `#upgradeProperty()` for each public property, set default attributes, add event listeners, call `#syncAccessibility()`
9. **`disconnectedCallback(): void`** — remove event listeners
10. **`attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void`** — guard `if (oldValue === newValue) return`, then `#syncAccessibility()`
11. **Typed property getters/setters** — cast getAttribute results to union types
12. **`#template(): string`** — return HTML string with `part="base"` on the inner interactive element
13. **`#syncAccessibility(): void`** — sync all ARIA attributes from host to inner element
14. **`#handleClick(event: Event): void`** — event handler with disabled/loading guard, toggle logic, form participation, and custom event dispatch
15. **`#upgradeProperty(prop: string): void`** — lazy property upgrade utility (see Web.dev Best Practices below)
16. **Self-registration** — `if (!customElements.get('ekko-{name}')) customElements.define('ekko-{name}', Ekko{Name})`

## ARIA Contract

IMPORTANT: These are the accessibility patterns every component must follow:

- Include `aria-label` and `aria-describedby` in `observedAttributes` so changes trigger `#syncAccessibility()`
- Use `aria-disabled="true"` on the inner element instead of native `disabled` — preserves tab-order discoverability for screen readers
- Set `aria-busy="true"` during loading states
- Forward `aria-label` from host to inner interactive element
- Forward `aria-describedby` from host to inner interactive element
- Toggle components use `aria-pressed` (buttons) or `aria-expanded` (disclosure)
- Expose `part="base"` on the inner interactive element for external styling
- Decorative elements (spinners, icons) get `aria-hidden="true"`

## Stylesheet Pattern

Styles live in `src/{name}/index.css` as native CSS, imported in the component via:
```ts
import css from './index.css?inline';
const styles = new CSSStyleSheet();
styles.replaceSync(css);
```

The `?inline` suffix tells Vite to return the CSS as a string instead of injecting it into the document. The web test runner handles this via a custom `inlineCssPlugin` in `web-test-runner.config.js`.

CSS rules:
- **Every themeable value MUST be a CSS custom property with a hardcoded fallback.** This includes — but is not limited to — `padding`, `margin`, `gap`, `width`, `height`, `min-*`/`max-*`, `inset`/`top`/`right`/`bottom`/`left`, `border-*`, `border-radius`, `outline-*`, `text-underline-offset`, `box-shadow`, `text-shadow`, `font-size`, `line-height`, `letter-spacing`, `font-weight`, `font-family`, `color`, `background-*`, `opacity`, `filter`, `transition-duration`, and `z-index`. If you're about to type a numeric value (`0.5rem`, `2px`, `1.25`) or a color (`#...`) directly into a CSS rule, STOP — add a token in `packages/tokens/tokens/component/{name}.json` first and reference it via `var()`.
- **Only the following values may appear as literals** (no token required): `0`, `auto`, `inherit`, `currentColor`, `transparent`, `none`, display/layout keywords (`flex`, `block`, `inline-flex`, `grid`, `absolute`, `relative`, etc.), `flex-shrink`/`flex-grow` numeric factors, `aspect-ratio`, `cursor` keywords, and `user-select`/`touch-action` keywords. Everything else is a token.
- **Unit policy** (applies to every dimension value, including token fallbacks): use `rem` for anything that should scale with user zoom/font-size — spacing (padding/margin/gap), layout sizing (width/height/min-height), typography (font-size/letter-spacing). Use `px` for pixel-precise values that should NOT scale with zoom — border-width, border-radius, outline-width/offset, box-shadow/text-shadow offsets and blur, text-underline-offset. `em` is forbidden. `1rem === 16px` (browser default).
- Token naming: `--ekko-{component}-{variant}-{property}` for variant-specific, `--ekko-{component}-shared-{property}` for shared, `--ekko-{component}-size-{sm|md|lg}-{property}` for size-specific.
- `:host` sets `display: inline-block` and `contain: content`; `:host([full-width])` sets `display: block; width: 100%`
- `:host([hidden]) { display: none }` MUST be present — custom elements with explicit `display` ignore the `hidden` attribute without this
- Use `:host([attribute])` selectors, not class-based styling
- Include `@media (prefers-reduced-motion: reduce)` to disable transitions/animations
- Focus ring via `:focus-visible` using `--ekko-{component}-shared-focus-ring-*` tokens

## Web.dev Best Practices

Every component MUST follow these patterns from the [web.dev custom elements best practices](https://web.dev/articles/custom-elements-best-practices):

### Hidden attribute support
Every component's CSS MUST include `:host([hidden]) { display: none }`. Without this, the `hidden` attribute has no effect on custom elements that set an explicit `display` value on `:host`.

### Layout containment
Every component's CSS MUST include `contain: content` on `:host`. This tells the browser the element's subtree is independent for layout, paint, and style — enabling significant rendering optimizations. Note: components with intentionally overflowing content (dropdowns, tooltips, popovers) should use `contain: none` instead.

### Lazy property upgrade
Every component MUST call `#upgradeProperty(prop)` in `connectedCallback()` for each public property with a setter, **BEFORE** setting default attributes. This handles the case where a framework sets properties on the element before the custom element definition loads:

```ts
#upgradeProperty(prop: string): void {
  if (Object.hasOwn(this, prop)) {
    const value = (this as Record<string, unknown>)[prop];
    delete (this as Record<string, unknown>)[prop];
    (this as Record<string, unknown>)[prop] = value;
  }
}
```

### Don't override author-set global attributes
In `connectedCallback()`, always guard default attribute assignments with `if (!this.hasAttribute(...))` so consumer-provided values are never overwritten. For `tabindex` and `role`, check with `hasAttribute` before setting defaults.

### FOUCE prevention
When adding a new component, add its tag name to `src/styles/fouce.css` so consumers can prevent a flash of unstyled content during lazy-loading.

## Events

Custom events use `ekko-{action}` naming (e.g., `ekko-click`, `ekko-change`). Always set:
- `bubbles: true`
- `composed: true` (crosses Shadow DOM boundary)
- `detail: { originalEvent }` — type with `CustomEvent<EkkoClickEventDetail>`

## Registration

After creating a component:
1. Add named export to `src/index.ts`
2. Add subpath export `"./{name}"` to `package.json` under `exports` with `types` field pointing to `./dist/types/{name}/index.d.ts`

## Test Expectations

Every component needs `tests/ekko-{name}.test.ts` with these describe blocks:
- **rendering** — Shadow DOM present, inner element rendered, slots, CSS parts
- **attributes** — defaults, reflection, property setters
- **ARIA** — aria-disabled, aria-busy, aria-label forwarding (including removal), aria-pressed
- **keyboard** — Enter/Space activation, disabled suppression
- **events** — custom event fires, bubbles, composed, detail content

Test setup:
- Use typed `mount(html: string): Ekko{Name}` helper and `cleanup(): void` in `afterEach`
- Use `innerBtn(el): HTMLButtonElement` helper to query the inner element through Shadow DOM
- Import `type { Ekko{Name} }` from the component
- Import `{ assert }` from `@esm-bundle/chai` and `{ sendKeys }` from `@web/test-runner-commands`
- Use `as` type assertions (not `!` non-null assertions) for narrowing nullable types after Chai assertions — Chai's `assert.isNotNull()` does not narrow types for TypeScript

Test runner config is in `web-test-runner.config.js` — run tests with `pnpm test` or directly with `npx web-test-runner`. Do NOT pass `--playwright --browsers` flags on the CLI as they conflict with the config file.
