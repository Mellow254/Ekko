Create a new Ekko component named "$ARGUMENTS".

Follow these steps in order:

1. **Component tokens** — Create `packages/tokens/tokens/component/$ARGUMENTS.json`
   - Add a top-level `"$ARGUMENTS"` key
   - Reference semantic tokens only — never base tokens directly
   - Include variant colors, shared properties (border-radius, border-width, border-style, font-family, font-weight, line-height, letter-spacing, gap, transition-duration, focus-ring tokens), and size variants (sm/md/lg with padding, font-size, height)
   - Run `pnpm build:tokens` to generate CSS custom properties

2. **Styles** — Create `packages/components/src/$ARGUMENTS/index.css`
   - All values via `--ekko-$ARGUMENTS-*` CSS custom properties with hardcoded fallbacks
   - Include: `:host` display with `contain: content`, `:host([hidden]) { display: none }`, `:host([full-width])`, size variants (sm/md/lg), `:focus-visible` ring, disabled state (opacity 0.5, cursor not-allowed), loading state with spinner, `@media (prefers-reduced-motion: reduce)`
   - Use `:host([attribute])` selectors, not class-based styling

3. **Component implementation** — Create `packages/components/src/$ARGUMENTS/index.ts`
   - Follow the exact class structure from `packages/components/src/button/index.ts`
   - Import CSS via `import css from './index.css?inline'` and adopt via `CSSStyleSheet`
   - Export type aliases for attribute values
   - Export an interface for the custom event detail
   - Include `#upgradeProperty()` private method — call it for every public property setter in `connectedCallback()`, before setting default attributes
   - Include `aria-label` and `aria-describedby` in `observedAttributes`
   - Implement `#syncAccessibility(): void` with proper ARIA forwarding
   - Self-register with `customElements.define`

4. **FOUCE** — Add `ekko-$ARGUMENTS:not(:defined)` to the selector list in `packages/components/src/styles/fouce.css`

5. **Barrel export** — Add the named export to `packages/components/src/index.ts`

6. **Package export** — Add a subpath export `"./$ARGUMENTS"` to `packages/components/package.json` under `exports` with `types` field pointing to `./dist/types/$ARGUMENTS/index.d.ts`

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
