/**
 * Tests run in real Chromium via @web/test-runner + Playwright.
 * Covers: rendering, attributes, ARIA contract, type forwarding, keyboard, events, form.
 */

import { assert } from '@esm-bundle/chai';
import { sendKeys } from '@web/test-runner-commands';
import type { EkkoInput } from '../src/input';
import '../src/input';

const mount = (html: string): EkkoInput => {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container.firstElementChild as EkkoInput;
};

const innerInput = (el: EkkoInput): HTMLInputElement => {
  return el.shadowRoot?.querySelector('.input') as HTMLInputElement;
};

const cleanup = (): void => {
  document.body.innerHTML = '';
};

describe('ekko-input — rendering', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    assert.isDefined(customElements.get('ekko-input'));
  });

  it('renders an inner <input> element', () => {
    const el = mount('<ekko-input></ekko-input>');
    assert.isNotNull(innerInput(el));
  });

  it('has a shadow root', () => {
    const el = mount('<ekko-input></ekko-input>');
    assert.isNotNull(el.shadowRoot);
  });

  it('exposes a "base" CSS part on the inner input', () => {
    const el = mount('<ekko-input></ekko-input>');
    assert.equal(innerInput(el).getAttribute('part'), 'base');
  });

  it('exposes a "control" CSS part on the wrapper', () => {
    const el = mount('<ekko-input></ekko-input>');
    const control = el.shadowRoot?.querySelector('.control') as HTMLElement;
    assert.equal(control.getAttribute('part'), 'control');
  });

  it('renders label when label attribute is set', () => {
    const el = mount('<ekko-input label="Email"></ekko-input>');
    const label = el.shadowRoot?.querySelector('.label-text') as HTMLElement;
    assert.equal(label.textContent, 'Email');
  });

  it('hides label when label attribute is absent', () => {
    const el = mount('<ekko-input></ekko-input>');
    const label = el.shadowRoot?.querySelector('.label') as HTMLElement;
    assert.isTrue(label.hasAttribute('hidden'));
  });

  it('associates label with inner input via for/id', () => {
    const el = mount('<ekko-input label="Email"></ekko-input>');
    const label = el.shadowRoot?.querySelector('.label') as HTMLLabelElement;
    assert.equal(label.htmlFor, innerInput(el).id);
  });
});

describe('ekko-input — attributes', () => {
  afterEach(cleanup);

  it('defaults type to "text"', () => {
    const el = mount('<ekko-input></ekko-input>');
    assert.equal(el.type, 'text');
    assert.equal(innerInput(el).type, 'text');
  });

  it('defaults size to "md"', () => {
    const el = mount('<ekko-input></ekko-input>');
    assert.equal(el.size, 'md');
  });

  it('forwards type attribute to inner input', () => {
    const el = mount('<ekko-input type="email"></ekko-input>');
    assert.equal(innerInput(el).type, 'email');
  });

  it('supports all documented types', () => {
    const types = [
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
    ];
    for (const t of types) {
      const el = mount(`<ekko-input type="${t}"></ekko-input>`);
      assert.equal(innerInput(el).type, t, `type="${t}" should forward`);
      cleanup();
    }
  });

  it('forwards placeholder to inner input', () => {
    const el = mount('<ekko-input placeholder="you@example.com"></ekko-input>');
    assert.equal(innerInput(el).placeholder, 'you@example.com');
  });

  it('forwards min/max/step for number', () => {
    const el = mount('<ekko-input type="number" min="0" max="10" step="2"></ekko-input>');
    const inner = innerInput(el);
    assert.equal(inner.min, '0');
    assert.equal(inner.max, '10');
    assert.equal(inner.step, '2');
  });

  it('forwards pattern / minlength / maxlength for text-likes', () => {
    const el = mount('<ekko-input pattern="[A-Z]+" minlength="2" maxlength="10"></ekko-input>');
    const inner = innerInput(el);
    assert.equal(inner.pattern, '[A-Z]+');
    assert.equal(inner.minLength, 2);
    assert.equal(inner.maxLength, 10);
  });

  it('forwards accept and multiple for file', () => {
    const el = mount('<ekko-input type="file" accept="image/*" multiple></ekko-input>');
    const inner = innerInput(el);
    assert.equal(inner.accept, 'image/*');
    assert.isTrue(inner.multiple);
  });

  it('forwards autocomplete', () => {
    const el = mount('<ekko-input autocomplete="email"></ekko-input>');
    assert.equal(innerInput(el).autocomplete, 'email');
  });

  it('reflects value property through setter', () => {
    const el = mount('<ekko-input value="initial"></ekko-input>');
    assert.equal(el.value, 'initial');
    el.value = 'updated';
    assert.equal(innerInput(el).value, 'updated');
  });

  it('reflects disabled to inner input', () => {
    const el = mount('<ekko-input disabled></ekko-input>');
    assert.isTrue(el.disabled);
    assert.isTrue(innerInput(el).disabled);
  });

  it('reflects readonly to inner input', () => {
    const el = mount('<ekko-input readonly></ekko-input>');
    assert.isTrue(el.readOnly);
    assert.isTrue(innerInput(el).readOnly);
  });

  it('reflects required to inner input', () => {
    const el = mount('<ekko-input required></ekko-input>');
    assert.isTrue(el.required);
    assert.isTrue(innerInput(el).required);
  });
});

