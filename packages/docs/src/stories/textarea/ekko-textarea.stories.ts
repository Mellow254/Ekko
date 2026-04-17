import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@ekko-ds/components/textarea';
import '@ekko-ds/components/button';

interface TextareaArgs {
  size: string;
  resize: string;
  rows?: number;
  cols?: number;
  wrap?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  help?: string;
  error?: string;
  minlength?: number;
  maxlength?: number;
  disabled: boolean;
  readonly: boolean;
  required: boolean;
  invalid: boolean;
  loading: boolean;
  'full-width': boolean;
}

/**
 * The `ekko-textarea` component wraps a native `<textarea>` in Shadow DOM and
 * forwards sizing and validation attributes. Multi-line input with labels,
 * help text, error text, and ARIA wiring handled for you.
 *
 * ## Token overrides
 *
 * ```css
 * :root {
 *   --ekko-textarea-shared-border-focus: #8B5CF6;
 *   --ekko-textarea-shared-border-radius: 2px;
 * }
 * ```
 */
const meta: Meta = {
  title: 'Components/Textarea',
  component: 'ekko-textarea',
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
      table: { defaultValue: { summary: 'md' } },
    },
    resize: {
      control: 'select',
      options: ['none', 'vertical', 'horizontal', 'both'],
      description: 'User resize behavior. Mirrors the CSS `resize` property.',
      table: { defaultValue: { summary: 'vertical' } },
    },
    rows: { control: 'number', description: 'Visible text rows.' },
    cols: { control: 'number', description: 'Visible character columns.' },
    wrap: {
      control: 'select',
      options: ['soft', 'hard', 'off'],
      description: 'Line-wrapping behavior on submit.',
      table: { defaultValue: { summary: 'soft' } },
    },
    label: { control: 'text', description: 'Visible label, associated via for/id.' },
    placeholder: { control: 'text', description: 'Placeholder text.' },
    value: { control: 'text', description: 'Current value.' },
    help: { control: 'text', description: 'Help text wired via aria-describedby.' },
    error: {
      control: 'text',
      description: 'Error message. Only shown when `invalid` is true.',
    },
    minlength: { control: 'number', description: 'Minimum character count.' },
    maxlength: { control: 'number', description: 'Maximum character count.' },
    disabled: { control: 'boolean', description: 'Disables the textarea.' },
    readonly: { control: 'boolean', description: 'Marks the textarea as read-only.' },
    required: { control: 'boolean', description: 'Marks the field as required.' },
    invalid: {
      control: 'boolean',
      description: 'Visual error state. Sets aria-invalid="true".',
    },
    loading: {
      control: 'boolean',
      description: 'Shows a loading spinner and disables input.',
    },
    'full-width': { control: 'boolean', description: 'Stretches to fill the container.' },
  },
};

export default meta;
type Story = StoryObj<TextareaArgs>;

export const Default: Story = {
  args: {
    size: 'md',
    resize: 'vertical',
    label: 'Bio',
    placeholder: 'Tell us about yourself…',
    value: '',
    help: '',
    error: '',
    disabled: false,
    readonly: false,
    required: false,
    invalid: false,
    loading: false,
    'full-width': false,
  },
  render: (args) => html`
    <ekko-textarea
      size=${args.size}
      resize=${args.resize}
      rows=${args.rows ?? ''}
      cols=${args.cols ?? ''}
      wrap=${args.wrap ?? ''}
      label=${args.label ?? ''}
      placeholder=${args.placeholder ?? ''}
      value=${args.value ?? ''}
      help=${args.help ?? ''}
      error=${args.error ?? ''}
      minlength=${args.minlength ?? ''}
      maxlength=${args.maxlength ?? ''}
      ?disabled=${args.disabled}
      ?readonly=${args.readonly}
      ?required=${args.required}
      ?invalid=${args.invalid}
      ?loading=${args.loading}
      ?full-width=${args['full-width']}
    ></ekko-textarea>
  `,
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Three sizes aligned to the typography and spacing scale.',
      },
    },
  },
  render: () => html`
    <div style="display: grid; gap: 12px; max-width: 360px;">
      <ekko-textarea size="sm" label="Small" placeholder="sm"></ekko-textarea>
      <ekko-textarea size="md" label="Medium" placeholder="md"></ekko-textarea>
      <ekko-textarea size="lg" label="Large" placeholder="lg"></ekko-textarea>
    </div>
  `,
};

