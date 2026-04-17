import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@ekko-ds/components/dialog';
import '@ekko-ds/components/button';
import type { EkkoDialog } from '@ekko-ds/components/dialog';

interface DialogArgs {
  size: string;
  heading?: string;
  description?: string;
  modal: boolean;
  disabled: boolean;
  loading: boolean;
  'hide-close': boolean;
  'close-on-backdrop': boolean;
}

const openDialog = (selector: string): void => {
  const dialog = document.querySelector(selector) as EkkoDialog | null;
  dialog?.showModal();
};

const meta: Meta = {
  title: 'Components/Dialog',
  component: 'ekko-dialog',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
The \`ekko-dialog\` component wraps a native [\`<dialog>\`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)
in Shadow DOM and adds a heading, description, close button, and footer slot on top
of the platform's built-in open/close, focus trapping, and \`::backdrop\` handling.

Use \`show()\` for a non-modal dialog that stays in the document flow, or \`showModal()\`
for a modal that dims the backdrop, traps focus, and closes on \`Escape\`.

## Token overrides

\`\`\`css
:root {
  --ekko-dialog-shared-border-radius: 4px;
  --ekko-dialog-shared-backdrop-opacity: 0.7;
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
      description: 'Width preset.',
      table: { defaultValue: { summary: 'md' } },
    },
    heading: {
      control: 'text',
      description: 'Dialog heading rendered in the header.',
    },
    description: {
      control: 'text',
      description: 'Supporting description rendered below the heading.',
    },
    modal: {
      control: 'boolean',
      description: 'Open as a modal (traps focus, dims backdrop).',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the dialog — interaction is blocked.',
    },
    loading: {
      control: 'boolean',
      description: 'Shows a spinner and marks the dialog aria-busy.',
    },
    'hide-close': {
      control: 'boolean',
      description: 'Hides the built-in close button.',
    },
    'close-on-backdrop': {
      control: 'boolean',
      description: 'Clicking the backdrop closes a modal dialog.',
    },
  },
};

export default meta;
type Story = StoryObj<DialogArgs>;

export const Default: Story = {
  args: {
    size: 'md',
    heading: 'Delete project',
    description: 'This action cannot be undone. The project and all its data will be removed.',
    modal: true,
    disabled: false,
    loading: false,
    'hide-close': false,
    'close-on-backdrop': true,
  },
  render: (args) => html`
    <ekko-button
      @ekko-click=${() => {
        const dialog = document.getElementById('default-dialog') as EkkoDialog;
        if (args.modal) dialog.showModal();
        else dialog.show();
      }}
    >
      Open dialog
    </ekko-button>
    <ekko-dialog
      id="default-dialog"
      size=${args.size}
      heading=${args.heading ?? ''}
      description=${args.description ?? ''}
      ?disabled=${args.disabled}
      ?loading=${args.loading}
      ?hide-close=${args['hide-close']}
      ?close-on-backdrop=${args['close-on-backdrop']}
    >
      <ekko-button
        slot="footer"
        variant="ghost"
        @ekko-click=${() => {
          const dialog = document.getElementById('default-dialog') as EkkoDialog;
          dialog.close('cancel');
        }}
      >
        Cancel
      </ekko-button>
      <ekko-button
        slot="footer"
        variant="danger"
        @ekko-click=${() => {
          const dialog = document.getElementById('default-dialog') as EkkoDialog;
          dialog.close('confirm');
        }}
      >
        Delete
      </ekko-button>
    </ekko-dialog>
  `,
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Three width presets. Padding, typography, and heading size scale together.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <ekko-button @ekko-click=${() => openDialog('#size-sm')}>Small</ekko-button>
      <ekko-button @ekko-click=${() => openDialog('#size-md')}>Medium</ekko-button>
      <ekko-button @ekko-click=${() => openDialog('#size-lg')}>Large</ekko-button>
    </div>
    <ekko-dialog id="size-sm" size="sm" heading="Small dialog" description="Compact.">
      <p>Body content for a small dialog.</p>
    </ekko-dialog>
    <ekko-dialog id="size-md" size="md" heading="Medium dialog" description="Default width.">
      <p>Body content for a medium dialog.</p>
    </ekko-dialog>
    <ekko-dialog id="size-lg" size="lg" heading="Large dialog" description="Roomy.">
      <p>Body content for a large dialog.</p>
    </ekko-dialog>
  `,
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '**Default** — heading, description, close button. **No close** — close button hidden. **Loading** — spinner overlay, body dimmed.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <ekko-button @ekko-click=${() => openDialog('#state-default')}>Default</ekko-button>
      <ekko-button @ekko-click=${() => openDialog('#state-no-close')}>No close</ekko-button>
      <ekko-button @ekko-click=${() => openDialog('#state-loading')}>Loading</ekko-button>
    </div>
    <ekko-dialog id="state-default" heading="Default state" description="Close button shown.">
      <p>Interact freely, press Escape or click the X to dismiss.</p>
    </ekko-dialog>
    <ekko-dialog id="state-no-close" hide-close heading="Cannot dismiss" description="Use a footer action.">
      <p>Close button is hidden — provide an explicit action in the footer.</p>
      <ekko-button
        slot="footer"
        @ekko-click=${() => (document.getElementById('state-no-close') as EkkoDialog).close()}
      >
        Done
      </ekko-button>
    </ekko-dialog>
    <ekko-dialog id="state-loading" loading heading="Saving…" description="Please wait.">
      <p>Body and footer are dimmed while the dialog is aria-busy.</p>
      <ekko-button slot="footer" disabled>Save</ekko-button>
    </ekko-dialog>
  `,
};

export const CloseOnBackdrop: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Set the \`close-on-backdrop\` attribute to dismiss a modal dialog when the user clicks outside of it. The backdrop click is only honored when the dialog was opened as a modal via \`showModal()\` — non-modal dialogs have no backdrop.

Open both dialogs below and try clicking the dimmed backdrop: the first one closes, the second one ignores the click.
        `,
      },
    },
  },
  render: () => html`
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <ekko-button @ekko-click=${() => openDialog('#backdrop-on')}>
        Click-outside enabled
      </ekko-button>
      <ekko-button @ekko-click=${() => openDialog('#backdrop-off')}>
        Click-outside disabled
      </ekko-button>
    </div>
    <ekko-dialog
      id="backdrop-on"
      close-on-backdrop
      heading="Click outside to dismiss"
      description="This dialog closes when you click the dimmed backdrop."
    >
      <p>You can also press Escape or use the close button.</p>
    </ekko-dialog>
    <ekko-dialog
      id="backdrop-off"
      heading="Backdrop clicks ignored"
      description="Without close-on-backdrop, the user must use an explicit close action."
    >
      <p>Clicking the dim area does nothing. Press Escape or use the close button.</p>
    </ekko-dialog>
  `,
};

