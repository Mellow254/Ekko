import { assert } from '@esm-bundle/chai';
import { sendKeys } from '@web/test-runner-commands';
import type { EkkoTooltip } from '../src/tooltip';
import '../src/tooltip';

const mount = (html: string): EkkoTooltip => {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container.firstElementChild as EkkoTooltip;
};

const innerTip = (el: EkkoTooltip): HTMLElement => {
  return el.shadowRoot?.querySelector('.tooltip') as HTMLElement;
};

const cleanup = (): void => {
  document.body.innerHTML = '';
};

const nextFrame = (): Promise<void> =>
  new Promise((resolve) => requestAnimationFrame(() => resolve()));

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

describe('ekko-tooltip — rendering', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    assert.isDefined(customElements.get('ekko-tooltip'));
  });

  it('has a shadow root', () => {
    const el = mount('<ekko-tooltip label="Help"><button>Trigger</button></ekko-tooltip>');
    assert.isNotNull(el.shadowRoot);
  });

  it('renders an inner tooltip element with role="tooltip"', () => {
    const el = mount('<ekko-tooltip label="Help"><button>Trigger</button></ekko-tooltip>');
    const tip = innerTip(el);
    assert.isNotNull(tip);
    assert.equal(tip.getAttribute('role'), 'tooltip');
  });

  it('exposes a "base" CSS part on the tooltip', () => {
    const el = mount('<ekko-tooltip label="Help"><button>Trigger</button></ekko-tooltip>');
    assert.equal(innerTip(el).getAttribute('part'), 'base');
  });

  it('renders the label attribute into the tooltip', () => {
    const el = mount('<ekko-tooltip label="Save changes"><button>S</button></ekko-tooltip>');
    const label = el.shadowRoot?.querySelector('.label') as HTMLElement;
    assert.equal(label.textContent, 'Save changes');
  });

  it('slots custom content via the content slot', () => {
    const el = mount(`
      <ekko-tooltip>
        <button>Trigger</button>
        <span slot="content">Rich <strong>tooltip</strong></span>
      </ekko-tooltip>
    `);
    const contentSlot = el.shadowRoot?.querySelector('slot[name="content"]') as HTMLSlotElement;
    const assigned = contentSlot.assignedElements();
    assert.equal(assigned.length, 1);
    assert.equal(assigned[0].textContent, 'Rich tooltip');
  });
});

describe('ekko-tooltip — attributes', () => {
  afterEach(cleanup);

  it('defaults placement to "top"', () => {
    const el = mount('<ekko-tooltip label="Hi"><button>T</button></ekko-tooltip>');
    assert.equal(el.placement, 'top');
  });

  it('reflects placement attribute to property', () => {
    const el = mount(
      '<ekko-tooltip placement="right" label="Hi"><button>T</button></ekko-tooltip>'
    );
    assert.equal(el.placement, 'right');
  });

  it('defaults size to "md"', () => {
    const el = mount('<ekko-tooltip label="Hi"><button>T</button></ekko-tooltip>');
    assert.equal(el.size, 'md');
  });

  it('sets variant via property', () => {
    const el = mount('<ekko-tooltip label="Hi"><button>T</button></ekko-tooltip>');
    el.variant = 'inverse';
    assert.equal(el.getAttribute('variant'), 'inverse');
  });

  it('reflects disabled to property', () => {
    const el = mount('<ekko-tooltip disabled label="Hi"><button>T</button></ekko-tooltip>');
    assert.isTrue(el.disabled);
  });

  it('defaults showDelay to 200ms', () => {
    const el = mount('<ekko-tooltip label="Hi"><button>T</button></ekko-tooltip>');
    assert.equal(el.showDelay, 200);
  });

  it('reads show-delay attribute', () => {
    const el = mount('<ekko-tooltip show-delay="50" label="Hi"><button>T</button></ekko-tooltip>');
    assert.equal(el.showDelay, 50);
  });
});

