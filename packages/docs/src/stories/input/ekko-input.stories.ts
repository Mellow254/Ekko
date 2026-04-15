import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@ekko-ds/components/input';
import '@ekko-ds/components/button';

interface InputArgs {
  type: string;
  size: string;
  label?: string;
  placeholder?: string;
  value?: string;
  help?: string;
  error?: string;
  disabled: boolean;
  readonly: boolean;
  required: boolean;
  invalid: boolean;
  'full-width': boolean;
}

/**
 * The `ekko-input` component wraps a native `<input>` in Shadow DOM and
 * forwards the `type` attribute so every native input type gets the
 * right UI and validation for free. Labels, help text, error text, and
 * ARIA wiring are handled for you.
 *
 * ## Token overrides
 *
 * ```css
 * :root {
 *   --ekko-input-shared-border-focus: #8B5CF6;
 *   --ekko-input-shared-border-radius: 2px;
 * }
 * ```
 */
const meta: Meta = {
  title: 'Components/Input',
  component: 'ekko-input',
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: [
        'text',
        'email',
        'password',
        'number',
        'tel',
        'url',
        'search',
        'date',
        'datetime-local',
        'month',
        'week',
        'time',
        'color',
        'file',
        'range',
      ],
      description: 'Native input type. Drives UI and validation.',
      table: { defaultValue: { summary: 'text' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
      table: { defaultValue: { summary: 'md' } },
    },
    label: { control: 'text', description: 'Visible label, associated via for/id.' },
    placeholder: { control: 'text', description: 'Placeholder text.' },
    value: { control: 'text', description: 'Current value.' },
    help: { control: 'text', description: 'Help text wired via aria-describedby.' },
    error: {
      control: 'text',
      description: 'Error message. Only shown when `invalid` is true.',
    },
    disabled: { control: 'boolean', description: 'Disables the input.' },
    readonly: { control: 'boolean', description: 'Marks the input as read-only.' },
    required: { control: 'boolean', description: 'Marks the field as required.' },
    invalid: {
      control: 'boolean',
      description: 'Visual error state. Sets aria-invalid="true".',
    },
    'full-width': { control: 'boolean', description: 'Stretches to fill the container.' },
  },
};

export default meta;
type Story = StoryObj<InputArgs>;

export const Default: Story = {
  args: {
    type: 'text',
    size: 'md',
    label: 'Full name',
    placeholder: 'Ada Lovelace',
    value: '',
    help: '',
    error: '',
    disabled: false,
    readonly: false,
    required: false,
    invalid: false,
    'full-width': false,
  },
  render: (args) => html`
    <ekko-input
      type=${args.type}
      size=${args.size}
      label=${args.label ?? ''}
      placeholder=${args.placeholder ?? ''}
      value=${args.value ?? ''}
      help=${args.help ?? ''}
      error=${args.error ?? ''}
      ?disabled=${args.disabled}
      ?readonly=${args.readonly}
      ?required=${args.required}
      ?invalid=${args.invalid}
      ?full-width=${args['full-width']}
    ></ekko-input>
  `,
};

export const Types: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'All 15 supported input types. Each forwards `type` to the inner `<input>`, so native UI and validation apply automatically (date picker, color picker, range slider, etc.).',
      },
    },
  },
  render: () => html`
    <div style="display: grid; gap: 16px; max-width: 360px;">
      <ekko-input type="text" label="Text" placeholder="Hello"></ekko-input>
      <ekko-input type="email" label="Email" placeholder="you@example.com"></ekko-input>
      <ekko-input type="password" label="Password" placeholder="••••••••"></ekko-input>
      <ekko-input type="number" label="Quantity" min="0" max="10" step="1"></ekko-input>
      <ekko-input type="tel" label="Phone" placeholder="+1 555 123 4567"></ekko-input>
      <ekko-input type="url" label="Website" placeholder="https://"></ekko-input>
      <ekko-input type="search" label="Search" placeholder="Find…"></ekko-input>
      <ekko-input type="date" label="Date"></ekko-input>
      <ekko-input type="datetime-local" label="When"></ekko-input>
      <ekko-input type="month" label="Month"></ekko-input>
      <ekko-input type="week" label="Week"></ekko-input>
      <ekko-input type="time" label="Time"></ekko-input>
      <ekko-input type="color" label="Accent" value="#7C3AED"></ekko-input>
      <ekko-input type="file" label="Upload" accept="image/*"></ekko-input>
      <ekko-input type="range" label="Volume" min="0" max="100" value="50"></ekko-input>
    </div>
  `,
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Three sizes aligned to the spacing scale.',
      },
    },
  },
  render: () => html`
    <div style="display: grid; gap: 12px; max-width: 320px;">
      <ekko-input size="sm" label="Small" placeholder="sm"></ekko-input>
      <ekko-input size="md" label="Medium" placeholder="md"></ekko-input>
      <ekko-input size="lg" label="Large" placeholder="lg"></ekko-input>
    </div>
  `,
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '**Disabled** — sets `aria-disabled="true"`. **Read-only** — form submits value but user cannot edit. **Invalid** — red border and `aria-invalid="true"`.',
      },
    },
  },
  render: () => html`
    <div style="display: grid; gap: 12px; max-width: 320px;">
      <ekko-input label="Default" placeholder="Type here"></ekko-input>
      <ekko-input label="Disabled" disabled value="Locked"></ekko-input>
      <ekko-input label="Read-only" readonly value="Cannot edit"></ekko-input>
      <ekko-input label="Required" required placeholder="Must fill"></ekko-input>
      <ekko-input
        label="Invalid"
        invalid
        value="not-an-email"
        error="Please enter a valid email"
      ></ekko-input>
    </div>
  `,
};