export const Resize: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Controls the `resize` handle. `vertical` is the default. Use `none` to lock the size or `both` to allow horizontal resizing.',
      },
    },
  },
  render: () => html`
    <div style="display: grid; gap: 16px; max-width: 360px;">
      <ekko-textarea label="Vertical (default)" resize="vertical"></ekko-textarea>
      <ekko-textarea label="None" resize="none"></ekko-textarea>
      <ekko-textarea label="Horizontal" resize="horizontal"></ekko-textarea>
      <ekko-textarea label="Both" resize="both"></ekko-textarea>
    </div>
  `,
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '**Disabled** — sets `aria-disabled="true"`. **Read-only** — form submits value but user cannot edit. **Invalid** — red border and `aria-invalid="true"`. **Loading** — spinner and disabled input.',
      },
    },
  },
  render: () => html`
    <div style="display: grid; gap: 12px; max-width: 360px;">
      <ekko-textarea label="Default" placeholder="Type here"></ekko-textarea>
      <ekko-textarea label="Disabled" disabled value="Locked content"></ekko-textarea>
      <ekko-textarea label="Read-only" readonly value="Cannot edit"></ekko-textarea>
      <ekko-textarea label="Required" required placeholder="Must fill"></ekko-textarea>
      <ekko-textarea
        label="Invalid"
        invalid
        value="bad"
        error="Please write at least 10 characters"
      ></ekko-textarea>
      <ekko-textarea label="Loading" loading value="Saving…"></ekko-textarea>
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
      <ekko-textarea
        label="Bio"
        help="A short bio — max 500 characters"
        placeholder="Tell us about yourself…"
        maxlength="500"
      ></ekko-textarea>
      <ekko-textarea
        label="Feedback"
        required
        invalid
        error="Please share at least 20 characters of feedback"
      ></ekko-textarea>
    </div>
  `,
};

export const WithRowsAndMaxLength: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Control initial height with `rows` and enforce length with `maxlength`.',
      },
    },
  },
  render: () => html`
    <div style="display: grid; gap: 12px; max-width: 360px;">
      <ekko-textarea label="2 rows" rows="2" placeholder="Short"></ekko-textarea>
      <ekko-textarea label="6 rows" rows="6" placeholder="Longer"></ekko-textarea>
      <ekko-textarea
        label="Tweet"
        maxlength="280"
        placeholder="What's happening?"
        help="Max 280 characters"
      ></ekko-textarea>
    </div>
  `,
};

export const FullWidth: Story = {
  render: () => html`
    <div style="max-width: 480px;">
      <ekko-textarea
        full-width
        label="Full width"
        placeholder="Spans the container"
      ></ekko-textarea>
    </div>
  `,
};

export const InAForm: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`ekko-textarea` is a form-associated custom element. It participates in native `FormData`, `form.reset()`, and `form.submit()` out of the box.',
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
      <ekko-textarea name="bio" label="Bio" required placeholder="Tell us…"></ekko-textarea>
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
      --ekko-textarea-shared-border-focus: #7C3AED;
      --ekko-textarea-shared-focus-ring-color: #7C3AED;
      --ekko-textarea-shared-border-radius: 2px;
      display: grid; gap: 12px; max-width: 360px;
    "
    >
      <ekko-textarea label="Brand override" placeholder="Focus me"></ekko-textarea>
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
- Visible labels use native \`<label for>\` — clicking the label focuses the textarea
- Without a visible label, provide \`aria-label\` on the host and it forwards to the inner textarea

**Describedby wiring**
- \`help\` attribute → rendered below + linked via \`aria-describedby\`
- \`error\` attribute + \`invalid\` → replaces help via \`aria-describedby\`, announced with role="alert"
- External \`aria-describedby\` is preserved and merged with internal ids

**State signals**
- \`disabled\` → native \`disabled\` + \`aria-disabled="true"\`
- \`required\` → native \`required\` + \`aria-required="true"\` + visible asterisk (when labeled)
- \`invalid\` → \`aria-invalid="true"\` + red border
- \`loading\` → \`aria-busy="true"\` + disabled input + spinner

**Keyboard**
- Tab/Shift+Tab moves focus to/from the textarea
- Enter inserts a newline (unlike single-line inputs)
- All native keyboard behavior works unchanged

**Focus ring**
- Always visible on \`:focus-within\` via \`--ekko-textarea-shared-focus-ring-*\` tokens

**Motion**
- Hover/focus color transitions respect \`prefers-reduced-motion\`
- Loading spinner freezes under reduced motion
        `,
      },
    },
  },
  render: () => html`
    <div style="display: grid; gap: 16px; max-width: 360px;">
      <ekko-textarea
        label="Bio"
        required
        help="A short bio — max 500 characters"
        placeholder="Tell us about yourself…"
      ></ekko-textarea>
      <ekko-textarea
        label="Feedback"
        required
        invalid
        error="Please share at least 20 characters"
      ></ekko-textarea>
      <ekko-textarea
        aria-label="Notes (no visible label)"
        placeholder="Uses aria-label instead of a visible label"
      ></ekko-textarea>
      <ekko-textarea label="Disabled" disabled value="Locked content"></ekko-textarea>
      <ekko-textarea label="Loading" loading value="Saving your draft…"></ekko-textarea>
    </div>
  `,
};
