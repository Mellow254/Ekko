/**
 * Tests run in real Chromium via @web/test-runner + Playwright.
 * Covers: rendering, attributes, ARIA contract, keyboard, events, form.
 */

import { assert } from '@esm-bundle/chai';
import { sendKeys } from '@web/test-runner-commands';
import type { EkkoButton } from '../src/button';
import '../src/button';

// Mount a component from HTML string and return the element.
const mount = (html: string): EkkoButton => {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  return container.firstElementChild as EkkoButton;
};

// Get the inner <button> through the Shadow DOM.
const innerBtn = (el: EkkoButton): HTMLButtonElement => {
  return el.shadowRoot?.querySelector('.btn') as HTMLButtonElement;
};

// Clean up after each test.
const cleanup = (): void => {
  document.body.innerHTML = '';
};

describe('ekko-button — rendering', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    assert.isDefined(customElements.get('ekko-button'));
  });

  it('renders an inner <button> element', () => {
    const el = mount('<ekko-button>Click</ekko-button>');
    assert.isNotNull(innerBtn(el));
  });

  it('has a shadow root', () => {
    const el = mount('<ekko-button>Click</ekko-button>');
    assert.isNotNull(el.shadowRoot);
  });

  it('renders the default slot content', async () => {
    const el = mount('<ekko-button>Click me</ekko-button>');
    // Slot content is in the light DOM
    assert.equal(el.textContent?.trim(), 'Click me');
  });

  it('exposes a "base" CSS part on the inner button', () => {
    const el = mount('<ekko-button>Click</ekko-button>');
    const btn = innerBtn(el);
    assert.equal(btn.getAttribute('part'), 'base');
  });
});

// Attributes

describe('ekko-button — attributes', () => {
  afterEach(cleanup);

  it('defaults variant to "primary"', () => {
    const el = mount('<ekko-button>Click</ekko-button>');
    assert.equal(el.variant, 'primary');
  });

  it('reflects variant attribute to property', () => {
    const el = mount('<ekko-button variant="secondary">Click</ekko-button>');
    assert.equal(el.variant, 'secondary');
  });

  it('sets variant via property', () => {
    const el = mount('<ekko-button>Click</ekko-button>');
    el.variant = 'ghost';
    assert.equal(el.getAttribute('variant'), 'ghost');
  });

  it('defaults size to "md"', () => {
    const el = mount('<ekko-button>Click</ekko-button>');
    assert.equal(el.size, 'md');
  });

  it('defaults type to "button"', () => {
    const el = mount('<ekko-button>Click</ekko-button>');
    assert.equal(el.type, 'button');
    assert.equal(innerBtn(el).type, 'button');
  });

  it('reflects type="submit" to inner button', () => {
    const el = mount('<ekko-button type="submit">Submit</ekko-button>');
    assert.equal(innerBtn(el).type, 'submit');
  });

  it('reflects disabled to property', () => {
    const el = mount('<ekko-button disabled>Click</ekko-button>');
    assert.isTrue(el.disabled);
  });

  it('sets disabled via property', () => {
    const el = mount('<ekko-button>Click</ekko-button>');
    el.disabled = true;
    assert.isTrue(el.hasAttribute('disabled'));
  });

  it('reflects loading to property', () => {
    const el = mount('<ekko-button loading>Saving</ekko-button>');
    assert.isTrue(el.loading);
  });
});

// ARIA contract

describe('ekko-button — ARIA', () => {
  afterEach(cleanup);

  it('inner button has no aria-disabled by default', () => {
    const el = mount('<ekko-button>Click</ekko-button>');
    assert.isNull(innerBtn(el).getAttribute('aria-disabled'));
  });

  it('sets aria-disabled="true" when disabled', () => {
    const el = mount('<ekko-button disabled>Click</ekko-button>');
    assert.equal(innerBtn(el).getAttribute('aria-disabled'), 'true');
  });

  it('sets aria-busy="true" when loading', () => {
    const el = mount('<ekko-button loading>Saving</ekko-button>');
    assert.equal(innerBtn(el).getAttribute('aria-busy'), 'true');
  });

  it('sets aria-disabled="true" when loading', () => {
    const el = mount('<ekko-button loading>Saving</ekko-button>');
    assert.equal(innerBtn(el).getAttribute('aria-disabled'), 'true');
  });

  it('sets aria-pressed when pressed attribute is present', () => {
    const el = mount('<ekko-button pressed="false">Mute</ekko-button>');
    assert.equal(innerBtn(el).getAttribute('aria-pressed'), 'false');
  });

  it('forwards aria-label from host to inner button', () => {
    const el = mount('<ekko-button icon-only aria-label="Close dialog">X</ekko-button>');
    assert.equal(innerBtn(el).getAttribute('aria-label'), 'Close dialog');
  });

  it('removes aria-label when host attribute is removed', () => {
    const el = mount('<ekko-button aria-label="Close">X</ekko-button>');
    el.removeAttribute('aria-label');
    assert.isNull(innerBtn(el).getAttribute('aria-label'));
  });
});

