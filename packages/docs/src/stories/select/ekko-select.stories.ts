import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@ekko-ds/components/select';
import '@ekko-ds/components/button';

interface SelectArgs {
  size: string;
  label?: string;
  placeholder?: string;
  value?: string;
  help?: string;
  error?: string;
  disabled: boolean;
  required: boolean;
  invalid: boolean;
  multiple: boolean;
  'visible-rows'?: number;
  'full-width': boolean;
}

/**
 * The `ekko-select` component wraps a native `<select>` in Shadow DOM and
 * lets you pass `<option>` (and `<optgroup>`) children declaratively. The
 * native control is preserved for keyboard navigation, search-as-you-type,
 * and accessibility while the chrome (border, chevron, focus ring) is
 * styled via design tokens.
 *
 * ## Token overrides
 *
 * ```css
 * :root {
 *   --ekko-select-shared-border-focus: #8B5CF6;
 *   --ekko-select-shared-border-radius: 2px;
 * }
 * ```
 */
const meta: Meta = {
  title: 'Components/Select',
  component: 'ekko-select',
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
      table: { defaultValue: { summary: 'md' } },
    },
    label: { control: 'text', description: 'Visible label, associated via for/id.' },
    placeholder: {
      control: 'text',
      description: 'Hidden, disabled placeholder option shown when no value is selected.',
    },
    value: { control: 'text', description: 'Current value.' },
    help: { control: 'text', description: 'Help text wired via aria-describedby.' },
    error: {
      control: 'text',
      description: 'Error message. Only shown when `invalid` is true.',
    },
    disabled: { control: 'boolean', description: 'Disables the select.' },
    required: { control: 'boolean', description: 'Marks the field as required.' },
    invalid: {
      control: 'boolean',
      description: 'Visual error state. Sets aria-invalid="true".',
    },
    multiple: {
      control: 'boolean',
      description: 'Allow multiple selections (renders an open list box).',
    },
    'visible-rows': {
      control: 'number',
      description: 'Show the select as an open list of N rows (native size attribute).',
    },
    'full-width': { control: 'boolean', description: 'Stretches to fill the container.' },
  },
};

export default meta;
type Story = StoryObj<SelectArgs>;

export const Default: Story = {
  args: {
    size: 'md',
    label: 'Country',
    placeholder: 'Select a country',
    value: '',
    help: '',
    error: '',
    disabled: false,
    required: false,
    invalid: false,
    multiple: false,
    'full-width': false,
  },
  render: (args) => html`
    <ekko-select
      size=${args.size}
      label=${args.label ?? ''}
      placeholder=${args.placeholder ?? ''}
      value=${args.value ?? ''}
      help=${args.help ?? ''}
      error=${args.error ?? ''}
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?invalid=${args.invalid}
      ?multiple=${args.multiple}
      ?full-width=${args['full-width']}
    >
      <option value="us">United States</option>
      <option value="ca">Canada</option>
      <option value="mx">Mexico</option>
      <option value="uk">United Kingdom</option>
      <option value="fr">France</option>
      <option value="de">Germany</option>
      <option value="jp">Japan</option>
    </ekko-select>
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
      <ekko-select size="sm" label="Small" placeholder="sm">
        <option value="a">Apple</option>
        <option value="b">Banana</option>
      </ekko-select>
      <ekko-select size="md" label="Medium" placeholder="md">
        <option value="a">Apple</option>
        <option value="b">Banana</option>
      </ekko-select>
      <ekko-select size="lg" label="Large" placeholder="lg">
        <option value="a">Apple</option>
        <option value="b">Banana</option>
      </ekko-select>
    </div>
  `,
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '**Disabled** — sets `aria-disabled="true"`. **Invalid** — red border and `aria-invalid="true"`.',
      },
    },
  },
  render: () => html`
    <div style="display: grid; gap: 12px; max-width: 320px;">
      <ekko-select label="Default" placeholder="Choose…">
        <option value="a">Option A</option>
        <option value="b">Option B</option>
      </ekko-select>
      <ekko-select label="Disabled" disabled value="a">
        <option value="a">Option A</option>
      </ekko-select>
      <ekko-select label="Required" required placeholder="Must pick">
        <option value="a">Option A</option>
      </ekko-select>
      <ekko-select label="Invalid" invalid placeholder="Choose…" error="Please pick a value">
        <option value="a">Option A</option>
      </ekko-select>
    </div>
  `,
};

