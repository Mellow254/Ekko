import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@ekko-ds/components/checkbox';

interface CheckboxArgs {
  size: string;
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  label: string;
}

/**
 * The `ekko-checkbox` component wraps a native `<input type="checkbox">` in
 * Shadow DOM. It supports checked, indeterminate, and disabled states, form
 * participation via `ElementInternals`, and full ARIA forwarding.
 *
 * ## Token overrides
 *
 * ```css
 * :root {
 *   --ekko-checkbox-shared-background-checked: #7C3AED;
 *   --ekko-checkbox-shared-border-radius: 2px;
 * }
 * ```
 */
const meta: Meta = {
  title: 'Components/Checkbox',
  component: 'ekko-checkbox',
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
      description: 'Whether the checkbox is checked.',
    },
    indeterminate: {
      control: 'boolean',
      description: 'Indeterminate (mixed) state — overrides the visual checkmark.',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the checkbox.',
    },
    label: {
      control: 'text',
      description: 'Label text (passed via default slot).',
    },
  },
};

export default meta;
type Story = StoryObj<CheckboxArgs>;

export const Default: Story = {
  args: {
    size: 'md',
    checked: false,
    indeterminate: false,
    disabled: false,
    label: 'Accept terms and conditions',
  },
  render: (args) => html`
    <ekko-checkbox
      size=${args.size}
      ?checked=${args.checked}
      ?disabled=${args.disabled}
      .indeterminate=${args.indeterminate}
    >
      ${args.label}
    </ekko-checkbox>
  `,
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Three sizes aligned to the spacing scale. Box and label font scale together.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <ekko-checkbox size="sm">Small</ekko-checkbox>
      <ekko-checkbox size="md">Medium</ekko-checkbox>
      <ekko-checkbox size="lg">Large</ekko-checkbox>
    </div>
  `,
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '**Unchecked** — default. **Checked** — filled with checkmark. **Indeterminate** — dash, commonly used for "select all" parents. **Disabled** — reduced opacity and `cursor: not-allowed`.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <ekko-checkbox>Unchecked</ekko-checkbox>
      <ekko-checkbox checked>Checked</ekko-checkbox>
      <ekko-checkbox .indeterminate=${true}>Indeterminate</ekko-checkbox>
      <ekko-checkbox disabled>Disabled</ekko-checkbox>
      <ekko-checkbox checked disabled>Disabled (checked)</ekko-checkbox>
    </div>
  `,
};

export const CheckboxGroup: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Multiple checkboxes in a group. Use a `<fieldset>` and `<legend>` for proper ARIA grouping.',
      },
    },
  },
  render: () => html`
    <fieldset style="border: none; padding: 0; margin: 0;">
      <legend style="font-weight: 500; margin-bottom: 8px;">Notifications</legend>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <ekko-checkbox name="notifications" value="email" checked>Email</ekko-checkbox>
        <ekko-checkbox name="notifications" value="sms">SMS</ekko-checkbox>
        <ekko-checkbox name="notifications" value="push" checked>Push</ekko-checkbox>
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
- The label wraps the checkbox — clicking label text toggles the checkbox
- Without visible text, provide \`aria-label\` on the host and it forwards to the inner input

**ARIA forwarding**
- \`aria-label\` → forwarded to inner \`<input>\`
- \`aria-describedby\` → forwarded to inner \`<input>\`
- \`disabled\` → native \`disabled\` + \`aria-disabled="true"\`

**Keyboard**
- Space toggles the checkbox
- Tab/Shift+Tab moves focus to/from the checkbox

**Focus ring**
- Visible on \`:focus-visible\` via \`--ekko-checkbox-shared-focus-ring-*\` tokens
        `,
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <ekko-checkbox>Click label or press Space to toggle</ekko-checkbox>
      <ekko-checkbox aria-label="Agree to privacy policy">
        With forwarded aria-label
      </ekko-checkbox>
      <ekko-checkbox disabled>Disabled — cannot interact</ekko-checkbox>
    </div>
  `,
};
