import { assert } from '@esm-bundle/chai';
import { sendKeys } from '@web/test-runner-commands';
import type { EkkoCheckbox } from '../src/checkbox';
import '../src/checkbox';

const mount = (html: string): EkkoCheckbox => {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container.firstElementChild as EkkoCheckbox;
};

const innerInput = (el: EkkoCheckbox): HTMLInputElement => {
  return el.shadowRoot?.querySelector('.input') as HTMLInputElement;
};

const cleanup = (): void => {
  document.body.innerHTML = '';
};

describe('ekko-checkbox — rendering', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    assert.isDefined(customElements.get('ekko-checkbox'));
  });

  it('renders an inner <input type="checkbox"> element', () => {
    const el = mount('<ekko-checkbox>Accept</ekko-checkbox>');
    const inner = innerInput(el);
    assert.isNotNull(inner);
    assert.equal(inner.type, 'checkbox');
  });

  it('has a shadow root', () => {
    const el = mount('<ekko-checkbox>Accept</ekko-checkbox>');
    assert.isNotNull(el.shadowRoot);
  });

  it('renders slot content as label text', () => {
    const el = mount('<ekko-checkbox>Accept terms</ekko-checkbox>');
    assert.equal(el.textContent?.trim(), 'Accept terms');
  });

  it('exposes a "base" CSS part on the inner input', () => {
    const el = mount('<ekko-checkbox>Accept</ekko-checkbox>');
    assert.equal(innerInput(el).getAttribute('part'), 'base');
  });

  it('renders the visual box element', () => {
    const el = mount('<ekko-checkbox>Accept</ekko-checkbox>');
    const box = el.shadowRoot?.querySelector('.box') as HTMLElement;
    assert.isNotNull(box);
    assert.equal(box.getAttribute('aria-hidden'), 'true');
  });
});

describe('ekko-checkbox — attributes', () => {
  afterEach(cleanup);

  it('defaults size to "md"', () => {
    const el = mount('<ekko-checkbox></ekko-checkbox>');
    assert.equal(el.size, 'md');
  });

  it('reflects size via property setter', () => {
    const el = mount('<ekko-checkbox></ekko-checkbox>');
    el.size = 'lg';
    assert.equal(el.getAttribute('size'), 'lg');
  });

  it('reflects checked from attribute', () => {
    const el = mount('<ekko-checkbox checked>Accept</ekko-checkbox>');
    assert.isTrue(el.checked);
    assert.isTrue(innerInput(el).checked);
  });

  it('sets checked via property', () => {
    const el = mount('<ekko-checkbox>Accept</ekko-checkbox>');
    el.checked = true;
    assert.isTrue(innerInput(el).checked);
    assert.isTrue(el.hasAttribute('checked'));
  });

  it('unchecks via property', () => {
    const el = mount('<ekko-checkbox checked>Accept</ekko-checkbox>');
    el.checked = false;
    assert.isFalse(innerInput(el).checked);
    assert.isFalse(el.hasAttribute('checked'));
  });

  it('handles indeterminate state', () => {
    const el = mount('<ekko-checkbox>Accept</ekko-checkbox>');
    el.indeterminate = true;
    assert.isTrue(el.indeterminate);
    assert.isTrue(innerInput(el).indeterminate);
  });

  it('reflects disabled to property', () => {
    const el = mount('<ekko-checkbox disabled>Accept</ekko-checkbox>');
    assert.isTrue(el.disabled);
  });

  it('sets disabled via property', () => {
    const el = mount('<ekko-checkbox>Accept</ekko-checkbox>');
    el.disabled = true;
    assert.isTrue(el.hasAttribute('disabled'));
  });

  it('defaults value to "on"', () => {
    const el = mount('<ekko-checkbox>Accept</ekko-checkbox>');
    assert.equal(el.value, 'on');
  });

  it('reflects custom value', () => {
    const el = mount('<ekko-checkbox value="agree">Accept</ekko-checkbox>');
    assert.equal(el.value, 'agree');
  });

  it('reflects name property', () => {
    const el = mount('<ekko-checkbox name="terms">Accept</ekko-checkbox>');
    assert.equal(el.name, 'terms');
  });
});

describe('ekko-checkbox — ARIA', () => {
  afterEach(cleanup);

  it('sets aria-disabled="true" when disabled', () => {
    const el = mount('<ekko-checkbox disabled>Accept</ekko-checkbox>');
    assert.equal(innerInput(el).getAttribute('aria-disabled'), 'true');
  });

  it('does not set aria-disabled by default', () => {
    const el = mount('<ekko-checkbox>Accept</ekko-checkbox>');
    assert.isNull(innerInput(el).getAttribute('aria-disabled'));
  });

  it('forwards aria-label from host to inner input', () => {
    const el = mount('<ekko-checkbox aria-label="Agree to terms"></ekko-checkbox>');
    assert.equal(innerInput(el).getAttribute('aria-label'), 'Agree to terms');
  });

  it('removes aria-label when host attribute is removed', () => {
    const el = mount('<ekko-checkbox aria-label="Agree"></ekko-checkbox>');
    el.removeAttribute('aria-label');
    assert.isNull(innerInput(el).getAttribute('aria-label'));
  });

  it('forwards aria-describedby from host to inner input', () => {
    const el = mount('<ekko-checkbox aria-describedby="help-text">Accept</ekko-checkbox>');
    assert.equal(innerInput(el).getAttribute('aria-describedby'), 'help-text');
  });

  it('removes aria-describedby when host attribute is removed', () => {
    const el = mount('<ekko-checkbox aria-describedby="help-text">Accept</ekko-checkbox>');
    el.removeAttribute('aria-describedby');
    assert.isNull(innerInput(el).getAttribute('aria-describedby'));
  });

  it('disables inner input when disabled attribute is set', () => {
    const el = mount('<ekko-checkbox disabled>Accept</ekko-checkbox>');
    assert.isTrue(innerInput(el).disabled);
  });
});