describe('ekko-tooltip — ARIA', () => {
  afterEach(cleanup);

  it('links the trigger to the tooltip via aria-describedby', async () => {
    const el = mount('<ekko-tooltip label="Help"><button id="t">Go</button></ekko-tooltip>');
    await nextFrame();
    const trigger = el.querySelector('button') as HTMLButtonElement;
    const tipId = innerTip(el).getAttribute('id') ?? '';
    assert.isNotEmpty(tipId);
    const describedby = trigger.getAttribute('aria-describedby') ?? '';
    assert.include(describedby.split(/\s+/), tipId);
  });

  it('preserves existing aria-describedby on the trigger', async () => {
    const el = mount(
      '<ekko-tooltip label="Help"><button aria-describedby="ext">Go</button></ekko-tooltip>'
    );
    await nextFrame();
    const trigger = el.querySelector('button') as HTMLButtonElement;
    const ids = (trigger.getAttribute('aria-describedby') ?? '').split(/\s+/);
    assert.include(ids, 'ext');
    assert.isTrue(ids.some((id) => id.startsWith('ekko-tooltip-')));
  });

  it('sets aria-busy on the tooltip when loading', () => {
    const el = mount('<ekko-tooltip loading label="Saving"><button>T</button></ekko-tooltip>');
    assert.equal(innerTip(el).getAttribute('aria-busy'), 'true');
  });

  it('forwards aria-label from host to the tooltip', () => {
    const el = mount(
      '<ekko-tooltip aria-label="Extra context" label="Hi"><button>T</button></ekko-tooltip>'
    );
    assert.equal(innerTip(el).getAttribute('aria-label'), 'Extra context');
  });

  it('removes aria-label from the tooltip when host attribute is removed', () => {
    const el = mount(
      '<ekko-tooltip aria-label="Label" label="Hi"><button>T</button></ekko-tooltip>'
    );
    el.removeAttribute('aria-label');
    assert.isNull(innerTip(el).getAttribute('aria-label'));
  });
});

describe('ekko-tooltip — keyboard', () => {
  afterEach(cleanup);

  it('shows when the trigger receives focus', async () => {
    const el = mount(
      '<ekko-tooltip show-delay="0" label="Hi"><button id="k">T</button></ekko-tooltip>'
    );
    (el.querySelector('button') as HTMLButtonElement).focus();
    await nextFrame();
    assert.isTrue(el.open);
  });

  it('hides when focus leaves the trigger', async () => {
    const el = mount(
      '<ekko-tooltip show-delay="0" hide-delay="0" label="Hi"><button>T</button></ekko-tooltip>'
    );
    const btn = el.querySelector('button') as HTMLButtonElement;
    btn.focus();
    await nextFrame();
    btn.blur();
    await nextFrame();
    assert.isFalse(el.open);
  });

  it('hides on Escape key', async () => {
    const el = mount('<ekko-tooltip show-delay="0" label="Hi"><button>T</button></ekko-tooltip>');
    const btn = el.querySelector('button') as HTMLButtonElement;
    btn.focus();
    await nextFrame();
    assert.isTrue(el.open);
    await sendKeys({ press: 'Escape' });
    assert.isFalse(el.open);
  });

  it('does not show when disabled', async () => {
    const el = mount(
      '<ekko-tooltip show-delay="0" disabled label="Hi"><button>T</button></ekko-tooltip>'
    );
    (el.querySelector('button') as HTMLButtonElement).focus();
    await nextFrame();
    assert.isFalse(el.open);
  });
});

describe('ekko-tooltip — events', () => {
  afterEach(cleanup);

  it('dispatches ekko-show when opening', () => {
    const el = mount('<ekko-tooltip label="Hi"><button>T</button></ekko-tooltip>');
    let event: CustomEvent<{ placement: string }> | null = null;
    el.addEventListener('ekko-show', (e) => {
      event = e as CustomEvent<{ placement: string }>;
    });
    el.show();
    assert.isNotNull(event);
    assert.equal((event as unknown as CustomEvent).type, 'ekko-show');
  });

  it('ekko-show bubbles and is composed', () => {
    const el = mount('<ekko-tooltip label="Hi"><button>T</button></ekko-tooltip>');
    let event: Event | null = null;
    document.body.addEventListener('ekko-show', (e) => {
      event = e;
    });
    el.show();
    assert.isNotNull(event);
    assert.isTrue((event as Event).composed);
    assert.isTrue((event as Event).bubbles);
  });

  it('dispatches ekko-hide when closing', () => {
    const el = mount('<ekko-tooltip open label="Hi"><button>T</button></ekko-tooltip>');
    let fired = false;
    el.addEventListener('ekko-hide', () => {
      fired = true;
    });
    el.hide();
    assert.isTrue(fired);
  });

  it('event detail contains the current placement', () => {
    const el = mount(
      '<ekko-tooltip placement="bottom" label="Hi"><button>T</button></ekko-tooltip>'
    );
    let detail: { placement: string } | null = null;
    el.addEventListener('ekko-show', (e) => {
      detail = (e as CustomEvent).detail;
    });
    el.show();
    assert.equal((detail as unknown as { placement: string }).placement, 'bottom');
  });

  it('respects show-delay before opening', async () => {
    const el = mount('<ekko-tooltip show-delay="40" label="Hi"><button>T</button></ekko-tooltip>');
    const btn = el.querySelector('button') as HTMLButtonElement;
    btn.focus();
    assert.isFalse(el.open);
    await wait(80);
    assert.isTrue(el.open);
  });
});
