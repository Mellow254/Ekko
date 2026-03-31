import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@ekko-ds/components/button';

interface ButtonArgs {
  variant: string;
  size: string;
  disabled: boolean;
  loading: boolean;
  'full-width': boolean;
  'icon-only': boolean;
  pressed?: string;
}

/**
 * The `ekko-button` component is the foundational interactive control
 * in the Ekko Design System. It is a headless Web Component — styling
 * is entirely driven by CSS custom properties from the token layer.
 *
 * ## Token overrides
 * Every visual property maps to a CSS custom property.
 * Override tokens at `:root` or on a parent element to restyle:
 *
 * ```css
 * :root {
 *   --ekko-button-primary-background: #8B5CF6;
 *   --ekko-button-shared-border-radius: 2px;
 * }
 * ```
 */
const meta: Meta = {
  title: 'Components/Button',
  component: 'ekko-button',
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger', 'link'],
      description: 'Visual style variant',
      table: {
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables interaction. Sets aria-disabled="true" to preserve discoverability.',
    },
    loading: {
      control: 'boolean',
      description: 'Shows a spinner and sets aria-busy="true". Prevents interaction.',
    },
    'full-width': {
      control: 'boolean',
      description: 'Stretches the button to fill its container.',
    },
    'icon-only': {
      control: 'boolean',
      description: 'Square padding for icon-only buttons. Always provide aria-label.',
    },
    pressed: {
      control: 'select',
      options: [undefined, 'true', 'false'],
      description: 'Toggle button state. When set, aria-pressed is applied.',
    },
  },
};

export default meta;
type Story = StoryObj<ButtonArgs>;

export const Default: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    'full-width': false,
    'icon-only': false,
    pressed: '',
  },
  render: (args) => html`
    <ekko-button
      variant=${args.variant}
      size=${args.size}
      ?disabled=${args.disabled}
      ?loading=${args.loading}
      ?full-width=${args['full-width']}
      ?icon-only=${args['icon-only']}
    >
      Save changes
    </ekko-button>
  `,
};

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'All five visual variants side by side. Use `primary` for the main call to action, `secondary` for alternative actions, `ghost` for low-emphasis actions, `danger` for destructive operations, and `link` for in-line navigation.',
      },
    },
  },
  render: () => html`
    <div
      style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;"
    >
      <ekko-button variant="primary">Primary</ekko-button>
      <ekko-button variant="secondary">Secondary</ekko-button>
      <ekko-button variant="ghost">Ghost</ekko-button>
      <ekko-button variant="danger">Danger</ekko-button>
      <ekko-button variant="link">Link</ekko-button>
    </div>
  `,
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Three sizes aligned to the spacing scale. `sm` for compact UIs and inline contexts, `md` for standard use, `lg` for prominent calls to action.',
      },
    },
  },
  render: () => html`
    <div
      style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;"
    >
      <ekko-button size="sm">Small</ekko-button>
      <ekko-button size="md">Medium</ekko-button>
      <ekko-button size="lg">Large</ekko-button>
    </div>
  `,
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '**Disabled** — sets `aria-disabled="true"` (not the native `disabled` attribute) so the button remains discoverable by keyboard and screen reader users who need to know it exists. **Loading** — sets `aria-busy="true"` and suppresses interaction while showing a spinner.',
      },
    },
  },
  render: () => html`
    <div
      style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;"
    >
      <ekko-button>Default</ekko-button>
      <ekko-button disabled>Disabled</ekko-button>
      <ekko-button loading>Loading...</ekko-button>
    </div>
    <div
      style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-top: 12px;"
    >
      <ekko-button variant="secondary">Default</ekko-button>
      <ekko-button variant="secondary" disabled>Disabled</ekko-button>
      <ekko-button variant="secondary" loading>Loading...</ekko-button>
    </div>
  `,
};