describe('ekko-checkbox — keyboard', () => {
  afterEach(cleanup);

  it('toggles checked on Space key', async () => {
    const el = mount('<ekko-checkbox>Accept</ekko-checkbox>');
    innerInput(el).focus();

    let fired = false;
    el.addEventListener('ekko-change', () => {
      fired = true;
    });

    await sendKeys({ press: ' ' });
    assert.isTrue(fired);
    assert.isTrue(el.checked);
  });

  it('does not toggle when disabled', async () => {
    const el = mount('<ekko-checkbox disabled>Accept</ekko-checkbox>');

    let fired = false;
    el.addEventListener('ekko-change', () => {
      fired = true;
    });

    innerInput(el).click();
    assert.isFalse(fired);
    assert.isFalse(el.checked);
  });
});

describe('ekko-checkbox — events', () => {
  afterEach(cleanup);

  it('dispatches ekko-change on toggle', () => {
    const el = mount('<ekko-checkbox>Accept</ekko-checkbox>');

    let event: Event | null = null;
    el.addEventListener('ekko-change', (e) => {
      event = e;
    });
    innerInput(el).click();

    assert.isNotNull(event);
    assert.equal((event as Event).type, 'ekko-change');
  });

  it('ekko-change bubbles', () => {
    const el = mount('<ekko-checkbox>Accept</ekko-checkbox>');
    const parent = el.parentElement as HTMLElement;

    let fired = false;
    parent.addEventListener('ekko-change', () => {
      fired = true;
    });
    innerInput(el).click();

    assert.isTrue(fired);
  });

  it('ekko-change is composed (crosses Shadow DOM boundary)', () => {
    const el = mount('<ekko-checkbox>Accept</ekko-checkbox>');

    let event: Event | null = null;
    document.body.addEventListener('ekko-change', (e) => {
      event = e;
    });
    innerInput(el).click();

    assert.isNotNull(event);
    assert.isTrue((event as Event).composed);
  });

  it('event detail contains checked state and original event', () => {
    const el = mount('<ekko-checkbox>Accept</ekko-checkbox>');

    let detail: { checked: boolean; indeterminate: boolean; originalEvent: Event } | null = null;
    el.addEventListener('ekko-change', (e) => {
      detail = (e as CustomEvent).detail;
    });
    innerInput(el).click();

    assert.isNotNull(detail);
    assert.isTrue(
      (detail as { checked: boolean; indeterminate: boolean; originalEvent: Event }).checked
    );
    assert.isNotNull(
      (detail as { checked: boolean; indeterminate: boolean; originalEvent: Event }).originalEvent
    );
  });
});

describe('ekko-checkbox — form participation', () => {
  afterEach(cleanup);

  it('submits value when checked', () => {
    document.body.innerHTML = `
      <form id="test-form">
        <ekko-checkbox name="terms" value="agree" checked>Accept</ekko-checkbox>
      </form>
    `;
    const form = document.getElementById('test-form') as HTMLFormElement;
    const formData = new FormData(form);
    assert.equal(formData.get('terms'), 'agree');
  });

  it('does not submit value when unchecked', () => {
    document.body.innerHTML = `
      <form id="test-form">
        <ekko-checkbox name="terms" value="agree">Accept</ekko-checkbox>
      </form>
    `;
    const form = document.getElementById('test-form') as HTMLFormElement;
    const formData = new FormData(form);
    assert.isNull(formData.get('terms'));
  });

  it('form getter exposes the associated form', () => {
    document.body.innerHTML = `
      <form id="test-form"><ekko-checkbox name="x">Accept</ekko-checkbox></form>
    `;
    const checkbox = document.querySelector('ekko-checkbox') as EkkoCheckbox;
    assert.equal(checkbox.form?.id, 'test-form');
  });

  it('resets to initial state on form reset', () => {
    document.body.innerHTML = `
      <form id="test-form">
        <ekko-checkbox name="terms" checked>Accept</ekko-checkbox>
      </form>
    `;
    const form = document.getElementById('test-form') as HTMLFormElement;
    const checkbox = form.querySelector('ekko-checkbox') as EkkoCheckbox;
    checkbox.checked = false;
    assert.isFalse(checkbox.checked);
    form.reset();
    assert.isTrue(checkbox.checked);
  });

  it('defaults value to "on" in form data', () => {
    document.body.innerHTML = `
      <form id="test-form">
        <ekko-checkbox name="terms" checked>Accept</ekko-checkbox>
      </form>
    `;
    const form = document.getElementById('test-form') as HTMLFormElement;
    const formData = new FormData(form);
    assert.equal(formData.get('terms'), 'on');
  });
});