describe('ekko-input — ARIA', () => {
  afterEach(cleanup);

  it('sets aria-invalid="true" when invalid', () => {
    const el = mount('<ekko-input invalid></ekko-input>');
    assert.equal(innerInput(el).getAttribute('aria-invalid'), 'true');
  });

  it('does not set aria-invalid by default', () => {
    const el = mount('<ekko-input></ekko-input>');
    assert.isNull(innerInput(el).getAttribute('aria-invalid'));
  });

  it('sets aria-required when required', () => {
    const el = mount('<ekko-input required></ekko-input>');
    assert.equal(innerInput(el).getAttribute('aria-required'), 'true');
  });

  it('sets aria-disabled when disabled', () => {
    const el = mount('<ekko-input disabled></ekko-input>');
    assert.equal(innerInput(el).getAttribute('aria-disabled'), 'true');
  });

  it('forwards aria-label from host to inner input when no visible label', () => {
    const el = mount('<ekko-input aria-label="Search site"></ekko-input>');
    assert.equal(innerInput(el).getAttribute('aria-label'), 'Search site');
  });

  it('removes aria-label when host attribute is removed', () => {
    const el = mount('<ekko-input aria-label="Search"></ekko-input>');
    el.removeAttribute('aria-label');
    assert.isNull(innerInput(el).getAttribute('aria-label'));
  });

  it('wires help text via aria-describedby', () => {
    const el = mount('<ekko-input help="We never share your email"></ekko-input>');
    const describedBy = innerInput(el).getAttribute('aria-describedby');
    const helpEl = el.shadowRoot?.querySelector('.help') as HTMLElement;
    assert.isNotNull(describedBy);
    assert.include(describedBy as string, helpEl.id);
  });

  it('wires error text via aria-describedby when invalid', () => {
    const el = mount('<ekko-input invalid error="Required field"></ekko-input>');
    const describedBy = innerInput(el).getAttribute('aria-describedby');
    const errorEl = el.shadowRoot?.querySelector('.error') as HTMLElement;
    assert.isNotNull(describedBy);
    assert.include(describedBy as string, errorEl.id);
  });

  it('preserves external aria-describedby alongside internal help id', () => {
    const el = mount('<ekko-input help="Hint" aria-describedby="external-note"></ekko-input>');
    const describedBy = innerInput(el).getAttribute('aria-describedby') as string;
    assert.include(describedBy, 'external-note');
  });

  it('shows required indicator when labeled and required', () => {
    const el = mount('<ekko-input label="Email" required></ekko-input>');
    const indicator = el.shadowRoot?.querySelector('.required-indicator') as HTMLElement;
    assert.isFalse(indicator.hasAttribute('hidden'));
  });
});

