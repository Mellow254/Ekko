Create a new Ekko component named "$ARGUMENTS".

Follow these steps in order:

1. **Component tokens** — Create `packages/tokens/tokens/component/$ARGUMENTS.json`
   - Add a top-level `"$ARGUMENTS"` key
   - Reference semantic tokens only — never base tokens directly
   - Include variant colors, shared properties (border-radius, border-width, border-style, font-family, font-weight, line-height, letter-spacing, gap, transition-duration, focus-ring tokens), and size variants (sm/md/lg with padding, font-size, height)
   - Run `pnpm build:tokens` to generate CSS custom properties

2. **Styles** — Create `packages/components/src/$ARGUMENTS/index.css`
   - All values via `--ekko-$ARGUMENTS-*` CSS custom properties with hardcoded fallbacks
   - Do NOT include `:host` display/contain, `:host([hidden])`, or `:host([full-width])` — these are provided by the `EkkoBase` base stylesheet
   - Include: size variants (sm/md/lg), `:focus-visible` ring, disabled state (opacity 0.5, cursor not-allowed), loading state with spinner, `@media (prefers-reduced-motion: reduce)`
   - Use `:host([attribute])` selectors, not class-based styling

3. **Component implementation** — Create `packages/components/src/$ARGUMENTS/index.ts`
   - Follow the exact class structure from `packages/components/src/button/index.ts`
   - Import `{ EkkoBase }` from `'../base'` and CSS via `import css from './index.css?inline'`
   - Extend `EkkoBase` instead of `HTMLElement`
   - In constructor, call `super(styles)` then `this.shadow.innerHTML = this.#template()`, then cache element refs via `this.shadow.querySelector()`
   - Include `#template(): string` private method returning the component HTML with `part="base"` on the inner interactive element
   - Export type aliases for attribute values
   - Export an interface for the custom event detail
   - Call `this.upgradeProperty()` (inherited) for every public property setter in `connectedCallback()`, before setting default attributes
   - Include `aria-label` and `aria-describedby` in `observedAttributes`
   - Implement `#syncAccessibility(): void` — use inherited `this.forwardAriaLabel(target)` and `this.forwardAriaDescribedby(target)` for ARIA forwarding
   - Self-register with `customElements.define`

4. **FOUCE** — Add `ekko-$ARGUMENTS:not(:defined)` to the selector list in `packages/components/src/styles/fouce.css`

5. **Barrel export** — Add the named export to `packages/components/src/index.ts`

6. **Package export** — Do NOT touch `packages/components/package.json`. The existing `"./*"` wildcard entry already resolves `@ekko-ds/components/$ARGUMENTS` to `./dist/$ARGUMENTS/index.js` and `./dist/types/$ARGUMENTS/index.d.ts`. Adding an explicit `"./$ARGUMENTS"` entry is redundant — no existing component has one.

7. **Tests** — Create `packages/components/tests/ekko-$ARGUMENTS.test.ts`
   - Import `type { Ekko{Name} }` from the component
   - Use typed `mount(html: string): Ekko{Name}` helper, `cleanup(): void` in `afterEach`
   - Use `innerBtn` (or equivalent) helper to query inner element through Shadow DOM
   - Import `{ assert }` from `@esm-bundle/chai` and `{ sendKeys }` from `@web/test-runner-commands`
   - Use `as` type assertions (not `!`) for narrowing nullable types after Chai assertions
   - Include describe blocks for: rendering, attributes, ARIA (including aria-label removal), keyboard, events
   - Only add comments where the logic isn't self-evident

8. **Story** — Create `packages/docs/src/stories/$ARGUMENTS/ekko-$ARGUMENTS.stories.ts`
   - Import `type { Meta, StoryObj }` from `@storybook/web-components`
   - Import `{ html }` from `lit` and `@ekko-ds/components/$ARGUMENTS`
   - Define `{Name}Args` interface, type default export as `Meta`, create `type Story = StoryObj<{Name}Args>`
   - Include stories: Default, Variants (if applicable), Sizes, States, AccessibilityShowcase
   - Use `tags: ['autodocs']`
   - Place descriptions in `parameters.docs.description.story`, not code comments

9. **Verify** — Run `pnpm build && pnpm typecheck && pnpm test && pnpm lint` and confirm everything passes.