export const WithHelpAndError: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Help text is announced via `aria-describedby`. When `invalid` is set, the error message replaces the help text (also via `aria-describedby`).',
      },
    },
  },
  render: () => html`
    <div style="display: grid; gap: 16px; max-width: 360px;">
      <ekko-input
        label="Username"
        help="3-20 characters, letters and numbers only"
        placeholder="ada"
      ></ekko-input>
      <ekko-input
        label="Password"
        type="password"
        required
        invalid
        error="Must be at least 8 characters"
      ></ekko-input>
    </div>
  `,
};

export const WithAdornments: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Icons or text can be placed inside the field via `start` and `end` slots.',
      },
    },
  },
  render: () => html`
    <div style="display: grid; gap: 16px; max-width: 360px;">
      <ekko-input label="Amount" type="number" placeholder="0.00">
        <span slot="start">$</span>
        <span slot="end">USD</span>
      </ekko-input>
      <ekko-input label="Search" type="search" placeholder="Find…">
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
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </ekko-input>
    </div>
  `,
};

export const FullWidth: Story = {
  render: () => html`
    <div style="max-width: 480px;">
      <ekko-input full-width label="Full width" placeholder="Spans the container"></ekko-input>
    </div>
  `,
};

export const InAForm: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`ekko-input` is a form-associated custom element. It participates in native `FormData`, `form.reset()`, and `form.submit()` out of the box.',
      },
    },
  },
  render: () => html`
    <form
      style="display: grid; gap: 12px; max-width: 360px;"
      @submit=${(e: Event) => {
        e.preventDefault();
        const data = new FormData(e.target as HTMLFormElement);
        alert(JSON.stringify(Object.fromEntries(data), null, 2));
      }}
    >
      <ekko-input name="name" label="Name" required></ekko-input>
      <ekko-input name="email" type="email" label="Email" required></ekko-input>
      <ekko-input name="age" type="number" label="Age" min="0" max="150"></ekko-input>
      <ekko-button type="submit">Submit</ekko-button>
    </form>
  `,
};

export const BrandOverride: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Overrides the primary focus and border tokens via CSS custom properties on a wrapping element.',
      },
    },
  },
  render: () => html`
    <div
      style="
      --ekko-input-shared-border-focus: #7C3AED;
      --ekko-input-shared-focus-ring-color: #7C3AED;
      --ekko-input-shared-border-radius: 2px;
      display: grid; gap: 12px; max-width: 360px;
    "
    >
      <ekko-input label="Brand override" placeholder="Focus me"></ekko-input>
      <ekko-input label="Email" type="email" placeholder="you@example.com"></ekko-input>
    </div>
  `,
};

export const AccessibilityShowcase: Story = {
  name: 'Accessibility',
  parameters: {
    docs: {
      description: {
        story: `
**Label association**
- Visible labels use native \`<label for>\` — clicking the label focuses the input
- Without a visible label, provide \`aria-label\` on the host and it forwards to the inner input

**Describedby wiring**
- \`help\` attribute → rendered below + linked via \`aria-describedby\`
- \`error\` attribute + \`invalid\` → replaces help via \`aria-describedby\`, announced with role="alert"
- External \`aria-describedby\` is preserved and merged with internal ids

**State signals**
- \`disabled\` → native \`disabled\` + \`aria-disabled="true"\`
- \`required\` → native \`required\` + \`aria-required="true"\` + visible asterisk (when labeled)
- \`invalid\` → \`aria-invalid="true"\` + red border

**Keyboard**
- Tab/Shift+Tab moves focus to/from the input
- All native keyboard behavior (arrow keys on number/range/date) works unchanged

**Focus ring**
- Always visible on \`:focus-within\` via \`--ekko-input-shared-focus-ring-*\` tokens
        `,
      },
    },
  },
  render: () => html`
    <div style="display: grid; gap: 16px; max-width: 360px;">
      <ekko-input
        label="Email"
        type="email"
        required
        help="We'll never share your email"
        placeholder="you@example.com"
      ></ekko-input>
      <ekko-input
        label="Password"
        type="password"
        required
        invalid
        error="Password must be at least 8 characters"
      ></ekko-input>
      <ekko-input
        aria-label="Search site"
        type="search"
        placeholder="Search… (no visible label, uses aria-label)"
      ></ekko-input>
      <ekko-input label="Disabled" disabled value="Locked value"></ekko-input>
    </div>
  `,
};