describe('ekko-input — keyboard & focus', () => {
  afterEach(cleanup);

  it('focus() delegates to inner input', () => {
    const el = mount('<ekko-input></ekko-input>');
    el.focus();
    assert.equal(el.shadowRoot?.activeElement, innerInput(el));
  });

  it('blur() delegates to inner input', () => {
    const el = mount('<ekko-input></ekko-input>');
    el.focus();
    el.blur();
    assert.notEqual(el.shadowRoot?.activeElement, innerInput(el));
  });

  it('accepts typed input via keyboard', async () => {
    const el = mount('<ekko-input></ekko-input>');
    el.focus();
    await sendKeys({ type: 'hello' });
    assert.equal(el.value, 'hello');
  });
});

describe('ekko-input — events', () => {
  afterEach(cleanup);

  it('dispatches ekko-input on input events', () => {
    const el = mount('<ekko-input></ekko-input>');
    let detail: { value: string; originalEvent: Event } | null = null;
    el.addEventListener('ekko-input', (e) => {
      detail = (e as CustomEvent).detail;
    });
    innerInput(el).value = 'typed';
    innerInput(el).dispatchEvent(new Event('input', { bubbles: true }));

    assert.isNotNull(detail);
    assert.equal((detail as { value: string }).value, 'typed');
  });

  it('dispatches ekko-change on change events', () => {
    const el = mount('<ekko-input></ekko-input>');
    let fired = false;
    el.addEventListener('ekko-change', () => {
      fired = true;
    });
    innerInput(el).value = 'done';
    innerInput(el).dispatchEvent(new Event('change', { bubbles: true }));
    assert.isTrue(fired);
  });

  it('ekko-input bubbles and is composed', () => {
    const el = mount('<ekko-input></ekko-input>');
    let event: Event | null = null;
    document.body.addEventListener('ekko-input', (e) => {
      event = e;
    });
    innerInput(el).dispatchEvent(new Event('input', { bubbles: true }));
    assert.isNotNull(event);
    assert.isTrue((event as Event).composed);
    assert.isTrue((event as Event).bubbles);
  });
});

describe('ekko-input — form participation', () => {
  afterEach(cleanup);

  it('participates in form submission via ElementInternals', () => {
    document.body.innerHTML = `
      <form id="test-form">
        <ekko-input name="username" value="ada"></ekko-input>
        <button type="submit">Go</button>
      </form>
    `;
    const form = document.getElementById('test-form') as HTMLFormElement;
    const formData = new FormData(form);
    assert.equal(formData.get('username'), 'ada');
  });

  it('form getter exposes the associated form', () => {
    document.body.innerHTML = `
      <form id="test-form"><ekko-input name="x"></ekko-input></form>
    `;
    const input = document.querySelector('ekko-input') as EkkoInput;
    assert.equal(input.form?.id, 'test-form');
  });

  it('resets to initial value on form reset', () => {
    document.body.innerHTML = `
      <form id="test-form">
        <ekko-input name="username" value="ada"></ekko-input>
      </form>
    `;
    const form = document.getElementById('test-form') as HTMLFormElement;
    const input = form.querySelector('ekko-input') as EkkoInput;
    input.value = 'changed';
    form.reset();
    assert.equal(input.value, 'ada');
  });

  it('checkValidity returns false for empty required input', () => {
    const el = mount('<ekko-input required></ekko-input>');
    assert.isFalse(el.checkValidity());
  });

  it('checkValidity returns true for a valid email', () => {
    const el = mount('<ekko-input type="email" value="a@b.co"></ekko-input>');
    assert.isTrue(el.checkValidity());
  });
});

