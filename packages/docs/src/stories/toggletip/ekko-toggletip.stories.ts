import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@ekko-ds/components/toggletip';

interface ToggletipArgs {
  label: string;
  placement: string;
  size: string;
  variant: string;
  disabled: boolean;
  loading: boolean;
  open: boolean;
}

const meta: Meta = {
  title: 'Components/Toggletip',
  component: 'ekko-toggletip',
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Text shown inside the popover. Use the default slot for rich HTML instead.',
      table: { defaultValue: { summary: '' } },
    },
    placement: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
      description: 'Side of the trigger the popover appears on.',
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
        'Visual treatment. `default` renders a light surface; `inverse` renders a dark surface — useful on light UIs.',
      table: { defaultValue: { summary: 'default' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Prevents the toggletip from opening and disables the trigger.',
    },
    loading: {
      control: 'boolean',
      description: 'Sets `aria-busy="true"` and shows a spinner inside the popover.',
    },
    open: {
      control: 'boolean',
      description: 'Opens the popover programmatically.',
    },
  },
  args: {
    label: 'Additional context appears when you click the trigger.',
    placement: 'top',
    size: 'md',
    variant: 'default',
    disabled: false,
    loading: false,
    open: false,
  },
  parameters: {
    docs: {
      description: {
        component: `
The \`ekko-toggletip\` component pairs a small trigger button with a popover that reveals
supplementary content on click. Unlike a tooltip (which is ephemeral and triggered on
hover/focus), a toggletip persists until the user dismisses it — by clicking the trigger
again, clicking outside, or pressing Escape.

Toggletips are ideal for content that's helpful but not critical: definitions,
descriptions, keyboard shortcut references, or low-priority guidance. The popover uses
\`role="status"\` with \`aria-live="polite"\`, so screen readers announce the revealed
content when it appears.

Provide a short message via the \`label\` attribute, or slot arbitrary HTML via the default
slot for richer content. A custom trigger icon can be slotted into the \`trigger\` slot.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<ToggletipArgs>;

export const Default: Story = {
  render: (args) => html`
    <div style="padding: 4rem; display: flex; justify-content: center;">
      <ekko-toggletip
        label=${args.label}
        placement=${args.placement}
        size=${args.size}
        variant=${args.variant}
        ?disabled=${args.disabled}
        ?loading=${args.loading}
        ?open=${args.open}
      ></ekko-toggletip>
    </div>
  `,
};

export const Placements: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Four sides are supported: `top` (default), `right`, `bottom`, `left`. Click each trigger to reveal the popover.',
      },
    },
  },
  render: () => html`
    <div
      style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; padding: 4rem 1rem; justify-items: center;"
    >
      <ekko-toggletip label="Top toggletip" placement="top"></ekko-toggletip>
      <ekko-toggletip label="Right toggletip" placement="right"></ekko-toggletip>
      <ekko-toggletip label="Bottom toggletip" placement="bottom"></ekko-toggletip>
      <ekko-toggletip label="Left toggletip" placement="left"></ekko-toggletip>
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
      <ekko-toggletip size="sm" label="Small toggletip"></ekko-toggletip>
      <ekko-toggletip size="md" label="Medium toggletip"></ekko-toggletip>
      <ekko-toggletip size="lg" label="Large toggletip with more text"></ekko-toggletip>
    </div>
  `,
};

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The default variant renders a light popover with a border. `inverse` renders a dark surface — useful on light-colored UIs.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; gap: 2rem; padding: 3rem 1rem; justify-content: center;">
      <ekko-toggletip label="Default surface"></ekko-toggletip>
      <ekko-toggletip label="Inverse surface" variant="inverse"></ekko-toggletip>
    </div>
  `,
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '**Disabled** — the trigger is inert and the popover cannot open. **Loading** — sets `aria-busy="true"` and shows a spinner while the content is fetched. **Open** — shown below with the `open` attribute applied.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; gap: 2rem; padding: 3rem 1rem; justify-content: center;">
      <ekko-toggletip label="Default"></ekko-toggletip>
      <ekko-toggletip label="Disabled" disabled></ekko-toggletip>
      <ekko-toggletip label="Fetching…" loading open></ekko-toggletip>
    </div>
  `,
};

export const RichContent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use the default slot to render arbitrary HTML inside the popover — multiple lines of text, keyboard hints, inline code, links, etc.',
      },
    },
  },
  render: () => html`
    <div style="padding: 5rem 1rem; display: flex; justify-content: center;">
      <ekko-toggletip placement="top">
        <span style="display: grid; gap: 0.25rem; text-align: left;">
          <strong>Keyboard shortcuts</strong>
          <span>⌘ + S &nbsp; Save</span>
          <span>⌘ + Z &nbsp; Undo</span>
          <span>⌘ + Shift + Z &nbsp; Redo</span>
        </span>
      </ekko-toggletip>
    </div>
  `,
};

export const CustomTrigger: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Slot an icon or any element into the `trigger` slot to replace the default "i" character with a custom visual.',
      },
    },
  },
  render: () => html`
    <div style="padding: 3rem 1rem; display: flex; justify-content: center;">
      <ekko-toggletip aria-label="More information" label="Help content for this section.">
        <svg
          slot="trigger"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      </ekko-toggletip>
    </div>
  `,
};

export const AccessibilityShowcase: Story = {
  name: 'Accessibility',
  parameters: {
    docs: {
      description: {
        story: `
**Pattern** — A toggletip is a small trigger button paired with a popover whose content
is revealed on demand:

- The trigger is a real \`<button>\` with \`aria-haspopup="true"\`, \`aria-expanded\` reflecting
  the open state, and \`aria-controls\` pointing to the popover's generated \`id\`.
- The popover uses \`role="status"\` with \`aria-live="polite"\` so assistive technologies
  announce the revealed content at the next natural break.
- When \`loading\`, \`aria-busy="true"\` is set on the popover.

**Keyboard**
- \`Tab\` moves focus to the trigger.
- \`Enter\` or \`Space\` toggles the popover.
- \`Escape\` dismisses the popover and returns focus to the trigger.

**Pointer**
- Click the trigger to toggle.
- Click outside the component to dismiss.

**Reduced motion**
- The fade transition is disabled when the user has \`prefers-reduced-motion: reduce\`.
        `,
      },
    },
  },
  render: () => html`
    <div style="padding: 4rem 1rem; display: flex; gap: 2rem; justify-content: center;">
      <label style="display: inline-flex; align-items: center; gap: 0.5rem;">
        <span>Password</span>
        <ekko-toggletip
          aria-label="Password requirements"
          label="Must be at least 12 characters and include one symbol."
          placement="right"
        ></ekko-toggletip>
      </label>
    </div>
  `,
};
