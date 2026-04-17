import { assert } from '@esm-bundle/chai';
import { sendKeys } from '@web/test-runner-commands';
import type { EkkoToggletip } from '../src/toggletip';
import '../src/toggletip';

const mount = (html: string): EkkoToggletip => {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container.firstElementChild as EkkoToggletip;
};

const innerBtn = (el: EkkoToggletip): HTMLButtonElement => {
  return el.shadowRoot?.querySelector('.trigger') as HTMLButtonElement;
};

const innerPopover = (el: EkkoToggletip): HTMLElement => {
  return el.shadowRoot?.querySelector('.popover') as HTMLElement;
};

const cleanup = (): void => {
  document.body.innerHTML = '';
};

describe('ekko-toggletip — rendering', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    assert.isDefined(customElements.get('ekko-toggletip'));
  });

  it('has a shadow root', () => {
    const el = mount('<ekko-toggletip label="Info"></ekko-toggletip>');
    assert.isNotNull(el.shadowRoot);
  });

  it('renders an inner trigger button', () => {
    const el = mount('<ekko-toggletip label="Info"></ekko-toggletip>');
    const btn = innerBtn(el);
    assert.isNotNull(btn);
    assert.equal(btn.tagName, 'BUTTON');
    assert.equal(btn.getAttribute('type'), 'button');
  });

  it('renders a popover with role="status" and aria-live="polite"', () => {
    const el = mount('<ekko-toggletip label="Info"></ekko-toggletip>');
    const popover = innerPopover(el);
    assert.isNotNull(popover);
    assert.equal(popover.getAttribute('role'), 'status');
    assert.equal(popover.getAttribute('aria-live'), 'polite');
  });

  it('exposes a "base" CSS part on the trigger', () => {
    const el = mount('<ekko-toggletip label="Info"></ekko-toggletip>');
    assert.equal(innerBtn(el).getAttribute('part'), 'base');
  });

  it('exposes a "popover" CSS part on the popover surface', () => {
    const el = mount('<ekko-toggletip label="Info"></ekko-toggletip>');
    assert.equal(innerPopover(el).getAttribute('part'), 'popover');
  });

  it('renders the label attribute into the popover content', () => {
    const el = mount('<ekko-toggletip label="Extra details"></ekko-toggletip>');
    const content = el.shadowRoot?.querySelector('.content') as HTMLElement;
    assert.equal(content.textContent?.trim(), 'Extra details');
  });

  it('slots rich content via the default slot', () => {
    const el = mount('<ekko-toggletip><p>Rich <strong>content</strong></p></ekko-toggletip>');
    const slot = el.shadowRoot?.querySelector('.content slot:not([name])') as HTMLSlotElement;
    const assigned = slot.assignedElements();
    assert.equal(assigned.length, 1);
    assert.equal(assigned[0].textContent, 'Rich content');
  });

  it('slots a custom trigger via the trigger slot', () => {
    const el = mount(`
      <ekko-toggletip label="Info">
        <svg slot="trigger" aria-hidden="true" width="16" height="16"></svg>
      </ekko-toggletip>
    `);
    const slot = el.shadowRoot?.querySelector('slot[name="trigger"]') as HTMLSlotElement;
    const assigned = slot.assignedElements();
    assert.equal(assigned.length, 1);
    assert.equal(assigned[0].tagName.toLowerCase(), 'svg');
  });
});

describe('ekko-toggletip — attributes', () => {
  afterEach(cleanup);

  it('defaults placement to "top"', () => {
    const el = mount('<ekko-toggletip label="Info"></ekko-toggletip>');
    assert.equal(el.placement, 'top');
  });

  it('reflects placement attribute to property', () => {
    const el = mount('<ekko-toggletip placement="right" label="Info"></ekko-toggletip>');
    assert.equal(el.placement, 'right');
  });

  it('defaults size to "md"', () => {
    const el = mount('<ekko-toggletip label="Info"></ekko-toggletip>');
    assert.equal(el.size, 'md');
  });

  it('sets variant via property', () => {
    const el = mount('<ekko-toggletip label="Info"></ekko-toggletip>');
    el.variant = 'inverse';
    assert.equal(el.getAttribute('variant'), 'inverse');
  });

  it('reflects disabled to property', () => {
    const el = mount('<ekko-toggletip disabled label="Info"></ekko-toggletip>');
    assert.isTrue(el.disabled);
  });

  it('removes open when disabled is set while open', () => {
    const el = mount('<ekko-toggletip open label="Info"></ekko-toggletip>');
    assert.isTrue(el.open);
    el.disabled = true;
    assert.isFalse(el.open);
  });
});

