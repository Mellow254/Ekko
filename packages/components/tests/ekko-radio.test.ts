import { assert } from '@esm-bundle/chai';
import { sendKeys } from '@web/test-runner-commands';
import type { EkkoRadio } from '../src/radio';
import '../src/radio';

const mount = (html: string): EkkoRadio => {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container.firstElementChild as EkkoRadio;
};

const mountAll = (html: string): NodeListOf<EkkoRadio> => {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container.querySelectorAll<EkkoRadio>('ekko-radio');
};

const innerInput = (el: EkkoRadio): HTMLInputElement => {
  return el.shadowRoot?.querySelector('.input') as HTMLInputElement;
};

const cleanup = (): void => {
  document.body.innerHTML = '';
};

describe('ekko-radio — rendering', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    assert.isDefined(customElements.get('ekko-radio'));
  });

  it('renders an inner <input type="radio"> element', () => {
    const el = mount('<ekko-radio>Option</ekko-radio>');
    const inner = innerInput(el);
    assert.isNotNull(inner);
    assert.equal(inner.type, 'radio');
  });

  it('has a shadow root', () => {
    const el = mount('<ekko-radio>Option</ekko-radio>');
    assert.isNotNull(el.shadowRoot);
  });

  it('renders slot content as label text', () => {
    const el = mount('<ekko-radio>Option A</ekko-radio>');
    assert.equal(el.textContent?.trim(), 'Option A');
  });

  it('exposes a "base" CSS part on the inner input', () => {
    const el = mount('<ekko-radio>Option</ekko-radio>');
    assert.equal(innerInput(el).getAttribute('part'), 'base');
  });

  it('renders the visual circle element', () => {
    const el = mount('<ekko-radio>Option</ekko-radio>');
    const circle = el.shadowRoot?.querySelector('.circle') as HTMLElement;
    assert.isNotNull(circle);
    assert.equal(circle.getAttribute('aria-hidden'), 'true');
  });
});

describe('ekko-radio — attributes', () => {
  afterEach(cleanup);

  it('defaults size to "md"', () => {
    const el = mount('<ekko-radio></ekko-radio>');
    assert.equal(el.size, 'md');
  });

  it('reflects size via property setter', () => {
    const el = mount('<ekko-radio></ekko-radio>');
    el.size = 'lg';
    assert.equal(el.getAttribute('size'), 'lg');
  });

  it('reflects checked from attribute', () => {
    const el = mount('<ekko-radio checked>Option</ekko-radio>');
    assert.isTrue(el.checked);
    assert.isTrue(innerInput(el).checked);
  });

  it('sets checked via property', () => {
    const el = mount('<ekko-radio>Option</ekko-radio>');
    el.checked = true;
    assert.isTrue(innerInput(el).checked);
    assert.isTrue(el.hasAttribute('checked'));
  });

  it('unchecks via property', () => {
    const el = mount('<ekko-radio checked>Option</ekko-radio>');
    el.checked = false;
    assert.isFalse(innerInput(el).checked);
    assert.isFalse(el.hasAttribute('checked'));
  });

  it('reflects disabled to property', () => {
    const el = mount('<ekko-radio disabled>Option</ekko-radio>');
    assert.isTrue(el.disabled);
  });

  it('sets disabled via property', () => {
    const el = mount('<ekko-radio>Option</ekko-radio>');
    el.disabled = true;
    assert.isTrue(el.hasAttribute('disabled'));
  });

  it('defaults value to "on"', () => {
    const el = mount('<ekko-radio>Option</ekko-radio>');
    assert.equal(el.value, 'on');
  });

  it('reflects custom value', () => {
    const el = mount('<ekko-radio value="a">Option A</ekko-radio>');
    assert.equal(el.value, 'a');
  });

  it('reflects name property', () => {
    const el = mount('<ekko-radio name="plan">Option</ekko-radio>');
    assert.equal(el.name, 'plan');
  });

  it('reflects required', () => {
    const el = mount('<ekko-radio required>Option</ekko-radio>');
    assert.isTrue(el.required);
    assert.isTrue(innerInput(el).required);
  });
});

