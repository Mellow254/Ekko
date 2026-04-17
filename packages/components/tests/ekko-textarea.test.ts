import { assert } from '@esm-bundle/chai';
import { sendKeys } from '@web/test-runner-commands';
import type { EkkoTextarea } from '../src/textarea';
import '../src/textarea';

const mount = (html: string): EkkoTextarea => {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container.firstElementChild as EkkoTextarea;
};

const innerTextarea = (el: EkkoTextarea): HTMLTextAreaElement => {
  return el.shadowRoot?.querySelector('.textarea') as HTMLTextAreaElement;
};

const cleanup = (): void => {
  document.body.innerHTML = '';
};

describe('ekko-textarea — rendering', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    assert.isDefined(customElements.get('ekko-textarea'));
  });

  it('renders an inner <textarea> element', () => {
    const el = mount('<ekko-textarea></ekko-textarea>');
    assert.isNotNull(innerTextarea(el));
    assert.equal(innerTextarea(el).tagName, 'TEXTAREA');
  });

  it('has a shadow root', () => {
    const el = mount('<ekko-textarea></ekko-textarea>');
    assert.isNotNull(el.shadowRoot);
  });

  it('exposes a "base" CSS part on the inner textarea', () => {
    const el = mount('<ekko-textarea></ekko-textarea>');
    assert.equal(innerTextarea(el).getAttribute('part'), 'base');
  });

  it('exposes a "control" CSS part on the wrapper', () => {
    const el = mount('<ekko-textarea></ekko-textarea>');
    const control = el.shadowRoot?.querySelector('.control') as HTMLElement;
    assert.equal(control.getAttribute('part'), 'control');
  });

  it('renders label when label attribute is set', () => {
    const el = mount('<ekko-textarea label="Bio"></ekko-textarea>');
    const label = el.shadowRoot?.querySelector('.label-text') as HTMLElement;
    assert.equal(label.textContent, 'Bio');
  });

  it('hides label when label attribute is absent', () => {
    const el = mount('<ekko-textarea></ekko-textarea>');
    const label = el.shadowRoot?.querySelector('.label') as HTMLElement;
    assert.isTrue(label.hasAttribute('hidden'));
  });

  it('associates label with inner textarea via for/id', () => {
    const el = mount('<ekko-textarea label="Bio"></ekko-textarea>');
    const label = el.shadowRoot?.querySelector('.label') as HTMLLabelElement;
    assert.equal(label.htmlFor, innerTextarea(el).id);
  });
});

describe('ekko-textarea — attributes', () => {
  afterEach(cleanup);

  it('defaults size to "md"', () => {
    const el = mount('<ekko-textarea></ekko-textarea>');
    assert.equal(el.size, 'md');
  });

  it('defaults resize to "vertical"', () => {
    const el = mount('<ekko-textarea></ekko-textarea>');
    assert.equal(el.resize, 'vertical');
  });

  it('forwards placeholder to inner textarea', () => {
    const el = mount('<ekko-textarea placeholder="Tell us…"></ekko-textarea>');
    assert.equal(innerTextarea(el).placeholder, 'Tell us…');
  });

  it('forwards rows to inner textarea', () => {
    const el = mount('<ekko-textarea rows="8"></ekko-textarea>');
    assert.equal(innerTextarea(el).rows, 8);
    assert.equal(el.rows, 8);
  });

  it('forwards cols to inner textarea', () => {
    const el = mount('<ekko-textarea cols="40"></ekko-textarea>');
    assert.equal(innerTextarea(el).cols, 40);
    assert.equal(el.cols, 40);
  });

  it('forwards wrap to inner textarea', () => {
    const el = mount('<ekko-textarea wrap="hard"></ekko-textarea>');
    assert.equal(innerTextarea(el).wrap, 'hard');
  });

  it('forwards minlength / maxlength', () => {
    const el = mount('<ekko-textarea minlength="2" maxlength="500"></ekko-textarea>');
    const inner = innerTextarea(el);
    assert.equal(inner.minLength, 2);
    assert.equal(inner.maxLength, 500);
  });

  it('forwards autocomplete', () => {
    const el = mount('<ekko-textarea autocomplete="off"></ekko-textarea>');
    assert.equal(innerTextarea(el).autocomplete, 'off');
  });

  it('reflects value property through setter', () => {
    const el = mount('<ekko-textarea value="initial"></ekko-textarea>');
    assert.equal(el.value, 'initial');
    el.value = 'updated';
    assert.equal(innerTextarea(el).value, 'updated');
  });

  it('reflects disabled to inner textarea', () => {
    const el = mount('<ekko-textarea disabled></ekko-textarea>');
    assert.isTrue(el.disabled);
    assert.isTrue(innerTextarea(el).disabled);
  });

  it('reflects readonly to inner textarea', () => {
    const el = mount('<ekko-textarea readonly></ekko-textarea>');
    assert.isTrue(el.readOnly);
    assert.isTrue(innerTextarea(el).readOnly);
  });

  it('reflects required to inner textarea', () => {
    const el = mount('<ekko-textarea required></ekko-textarea>');
    assert.isTrue(el.required);
    assert.isTrue(innerTextarea(el).required);
  });

  it('reflects loading disables the inner textarea', () => {
    const el = mount('<ekko-textarea loading></ekko-textarea>');
    assert.isTrue(el.loading);
    assert.isTrue(innerTextarea(el).disabled);
  });
});