export const WithIcons: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Icons are placed via named slots: `start` (before the label) and `end` (after the label). The component manages icon sizing based on the `size` attribute via `::slotted()` selectors.',
      },
    },
  },
  render: () => html`
    <div
      style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;"
    >
      <ekko-button variant="primary">
        <svg
          slot="start"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
        Download
      </ekko-button>

      <ekko-button variant="secondary">
        Send
        <svg
          slot="end"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
        </svg>
      </ekko-button>

      <ekko-button variant="ghost" icon-only aria-label="Delete item">
        <svg
          slot="start"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
        </svg>
      </ekko-button>
    </div>
  `,
};

export const ToggleButton: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Setting the `pressed` attribute enables toggle button semantics via `aria-pressed`. The component manages toggling on click. Use this for mute, bold, favourite, and similar binary controls that take immediate effect.',
      },
    },
  },
  render: () => html`
    <div
      style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;"
    >
      <ekko-button variant="secondary" pressed="false">
        <svg
          slot="start"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
        Mute
      </ekko-button>

      <ekko-button
        variant="ghost"
        pressed="true"
        aria-label="Favourite (active)"
      >
        <svg
          slot="start"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
          />
        </svg>
      </ekko-button>
    </div>
  `,
};

export const FullWidth: Story = {
  render: () => html`
    <div style="max-width: 400px;">
      <ekko-button full-width>Full width primary</ekko-button>
    </div>
  `,
};

export const BrandOverride: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the multi-brand token system. The wrapping `div` overrides the primary button tokens via CSS custom properties — zero component code changed. Any brand can do this by loading their token CSS file.',
      },
    },
  },
  render: () => html`
    <div
      style="
      --ekko-button-primary-background: #7C3AED;
      --ekko-button-primary-border: #7C3AED;
      --ekko-button-primary-background-hover: #6D28D9;
      --ekko-button-primary-background-active: #5B21B6;
      --ekko-button-shared-border-radius: 2px;
      display: flex; gap: 12px; flex-wrap: wrap; align-items: center;
    "
    >
      <ekko-button>Brand override</ekko-button>
      <ekko-button size="sm">Small</ekko-button>
      <ekko-button size="lg">Large</ekko-button>
      <ekko-button loading>Loading</ekko-button>
    </div>
  `,
};

export const AccessibilityShowcase: Story = {
  name: 'Accessibility',
  parameters: {
    docs: {
      description: {
        story: `
**Keyboard navigation**
- \`Tab\` / \`Shift+Tab\` — move focus to/from the button
- \`Enter\` / \`Space\` — activate

**Screen reader**
- Announces button role and label automatically
- Announces "dimmed" or "unavailable" for disabled state (via \`aria-disabled\`)
- Announces "busy" when loading (via \`aria-busy\`)
- Announces "pressed" / "not pressed" for toggle buttons (via \`aria-pressed\`)

**Focus ring**
- Always visible on \`:focus-visible\` — never suppressed
- Driven by \`--ekko-button-shared-focus-ring-*\` tokens for brand customisation

**Icon-only buttons**
- Always require \`aria-label\` — the component does not enforce this but the
  a11y addon will flag its absence as a violation
        `,
      },
    },
    a11y: {
      config: {
        rules: [{ id: 'button-name', enabled: true }],
      },
    },
  },
  render: () => html`
    <div
      style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;"
    >
      <ekko-button>Accessible button</ekko-button>
      <ekko-button disabled>Disabled (aria-disabled)</ekko-button>
      <ekko-button loading aria-label="Saving your changes, please wait">
        Loading (aria-busy)
      </ekko-button>
      <ekko-button variant="ghost" icon-only aria-label="Open settings">
        <svg
          slot="start"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="3" />
          <path
            d="M19.07 4.93A10 10 0 0 0 4.93 19.07M12 2v2M12 20v2M2 12h2M20 12h2"
          />
        </svg>
      </ekko-button>
    </div>
  `,
};
