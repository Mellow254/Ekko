/**
 * Tests run in real Chromium via @web/test-runner + Playwright.
 * Covers: rendering, attributes, ARIA contract, options sync, keyboard, events, form.
 */

import { assert } from '@esm-bundle/chai';
import type { EkkoSelect } from '../src/select';
import '../src/select';

const mount = (html: string): EkkoSelect => {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container.firstElementChild as EkkoSelect;
};

const innerSelect = (el: EkkoSelect): HTMLSelectElement => {
  return el.shadowRoot?.querySelector('.select') as HTMLSelectElement;
};

const tick = (): Promise<void> => new Promise((r) => requestAnimationFrame(() => r()));

const cleanup = (): void => {
  document.body.innerHTML = '';
};

describe('ekko-select — rendering', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    assert.isDefined(customElements.get('ekko-select'));
  });

  it('renders an inner <select> element', () => {
    const el = mount('<ekko-select></ekko-select>');
    assert.isNotNull(innerSelect(el));
  });

  it('has a shadow root', () => {
    const el = mount('<ekko-select></ekko-select>');
    assert.isNotNull(el.shadowRoot);
  });

  it('exposes a "base" CSS part on the inner select', () => {
    const el = mount('<ekko-select></ekko-select>');
    assert.equal(innerSelect(el).getAttribute('part'), 'base');
  });

  it('exposes a "control" CSS part on the wrapper', () => {
    const el = mount('<ekko-select></ekko-select>');
    const control = el.shadowRoot?.querySelector('.control') as HTMLElement;
    assert.equal(control.getAttribute('part'), 'control');
  });

  it('exposes a "chevron" CSS part on the indicator', () => {
    const el = mount('<ekko-select></ekko-select>');
    const chevron = el.shadowRoot?.querySelector('.chevron') as SVGElement;
    assert.equal(chevron.getAttribute('part'), 'chevron');
  });

  it('renders label when label attribute is set', () => {
    const el = mount('<ekko-select label="Country"></ekko-select>');
    const label = el.shadowRoot?.querySelector('.label-text') as HTMLElement;
    assert.equal(label.textContent, 'Country');
  });

  it('hides label when label attribute is absent', () => {
    const el = mount('<ekko-select></ekko-select>');
    const label = el.shadowRoot?.querySelector('.label') as HTMLElement;
    assert.isTrue(label.hasAttribute('hidden'));
  });

  it('associates label with inner select via for/id', () => {
    const el = mount('<ekko-select label="Country"></ekko-select>');
    const label = el.shadowRoot?.querySelector('.label') as HTMLLabelElement;
    assert.equal(label.htmlFor, innerSelect(el).id);
  });
});

