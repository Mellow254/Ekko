import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@ekko-ds/components/radio';

interface RadioArgs {
  size: string;
  checked: boolean;
  disabled: boolean;
  label: string;
  name: string;
  value: string;
}

/**
 * The `ekko-radio` component wraps a native `<input type="radio">` in Shadow
 * DOM. Radios with the same `name` form a group: only one is checked at a
 * time, and Arrow keys navigate between them with roving tabindex (matching
 * the WAI-ARIA radio group pattern).
 *
 * ## Token overrides
 *
 * ```css
 * :root {
 *   --ekko-radio-shared-background-checked: #7C3AED;
 *   --ekko-radio-size-md-circle-size: 1.125rem;
 * }
 * ```
 */
const meta: Meta = {
  title: 'Components/Radio',
  component: 'ekko-radio',
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant.',
      table: { defaultValue: { summary: 'md' } },
    },
    checked: {
      control: 'boolean',
      description: 'Whether the radio is selected.',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the radio.',
    },
    name: {
      control: 'text',
      description: 'Group name — radios sharing a name form a single group.',
    },
    value: {
      control: 'text',
      description: 'Submitted value when selected.',
    },
    label: {
      control: 'text',
      description: 'Label text (passed via default slot).',
    },
  },
};

export default meta;
type Story = StoryObj<RadioArgs>;

export const Default: Story = {
  args: {
    size: 'md',
    checked: false,
    disabled: false,
    name: 'plan',
    value: 'free',
    label: 'Free plan',
  },
  render: (args) => html`
    <ekko-radio
      size=${args.size}
      name=${args.name}
      value=${args.value}
      ?checked=${args.checked}
      ?disabled=${args.disabled}
    >
      ${args.label}
    </ekko-radio>
  `,
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Three sizes aligned to the spacing scale. Circle and label font scale together.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <ekko-radio size="sm" name="sizes-sm">Small</ekko-radio>
      <ekko-radio size="md" name="sizes-md">Medium</ekko-radio>
      <ekko-radio size="lg" name="sizes-lg">Large</ekko-radio>
    </div>
  `,
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '**Unselected** — default. **Selected** — filled with dot. **Disabled** — reduced opacity and `cursor: not-allowed`.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <ekko-radio name="states-a">Unselected</ekko-radio>
      <ekko-radio name="states-b" checked>Selected</ekko-radio>
      <ekko-radio name="states-c" disabled>Disabled</ekko-radio>
      <ekko-radio name="states-d" checked disabled>Disabled (selected)</ekko-radio>
    </div>
  `,
};

export const RadioGroup: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Radios sharing a `name` form a group — only one can be selected. Wrap in a `<fieldset>` with a `<legend>` for proper ARIA grouping. Use Arrow keys to move between options.',
      },
    },
  },
  render: () => html`
    <fieldset style="border: none; padding: 0; margin: 0;">
      <legend style="font-weight: 500; margin-bottom: 8px;">Subscription plan</legend>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <ekko-radio name="plan" value="free" checked>Free</ekko-radio>
        <ekko-radio name="plan" value="pro">Pro</ekko-radio>
        <ekko-radio name="plan" value="team">Team</ekko-radio>
      </div>
    </fieldset>
  `,
};

export const AccessibilityShowcase: Story = {
  name: 'Accessibility',
  parameters: {
    docs: {
      description: {
        story: `
**Label association**
- The label wraps the radio — clicking label text selects the radio
- Without visible text, provide \`aria-label\` on the host and it forwards to the inner input

**ARIA forwarding**
- \`aria-label\` → forwarded to inner \`<input>\`
- \`aria-describedby\` → forwarded to inner \`<input>\`
- \`disabled\` → native \`disabled\` + \`aria-disabled="true"\`

**Keyboard**
- Tab moves focus to the selected radio (or the first radio if none selected)
- Arrow Up/Left moves to the previous radio in the group and selects it
- Arrow Down/Right moves to the next radio in the group and selects it
- Arrow navigation wraps at the ends and skips disabled radios
- Space selects the focused radio

**Focus ring**
- Visible on \`:focus-visible\` via \`--ekko-radio-shared-focus-ring-*\` tokens
        `,
      },
    },
  },
  render: () => html`
    <fieldset style="border: none; padding: 0; margin: 0;">
      <legend style="font-weight: 500; margin-bottom: 8px;">Notification channel</legend>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <ekko-radio name="channel" value="email" checked>Email</ekko-radio>
        <ekko-radio name="channel" value="sms">SMS</ekko-radio>
        <ekko-radio name="channel" value="push" disabled>Push (coming soon)</ekko-radio>
      </div>
    </fieldset>
  `,
};