describe('ekko-radio — ARIA', () => {
  afterEach(cleanup);

  it('sets aria-disabled="true" when disabled', () => {
    const el = mount('<ekko-radio disabled>Option</ekko-radio>');
    assert.equal(innerInput(el).getAttribute('aria-disabled'), 'true');
  });

  it('does not set aria-disabled by default', () => {
    const el = mount('<ekko-radio>Option</ekko-radio>');
    assert.isNull(innerInput(el).getAttribute('aria-disabled'));
  });

  it('forwards aria-label from host to inner input', () => {
    const el = mount('<ekko-radio aria-label="Free plan"></ekko-radio>');
    assert.equal(innerInput(el).getAttribute('aria-label'), 'Free plan');
  });

  it('removes aria-label when host attribute is removed', () => {
    const el = mount('<ekko-radio aria-label="Free"></ekko-radio>');
    el.removeAttribute('aria-label');
    assert.isNull(innerInput(el).getAttribute('aria-label'));
  });

  it('forwards aria-describedby from host to inner input', () => {
    const el = mount('<ekko-radio aria-describedby="help-text">Option</ekko-radio>');
    assert.equal(innerInput(el).getAttribute('aria-describedby'), 'help-text');
  });

  it('removes aria-describedby when host attribute is removed', () => {
    const el = mount('<ekko-radio aria-describedby="help-text">Option</ekko-radio>');
    el.removeAttribute('aria-describedby');
    assert.isNull(innerInput(el).getAttribute('aria-describedby'));
  });

  it('disables inner input when disabled attribute is set', () => {
    const el = mount('<ekko-radio disabled>Option</ekko-radio>');
    assert.isTrue(innerInput(el).disabled);
  });
});

describe('ekko-radio — group behavior', () => {
  afterEach(cleanup);

  it('unchecks siblings when one is checked via property', () => {
    const radios = mountAll(`
      <div>
        <ekko-radio name="plan" value="a" checked>A</ekko-radio>
        <ekko-radio name="plan" value="b">B</ekko-radio>
        <ekko-radio name="plan" value="c">C</ekko-radio>
      </div>
    `);
    radios[1].checked = true;
    assert.isFalse(radios[0].checked);
    assert.isTrue(radios[1].checked);
    assert.isFalse(radios[2].checked);
  });

  it('unchecks siblings when one is clicked', () => {
    const radios = mountAll(`
      <div>
        <ekko-radio name="plan" value="a" checked>A</ekko-radio>
        <ekko-radio name="plan" value="b">B</ekko-radio>
      </div>
    `);
    innerInput(radios[1]).click();
    assert.isFalse(radios[0].checked);
    assert.isTrue(radios[1].checked);
  });

  it('does not affect radios with a different name', () => {
    const radios = mountAll(`
      <div>
        <ekko-radio name="plan" value="a" checked>A</ekko-radio>
        <ekko-radio name="color" value="red" checked>Red</ekko-radio>
      </div>
    `);
    radios[0].checked = false;
    assert.isTrue(radios[1].checked);
  });

  it('gives the checked radio tabindex=0 and others -1', () => {
    const radios = mountAll(`
      <div>
        <ekko-radio name="plan" value="a">A</ekko-radio>
        <ekko-radio name="plan" value="b" checked>B</ekko-radio>
        <ekko-radio name="plan" value="c">C</ekko-radio>
      </div>
    `);
    assert.equal(innerInput(radios[0]).getAttribute('tabindex'), '-1');
    assert.isNull(innerInput(radios[1]).getAttribute('tabindex'));
    assert.equal(innerInput(radios[2]).getAttribute('tabindex'), '-1');
  });

  it('defaults tabbable to the first radio when none are checked', () => {
    const radios = mountAll(`
      <div>
        <ekko-radio name="plan" value="a">A</ekko-radio>
        <ekko-radio name="plan" value="b">B</ekko-radio>
      </div>
    `);
    assert.isNull(innerInput(radios[0]).getAttribute('tabindex'));
    assert.equal(innerInput(radios[1]).getAttribute('tabindex'), '-1');
  });
});

describe('ekko-radio — keyboard', () => {
  afterEach(cleanup);

  it('selects radio on Space key', async () => {
    const el = mount('<ekko-radio>Option</ekko-radio>');
    innerInput(el).focus();

    let fired = false;
    el.addEventListener('ekko-change', () => {
      fired = true;
    });

    await sendKeys({ press: ' ' });
    assert.isTrue(fired);
    assert.isTrue(el.checked);
  });

  it('ArrowDown moves selection and focus to the next radio', async () => {
    const radios = mountAll(`
      <div>
        <ekko-radio name="plan" value="a" checked>A</ekko-radio>
        <ekko-radio name="plan" value="b">B</ekko-radio>
        <ekko-radio name="plan" value="c">C</ekko-radio>
      </div>
    `);
    innerInput(radios[0]).focus();
    await sendKeys({ press: 'ArrowDown' });
    assert.isTrue(radios[1].checked);
    assert.isFalse(radios[0].checked);
    assert.equal(document.activeElement, radios[1]);
  });

  it('ArrowUp moves selection and focus to the previous radio', async () => {
    const radios = mountAll(`
      <div>
        <ekko-radio name="plan" value="a">A</ekko-radio>
        <ekko-radio name="plan" value="b" checked>B</ekko-radio>
        <ekko-radio name="plan" value="c">C</ekko-radio>
      </div>
    `);
    innerInput(radios[1]).focus();
    await sendKeys({ press: 'ArrowUp' });
    assert.isTrue(radios[0].checked);
    assert.isFalse(radios[1].checked);
  });

  it('Arrow keys wrap at the end of the group', async () => {
    const radios = mountAll(`
      <div>
        <ekko-radio name="plan" value="a">A</ekko-radio>
        <ekko-radio name="plan" value="b">B</ekko-radio>
        <ekko-radio name="plan" value="c" checked>C</ekko-radio>
      </div>
    `);
    innerInput(radios[2]).focus();
    await sendKeys({ press: 'ArrowDown' });
    assert.isTrue(radios[0].checked);
    assert.isFalse(radios[2].checked);
  });

  it('skips disabled radios during arrow navigation', async () => {
    const radios = mountAll(`
      <div>
        <ekko-radio name="plan" value="a" checked>A</ekko-radio>
        <ekko-radio name="plan" value="b" disabled>B</ekko-radio>
        <ekko-radio name="plan" value="c">C</ekko-radio>
      </div>
    `);
    innerInput(radios[0]).focus();
    await sendKeys({ press: 'ArrowDown' });
    assert.isTrue(radios[2].checked);
    assert.isFalse(radios[1].checked);
  });

  it('does not toggle when disabled', () => {
    const el = mount('<ekko-radio disabled>Option</ekko-radio>');

    let fired = false;
    el.addEventListener('ekko-change', () => {
      fired = true;
    });

    innerInput(el).click();
    assert.isFalse(fired);
    assert.isFalse(el.checked);
  });
});