describe('ekko-select — attributes', () => {
  afterEach(cleanup);

  it('defaults size to "md"', () => {
    const el = mount('<ekko-select></ekko-select>');
    assert.equal(el.size, 'md');
  });

  it('reflects size sm/md/lg', () => {
    const el = mount('<ekko-select></ekko-select>');
    el.size = 'lg';
    assert.equal(el.getAttribute('size'), 'lg');
    el.size = 'sm';
    assert.equal(el.getAttribute('size'), 'sm');
  });

  it('clones option children into the inner select', () => {
    const el = mount(`
      <ekko-select>
        <option value="a">A</option>
        <option value="b">B</option>
      </ekko-select>
    `);
    const inner = innerSelect(el);
    assert.equal(inner.options.length, 2);
    assert.equal(inner.options[0].value, 'a');
    assert.equal(inner.options[1].value, 'b');
  });

  it('clones optgroup children into the inner select', () => {
    const el = mount(`
      <ekko-select>
        <optgroup label="Letters">
          <option value="a">A</option>
        </optgroup>
      </ekko-select>
    `);
    const inner = innerSelect(el);
    assert.equal(inner.querySelectorAll('optgroup').length, 1);
    assert.equal(inner.options.length, 1);
  });

  it('reflects value property through setter', () => {
    const el = mount(`
      <ekko-select>
        <option value="a">A</option>
        <option value="b">B</option>
      </ekko-select>
    `);
    el.value = 'b';
    assert.equal(innerSelect(el).value, 'b');
    assert.equal(el.value, 'b');
  });

  it('forwards name attribute', () => {
    const el = mount('<ekko-select name="country"></ekko-select>');
    assert.equal(innerSelect(el).name, 'country');
  });

  it('reflects multiple to inner select', () => {
    const el = mount('<ekko-select multiple></ekko-select>');
    assert.isTrue(innerSelect(el).multiple);
  });

  it('reflects disabled to inner select', () => {
    const el = mount('<ekko-select disabled></ekko-select>');
    assert.isTrue(el.disabled);
    assert.isTrue(innerSelect(el).disabled);
  });

  it('reflects required to inner select', () => {
    const el = mount('<ekko-select required></ekko-select>');
    assert.isTrue(el.required);
    assert.isTrue(innerSelect(el).required);
  });

  it('renders a hidden placeholder option when placeholder is set', () => {
    const el = mount(`
      <ekko-select placeholder="Pick one">
        <option value="a">A</option>
      </ekko-select>
    `);
    const inner = innerSelect(el);
    assert.equal(inner.options.length, 2);
    assert.equal(inner.options[0].value, '');
    assert.equal(inner.options[0].textContent, 'Pick one');
    assert.isTrue(inner.options[0].disabled);
  });

  it('forwards visible-rows as native size attribute', () => {
    const el = mount('<ekko-select visible-rows="5"></ekko-select>');
    assert.equal(innerSelect(el).getAttribute('size'), '5');
  });

  it('does not forward visible-rows of 1 or less', () => {
    const el = mount('<ekko-select visible-rows="1"></ekko-select>');
    assert.isNull(innerSelect(el).getAttribute('size'));
  });

  it('updates options when children change', async () => {
    const el = mount('<ekko-select></ekko-select>');
    const opt = document.createElement('option');
    opt.value = 'new';
    opt.textContent = 'New';
    el.appendChild(opt);
    await tick();
    assert.equal(innerSelect(el).options.length, 1);
    assert.equal(innerSelect(el).options[0].value, 'new');
  });
});

describe('ekko-select — ARIA', () => {
  afterEach(cleanup);

  it('sets aria-invalid="true" when invalid', () => {
    const el = mount('<ekko-select invalid></ekko-select>');
    assert.equal(innerSelect(el).getAttribute('aria-invalid'), 'true');
  });

  it('does not set aria-invalid by default', () => {
    const el = mount('<ekko-select></ekko-select>');
    assert.isNull(innerSelect(el).getAttribute('aria-invalid'));
  });

  it('sets aria-required when required', () => {
    const el = mount('<ekko-select required></ekko-select>');
    assert.equal(innerSelect(el).getAttribute('aria-required'), 'true');
  });

  it('sets aria-disabled when disabled', () => {
    const el = mount('<ekko-select disabled></ekko-select>');
    assert.equal(innerSelect(el).getAttribute('aria-disabled'), 'true');
  });

  it('forwards aria-label from host to inner select when no visible label', () => {
    const el = mount('<ekko-select aria-label="Country"></ekko-select>');
    assert.equal(innerSelect(el).getAttribute('aria-label'), 'Country');
  });

  it('removes aria-label when host attribute is removed', () => {
    const el = mount('<ekko-select aria-label="Country"></ekko-select>');
    el.removeAttribute('aria-label');
    assert.isNull(innerSelect(el).getAttribute('aria-label'));
  });

  it('wires help text via aria-describedby', () => {
    const el = mount('<ekko-select help="Choose your country"></ekko-select>');
    const describedBy = innerSelect(el).getAttribute('aria-describedby');
    const helpEl = el.shadowRoot?.querySelector('.help') as HTMLElement;
    assert.isNotNull(describedBy);
    assert.include(describedBy as string, helpEl.id);
  });

  it('wires error text via aria-describedby when invalid', () => {
    const el = mount('<ekko-select invalid error="Required"></ekko-select>');
    const describedBy = innerSelect(el).getAttribute('aria-describedby');
    const errorEl = el.shadowRoot?.querySelector('.error') as HTMLElement;
    assert.isNotNull(describedBy);
    assert.include(describedBy as string, errorEl.id);
  });

  it('preserves external aria-describedby alongside internal help id', () => {
    const el = mount('<ekko-select help="Hint" aria-describedby="external-note"></ekko-select>');
    const describedBy = innerSelect(el).getAttribute('aria-describedby') as string;
    assert.include(describedBy, 'external-note');
  });

  it('shows required indicator when labeled and required', () => {
    const el = mount('<ekko-select label="Country" required></ekko-select>');
    const indicator = el.shadowRoot?.querySelector('.required-indicator') as HTMLElement;
    assert.isFalse(indicator.hasAttribute('hidden'));
  });
});