describe('ekko-toggletip — ARIA', () => {
  afterEach(cleanup);

  it('sets aria-expanded="false" on the trigger by default', () => {
    const el = mount('<ekko-toggletip label="Info"></ekko-toggletip>');
    assert.equal(innerBtn(el).getAttribute('aria-expanded'), 'false');
  });

  it('sets aria-expanded="true" on the trigger when open', () => {
    const el = mount('<ekko-toggletip open label="Info"></ekko-toggletip>');
    assert.equal(innerBtn(el).getAttribute('aria-expanded'), 'true');
  });

  it('links the trigger to the popover via aria-controls', () => {
    const el = mount('<ekko-toggletip label="Info"></ekko-toggletip>');
    const controls = innerBtn(el).getAttribute('aria-controls') ?? '';
    const popoverId = innerPopover(el).getAttribute('id') ?? '';
    assert.isNotEmpty(popoverId);
    assert.equal(controls, popoverId);
  });

  it('sets aria-haspopup on the trigger', () => {
    const el = mount('<ekko-toggletip label="Info"></ekko-toggletip>');
    assert.equal(innerBtn(el).getAttribute('aria-haspopup'), 'true');
  });

  it('sets aria-disabled on the trigger when disabled', () => {
    const el = mount('<ekko-toggletip disabled label="Info"></ekko-toggletip>');
    assert.equal(innerBtn(el).getAttribute('aria-disabled'), 'true');
  });

  it('sets aria-busy on the popover when loading', () => {
    const el = mount('<ekko-toggletip loading label="Info"></ekko-toggletip>');
    assert.equal(innerPopover(el).getAttribute('aria-busy'), 'true');
  });

  it('forwards aria-label from host to the trigger', () => {
    const el = mount('<ekko-toggletip aria-label="More info" label="Info"></ekko-toggletip>');
    assert.equal(innerBtn(el).getAttribute('aria-label'), 'More info');
  });

  it('removes aria-label from the trigger when host attribute is removed', () => {
    const el = mount('<ekko-toggletip aria-label="Label" label="Info"></ekko-toggletip>');
    el.removeAttribute('aria-label');
    assert.isNull(innerBtn(el).getAttribute('aria-label'));
  });

  it('forwards aria-describedby from host to the trigger', () => {
    const el = mount('<ekko-toggletip aria-describedby="ext" label="Info"></ekko-toggletip>');
    assert.equal(innerBtn(el).getAttribute('aria-describedby'), 'ext');
  });
});

describe('ekko-toggletip — keyboard & interaction', () => {
  afterEach(cleanup);

  it('toggles open on trigger click', () => {
    const el = mount('<ekko-toggletip label="Info"></ekko-toggletip>');
    innerBtn(el).click();
    assert.isTrue(el.open);
    innerBtn(el).click();
    assert.isFalse(el.open);
  });

  it('opens on Enter key when trigger is focused', async () => {
    const el = mount('<ekko-toggletip label="Info"></ekko-toggletip>');
    innerBtn(el).focus();
    await sendKeys({ press: 'Enter' });
    assert.isTrue(el.open);
  });

  it('opens on Space key when trigger is focused', async () => {
    const el = mount('<ekko-toggletip label="Info"></ekko-toggletip>');
    innerBtn(el).focus();
    await sendKeys({ press: 'Space' });
    assert.isTrue(el.open);
  });

  it('hides on Escape key', () => {
    const el = mount('<ekko-toggletip open label="Info"></ekko-toggletip>');
    innerBtn(el).focus();
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    assert.isFalse(el.open);
  });

  it('does not open when disabled', () => {
    const el = mount('<ekko-toggletip disabled label="Info"></ekko-toggletip>');
    innerBtn(el).click();
    assert.isFalse(el.open);
  });

  it('closes when clicking outside the component', () => {
    const el = mount('<ekko-toggletip open label="Info"></ekko-toggletip>');
    document.body.click();
    assert.isFalse(el.open);
  });

  it('remains open when clicking inside the component', () => {
    const el = mount('<ekko-toggletip open label="Info"></ekko-toggletip>');
    innerPopover(el).click();
    assert.isTrue(el.open);
  });
});

describe('ekko-toggletip — events', () => {
  afterEach(cleanup);

  it('dispatches ekko-show when opening', () => {
    const el = mount('<ekko-toggletip label="Info"></ekko-toggletip>');
    let event: Event | null = null;
    el.addEventListener('ekko-show', (e) => {
      event = e;
    });
    el.show();
    assert.isNotNull(event);
    assert.equal((event as unknown as Event).type, 'ekko-show');
  });

  it('ekko-show bubbles and is composed', () => {
    const el = mount('<ekko-toggletip label="Info"></ekko-toggletip>');
    let event: Event | null = null;
    document.body.addEventListener('ekko-show', (e) => {
      event = e;
    });
    el.show();
    assert.isNotNull(event);
    assert.isTrue((event as unknown as Event).bubbles);
    assert.isTrue((event as unknown as Event).composed);
  });

  it('dispatches ekko-hide when closing', () => {
    const el = mount('<ekko-toggletip open label="Info"></ekko-toggletip>');
    let fired = false;
    el.addEventListener('ekko-hide', () => {
      fired = true;
    });
    el.hide();
    assert.isTrue(fired);
  });

  it('event detail contains the current placement', () => {
    const el = mount('<ekko-toggletip placement="bottom" label="Info"></ekko-toggletip>');
    let detail: { placement: string } | null = null;
    el.addEventListener('ekko-show', (e) => {
      detail = (e as CustomEvent).detail;
    });
    el.show();
    assert.equal((detail as unknown as { placement: string }).placement, 'bottom');
  });
});