export const NonModal: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A non-modal dialog rendered via `show()` stays in the document flow and does not dim the backdrop. Useful for inline notices that should not trap focus.',
      },
    },
  },
  render: () => html`
    <ekko-button
      @ekko-click=${() => (document.getElementById('nonmodal') as EkkoDialog).show()}
    >
      Open non-modal
    </ekko-button>
    <ekko-dialog
      id="nonmodal"
      heading="Non-modal"
      description="Opened with show(), not showModal()."
    >
      <p>Focus is not trapped; the rest of the page is still reachable.</p>
    </ekko-dialog>
  `,
};

export const AlertDialog: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Set the `alert` attribute to render with `role="alertdialog"`. Use for destructive confirmations and error announcements.',
      },
    },
  },
  render: () => html`
    <ekko-button
      @ekko-click=${() => (document.getElementById('alert-dialog') as EkkoDialog).showModal()}
    >
      Open alert dialog
    </ekko-button>
    <ekko-dialog
      id="alert-dialog"
      alert
      heading="Unsaved changes"
      description="Leaving now will discard your edits."
    >
      <ekko-button
        slot="footer"
        variant="ghost"
        @ekko-click=${() => (document.getElementById('alert-dialog') as EkkoDialog).close('stay')}
      >
        Stay
      </ekko-button>
      <ekko-button
        slot="footer"
        variant="danger"
        @ekko-click=${() => (document.getElementById('alert-dialog') as EkkoDialog).close('leave')}
      >
        Leave
      </ekko-button>
    </ekko-dialog>
  `,
};

export const AccessibilityShowcase: Story = {
  name: 'Accessibility',
  parameters: {
    docs: {
      description: {
        story: `
**Role**
- Inner \`<dialog>\` carries \`role="dialog"\` by default, or \`role="alertdialog"\` when the host has \`alert\`

**Labeling**
- When \`heading\` is set, the inner dialog's \`aria-labelledby\` points at the heading
- When only \`aria-label\` is set on the host, it forwards to the inner dialog
- \`aria-describedby\` is set to the description element's id and merges with any external \`aria-describedby\` on the host

**Keyboard**
- \`Escape\` closes a modal dialog and fires an \`ekko-cancel\` event (call \`event.preventDefault()\` on the custom event to block the close)
- \`Tab\` / \`Shift+Tab\` is trapped inside a modal dialog by the browser's top-layer behavior

**Focus**
- \`showModal()\` moves focus into the dialog and restores it to the invoker on close
- \`:focus-visible\` renders the standard Ekko focus ring on both the dialog and the close button
        `,
      },
    },
  },
  render: () => html`
    <ekko-button
      @ekko-click=${() => (document.getElementById('a11y-dialog') as EkkoDialog).showModal()}
    >
      Open accessible dialog
    </ekko-button>
    <ekko-dialog
      id="a11y-dialog"
      heading="Accessible dialog"
      description="Labeled via aria-labelledby, described via aria-describedby."
      close-on-backdrop
    >
      <p>Press Escape or click outside to close.</p>
      <ekko-button
        slot="footer"
        @ekko-click=${() => (document.getElementById('a11y-dialog') as EkkoDialog).close()}
      >
        OK
      </ekko-button>
    </ekko-dialog>
  `,
};