export const WithOptgroups: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Group related options together with `<optgroup label>`.',
      },
    },
  },
  render: () => html`
    <ekko-select label="Beverage" placeholder="Pick a drink" style="max-width: 320px;">
      <optgroup label="Hot">
        <option value="coffee">Coffee</option>
        <option value="tea">Tea</option>
        <option value="cocoa">Cocoa</option>
      </optgroup>
      <optgroup label="Cold">
        <option value="water">Water</option>
        <option value="juice">Juice</option>
        <option value="soda">Soda</option>
      </optgroup>
    </ekko-select>
  `,
};

export const Multiple: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Setting `multiple` opens the control as a list box. Hold Cmd/Ctrl to toggle individual options.',
      },
    },
  },
  render: () => html`
    <ekko-select label="Toppings" multiple visible-rows="5" name="toppings" style="max-width: 320px;">
      <option value="cheese">Cheese</option>
      <option value="mushroom">Mushroom</option>
      <option value="pepperoni">Pepperoni</option>
      <option value="onion">Onion</option>
      <option value="olives">Olives</option>
      <option value="basil">Basil</option>
    </ekko-select>
  `,
};

export const VisibleRows: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use `visible-rows` to render the native select as an open scrolling list of N rows.',
      },
    },
  },
  render: () => html`
    <ekko-select label="Pick a city" visible-rows="4" style="max-width: 320px;">
      <option value="ny">New York</option>
      <option value="la">Los Angeles</option>
      <option value="ch">Chicago</option>
      <option value="hn">Houston</option>
      <option value="ph">Phoenix</option>
      <option value="pa">Philadelphia</option>
    </ekko-select>
  `,
};

export const WithHelpAndError: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Help text is announced via `aria-describedby`. When `invalid` is set, the error replaces the help message.',
      },
    },
  },
  render: () => html`
    <div style="display: grid; gap: 16px; max-width: 360px;">
      <ekko-select
        label="Plan"
        placeholder="Choose a plan"
        help="You can change your plan at any time"
      >
        <option value="free">Free</option>
        <option value="pro">Pro</option>
        <option value="team">Team</option>
      </ekko-select>
      <ekko-select label="Country" required invalid error="Please select a country">
        <option value="us">United States</option>
        <option value="ca">Canada</option>
      </ekko-select>
    </div>
  `,
};

export const RichOptions: Story = {
  parameters: {
    docs: {
      description: {
        story: `In browsers that support \`appearance: base-select\` (Chrome 130+), \`<option>\` elements can contain rich markup — icons, badges, multi-line content. The \`<selectedcontent>\` element automatically clones the selected option's content into the trigger button. In other browsers, the option's text content is shown.`,
      },
    },
  },
  render: () => html`
    <style>
      .opt {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .opt .flag {
        font-size: 1.1rem;
        line-height: 1;
      }
      .opt .meta {
        margin-inline-start: auto;
        color: #737373;
        font-size: 0.75rem;
      }
    </style>
    <ekko-select label="Pick a country" placeholder="Select…" style="max-width: 320px;">
      <option value="us">
        <span class="opt"><span class="flag" aria-hidden="true">🇺🇸</span><span>United States</span><span class="meta">+1</span></span>
      </option>
      <option value="ca">
        <span class="opt"><span class="flag" aria-hidden="true">🇨🇦</span><span>Canada</span><span class="meta">+1</span></span>
      </option>
      <option value="uk">
        <span class="opt"><span class="flag" aria-hidden="true">🇬🇧</span><span>United Kingdom</span><span class="meta">+44</span></span>
      </option>
      <option value="jp">
        <span class="opt"><span class="flag" aria-hidden="true">🇯🇵</span><span>Japan</span><span class="meta">+81</span></span>
      </option>
      <option value="de">
        <span class="opt"><span class="flag" aria-hidden="true">🇩🇪</span><span>Germany</span><span class="meta">+49</span></span>
      </option>
    </ekko-select>
  `,
};

