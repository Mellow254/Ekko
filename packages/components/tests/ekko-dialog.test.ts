import { assert } from '@esm-bundle/chai';
import { sendKeys } from '@web/test-runner-commands';
import type { EkkoDialog } from '../src/dialog';
import '../src/dialog';

const mount = (html: string): EkkoDialog => {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container.firstElementChild as EkkoDialog;
};

const innerDialog = (el: EkkoDialog): HTMLDialogElement => {
  return el.shadowRoot?.querySelector('.dialog') as HTMLDialogElement;
};

const innerClose = (el: EkkoDialog): HTMLButtonElement => {
  return el.shadowRoot?.querySelector('.close') as HTMLButtonElement;
};

const cleanup = (): void => {
  document.querySelectorAll('ekko-dialog').forEach((el) => {
    const dialog = (el as EkkoDialog).shadowRoot?.querySelector('dialog') as HTMLDialogElement;
    if (dialog?.open) dialog.close();
  });
  document.body.innerHTML = '';
};

describe('ekko-dialog — rendering', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    assert.isDefined(customElements.get('ekko-dialog'));
  });

  it('renders an inner <dialog> element', () => {
    const el = mount('<ekko-dialog></ekko-dialog>');
    assert.isNotNull(innerDialog(el));
    assert.equal(innerDialog(el).tagName, 'DIALOG');
  });

  it('has a shadow root', () => {
    const el = mount('<ekko-dialog></ekko-dialog>');
    assert.isNotNull(el.shadowRoot);
  });

  it('exposes a "base" CSS part on the inner dialog', () => {
    const el = mount('<ekko-dialog></ekko-dialog>');
    assert.equal(innerDialog(el).getAttribute('part'), 'base');
  });

  it('renders default slot content in the body', () => {
    const el = mount('<ekko-dialog>Body content</ekko-dialog>');
    assert.equal(el.textContent?.trim(), 'Body content');
  });

  it('renders heading when attribute is set', () => {
    const el = mount('<ekko-dialog heading="Confirm"></ekko-dialog>');
    const heading = el.shadowRoot?.querySelector('.title') as HTMLHeadingElement;
    assert.equal(heading.textContent, 'Confirm');
    assert.isFalse(heading.hasAttribute('hidden'));
  });

  it('renders description when attribute is set', () => {
    const el = mount('<ekko-dialog description="Are you sure?"></ekko-dialog>');
    const desc = el.shadowRoot?.querySelector('.description') as HTMLParagraphElement;
    assert.equal(desc.textContent, 'Are you sure?');
    assert.isFalse(desc.hasAttribute('hidden'));
  });

  it('hides header when neither heading nor description is set', () => {
    const el = mount('<ekko-dialog></ekko-dialog>');
    const header = el.shadowRoot?.querySelector('.header') as HTMLElement;
    assert.isTrue(header.hasAttribute('hidden'));
  });

  it('renders a close button', () => {
    const el = mount('<ekko-dialog></ekko-dialog>');
    assert.isNotNull(innerClose(el));
    assert.equal(innerClose(el).type, 'button');
  });

  it('exposes "header", "body", "footer", "close" CSS parts', () => {
    const el = mount('<ekko-dialog></ekko-dialog>');
    assert.isNotNull(el.shadowRoot?.querySelector('[part="header"]'));
    assert.isNotNull(el.shadowRoot?.querySelector('[part="body"]'));
    assert.isNotNull(el.shadowRoot?.querySelector('[part="footer"]'));
    assert.isNotNull(el.shadowRoot?.querySelector('[part="close"]'));
  });

  it('renders the footer slot', () => {
    const el = mount(
      '<ekko-dialog><button slot="footer" id="cancel">Cancel</button></ekko-dialog>'
    );
    const assigned = (
      el.shadowRoot?.querySelector('slot[name="footer"]') as HTMLSlotElement
    ).assignedElements();
    assert.equal(assigned.length, 1);
    assert.equal((assigned[0] as HTMLElement).id, 'cancel');
  });
});