describe('ekko-select — keyboard & focus', () => {
  afterEach(cleanup);

  it('focus() delegates to inner select', () => {
    const el = mount('<ekko-select><option value="a">A</option></ekko-select>');
    el.focus();
    assert.equal(el.shadowRoot?.activeElement, innerSelect(el));
  });

  it('blur() delegates to inner select', () => {
    const el = mount('<ekko-select><option value="a">A</option></ekko-select>');
    el.focus();
    el.blur();
    assert.notEqual(el.shadowRoot?.activeElement, innerSelect(el));
  });
});

describe('ekko-select — events', () => {
  afterEach(cleanup);

  it('dispatches ekko-change on change events', () => {
    const el = mount(`
      <ekko-select>
        <option value="a">A</option>
        <option value="b">B</option>
      </ekko-select>
    `);
    let detail: { value: string; originalEvent: Event } | null = null;
    el.addEventListener('ekko-change', (e) => {
      detail = (e as CustomEvent).detail;
    });
    innerSelect(el).value = 'b';
    innerSelect(el).dispatchEvent(new Event('change', { bubbles: true }));

    assert.isNotNull(detail);
    assert.equal((detail as { value: string }).value, 'b');
  });

  it('dispatches ekko-input on input events', () => {
    const el = mount(`
      <ekko-select>
        <option value="a">A</option>
        <option value="b">B</option>
      </ekko-select>
    `);
    let fired = false;
    el.addEventListener('ekko-input', () => {
      fired = true;
    });
    innerSelect(el).value = 'b';
    innerSelect(el).dispatchEvent(new Event('input', { bubbles: true }));
    assert.isTrue(fired);
  });

  it('ekko-change bubbles and is composed', () => {
    const el = mount(`
      <ekko-select>
        <option value="a">A</option>
      </ekko-select>
    `);
    let event: Event | null = null;
    document.body.addEventListener('ekko-change', (e) => {
      event = e;
    });
    innerSelect(el).dispatchEvent(new Event('change', { bubbles: true }));
    assert.isNotNull(event);
    assert.isTrue((event as Event).composed);
    assert.isTrue((event as Event).bubbles);
  });
});

describe('ekko-select — form participation', () => {
  afterEach(cleanup);

  it('participates in form submission via ElementInternals', () => {
    document.body.innerHTML = `
      <form id="test-form">
        <ekko-select name="country" value="us">
          <option value="us">US</option>
          <option value="ca">CA</option>
        </ekko-select>
      </form>
    `;
    const form = document.getElementById('test-form') as HTMLFormElement;
    const formData = new FormData(form);
    assert.equal(formData.get('country'), 'us');
  });

  it('form getter exposes the associated form', () => {
    document.body.innerHTML = `
      <form id="test-form"><ekko-select name="x"></ekko-select></form>
    `;
    const sel = document.querySelector('ekko-select') as EkkoSelect;
    assert.equal(sel.form?.id, 'test-form');
  });

  it('resets to initial value on form reset', () => {
    document.body.innerHTML = `
      <form id="test-form">
        <ekko-select name="country" value="us">
          <option value="us">US</option>
          <option value="ca">CA</option>
        </ekko-select>
      </form>
    `;
    const form = document.getElementById('test-form') as HTMLFormElement;
    const sel = form.querySelector('ekko-select') as EkkoSelect;
    sel.value = 'ca';
    form.reset();
    assert.equal(sel.value, 'us');
  });

  it('checkValidity returns false for required empty select with placeholder', () => {
    const el = mount(`
      <ekko-select required placeholder="Choose">
        <option value="a">A</option>
      </ekko-select>
    `);
    assert.isFalse(el.checkValidity());
  });
});