export const FullWidth: Story = {
  render: () => html`
    <div style="max-width: 480px;">
      <ekko-select full-width label="Full width" placeholder="Spans the container">
        <option value="a">Option A</option>
        <option value="b">Option B</option>
      </ekko-select>
    </div>
  `,
};

export const InAForm: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`ekko-select` is a form-associated custom element. It participates in native `FormData`, `form.reset()`, and `form.submit()` out of the box.',
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
      <ekko-select name="size" label="Size" required placeholder="Pick a size">
        <option value="sm">Small</option>
        <option value="md">Medium</option>
        <option value="lg">Large</option>
      </ekko-select>
      <ekko-select name="color" label="Color" required placeholder="Pick a color">
        <option value="red">Red</option>
        <option value="green">Green</option>
        <option value="blue">Blue</option>
      </ekko-select>
      <ekko-button type="submit">Submit</ekko-button>
    </form>
  `,
};

export const BrandOverride: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Overrides the focus and border tokens via CSS custom properties on a wrapping element.',
      },
    },
  },
  render: () => html`
    <div
      style="
      --ekko-select-shared-border-focus: #7C3AED;
      --ekko-select-shared-focus-ring-color: #7C3AED;
      --ekko-select-shared-border-radius: 2px;
      display: grid; gap: 12px; max-width: 360px;
    "
    >
      <ekko-select label="Brand override" placeholder="Focus me">
        <option value="a">Option A</option>
        <option value="b">Option B</option>
      </ekko-select>
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
- Visible labels use native \`<label for>\` — clicking the label focuses the select
- Without a visible label, provide \`aria-label\` on the host and it forwards to the inner select

**Describedby wiring**
- \`help\` attribute → rendered below + linked via \`aria-describedby\`
- \`error\` attribute + \`invalid\` → replaces help via \`aria-describedby\`, announced with role="alert"
- External \`aria-describedby\` is preserved and merged with internal ids

**State signals**
- \`disabled\` → native \`disabled\` + \`aria-disabled="true"\`
- \`required\` → native \`required\` + \`aria-required="true"\` + visible asterisk (when labeled)
- \`invalid\` → \`aria-invalid="true"\` + red border

**Keyboard**
- Tab/Shift+Tab moves focus to/from the select
- Space/Enter and Arrow keys open and navigate the native picker
- Type-ahead search works (start typing an option label)
        `,
      },
    },
  },
  render: () => html`
    <div style="display: grid; gap: 16px; max-width: 360px;">
      <ekko-select
        label="Country"
        required
        placeholder="Select a country"
        help="We use this for tax calculation"
      >
        <option value="us">United States</option>
        <option value="ca">Canada</option>
        <option value="mx">Mexico</option>
      </ekko-select>
      <ekko-select
        label="Plan"
        required
        invalid
        placeholder="Pick a plan"
        error="Please choose a plan to continue"
      >
        <option value="free">Free</option>
        <option value="pro">Pro</option>
      </ekko-select>
      <ekko-select aria-label="Sort order" placeholder="Sort by">
        <option value="recent">Most recent</option>
        <option value="popular">Most popular</option>
      </ekko-select>
      <ekko-select label="Disabled" disabled value="a">
        <option value="a">Option A</option>
      </ekko-select>
    </div>
  `,
};