describe('ekko-dialog — attributes', () => {
  afterEach(cleanup);

  it('defaults size to "md"', () => {
    const el = mount('<ekko-dialog></ekko-dialog>');
    assert.equal(el.size, 'md');
  });

  it('reflects size via property setter', () => {
    const el = mount('<ekko-dialog></ekko-dialog>');
    el.size = 'lg';
    assert.equal(el.getAttribute('size'), 'lg');
  });

  it('reflects open via property', () => {
    const el = mount('<ekko-dialog></ekko-dialog>');
    el.open = true;
    assert.isTrue(el.hasAttribute('open'));
    assert.isTrue(innerDialog(el).open);
  });

  it('closes when open property is set to false', () => {
    const el = mount('<ekko-dialog open></ekko-dialog>');
    assert.isTrue(innerDialog(el).open);
    el.open = false;
    assert.isFalse(el.hasAttribute('open'));
    assert.isFalse(innerDialog(el).open);
  });

  it('reflects modal via property', () => {
    const el = mount('<ekko-dialog></ekko-dialog>');
    el.modal = true;
    assert.isTrue(el.hasAttribute('modal'));
  });

  it('reflects disabled via property', () => {
    const el = mount('<ekko-dialog></ekko-dialog>');
    el.disabled = true;
    assert.isTrue(el.hasAttribute('disabled'));
  });

  it('reflects loading via property', () => {
    const el = mount('<ekko-dialog></ekko-dialog>');
    el.loading = true;
    assert.isTrue(el.hasAttribute('loading'));
  });

  it('reflects hideClose via property', () => {
    const el = mount('<ekko-dialog></ekko-dialog>');
    el.hideClose = true;
    assert.isTrue(el.hasAttribute('hide-close'));
  });

  it('reflects closeOnBackdrop via property', () => {
    const el = mount('<ekko-dialog></ekko-dialog>');
    el.closeOnBackdrop = true;
    assert.isTrue(el.hasAttribute('close-on-backdrop'));
  });

  it('heading setter updates rendered heading text', () => {
    const el = mount('<ekko-dialog></ekko-dialog>');
    el.heading = 'New title';
    const heading = el.shadowRoot?.querySelector('.title') as HTMLHeadingElement;
    assert.equal(heading.textContent, 'New title');
  });
});

describe('ekko-dialog — ARIA', () => {
  afterEach(cleanup);

  it('inner dialog has role="dialog" by default', () => {
    const el = mount('<ekko-dialog heading="Hi"></ekko-dialog>');
    assert.equal(innerDialog(el).getAttribute('role'), 'dialog');
  });

  it('inner dialog has role="alertdialog" when alert attribute is set', () => {
    const el = mount('<ekko-dialog alert heading="Hi"></ekko-dialog>');
    assert.equal(innerDialog(el).getAttribute('role'), 'alertdialog');
  });

  it('sets aria-labelledby to heading id when heading is set', () => {
    const el = mount('<ekko-dialog heading="Confirm"></ekko-dialog>');
    const heading = el.shadowRoot?.querySelector('.title') as HTMLHeadingElement;
    assert.equal(innerDialog(el).getAttribute('aria-labelledby'), heading.id);
  });

  it('forwards aria-label from host to inner dialog', () => {
    const el = mount('<ekko-dialog aria-label="Confirm dialog"></ekko-dialog>');
    assert.equal(innerDialog(el).getAttribute('aria-label'), 'Confirm dialog');
    assert.isNull(innerDialog(el).getAttribute('aria-labelledby'));
  });

  it('removes aria-label when host attribute is removed', () => {
    const el = mount('<ekko-dialog aria-label="Confirm"></ekko-dialog>');
    el.removeAttribute('aria-label');
    assert.isNull(innerDialog(el).getAttribute('aria-label'));
  });

  it('sets aria-describedby to description id when description is set', () => {
    const el = mount('<ekko-dialog description="Are you sure?"></ekko-dialog>');
    const desc = el.shadowRoot?.querySelector('.description') as HTMLParagraphElement;
    assert.equal(innerDialog(el).getAttribute('aria-describedby'), desc.id);
  });

  it('forwards external aria-describedby and merges with description', () => {
    const el = mount(
      '<ekko-dialog description="Are you sure?" aria-describedby="external-help"></ekko-dialog>'
    );
    const desc = el.shadowRoot?.querySelector('.description') as HTMLParagraphElement;
    const describedBy = innerDialog(el).getAttribute('aria-describedby');
    assert.include(describedBy, 'external-help');
    assert.include(describedBy, desc.id);
  });

  it('sets aria-busy="true" when loading', () => {
    const el = mount('<ekko-dialog loading></ekko-dialog>');
    assert.equal(innerDialog(el).getAttribute('aria-busy'), 'true');
  });

  it('does not set aria-busy by default', () => {
    const el = mount('<ekko-dialog></ekko-dialog>');
    assert.isNull(innerDialog(el).getAttribute('aria-busy'));
  });

  it('close button has aria-label "Close" by default', () => {
    const el = mount('<ekko-dialog></ekko-dialog>');
    assert.equal(innerClose(el).getAttribute('aria-label'), 'Close');
  });

  it('close button honors custom close-label', () => {
    const el = mount('<ekko-dialog close-label="Dismiss"></ekko-dialog>');
    assert.equal(innerClose(el).getAttribute('aria-label'), 'Dismiss');
  });
});