describe('ekko-select — methods', () => {
  afterEach(cleanup);

  it('exposes options collection', () => {
    const el = mount(`
      <ekko-select>
        <option value="a">A</option>
        <option value="b">B</option>
      </ekko-select>
    `);
    assert.equal(el.options.length, 2);
  });

  it('exposes selectedIndex', () => {
    const el = mount(`
      <ekko-select>
        <option value="a">A</option>
        <option value="b" selected>B</option>
      </ekko-select>
    `);
    assert.equal(el.selectedIndex, 1);
  });

  it('setCustomValidity flags the select as invalid', () => {
    const el = mount('<ekko-select><option value="a">A</option></ekko-select>');
    el.setCustomValidity('Always wrong');
    assert.isFalse(el.checkValidity());
    assert.equal(el.validationMessage, 'Always wrong');
  });

  it('validity getter exposes ValidityState', () => {
    const el = mount(`
      <ekko-select required placeholder="Choose">
        <option value="a">A</option>
      </ekko-select>
    `);
    assert.isTrue(el.validity.valueMissing);
  });

  it('setters reflect to attributes', () => {
    const el = mount('<ekko-select></ekko-select>');
    el.name = 'country';
    el.placeholder = 'Pick one';
    el.label = 'Country';
    el.disabled = true;
    el.required = true;
    el.invalid = true;
    el.multiple = true;
    assert.equal(el.getAttribute('name'), 'country');
    assert.equal(el.getAttribute('placeholder'), 'Pick one');
    assert.equal(el.getAttribute('label'), 'Country');
    assert.isTrue(el.hasAttribute('disabled'));
    assert.isTrue(el.hasAttribute('required'));
    assert.isTrue(el.hasAttribute('invalid'));
    assert.isTrue(el.hasAttribute('multiple'));
  });

  it('removes attributes via setter when unset', () => {
    const el = mount('<ekko-select disabled required invalid multiple></ekko-select>');
    el.disabled = false;
    el.required = false;
    el.invalid = false;
    el.multiple = false;
    assert.isFalse(el.hasAttribute('disabled'));
    assert.isFalse(el.hasAttribute('required'));
    assert.isFalse(el.hasAttribute('invalid'));
    assert.isFalse(el.hasAttribute('multiple'));
  });

  it('disconnects cleanly when removed from the DOM', () => {
    const el = mount('<ekko-select></ekko-select>');
    el.remove();
    assert.isFalse(document.body.contains(el));
  });
});

describe('ekko-select — base-select picker', () => {
  afterEach(cleanup);

  const supportsBasePicker = (): boolean =>
    typeof CSS !== 'undefined' && CSS.supports('appearance', 'base-select');

  it('injects a <button><selectedcontent></selectedcontent></button> trigger when supported', () => {
    if (!supportsBasePicker()) return;
    const el = mount('<ekko-select><option value="a">A</option></ekko-select>');
    const trigger = innerSelect(el).querySelector(':scope > button');
    assert.isNotNull(trigger);
    assert.isNotNull(trigger?.querySelector('selectedcontent'));
  });

  it('marks host with data-base-picker attribute when supported', () => {
    if (!supportsBasePicker()) return;
    const el = mount('<ekko-select></ekko-select>');
    assert.isTrue(el.hasAttribute('data-base-picker'));
  });

  it('does not strip the trigger when options re-sync', async () => {
    if (!supportsBasePicker()) return;
    const el = mount(`
      <ekko-select>
        <option value="a">A</option>
      </ekko-select>
    `);
    const opt = document.createElement('option');
    opt.value = 'b';
    opt.textContent = 'B';
    el.appendChild(opt);
    await tick();
    const trigger = innerSelect(el).querySelector(':scope > button');
    assert.isNotNull(trigger);
    assert.equal(innerSelect(el).options.length, 2);
  });
});

describe('ekko-select — messages', () => {
  afterEach(cleanup);

  it('renders help text when help attribute is set', () => {
    const el = mount('<ekko-select help="Pick the right one"></ekko-select>');
    const help = el.shadowRoot?.querySelector('.help') as HTMLElement;
    assert.equal(help.textContent, 'Pick the right one');
    assert.isFalse(help.hasAttribute('hidden'));
  });

  it('renders error text when error attribute is set', () => {
    const el = mount('<ekko-select error="Required"></ekko-select>');
    const error = el.shadowRoot?.querySelector('.error') as HTMLElement;
    assert.equal(error.textContent, 'Required');
  });
});
