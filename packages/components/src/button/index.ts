import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';

export interface EkkoClickEventDetail {
  originalEvent: Event;
}

export class EkkoButton extends HTMLElement {
  static get observedAttributes(): string[] {
    return [
      'variant',
      'size',
      'disabled',
      'loading',
      'pressed',
      'type',
      'full-width',
      'icon-only',
      'aria-label',
      'aria-describedby',
    ];
  }

  #shadow: ShadowRoot;
  #btn: HTMLButtonElement;
  #clickHandler: (event: Event) => void;

  constructor() {
    super();

    this.#shadow = this.attachShadow({ mode: 'open' });
    this.#shadow.adoptedStyleSheets = [styles];
    this.#shadow.innerHTML = this.#template();

    this.#btn = this.#shadow.querySelector('.btn') as HTMLButtonElement;

    this.#clickHandler = this.#handleClick.bind(this);
  }

  connectedCallback(): void {
    // setting default attributes
    if (!this.hasAttribute('variant')) {
      this.variant = 'primary';
    }
    if (!this.hasAttribute('size')) {
      this.size = 'md';
    }
    if (!this.hasAttribute('type')) {
      this.type = 'button';
    }

    this.#btn.addEventListener('click', this.#clickHandler);
    this.#syncAccessibility();
  }

  disconnectedCallback(): void {
    this.#btn.removeEventListener('click', this.#clickHandler);
  }

  attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;
    this.#syncAccessibility();
  }

  get variant(): ButtonVariant {
    return (this.getAttribute('variant') as ButtonVariant) ?? 'primary';
  }
  set variant(value: ButtonVariant) {
    this.setAttribute('variant', value);
  }

  get size(): ButtonSize {
    return (this.getAttribute('size') as ButtonSize) ?? 'md';
  }
  set size(value: ButtonSize) {
    this.setAttribute('size', value);
  }

  get disabled(): boolean {
    return this.hasAttribute('disabled');
  }
  set disabled(value: boolean) {
    this.toggleAttribute('disabled', Boolean(value));
  }

  get loading(): boolean {
    return this.hasAttribute('loading');
  }
  set loading(value: boolean) {
    this.toggleAttribute('loading', Boolean(value));
  }

  get type(): ButtonType {
    return (this.getAttribute('type') as ButtonType) ?? 'button';
  }
  set type(value: ButtonType) {
    this.setAttribute('type', value);
  }

  get pressed(): string | null {
    return this.getAttribute('pressed');
  }
  set pressed(value: string | null | undefined) {
    if (value === null || value === undefined) {
      this.removeAttribute('pressed');
    } else {
      this.setAttribute('pressed', String(value));
    }
  }

  #template(): string {
    return `
      <button
        part="base"
        class="btn"
        type="${this.getAttribute('type') ?? 'button'}"
      >
        <slot name="start"></slot>
        <span class="btn-label">
          <slot></slot>
        </span>
        <div class="spinner" aria-hidden="true"></div>
        <slot name="end"></slot>
      </button>
    `;
  }

  /**
   * Keep the inner button's ARIA attributes in sync with the host element's
   * state. Called on connect and on every attribute change.
   */
  #syncAccessibility(): void {
    if (!this.#btn) return;

    this.#btn.setAttribute('type', this.type);

    if (this.disabled || this.loading) {
      this.#btn.setAttribute('aria-disabled', 'true'); // focus is retained for screen reader
      this.#btn.disabled = true; // For the form submission
    } else {
      this.#btn.removeAttribute('aria-disabled');
      this.#btn.disabled = false;
    }

    if (this.loading) {
      this.#btn.setAttribute('aria-busy', 'true');
    } else {
      this.#btn.removeAttribute('aria-busy');
    }

    const pressed = this.getAttribute('pressed');
    if (pressed !== null) {
      this.#btn.setAttribute('aria-pressed', pressed);
    } else {
      this.#btn.removeAttribute('aria-pressed');
    }

    const ariaLabel = this.getAttribute('aria-label');
    if (ariaLabel) {
      this.#btn.setAttribute('aria-label', ariaLabel);
    } else {
      this.#btn.removeAttribute('aria-label');
    }

    const ariaDescribedby = this.getAttribute('aria-describedby');
    if (ariaDescribedby) {
      this.#btn.setAttribute('aria-describedby', ariaDescribedby);
    } else {
      this.#btn.removeAttribute('aria-describedby');
    }
  }

  #handleClick(event: Event): void {
    // Suppress clicks when disabled or loading
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    // Toggle pressed state if this is a toggle button
    if (this.getAttribute('pressed') !== null) {
      const next = this.getAttribute('pressed') === 'true' ? 'false' : 'true';
      this.setAttribute('pressed', next);
    }

    // Handle form submission — the inner button is type="submit" but is inside
    // Shadow DOM, so it won't natively submit the outer form. We handle it here.
    if (this.type === 'submit') {
      const formId = this.getAttribute('form');
      const form = formId ? document.getElementById(formId) : this.closest('form');

      if (form instanceof HTMLFormElement) {
        // Trigger native form submission
        const submitter = document.createElement('button');
        submitter.type = 'submit';
        submitter.name = this.getAttribute('name') ?? '';
        submitter.value = this.getAttribute('value') ?? '';
        submitter.style.display = 'none';
        form.appendChild(submitter);
        submitter.click();
        form.removeChild(submitter);
        return;
      }
    }

    if (this.type === 'reset') {
      const formId = this.getAttribute('form');
      const form = formId ? document.getElementById(formId) : this.closest('form');
      if (form instanceof HTMLFormElement) {
        form.reset();
        return;
      }
    }

    // Dispatch a custom event for framework consumers to listen to
    this.dispatchEvent(
      new CustomEvent<EkkoClickEventDetail>('ekko-click', {
        bubbles: true,
        composed: true,
        detail: { originalEvent: event },
      })
    );
  }
}

if (!customElements.get('ekko-button')) {
  customElements.define('ekko-button', EkkoButton);
}
