import { EkkoBase } from '../base';
import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';

export interface EkkoClickEventDetail {
  originalEvent: Event;
}

export class EkkoButton extends EkkoBase {
  static formAssociated = true;

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
      'name',
      'value',
      'aria-label',
      'aria-describedby',
    ];
  }

  #btn: HTMLButtonElement;
  #clickHandler: (event: Event) => void;
  #internals: ElementInternals;
  #formDisabled = false;

  constructor() {
    super(styles);
    this.shadow.innerHTML = this.#template();

    this.#btn = this.shadow.querySelector('.btn') as HTMLButtonElement;
    this.#clickHandler = this.#handleClick.bind(this);
    this.#internals = this.attachInternals();
  }

  connectedCallback(): void {
    this.upgradeProperty('variant');
    this.upgradeProperty('size');
    this.upgradeProperty('disabled');
    this.upgradeProperty('loading');
    this.upgradeProperty('type');
    this.upgradeProperty('pressed');
    this.upgradeProperty('name');
    this.upgradeProperty('value');

    if (!this.hasAttribute('variant')) {
      this.variant = 'primary';
    }
    if (!this.hasAttribute('size')) {
      this.size = 'md';
    }
    if (!this.hasAttribute('type')) {
      this.type = 'button';
    }

    this.addEventListener('click', this.#clickHandler);
    this.#syncAccessibility();
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.#clickHandler);
  }

  attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;
    this.#syncAccessibility();
  }

  formDisabledCallback(disabled: boolean): void {
    this.#formDisabled = disabled;
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

  get name(): string {
    return this.getAttribute('name') ?? '';
  }
  set name(value: string) {
    this.setAttribute('name', value);
  }

  get value(): string {
    return this.getAttribute('value') ?? '';
  }
  set value(value: string) {
    this.setAttribute('value', value);
  }

  get form(): HTMLFormElement | null {
    return this.#internals.form;
  }

  #template(): string {
    return `
      <button part="base" class="btn" type="button">
        <slot name="start"></slot>
        <span class="btn-label"><slot></slot></span>
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

    const inert = this.disabled || this.loading || this.#formDisabled;
    if (inert) {
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

    this.forwardAriaLabel(this.#btn);
    this.forwardAriaDescribedby(this.#btn);
  }

  #handleClick(event: Event): void {
    // Suppress clicks when disabled or loading
    if (this.disabled || this.loading || this.#formDisabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    // Toggle pressed state if this is a toggle button
    if (this.getAttribute('pressed') !== null) {
      const next = this.getAttribute('pressed') === 'true' ? 'false' : 'true';
      this.setAttribute('pressed', next);
    }

    // Form-associated submit: use ElementInternals to reach the owning form.
    // requestSubmit() runs constraint validation and fires the submit event,
    // which form.submit() would skip. setFormValue() is set transiently so
    // name/value are present in FormData during this submission only —
    // matching native button submitter semantics where a button only
    // contributes its value when it is the active submitter.
    if (this.type === 'submit') {
      const form = this.#internals.form;
      if (form) {
        const hasEntry = Boolean(this.name);
        if (hasEntry) {
          this.#internals.setFormValue(this.value);
        }
        form.requestSubmit();
        if (hasEntry) {
          this.#internals.setFormValue(null);
        }
        return;
      }
    }

    if (this.type === 'reset') {
      const form = this.#internals.form;
      if (form) {
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