describe('ekko-textarea — ARIA', () => {
  afterEach(cleanup);

  it('sets aria-invalid="true" when invalid', () => {
    const el = mount('<ekko-textarea invalid></ekko-textarea>');
    assert.equal(innerTextarea(el).getAttribute('aria-invalid'), 'true');
  });

  it('does not set aria-invalid by default', () => {
    const el = mount('<ekko-textarea></ekko-textarea>');
    assert.isNull(innerTextarea(el).getAttribute('aria-invalid'));
  });

  it('sets aria-required when required', () => {
    const el = mount('<ekko-textarea required></ekko-textarea>');
    assert.equal(innerTextarea(el).getAttribute('aria-required'), 'true');
  });

  it('sets aria-disabled when disabled', () => {
    const el = mount('<ekko-textarea disabled></ekko-textarea>');
    assert.equal(innerTextarea(el).getAttribute('aria-disabled'), 'true');
  });

  it('sets aria-busy when loading', () => {
    const el = mount('<ekko-textarea loading></ekko-textarea>');
    assert.equal(innerTextarea(el).getAttribute('aria-busy'), 'true');
  });

  it('forwards aria-label from host to inner textarea', () => {
    const el = mount('<ekko-textarea aria-label="Bio"></ekko-textarea>');
    assert.equal(innerTextarea(el).getAttribute('aria-label'), 'Bio');
  });

  it('removes aria-label when host attribute is removed', () => {
    const el = mount('<ekko-textarea aria-label="Bio"></ekko-textarea>');
    el.removeAttribute('aria-label');
    assert.isNull(innerTextarea(el).getAttribute('aria-label'));
  });

  it('wires help text via aria-describedby', () => {
    const el = mount('<ekko-textarea help="Max 500 chars"></ekko-textarea>');
    const describedBy = innerTextarea(el).getAttribute('aria-describedby');
    const helpEl = el.shadowRoot?.querySelector('.help') as HTMLElement;
    assert.isNotNull(describedBy);
    assert.include(describedBy as string, helpEl.id);
  });

  it('wires error text via aria-describedby when invalid', () => {
    const el = mount('<ekko-textarea invalid error="Required"></ekko-textarea>');
    const describedBy = innerTextarea(el).getAttribute('aria-describedby');
    const errorEl = el.shadowRoot?.querySelector('.error') as HTMLElement;
    assert.isNotNull(describedBy);
    assert.include(describedBy as string, errorEl.id);
  });

  it('preserves external aria-describedby alongside internal help id', () => {
    const el = mount(
      '<ekko-textarea help="Hint" aria-describedby="external-note"></ekko-textarea>'
    );
    const describedBy = innerTextarea(el).getAttribute('aria-describedby') as string;
    assert.include(describedBy, 'external-note');
  });

  it('shows required indicator when labeled and required', () => {
    const el = mount('<ekko-textarea label="Bio" required></ekko-textarea>');
    const indicator = el.shadowRoot?.querySelector('.required-indicator') as HTMLElement;
    assert.isFalse(indicator.hasAttribute('hidden'));
  });
});

