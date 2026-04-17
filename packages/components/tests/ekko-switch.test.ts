import { assert } from '@esm-bundle/chai';
import { sendKeys } from '@web/test-runner-commands';
import type { EkkoSwitch } from '../src/switch';
import '../src/switch';

const mount = (html: string): EkkoSwitch => {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container.firstElementChild as EkkoSwitch;
};

const innerInput = (el: EkkoSwitch): HTMLInputElement => {
  return el.shadowRoot?.querySelector('.input') as HTMLInputElement;
};

const cleanup = (): void => {
  document.body.innerHTML = '';
};

describe('ekko-switch — rendering', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    assert.isDefined(customElements.get('ekko-switch'));
  });

  it('renders an inner input with role="switch"', () => {
    const el = mount('<ekko-switch>Wi-Fi</ekko-switch>');
    const inner = innerInput(el);
    assert.isNotNull(inner);
    assert.equal(inner.type, 'checkbox');
    assert.equal(inner.getAttribute('role'), 'switch');
  });

  it('has a shadow root', () => {
    const el = mount('<ekko-switch>Wi-Fi</ekko-switch>');
    assert.isNotNull(el.shadowRoot);
  });

  it('renders slot content as label text', () => {
    const el = mount('<ekko-switch>Enable Wi-Fi</ekko-switch>');
    assert.equal(el.textContent?.trim(), 'Enable Wi-Fi');
  });

  it('exposes a "base" CSS part on the inner input', () => {
    const el = mount('<ekko-switch>Wi-Fi</ekko-switch>');
    assert.equal(innerInput(el).getAttribute('part'), 'base');
  });

  it('renders the visual track and thumb elements', () => {
    const el = mount('<ekko-switch>Wi-Fi</ekko-switch>');
    const track = el.shadowRoot?.querySelector('.track') as HTMLElement;
    const thumb = el.shadowRoot?.querySelector('.thumb') as HTMLElement;
    assert.isNotNull(track);
    assert.isNotNull(thumb);
    assert.equal(track.getAttribute('aria-hidden'), 'true');
  });
});

describe('ekko-switch — attributes', () => {
  afterEach(cleanup);

  it('defaults size to "md"', () => {
    const el = mount('<ekko-switch></ekko-switch>');
    assert.equal(el.size, 'md');
  });

  it('reflects size via property setter', () => {
    const el = mount('<ekko-switch></ekko-switch>');
    el.size = 'lg';
    assert.equal(el.getAttribute('size'), 'lg');
  });

  it('reflects checked from attribute', () => {
    const el = mount('<ekko-switch checked>Wi-Fi</ekko-switch>');
    assert.isTrue(el.checked);
    assert.isTrue(innerInput(el).checked);
  });

  it('sets checked via property', () => {
    const el = mount('<ekko-switch>Wi-Fi</ekko-switch>');
    el.checked = true;
    assert.isTrue(innerInput(el).checked);
    assert.isTrue(el.hasAttribute('checked'));
  });

  it('unchecks via property', () => {
    const el = mount('<ekko-switch checked>Wi-Fi</ekko-switch>');
    el.checked = false;
    assert.isFalse(innerInput(el).checked);
    assert.isFalse(el.hasAttribute('checked'));
  });

  it('reflects disabled to property', () => {
    const el = mount('<ekko-switch disabled>Wi-Fi</ekko-switch>');
    assert.isTrue(el.disabled);
  });

  it('sets disabled via property', () => {
    const el = mount('<ekko-switch>Wi-Fi</ekko-switch>');
    el.disabled = true;
    assert.isTrue(el.hasAttribute('disabled'));
  });

  it('defaults value to "on"', () => {
    const el = mount('<ekko-switch>Wi-Fi</ekko-switch>');
    assert.equal(el.value, 'on');
  });

  it('reflects custom value', () => {
    const el = mount('<ekko-switch value="enabled">Wi-Fi</ekko-switch>');
    assert.equal(el.value, 'enabled');
  });

  it('reflects name property', () => {
    const el = mount('<ekko-switch name="wifi">Wi-Fi</ekko-switch>');
    assert.equal(el.name, 'wifi');
  });
});

