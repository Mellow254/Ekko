import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@ekko-ds/components/tooltip';
import '@ekko-ds/components/button';

interface TooltipArgs {
  label: string;
  placement: string;
  size: string;
  variant: string;
  disabled: boolean;
  loading: boolean;
  'show-delay': number;
  'hide-delay': number;
}

const meta: Meta = {
  title: 'Components/Tooltip',
  component: 'ekko-tooltip',
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Text shown inside the tooltip. Use the `content` slot for rich HTML instead.',
      table: { defaultValue: { summary: '' } },
    },
    placement: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
      description: 'Side of the trigger the tooltip appears on.',
      table: { defaultValue: { summary: 'top' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant.',
      table: { defaultValue: { summary: 'md' } },
    },
    variant: {
      control: 'select',
      options: ['default', 'inverse'],
      description:
        'Visual treatment. `default` is dark-on-light; `inverse` renders a light surface with a border.',
      table: { defaultValue: { summary: 'default' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Prevents the tooltip from opening on hover or focus.',
    },
    loading: {
      control: 'boolean',
      description: 'Sets `aria-busy="true"` and shows a spinner inside the tooltip.',
    },
    'show-delay': {
      control: { type: 'number', min: 0, step: 50 },
      description: 'Delay (ms) before showing the tooltip after hover/focus.',
      table: { defaultValue: { summary: '200' } },
    },
    'hide-delay': {
      control: { type: 'number', min: 0, step: 50 },
      description: 'Delay (ms) before hiding the tooltip after pointer leave/blur.',
      table: { defaultValue: { summary: '0' } },
    },
  },
  args: {
    label: 'Save your changes',
    placement: 'top',
    size: 'md',
    variant: 'default',
    disabled: false,
    loading: false,
    'show-delay': 200,
    'hide-delay': 0,
  },
  parameters: {
    docs: {
      description: {
        component: `
The \`ekko-tooltip\` component wraps a trigger element and displays an ephemeral label
or description on hover, focus, or pointer enter. It implements the
[W3C ARIA APG Tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/):
the trigger gets \`aria-describedby\` pointing at a container with \`role="tooltip"\`,
and the tooltip dismisses on Escape.

Wrap any focusable element (button, link, input) in \`<ekko-tooltip>\` and supply the
text via the \`label\` attribute — or slot rich content into the \`content\` slot for
multi-element tooltips.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<TooltipArgs>;

export const Default: Story = {
  render: (args) => html`
    <div style="padding: 4rem; display: flex; justify-content: center;">
      <ekko-tooltip
        label=${args.label}
        placement=${args.placement}
        size=${args.size}
        variant=${args.variant}
        ?disabled=${args.disabled}
        ?loading=${args.loading}
        show-delay=${args['show-delay']}
        hide-delay=${args['hide-delay']}
      >
        <ekko-button variant="secondary">Hover me</ekko-button>
      </ekko-tooltip>
    </div>
  `,
};

export const Placements: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Four sides are supported: `top` (default), `right`, `bottom`, `left`. Hover each button to reveal the tooltip.',
      },
    },
  },
  render: () => html`
    <div
      style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; padding: 4rem 1rem; justify-items: center;"
    >
      <ekko-tooltip label="Top tooltip" placement="top" show-delay="0">
        <ekko-button variant="secondary">Top</ekko-button>
      </ekko-tooltip>
      <ekko-tooltip label="Right tooltip" placement="right" show-delay="0">
        <ekko-button variant="secondary">Right</ekko-button>
      </ekko-tooltip>
      <ekko-tooltip label="Bottom tooltip" placement="bottom" show-delay="0">
        <ekko-button variant="secondary">Bottom</ekko-button>
      </ekko-tooltip>
      <ekko-tooltip label="Left tooltip" placement="left" show-delay="0">
        <ekko-button variant="secondary">Left</ekko-button>
      </ekko-tooltip>
    </div>
  `,
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Three sizes: `sm` for compact inline hints, `md` for standard help text, `lg` for more substantial descriptions.',
      },
    },
  },
  render: () => html`
    <div
      style="display: flex; gap: 2rem; padding: 3rem 1rem; justify-content: center; align-items: center;"
    >
      <ekko-tooltip size="sm" label="Small" show-delay="0">
        <ekko-button variant="secondary" size="sm">Small</ekko-button>
      </ekko-tooltip>
      <ekko-tooltip size="md" label="Medium tooltip" show-delay="0">
        <ekko-button variant="secondary">Medium</ekko-button>
      </ekko-tooltip>
      <ekko-tooltip size="lg" label="Large tooltip with more text" show-delay="0">
        <ekko-button variant="secondary" size="lg">Large</ekko-button>
      </ekko-tooltip>
    </div>
  `,
};

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The default variant is dark; `inverse` renders a light surface with a border — useful on dark UIs.',
      },
    },
  },
  render: () => html`
    <div
      style="display: flex; gap: 2rem; padding: 3rem 1rem; justify-content: center;"
    >
      <ekko-tooltip label="Default tooltip" show-delay="0">
        <ekko-button variant="secondary">Default</ekko-button>
      </ekko-tooltip>
      <ekko-tooltip label="Inverse tooltip" variant="inverse" show-delay="0">
        <ekko-button variant="secondary">Inverse</ekko-button>
      </ekko-tooltip>
    </div>
  `,
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '**Disabled** — the tooltip never opens while the trigger remains interactive. **Loading** — sets `aria-busy="true"` and shows a spinner while the content is being fetched.',
      },
    },
  },
  render: () => html`
    <div
      style="display: flex; gap: 2rem; padding: 3rem 1rem; justify-content: center;"
    >
      <ekko-tooltip label="Default" show-delay="0">
        <ekko-button variant="secondary">Default</ekko-button>
      </ekko-tooltip>
      <ekko-tooltip label="Hidden while disabled" disabled show-delay="0">
        <ekko-button variant="secondary">Disabled</ekko-button>
      </ekko-tooltip>
      <ekko-tooltip label="Fetching…" loading show-delay="0" open>
        <ekko-button variant="secondary">Loading (open)</ekko-button>
      </ekko-tooltip>
    </div>
  `,
};

export const RichContent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use the `content` slot instead of the `label` attribute to render arbitrary HTML inside the tooltip — lines of text, icons, keyboard hints, etc.',
      },
    },
  },
  render: () => html`
    <div style="padding: 5rem 1rem; display: flex; justify-content: center;">
      <ekko-tooltip placement="top" show-delay="0">
        <ekko-button variant="primary">Shortcuts</ekko-button>
        <span slot="content" style="display: grid; gap: 0.25rem; text-align: left;">
          <strong>Keyboard shortcuts</strong>
          <span>⌘ + S &nbsp; Save</span>
          <span>⌘ + Z &nbsp; Undo</span>
        </span>
      </ekko-tooltip>
    </div>
  `,
};

export const AccessibilityShowcase: Story = {
  name: 'Accessibility',
  parameters: {
    docs: {
      description: {
        story: `
**Pattern** — Implements the [W3C ARIA APG Tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/):

- The tooltip surface has \`role="tooltip"\` and a generated \`id\`.
- The slotted trigger receives \`aria-describedby\` pointing to that id, preserving any existing \`aria-describedby\` value.
- The tooltip is an ephemeral description — it does not receive focus and does not contain interactive content.

**Keyboard**
- \`Tab\` moves focus to the trigger, opening the tooltip.
- \`Shift + Tab\` moves focus away and dismisses the tooltip.
- \`Escape\` dismisses the tooltip while leaving focus on the trigger.

**Pointer**
- \`pointerenter\` opens after \`show-delay\` ms (default 200ms) to prevent flicker.
- \`pointerleave\` closes after \`hide-delay\` ms (default 0ms).

**Reduced motion**
- The fade transition is removed when the user has \`prefers-reduced-motion: reduce\`.
        `,
      },
    },
  },
  render: () => html`
    <div
      style="display: flex; gap: 2rem; padding: 4rem 1rem; justify-content: center; align-items: center;"
    >
      <ekko-tooltip label="Delete this item permanently" show-delay="0">
        <ekko-button variant="danger" aria-label="Delete">
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
      </ekko-tooltip>

      <ekko-tooltip label="This field is required" placement="right" show-delay="0">
        <input
          type="text"
          aria-label="Your name"
          placeholder="Focus me"
          style="padding: 0.5rem 0.75rem; border: 1px solid #d4d4d4; border-radius: 6px;"
        />
      </ekko-tooltip>
    </div>
  `,
};
