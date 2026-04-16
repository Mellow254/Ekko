import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface EkkoChangeEventDetail {
  checked: boolean;
  indeterminate: boolean;
  originalEvent: Event;
}

export class EkkoCheckbox extends HTMLElement {
  static formAssociated = true;

  static get observedAttributes(): string[] {
    return ['checked', 'disabled', 'name', 'value', 'size', 'aria-label', 'aria-describedby'];
  }

  #shadow: ShadowRoot;
  #input: HTMLInputElement;
  #internals: ElementInternals;
  #changeHandler: (event: Event) => void;
  #defaultChecked = false;

  constructor() {
    super();

    this.#shadow = this.attachShadow({ mode: 'open' });
    this.#shadow.adoptedStyleSheets = [styles];
    this.#shadow.innerHTML = this.#template();

    this.#input = this.#shadow.querySelector('.input') as HTMLInputElement;
    this.#internals = this.attachInternals();

    this.#changeHandler = this.#handleChange.bind(this);
  }

  connectedCallback(): void {
    this.#upgradeProperty('checked');
    this.#upgradeProperty('indeterminate');
    this.#upgradeProperty('disabled');
    this.#upgradeProperty('name');
    this.#upgradeProperty('value');
    this.#upgradeProperty('size');

    if (!this.hasAttribute('size')) {
      this.size = 'md';
    }

    // Capture the initial checked state for form reset
    this.#defaultChecked = this.hasAttribute('checked');
    if (this.#defaultChecked) {
      this.#input.checked = true;
    }
    this.#syncFormValue();

    this.#input.addEventListener('change', this.#changeHandler);
    this.#syncAccessibility();
  }

  disconnectedCallback(): void {
    this.#input.removeEventListener('change', this.#changeHandler);
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    if (name === 'checked') {
      this.#input.checked = newValue !== null;
      this.#syncFormValue();
    }

    this.#syncAccessibility();
  }

  get checked(): boolean {
    return this.#input?.checked ?? false;
  }
  set checked(val: boolean) {
    if (this.#input) this.#input.checked = val;
    this.toggleAttribute('checked', Boolean(val));
    this.#syncFormValue();
  }

  get indeterminate(): boolean {
    return this.#input?.indeterminate ?? false;
  }
  set indeterminate(val: boolean) {
    if (this.#input) this.#input.indeterminate = val;
  }

  get disabled(): boolean {
    return this.hasAttribute('disabled');
  }
  set disabled(val: boolean) {
    this.toggleAttribute('disabled', Boolean(val));
  }

  get name(): string {
    return this.getAttribute('name') ?? '';
  }
  set name(val: string) {
    this.setAttribute('name', val);
  }

  get value(): string {
    return this.getAttribute('value') ?? 'on';
  }
  set value(val: string) {
    this.setAttribute('value', val);
  }

  get size(): CheckboxSize {
    return (this.getAttribute('size') as CheckboxSize) ?? 'md';
  }
  set size(val: CheckboxSize) {
    this.setAttribute('size', val);
  }

  get form(): HTMLFormElement | null {
    return this.#internals.form;
  }

  formResetCallback(): void {
    this.#input.checked = this.#defaultChecked;
    this.toggleAttribute('checked', this.#defaultChecked);
    this.#syncFormValue();
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  #template(): string {
    return `
      <label class="label">
        <input
          part="base"
          class="input"
          type="checkbox"
        />
        <span class="box" aria-hidden="true"></span>
        <span class="label-text">
          <slot></slot>
        </span>
      </label>
    `;
  }

  #syncAccessibility(): void {
    if (!this.#input) return;

    this.#input.disabled = this.disabled;

    if (this.disabled) {
      this.#input.setAttribute('aria-disabled', 'true');
    } else {
      this.#input.removeAttribute('aria-disabled');
    }

    const ariaLabel = this.getAttribute('aria-label');
    if (ariaLabel) {
      this.#input.setAttribute('aria-label', ariaLabel);
    } else {
      this.#input.removeAttribute('aria-label');
    }

    const ariaDescribedby = this.getAttribute('aria-describedby');
    if (ariaDescribedby) {
      this.#input.setAttribute('aria-describedby', ariaDescribedby);
    } else {
      this.#input.removeAttribute('aria-describedby');
    }
  }

  #syncFormValue(): void {
    if (!this.#internals) return;
    this.#internals.setFormValue(this.#input?.checked ? this.value : null);
  }

  #handleChange(event: Event): void {
    this.toggleAttribute('checked', this.#input.checked);
    this.#syncFormValue();
    this.dispatchEvent(
      new CustomEvent<EkkoChangeEventDetail>('ekko-change', {
        bubbles: true,
        composed: true,
        detail: {
          checked: this.#input.checked,
          indeterminate: this.#input.indeterminate,
          originalEvent: event,
        },
      })
    );
  }

  #upgradeProperty(prop: string): void {
    if (Object.hasOwn(this, prop)) {
      const value = (this as Record<string, unknown>)[prop];
      delete (this as Record<string, unknown>)[prop];
      (this as Record<string, unknown>)[prop] = value;
    }
  }
}

if (!customElements.get('ekko-checkbox')) {
  customElements.define('ekko-checkbox', EkkoCheckbox);
}