describe('ekko-textarea — keyboard & focus', () => {
  afterEach(cleanup);

  it('focus() delegates to inner textarea', () => {
    const el = mount('<ekko-textarea></ekko-textarea>');
    el.focus();
    assert.equal(el.shadowRoot?.activeElement, innerTextarea(el));
  });

  it('blur() delegates to inner textarea', () => {
    const el = mount('<ekko-textarea></ekko-textarea>');
    el.focus();
    el.blur();
    assert.notEqual(el.shadowRoot?.activeElement, innerTextarea(el));
  });

  it('accepts typed input via keyboard', async () => {
    const el = mount('<ekko-textarea></ekko-textarea>');
    el.focus();
    await sendKeys({ type: 'hello' });
    assert.equal(el.value, 'hello');
  });

  it('accepts newlines via Enter key', async () => {
    const el = mount('<ekko-textarea></ekko-textarea>');
    el.focus();
    await sendKeys({ type: 'line one' });
    await sendKeys({ press: 'Enter' });
    await sendKeys({ type: 'line two' });
    assert.equal(el.value, 'line one\nline two');
  });
});

describe('ekko-textarea — events', () => {
  afterEach(cleanup);

  it('dispatches ekko-input on input events', () => {
    const el = mount('<ekko-textarea></ekko-textarea>');
    let detail: { value: string; originalEvent: Event } | null = null;
    el.addEventListener('ekko-input', (e) => {
      detail = (e as CustomEvent).detail;
    });
    innerTextarea(el).value = 'typed';
    innerTextarea(el).dispatchEvent(new Event('input', { bubbles: true }));

    assert.isNotNull(detail);
    assert.equal((detail as { value: string }).value, 'typed');
  });

  it('dispatches ekko-change on change events', () => {
    const el = mount('<ekko-textarea></ekko-textarea>');
    let fired = false;
    el.addEventListener('ekko-change', () => {
      fired = true;
    });
    innerTextarea(el).value = 'done';
    innerTextarea(el).dispatchEvent(new Event('change', { bubbles: true }));
    assert.isTrue(fired);
  });

  it('ekko-input bubbles and is composed', () => {
    const el = mount('<ekko-textarea></ekko-textarea>');
    let event: Event | null = null;
    document.body.addEventListener('ekko-input', (e) => {
      event = e;
    });
    innerTextarea(el).dispatchEvent(new Event('input', { bubbles: true }));
    assert.isNotNull(event);
    assert.isTrue((event as Event).composed);
    assert.isTrue((event as Event).bubbles);
  });
});

describe('ekko-textarea — form participation', () => {
  afterEach(cleanup);

  it('participates in form submission via ElementInternals', () => {
    document.body.innerHTML = `
      <form id="test-form">
        <ekko-textarea name="bio" value="hello"></ekko-textarea>
        <button type="submit">Go</button>
      </form>
    `;
    const form = document.getElementById('test-form') as HTMLFormElement;
    const formData = new FormData(form);
    assert.equal(formData.get('bio'), 'hello');
  });

  it('form getter exposes the associated form', () => {
    document.body.innerHTML = `
      <form id="test-form"><ekko-textarea name="bio"></ekko-textarea></form>
    `;
    const textarea = document.querySelector('ekko-textarea') as EkkoTextarea;
    assert.equal(textarea.form?.id, 'test-form');
  });

  it('resets to initial value on form reset', () => {
    document.body.innerHTML = `
      <form id="test-form">
        <ekko-textarea name="bio" value="original"></ekko-textarea>
      </form>
    `;
    const form = document.getElementById('test-form') as HTMLFormElement;
    const textarea = form.querySelector('ekko-textarea') as EkkoTextarea;
    textarea.value = 'changed';
    form.reset();
    assert.equal(textarea.value, 'original');
  });

  it('checkValidity returns false for empty required textarea', () => {
    const el = mount('<ekko-textarea required></ekko-textarea>');
    assert.isFalse(el.checkValidity());
  });
});

