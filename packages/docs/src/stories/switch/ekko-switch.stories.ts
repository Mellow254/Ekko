import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@ekko-ds/components/switch';

interface SwitchArgs {
  size: string;
  checked: boolean;
  disabled: boolean;
  label: string;
}

const meta: Meta = {
  title: 'Components/Switch',
  component: 'ekko-switch',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
The \`ekko-switch\` component is a toggle for binary on/off settings, following the
[ARIA \`switch\` role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/switch_role).
A hidden \`<input type="checkbox" role="switch">\` drives form participation via
\`ElementInternals\` while the visual track and thumb are rendered in Shadow DOM.

## Token overrides

\`\`\`css
:root {
  --ekko-switch-shared-background-checked: #16a34a;
  --ekko-switch-shared-border-radius: 4px;
}
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant.',
      table: { defaultValue: { summary: 'md' } },
    },
    checked: {
      control: 'boolean',
      description: 'Whether the switch is on.',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the switch.',
    },
    label: {
      control: 'text',
      description: 'Label text (passed via default slot).',
    },
  },
};

export default meta;
type Story = StoryObj<SwitchArgs>;

export const Default: Story = {
  args: {
    size: 'md',
    checked: false,
    disabled: false,
    label: 'Enable Wi-Fi',
  },
  render: (args) => html`
    <ekko-switch size=${args.size} ?checked=${args.checked} ?disabled=${args.disabled}>
      ${args.label}
    </ekko-switch>
  `,
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Three sizes aligned to the spacing scale. Track, thumb, and label scale together.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <ekko-switch size="sm">Small</ekko-switch>
      <ekko-switch size="md">Medium</ekko-switch>
      <ekko-switch size="lg">Large</ekko-switch>
    </div>
  `,
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '**Off** — default. **On** — filled track, thumb slid to the end. **Disabled** — reduced opacity and `cursor: not-allowed`.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <ekko-switch>Off</ekko-switch>
      <ekko-switch checked>On</ekko-switch>
      <ekko-switch disabled>Disabled</ekko-switch>
      <ekko-switch checked disabled>Disabled (on)</ekko-switch>
    </div>
  `,
};

export const SettingsGroup: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Common settings-panel usage with switches grouped by section.',
      },
    },
  },
  render: () => html`
    <fieldset style="border: none; padding: 0; margin: 0;">
      <legend style="font-weight: 500; margin-bottom: 8px;">Notifications</legend>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <ekko-switch name="email" checked>Email alerts</ekko-switch>
        <ekko-switch name="sms">SMS alerts</ekko-switch>
        <ekko-switch name="push" checked>Push notifications</ekko-switch>
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
**Role**
- Inner \`<input type="checkbox">\` carries \`role="switch"\` — assistive technologies announce it as "switch, on/off" instead of "checkbox"

**Label association**
- The label wraps the switch — clicking label text toggles the state
- Without visible text, provide \`aria-label\` on the host and it forwards to the inner input

**ARIA forwarding**
- \`aria-label\` → forwarded to inner \`<input>\`
- \`aria-describedby\` → forwarded to inner \`<input>\`
- \`disabled\` → native \`disabled\` + \`aria-disabled="true"\`

**Keyboard**
- Space toggles the switch
- Tab/Shift+Tab moves focus to/from the switch

**Focus ring**
- Visible on \`:focus-visible\` via \`--ekko-switch-shared-focus-ring-*\` tokens
        `,
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <ekko-switch>Click label or press Space to toggle</ekko-switch>
      <ekko-switch aria-label="Enable dark mode"></ekko-switch>
      <ekko-switch disabled>Disabled — cannot interact</ekko-switch>
    </div>
  `,
};