// Keyboard
describe('ekko-button — keyboard', () => {
  afterEach(cleanup);

  it('fires ekko-click on Enter key', async () => {
    const el = mount('<ekko-button>Click</ekko-button>');
    innerBtn(el).focus();

    let fired = false;
    el.addEventListener('ekko-click', () => {
      fired = true;
    });

    await sendKeys({ press: 'Enter' });
    assert.isTrue(fired);
  });

  it('fires ekko-click on Space key', async () => {
    const el = mount('<ekko-button>Click</ekko-button>');
    innerBtn(el).focus();

    let fired = false;
    el.addEventListener('ekko-click', () => {
      fired = true;
    });

    await sendKeys({ press: ' ' });
    assert.isTrue(fired);
  });

  it('does not fire ekko-click when disabled', async () => {
    const el = mount('<ekko-button disabled>Click</ekko-button>');
    innerBtn(el).focus();

    let fired = false;
    el.addEventListener('ekko-click', () => {
      fired = true;
    });

    await sendKeys({ press: 'Enter' });
    assert.isFalse(fired);
  });

  it('does not fire ekko-click when loading', async () => {
    const el = mount('<ekko-button loading>Saving</ekko-button>');

    let fired = false;
    el.addEventListener('ekko-click', () => {
      fired = true;
    });

    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    assert.isFalse(fired);
  });
});

// Events

describe('ekko-button — events', () => {
  afterEach(cleanup);

  it('dispatches ekko-click on click', () => {
    const el = mount('<ekko-button>Click</ekko-button>');

    let event: Event | null = null;
    el.addEventListener('ekko-click', (e) => {
      event = e;
    });
    innerBtn(el).click();

    assert.isNotNull(event);
    assert.equal((event as Event).type, 'ekko-click');
  });

  it('ekko-click bubbles', () => {
    const el = mount('<ekko-button>Click</ekko-button>');
    const parent = el.parentElement as HTMLElement;

    let fired = false;
    parent.addEventListener('ekko-click', () => {
      fired = true;
    });
    innerBtn(el).click();

    assert.isTrue(fired);
  });

  it('ekko-click is composed (crosses Shadow DOM boundary)', () => {
    const el = mount('<ekko-button>Click</ekko-button>');

    let event: Event | null = null;
    document.body.addEventListener('ekko-click', (e) => {
      event = e;
    });
    innerBtn(el).click();

    assert.isNotNull(event);
    assert.isTrue((event as Event).composed);
  });

  it('event detail contains the original event', () => {
    const el = mount('<ekko-button>Click</ekko-button>');

    let detail: { originalEvent: Event } | null = null;
    el.addEventListener('ekko-click', (e) => {
      detail = (e as CustomEvent).detail;
    });
    innerBtn(el).click();

    assert.isNotNull(detail);
    assert.isNotNull((detail as { originalEvent: Event }).originalEvent);
  });
});

// Toggle (pressed)

describe('ekko-button — toggle/pressed state', () => {
  afterEach(cleanup);

  it('toggles pressed from false to true on click', () => {
    const el = mount('<ekko-button pressed="false">Mute</ekko-button>');
    innerBtn(el).click();
    assert.equal(el.getAttribute('pressed'), 'true');
    assert.equal(innerBtn(el).getAttribute('aria-pressed'), 'true');
  });

  it('toggles pressed from true to false on click', () => {
    const el = mount('<ekko-button pressed="true">Mute</ekko-button>');
    innerBtn(el).click();
    assert.equal(el.getAttribute('pressed'), 'false');
    assert.equal(innerBtn(el).getAttribute('aria-pressed'), 'false');
  });
});

// Form participation

describe('ekko-button — form participation', () => {
  afterEach(cleanup);

  it('submits the nearest form when type="submit"', () => {
    document.body.innerHTML = `
      <form id="test-form">
        <input name="username" value="ada">
        <ekko-button type="submit">Submit</ekko-button>
      </form>
    `;
    const form = document.getElementById('test-form') as HTMLFormElement;
    const btn = form.querySelector('ekko-button') as EkkoButton;

    let submitted = false;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitted = true;
    });

    innerBtn(btn).click();
    assert.isTrue(submitted);
  });

  it('resets the nearest form when type="reset"', () => {
    document.body.innerHTML = `
      <form id="test-form">
        <input name="username" value="ada" id="user-input">
        <ekko-button type="reset">Reset</ekko-button>
      </form>
    `;
    const form = document.getElementById('test-form') as HTMLFormElement;
    const btn = form.querySelector('ekko-button') as EkkoButton;
    const input = document.getElementById('user-input') as HTMLInputElement;

    // Change the value from its default
    input.value = 'changed';
    assert.equal(input.value, 'changed');

    innerBtn(btn).click();
    assert.equal(input.value, 'ada');
  });
});