describe('ekko-textarea — methods', () => {
  afterEach(cleanup);

  it('select() selects the textarea contents', () => {
    const el = mount('<ekko-textarea value="hello"></ekko-textarea>');
    el.focus();
    el.select();
    assert.equal(innerTextarea(el).selectionStart, 0);
    assert.equal(innerTextarea(el).selectionEnd, 5);
  });

  it('setSelectionRange() sets the selection range', () => {
    const el = mount('<ekko-textarea value="hello world"></ekko-textarea>');
    el.focus();
    el.setSelectionRange(0, 5);
    assert.equal(innerTextarea(el).selectionStart, 0);
    assert.equal(innerTextarea(el).selectionEnd, 5);
  });

  it('setRangeText replaces text within range', () => {
    const el = mount('<ekko-textarea value="hello world"></ekko-textarea>');
    el.setRangeText('brave', 6, 11, 'select');
    assert.equal(el.value, 'hello brave');
  });

  it('setCustomValidity flags the textarea as invalid', () => {
    const el = mount('<ekko-textarea></ekko-textarea>');
    el.setCustomValidity('Always wrong');
    assert.isFalse(el.checkValidity());
    assert.equal(el.validationMessage, 'Always wrong');
  });

  it('validity getter exposes ValidityState', () => {
    const el = mount('<ekko-textarea required></ekko-textarea>');
    assert.isTrue(el.validity.valueMissing);
  });

  it('textLength getter exposes current length', () => {
    const el = mount('<ekko-textarea value="abcd"></ekko-textarea>');
    assert.equal(el.textLength, 4);
  });

  it('setters reflect to attributes', () => {
    const el = mount('<ekko-textarea></ekko-textarea>');
    el.name = 'bio';
    el.placeholder = 'Tell us…';
    el.label = 'Bio';
    el.rows = 6;
    el.cols = 30;
    el.wrap = 'hard';
    el.resize = 'none';
    el.disabled = true;
    el.readOnly = true;
    el.required = true;
    el.invalid = true;
    el.loading = true;
    assert.equal(el.getAttribute('name'), 'bio');
    assert.equal(el.getAttribute('placeholder'), 'Tell us…');
    assert.equal(el.getAttribute('label'), 'Bio');
    assert.equal(el.getAttribute('rows'), '6');
    assert.equal(el.getAttribute('cols'), '30');
    assert.equal(el.getAttribute('wrap'), 'hard');
    assert.equal(el.getAttribute('resize'), 'none');
    assert.isTrue(el.hasAttribute('disabled'));
    assert.isTrue(el.hasAttribute('readonly'));
    assert.isTrue(el.hasAttribute('required'));
    assert.isTrue(el.hasAttribute('invalid'));
    assert.isTrue(el.hasAttribute('loading'));
  });

  it('removes attributes via setter when unset', () => {
    const el = mount('<ekko-textarea disabled readonly required invalid loading></ekko-textarea>');
    el.disabled = false;
    el.readOnly = false;
    el.required = false;
    el.invalid = false;
    el.loading = false;
    assert.isFalse(el.hasAttribute('disabled'));
    assert.isFalse(el.hasAttribute('readonly'));
    assert.isFalse(el.hasAttribute('required'));
    assert.isFalse(el.hasAttribute('invalid'));
    assert.isFalse(el.hasAttribute('loading'));
  });

  it('disconnects cleanly when removed from the DOM', () => {
    const el = mount('<ekko-textarea></ekko-textarea>');
    el.remove();
    assert.isFalse(document.body.contains(el));
  });

  it('size setter reflects to attribute', () => {
    const el = mount('<ekko-textarea></ekko-textarea>');
    el.size = 'lg';
    assert.equal(el.getAttribute('size'), 'lg');
  });
});

describe('ekko-textarea — messages', () => {
  afterEach(cleanup);

  it('renders help text when help attribute is set', () => {
    const el = mount('<ekko-textarea help="Max 500 chars"></ekko-textarea>');
    const help = el.shadowRoot?.querySelector('.help') as HTMLElement;
    assert.equal(help.textContent, 'Max 500 chars');
    assert.isFalse(help.hasAttribute('hidden'));
  });

  it('renders error text when error attribute is set', () => {
    const el = mount('<ekko-textarea error="Required"></ekko-textarea>');
    const error = el.shadowRoot?.querySelector('.error') as HTMLElement;
    assert.equal(error.textContent, 'Required');
  });
});