describe('ekko-switch — ARIA', () => {
  afterEach(cleanup);

  it('sets aria-disabled="true" when disabled', () => {
    const el = mount('<ekko-switch disabled>Wi-Fi</ekko-switch>');
    assert.equal(innerInput(el).getAttribute('aria-disabled'), 'true');
  });

  it('does not set aria-disabled by default', () => {
    const el = mount('<ekko-switch>Wi-Fi</ekko-switch>');
    assert.isNull(innerInput(el).getAttribute('aria-disabled'));
  });

  it('forwards aria-label from host to inner input', () => {
    const el = mount('<ekko-switch aria-label="Enable Wi-Fi"></ekko-switch>');
    assert.equal(innerInput(el).getAttribute('aria-label'), 'Enable Wi-Fi');
  });

  it('removes aria-label when host attribute is removed', () => {
    const el = mount('<ekko-switch aria-label="Wi-Fi"></ekko-switch>');
    el.removeAttribute('aria-label');
    assert.isNull(innerInput(el).getAttribute('aria-label'));
  });

  it('forwards aria-describedby from host to inner input', () => {
    const el = mount('<ekko-switch aria-describedby="help-text">Wi-Fi</ekko-switch>');
    assert.equal(innerInput(el).getAttribute('aria-describedby'), 'help-text');
  });

  it('removes aria-describedby when host attribute is removed', () => {
    const el = mount('<ekko-switch aria-describedby="help-text">Wi-Fi</ekko-switch>');
    el.removeAttribute('aria-describedby');
    assert.isNull(innerInput(el).getAttribute('aria-describedby'));
  });

  it('disables inner input when disabled attribute is set', () => {
    const el = mount('<ekko-switch disabled>Wi-Fi</ekko-switch>');
    assert.isTrue(innerInput(el).disabled);
  });
});

describe('ekko-switch — keyboard', () => {
  afterEach(cleanup);

  it('toggles checked on Space key', async () => {
    const el = mount('<ekko-switch>Wi-Fi</ekko-switch>');
    innerInput(el).focus();

    let fired = false;
    el.addEventListener('ekko-change', () => {
      fired = true;
    });

    await sendKeys({ press: ' ' });
    assert.isTrue(fired);
    assert.isTrue(el.checked);
  });

  it('does not toggle when disabled', () => {
    const el = mount('<ekko-switch disabled>Wi-Fi</ekko-switch>');

    let fired = false;
    el.addEventListener('ekko-change', () => {
      fired = true;
    });

    innerInput(el).click();
    assert.isFalse(fired);
    assert.isFalse(el.checked);
  });
});

describe('ekko-switch — events', () => {
  afterEach(cleanup);

  it('dispatches ekko-change on toggle', () => {
    const el = mount('<ekko-switch>Wi-Fi</ekko-switch>');

    let event: Event | null = null;
    el.addEventListener('ekko-change', (e) => {
      event = e;
    });
    innerInput(el).click();

    assert.isNotNull(event);
    assert.equal((event as Event).type, 'ekko-change');
  });

  it('ekko-change bubbles', () => {
    const el = mount('<ekko-switch>Wi-Fi</ekko-switch>');
    const parent = el.parentElement as HTMLElement;

    let fired = false;
    parent.addEventListener('ekko-change', () => {
      fired = true;
    });
    innerInput(el).click();

    assert.isTrue(fired);
  });

  it('ekko-change is composed (crosses Shadow DOM boundary)', () => {
    const el = mount('<ekko-switch>Wi-Fi</ekko-switch>');

    let event: Event | null = null;
    document.body.addEventListener('ekko-change', (e) => {
      event = e;
    });
    innerInput(el).click();

    assert.isNotNull(event);
    assert.isTrue((event as Event).composed);
  });

  it('event detail contains checked state and original event', () => {
    const el = mount('<ekko-switch>Wi-Fi</ekko-switch>');

    let detail: { checked: boolean; originalEvent: Event } | null = null;
    el.addEventListener('ekko-change', (e) => {
      detail = (e as CustomEvent).detail;
    });
    innerInput(el).click();

    assert.isNotNull(detail);
    const d = detail as { checked: boolean; originalEvent: Event };
    assert.isTrue(d.checked);
    assert.isNotNull(d.originalEvent);
  });
});

describe('ekko-switch — form participation', () => {
  afterEach(cleanup);

  it('submits value when checked', () => {
    document.body.innerHTML = `
      <form id="test-form">
        <ekko-switch name="wifi" value="on" checked>Wi-Fi</ekko-switch>
      </form>
    `;
    const form = document.getElementById('test-form') as HTMLFormElement;
    const formData = new FormData(form);
    assert.equal(formData.get('wifi'), 'on');
  });

  it('does not submit value when unchecked', () => {
    document.body.innerHTML = `
      <form id="test-form">
        <ekko-switch name="wifi" value="on">Wi-Fi</ekko-switch>
      </form>
    `;
    const form = document.getElementById('test-form') as HTMLFormElement;
    const formData = new FormData(form);
    assert.isNull(formData.get('wifi'));
  });

  it('form getter exposes the associated form', () => {
    document.body.innerHTML = `
      <form id="test-form"><ekko-switch name="wifi">Wi-Fi</ekko-switch></form>
    `;
    const toggle = document.querySelector('ekko-switch') as EkkoSwitch;
    assert.equal(toggle.form?.id, 'test-form');
  });

  it('resets to initial state on form reset', () => {
    document.body.innerHTML = `
      <form id="test-form">
        <ekko-switch name="wifi" checked>Wi-Fi</ekko-switch>
      </form>
    `;
    const form = document.getElementById('test-form') as HTMLFormElement;
    const toggle = form.querySelector('ekko-switch') as EkkoSwitch;
    toggle.checked = false;
    assert.isFalse(toggle.checked);
    form.reset();
    assert.isTrue(toggle.checked);
  });
});