// Form-Associated Custom Element (FACE) contract

describe('ekko-button — form-associated custom element', () => {
  afterEach(cleanup);

  it('declares itself as form-associated', () => {
    // Exposed by the spec for upgrades; cast through unknown to read the static
    // formAssociated flag without relying on a global declaration.
    const ctor = customElements.get('ekko-button') as unknown as {
      formAssociated?: boolean;
    };
    assert.isTrue(ctor.formAssociated);
  });

  it('exposes the owning form via the .form getter', () => {
    document.body.innerHTML = `
      <form id="face-form">
        <ekko-button type="submit">Submit</ekko-button>
      </form>
    `;
    const form = document.getElementById('face-form') as HTMLFormElement;
    const btn = form.querySelector('ekko-button') as EkkoButton;
    assert.strictEqual(btn.form, form);
  });

  it('resolves the form via the "form" attribute when not nested', () => {
    document.body.innerHTML = `
      <form id="remote-form"></form>
      <ekko-button type="submit" form="remote-form">Submit</ekko-button>
    `;
    const form = document.getElementById('remote-form') as HTMLFormElement;
    const btn = document.querySelector('ekko-button') as EkkoButton;
    assert.strictEqual(btn.form, form);
  });

  it('contributes name/value to FormData when used as submitter', () => {
    document.body.innerHTML = `
      <form id="face-form">
        <input name="q" value="hello">
        <ekko-button type="submit" name="action" value="save">Save</ekko-button>
      </form>
    `;
    const form = document.getElementById('face-form') as HTMLFormElement;
    const btn = form.querySelector('ekko-button') as EkkoButton;

    let data: FormData | null = null;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      data = new FormData(form);
    });

    innerBtn(btn).click();

    assert.isNotNull(data);
    const formData = data as unknown as FormData;
    assert.equal(formData.get('q'), 'hello');
    assert.equal(formData.get('action'), 'save');
  });

  it('omits its value from FormData on a subsequent unrelated submission', () => {
    // Verifies setFormValue is cleared after submit so the button does not
    // leak its value into later submissions it did not trigger.
    document.body.innerHTML = `
      <form id="face-form">
        <input name="q" value="hello">
        <ekko-button type="submit" name="action" value="save">Save</ekko-button>
      </form>
    `;
    const form = document.getElementById('face-form') as HTMLFormElement;
    const btn = form.querySelector('ekko-button') as EkkoButton;

    let data: FormData | null = null;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      data = new FormData(form);
    });

    // First submission via our button — value is present.
    innerBtn(btn).click();
    assert.equal((data as unknown as FormData).get('action'), 'save');

    // Second submission without the button as trigger — value is absent.
    data = null;
    form.requestSubmit();
    assert.isNotNull(data);
    assert.isNull((data as unknown as FormData).get('action'));
  });

  it('submits the form implicitly when Enter is pressed in a sibling input', async () => {
    document.body.innerHTML = `
      <form id="face-form">
        <input id="q-input" name="q" value="hi">
        <ekko-button type="submit">Search</ekko-button>
      </form>
    `;
    const form = document.getElementById('face-form') as HTMLFormElement;
    const input = document.getElementById('q-input') as HTMLInputElement;

    let submitted = false;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitted = true;
    });

    input.focus();
    await sendKeys({ press: 'Enter' });
    assert.isTrue(submitted);
  });

  it('disables the inner button when an ancestor fieldset is disabled', () => {
    document.body.innerHTML = `
      <form>
        <fieldset id="fs">
          <ekko-button type="submit">Submit</ekko-button>
        </fieldset>
      </form>
    `;
    const fs = document.getElementById('fs') as HTMLFieldSetElement;
    const btn = fs.querySelector('ekko-button') as EkkoButton;

    fs.disabled = true;
    assert.equal(innerBtn(btn).getAttribute('aria-disabled'), 'true');
    assert.isTrue(innerBtn(btn).disabled);

    fs.disabled = false;
    assert.isNull(innerBtn(btn).getAttribute('aria-disabled'));
    assert.isFalse(innerBtn(btn).disabled);
  });

  it('does not submit when disabled via fieldset', () => {
    document.body.innerHTML = `
      <form id="face-form">
        <fieldset id="fs" disabled>
          <ekko-button type="submit">Submit</ekko-button>
        </fieldset>
      </form>
    `;
    const form = document.getElementById('face-form') as HTMLFormElement;
    const btn = form.querySelector('ekko-button') as EkkoButton;

    let submitted = false;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitted = true;
    });

    innerBtn(btn).click();
    assert.isFalse(submitted);
  });
});