describe('ekko-input — methods', () => {
  afterEach(cleanup);

  it('select() selects the input contents', () => {
    const el = mount('<ekko-input value="hello"></ekko-input>');
    el.focus();
    el.select();
    assert.equal(innerInput(el).selectionStart, 0);
    assert.equal(innerInput(el).selectionEnd, 5);
  });

  it('setSelectionRange() sets the selection range', () => {
    const el = mount('<ekko-input value="hello world"></ekko-input>');
    el.focus();
    el.setSelectionRange(0, 5);
    assert.equal(innerInput(el).selectionStart, 0);
    assert.equal(innerInput(el).selectionEnd, 5);
  });

  it('setCustomValidity flags the input as invalid', () => {
    const el = mount('<ekko-input></ekko-input>');
    el.setCustomValidity('Always wrong');
    assert.isFalse(el.checkValidity());
    assert.equal(el.validationMessage, 'Always wrong');
  });

  it('reportValidity returns a boolean', () => {
    const el = mount('<ekko-input required></ekko-input>');
    assert.isFalse(el.reportValidity());
  });

  it('validity getter exposes ValidityState', () => {
    const el = mount('<ekko-input required></ekko-input>');
    assert.isTrue(el.validity.valueMissing);
  });

  it('setters reflect to attributes', () => {
    const el = mount('<ekko-input></ekko-input>');
    el.name = 'email';
    el.placeholder = 'you@ex.com';
    el.label = 'Email';
    el.disabled = true;
    el.readOnly = true;
    el.required = true;
    el.invalid = true;
    assert.equal(el.getAttribute('name'), 'email');
    assert.equal(el.getAttribute('placeholder'), 'you@ex.com');
    assert.equal(el.getAttribute('label'), 'Email');
    assert.isTrue(el.hasAttribute('disabled'));
    assert.isTrue(el.hasAttribute('readonly'));
    assert.isTrue(el.hasAttribute('required'));
    assert.isTrue(el.hasAttribute('invalid'));
  });

  it('removes attributes via setter when unset', () => {
    const el = mount('<ekko-input disabled readonly required invalid></ekko-input>');
    el.disabled = false;
    el.readOnly = false;
    el.required = false;
    el.invalid = false;
    assert.isFalse(el.hasAttribute('disabled'));
    assert.isFalse(el.hasAttribute('readonly'));
    assert.isFalse(el.hasAttribute('required'));
    assert.isFalse(el.hasAttribute('invalid'));
  });

  it('detects start/end adornment slots', async () => {
    const el = mount(
      '<ekko-input><span slot="start">$</span><span slot="end">.00</span></ekko-input>'
    );
    await new Promise((r) => requestAnimationFrame(r));
    const control = el.shadowRoot?.querySelector('.control') as HTMLElement;
    assert.isTrue(control.classList.contains('has-start'));
    assert.isTrue(control.classList.contains('has-end'));
  });

  it('disconnects cleanly when removed from the DOM', () => {
    const el = mount('<ekko-input></ekko-input>');
    el.remove();
    assert.isFalse(document.body.contains(el));
  });

  it('size setter reflects to attribute', () => {
    const el = mount('<ekko-input></ekko-input>');
    el.size = 'lg';
    assert.equal(el.getAttribute('size'), 'lg');
  });
});

describe('ekko-input — messages', () => {
  afterEach(cleanup);

  it('renders help text when help attribute is set', () => {
    const el = mount('<ekko-input help="Max 140 chars"></ekko-input>');
    const help = el.shadowRoot?.querySelector('.help') as HTMLElement;
    assert.equal(help.textContent, 'Max 140 chars');
    assert.isFalse(help.hasAttribute('hidden'));
  });

  it('renders error text when error attribute is set', () => {
    const el = mount('<ekko-input error="Required"></ekko-input>');
    const error = el.shadowRoot?.querySelector('.error') as HTMLElement;
    assert.equal(error.textContent, 'Required');
  });
});