describe('ekko-radio — events', () => {
  afterEach(cleanup);

  it('dispatches ekko-change on selection', () => {
    const el = mount('<ekko-radio>Option</ekko-radio>');

    let event: Event | null = null;
    el.addEventListener('ekko-change', (e) => {
      event = e;
    });
    innerInput(el).click();

    assert.isNotNull(event);
    assert.equal((event as Event).type, 'ekko-change');
  });

  it('ekko-change bubbles', () => {
    const el = mount('<ekko-radio>Option</ekko-radio>');
    const parent = el.parentElement as HTMLElement;

    let fired = false;
    parent.addEventListener('ekko-change', () => {
      fired = true;
    });
    innerInput(el).click();

    assert.isTrue(fired);
  });

  it('ekko-change is composed (crosses Shadow DOM boundary)', () => {
    const el = mount('<ekko-radio>Option</ekko-radio>');

    let event: Event | null = null;
    document.body.addEventListener('ekko-change', (e) => {
      event = e;
    });
    innerInput(el).click();

    assert.isNotNull(event);
    assert.isTrue((event as Event).composed);
  });

  it('event detail contains checked state, value, and original event', () => {
    const el = mount('<ekko-radio value="custom">Option</ekko-radio>');

    let detail: { checked: boolean; value: string; originalEvent: Event } | null = null;
    el.addEventListener('ekko-change', (e) => {
      detail = (e as CustomEvent).detail;
    });
    innerInput(el).click();

    assert.isNotNull(detail);
    const d = detail as { checked: boolean; value: string; originalEvent: Event };
    assert.isTrue(d.checked);
    assert.equal(d.value, 'custom');
    assert.isNotNull(d.originalEvent);
  });
});

describe('ekko-radio — form participation', () => {
  afterEach(cleanup);

  it('submits the value of the checked radio', () => {
    document.body.innerHTML = `
      <form id="test-form">
        <ekko-radio name="plan" value="free">Free</ekko-radio>
        <ekko-radio name="plan" value="pro" checked>Pro</ekko-radio>
        <ekko-radio name="plan" value="team">Team</ekko-radio>
      </form>
    `;
    const form = document.getElementById('test-form') as HTMLFormElement;
    const formData = new FormData(form);
    assert.equal(formData.get('plan'), 'pro');
  });

  it('does not submit value when no radio is checked', () => {
    document.body.innerHTML = `
      <form id="test-form">
        <ekko-radio name="plan" value="free">Free</ekko-radio>
        <ekko-radio name="plan" value="pro">Pro</ekko-radio>
      </form>
    `;
    const form = document.getElementById('test-form') as HTMLFormElement;
    const formData = new FormData(form);
    assert.isNull(formData.get('plan'));
  });

  it('form getter exposes the associated form', () => {
    document.body.innerHTML = `
      <form id="test-form"><ekko-radio name="plan">Free</ekko-radio></form>
    `;
    const radio = document.querySelector('ekko-radio') as EkkoRadio;
    assert.equal(radio.form?.id, 'test-form');
  });

  it('resets to initial state on form reset', () => {
    document.body.innerHTML = `
      <form id="test-form">
        <ekko-radio name="plan" value="free" checked>Free</ekko-radio>
        <ekko-radio name="plan" value="pro">Pro</ekko-radio>
      </form>
    `;
    const form = document.getElementById('test-form') as HTMLFormElement;
    const [free, pro] = form.querySelectorAll<EkkoRadio>('ekko-radio');
    pro.checked = true;
    assert.isFalse(free.checked);
    form.reset();
    assert.isTrue(free.checked);
    assert.isFalse(pro.checked);
  });
});