describe('ekko-dialog — methods', () => {
  afterEach(cleanup);

  it('show() opens the dialog non-modally', () => {
    const el = mount('<ekko-dialog></ekko-dialog>');
    el.show();
    assert.isTrue(innerDialog(el).open);
    assert.isTrue(el.hasAttribute('open'));
    assert.isFalse(el.modal);
  });

  it('showModal() opens the dialog as modal', () => {
    const el = mount('<ekko-dialog></ekko-dialog>');
    el.showModal();
    assert.isTrue(innerDialog(el).open);
    assert.isTrue(el.modal);
  });

  it('close() closes the dialog', () => {
    const el = mount('<ekko-dialog></ekko-dialog>');
    el.show();
    el.close();
    assert.isFalse(innerDialog(el).open);
  });

  it('close(returnValue) sets the return value', () => {
    const el = mount('<ekko-dialog></ekko-dialog>');
    el.show();
    el.close('confirm');
    assert.equal(el.returnValue, 'confirm');
  });

  it('show() does nothing when disabled', () => {
    const el = mount('<ekko-dialog disabled></ekko-dialog>');
    el.show();
    assert.isFalse(innerDialog(el).open);
  });
});

describe('ekko-dialog — keyboard', () => {
  afterEach(cleanup);

  it('Escape closes a modal dialog', async () => {
    const el = mount('<ekko-dialog></ekko-dialog>');
    el.showModal();
    innerDialog(el).focus();

    let fired = false;
    el.addEventListener('ekko-close', () => {
      fired = true;
    });

    await sendKeys({ press: 'Escape' });
    assert.isTrue(fired);
    assert.isFalse(innerDialog(el).open);
  });

  it('Enter on close button closes the dialog', async () => {
    const el = mount('<ekko-dialog></ekko-dialog>');
    el.show();
    innerClose(el).focus();

    let fired = false;
    el.addEventListener('ekko-close', () => {
      fired = true;
    });

    await sendKeys({ press: 'Enter' });
    assert.isTrue(fired);
  });
});

const waitForEvent = (el: EventTarget, type: string): Promise<Event> =>
  new Promise((resolve) => el.addEventListener(type, resolve, { once: true }));

describe('ekko-dialog — events', () => {
  afterEach(cleanup);

  it('dispatches ekko-open on show()', () => {
    const el = mount('<ekko-dialog></ekko-dialog>');

    let event: Event | null = null;
    el.addEventListener('ekko-open', (e) => {
      event = e;
    });
    el.show();

    assert.isNotNull(event);
    assert.equal((event as Event).type, 'ekko-open');
  });

  it('ekko-open detail contains modal flag', () => {
    const el = mount('<ekko-dialog></ekko-dialog>');

    let detail: { modal: boolean } | null = null;
    el.addEventListener('ekko-open', (e) => {
      detail = (e as CustomEvent).detail;
    });
    el.showModal();

    assert.isNotNull(detail);
    assert.isTrue((detail as { modal: boolean }).modal);
  });

  it('dispatches ekko-close when close() is called', async () => {
    const el = mount('<ekko-dialog></ekko-dialog>');
    el.show();

    const closeEvent = waitForEvent(el, 'ekko-close');
    el.close();
    const event = await closeEvent;

    assert.equal(event.type, 'ekko-close');
  });

  it('ekko-close detail contains returnValue', async () => {
    const el = mount('<ekko-dialog></ekko-dialog>');
    el.show();

    const closeEvent = waitForEvent(el, 'ekko-close');
    el.close('ok');
    const event = (await closeEvent) as CustomEvent<{ returnValue: string }>;

    assert.equal(event.detail.returnValue, 'ok');
  });

  it('ekko-close bubbles and is composed', async () => {
    const el = mount('<ekko-dialog></ekko-dialog>');
    el.show();

    const bubbled = waitForEvent(document.body, 'ekko-close');
    el.close();
    const event = await bubbled;

    assert.isTrue(event.bubbles);
    assert.isTrue(event.composed);
  });

  it('clicking close button dispatches ekko-close', async () => {
    const el = mount('<ekko-dialog></ekko-dialog>');
    el.show();

    const closeEvent = waitForEvent(el, 'ekko-close');
    innerClose(el).click();
    const event = await closeEvent;

    assert.equal(event.type, 'ekko-close');
  });
});
