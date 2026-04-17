import { EkkoBase } from '../base';
import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

export type SelectSize = 'sm' | 'md' | 'lg';

export interface EkkoChangeEventDetail {
  value: string;
  originalEvent: Event;
}

export interface EkkoInputEventDetail {
  value: string;
  originalEvent: Event;
}

const FORWARDED_ATTRIBUTES = ['name', 'autocomplete', 'multiple', 'form'] as const;

export class EkkoSelect extends EkkoBase {
  static formAssociated = true;

  static get observedAttributes(): string[] {
    return [
      'name',
      'value',
      'autocomplete',
      'visible-rows',
      'size',
      'multiple',
      'disabled',
      'required',
      'invalid',
      'label',
      'placeholder',
      'help',
      'error',
      'full-width',
      'aria-label',
      'aria-describedby',
    ];
  }

  #select: HTMLSelectElement;
  #labelEl: HTMLLabelElement;
  #labelText: HTMLSpanElement;
  #helpEl: HTMLElement;
  #errorEl: HTMLElement;
  #trigger: HTMLButtonElement | null;
  #internals: ElementInternals;
  #observer: MutationObserver;
  #changeHandler: (event: Event) => void;
  #inputHandler: (event: Event) => void;
  #selectId: string;
  #helpId: string;
  #errorId: string;
  #syncing: boolean;
  #supportsBasePicker: boolean;

  constructor() {
    const uid = Math.random().toString(36).slice(2, 10);
    super(styles);

    this.#selectId = `ekko-select-${uid}`;
    this.#helpId = `ekko-select-help-${uid}`;
    this.#errorId = `ekko-select-error-${uid}`;
    this.#syncing = false;

    this.shadow.innerHTML = this.#template();

    this.#labelEl = this.shadow.querySelector('.label') as HTMLLabelElement;
    this.#labelText = this.shadow.querySelector('.label-text') as HTMLSpanElement;
    this.#select = this.shadow.querySelector('.select') as HTMLSelectElement;
    this.#helpEl = this.shadow.querySelector('.help') as HTMLElement;
    this.#errorEl = this.shadow.querySelector('.error') as HTMLElement;

    this.#supportsBasePicker =
      typeof CSS !== 'undefined' && CSS.supports('appearance', 'base-select');
    this.#trigger = null;
    if (this.#supportsBasePicker) {
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.setAttribute('part', 'trigger');
      trigger.classList.add('trigger');
      trigger.innerHTML = '<selectedcontent></selectedcontent>';
      this.#select.append(trigger);
      this.#trigger = trigger;
      this.setAttribute('data-base-picker', '');
    }

    this.#internals = this.attachInternals();

    this.#changeHandler = this.#handleChange.bind(this);
    this.#inputHandler = this.#handleInput.bind(this);
    this.#observer = new MutationObserver(() => this.#syncOptions());
  }

  connectedCallback(): void {
    this.upgradeProperty('size');
    this.upgradeProperty('value');
    this.upgradeProperty('name');
    this.upgradeProperty('placeholder');
    this.upgradeProperty('multiple');
    this.upgradeProperty('disabled');
    this.upgradeProperty('required');
    this.upgradeProperty('invalid');
    this.upgradeProperty('label');
    this.upgradeProperty('visibleRows');

    if (!this.hasAttribute('size')) {
      this.size = 'md';
    }

    this.#select.addEventListener('change', this.#changeHandler);
    this.#select.addEventListener('input', this.#inputHandler);
    this.#observer.observe(this, { childList: true, subtree: true, attributes: true });

    this.#syncAll();
  }

  disconnectedCallback(): void {
    this.#select.removeEventListener('change', this.#changeHandler);
    this.#select.removeEventListener('input', this.#inputHandler);
    this.#observer.disconnect();
  }

  attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;
    this.#syncAll();
  }

  formResetCallback(): void {
    this.value = this.getAttribute('value') ?? '';
    this.#internals.setFormValue(this.value);
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  get size(): SelectSize {
    return (this.getAttribute('size') as SelectSize) ?? 'md';
  }
  set size(value: SelectSize) {
    this.setAttribute('size', value);
  }

  get value(): string {
    return this.#select?.value ?? this.getAttribute('value') ?? '';
  }
  set value(val: string) {
    if (this.#select) this.#select.value = val;
    this.#internals.setFormValue(val);
  }

  get name(): string {
    return this.getAttribute('name') ?? '';
  }
  set name(val: string) {
    this.setAttribute('name', val);
  }

  get placeholder(): string {
    return this.getAttribute('placeholder') ?? '';
  }
  set placeholder(val: string) {
    this.setAttribute('placeholder', val);
  }

  get visibleRows(): number {
    const val = this.getAttribute('visible-rows');
    return val === null ? 0 : Number(val);
  }
  set visibleRows(val: number) {
    this.setAttribute('visible-rows', String(val));
  }

  get multiple(): boolean {
    return this.hasAttribute('multiple');
  }
  set multiple(val: boolean) {
    this.toggleAttribute('multiple', Boolean(val));
  }

  get disabled(): boolean {
    return this.hasAttribute('disabled');
  }
  set disabled(val: boolean) {
    this.toggleAttribute('disabled', Boolean(val));
  }

  get required(): boolean {
    return this.hasAttribute('required');
  }
  set required(val: boolean) {
    this.toggleAttribute('required', Boolean(val));
  }

  get invalid(): boolean {
    return this.hasAttribute('invalid');
  }
  set invalid(val: boolean) {
    this.toggleAttribute('invalid', Boolean(val));
  }

  get label(): string {
    return this.getAttribute('label') ?? '';
  }
  set label(val: string) {
    this.setAttribute('label', val);
  }

  get options(): HTMLOptionsCollection {
    return this.#select.options;
  }

  get selectedOptions(): HTMLCollectionOf<HTMLOptionElement> {
    return this.#select.selectedOptions;
  }

  get selectedIndex(): number {
    return this.#select.selectedIndex;
  }
  set selectedIndex(val: number) {
    this.#select.selectedIndex = val;
  }

  get form(): HTMLFormElement | null {
    return this.#internals.form;
  }

  get validity(): ValidityState {
    return this.#select.validity;
  }

  get validationMessage(): string {
    return this.#select.validationMessage;
  }

  checkValidity(): boolean {
    return this.#select.checkValidity();
  }

  reportValidity(): boolean {
    return this.#select.reportValidity();
  }

  setCustomValidity(message: string): void {
    this.#select.setCustomValidity(message);
    this.#internals.setValidity(this.#select.validity, message, this.#select);
  }

  focus(options?: FocusOptions): void {
    this.#select.focus(options);
  }

  blur(): void {
    this.#select.blur();
  }

  #template(): string {
    return `
      <div class="field">
        <label class="label" for="${this.#selectId}" hidden>
          <span class="label-text"></span>
          <span class="required-indicator" aria-hidden="true" hidden>*</span>
        </label>
        <div class="control" part="control">
          <select part="base" class="select" id="${this.#selectId}"></select>
          <svg
            class="chevron"
            part="chevron"
            viewBox="0 0 16 16"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 6 L8 10 L12 6"></path>
          </svg>
        </div>
        <div class="help" id="${this.#helpId}" part="help" hidden></div>
        <div class="error" id="${this.#errorId}" part="error" role="alert" hidden></div>
      </div>
    `;
  }

  #syncAll(): void {
    if (!this.#select) return;
    this.#syncForwardedAttributes();
    this.#syncVisibleRows();
    this.#syncTrigger();
    this.#syncOptions();
    this.#syncState();
    this.#syncLabel();
    this.#syncMessages();
    this.#syncAccessibility();
    this.#internals.setFormValue(this.#select.value);
  }

  #syncTrigger(): void {
    if (!this.#trigger) return;
    const isListbox = this.multiple || this.visibleRows > 1;
    if (isListbox) {
      if (this.#trigger.parentNode) this.#trigger.remove();
    } else if (!this.#trigger.parentNode) {
      this.#select.prepend(this.#trigger);
    }
  }

  #syncForwardedAttributes(): void {
    for (const attr of FORWARDED_ATTRIBUTES) {
      const val = this.getAttribute(attr);
      if (val === null) {
        this.#select.removeAttribute(attr);
      } else {
        this.#select.setAttribute(attr, val);
      }
    }
  }

  #syncVisibleRows(): void {
    const rows = this.getAttribute('visible-rows');
    if (rows !== null && Number(rows) > 1) {
      this.#select.setAttribute('size', rows);
    } else {
      this.#select.removeAttribute('size');
    }
  }

  #syncOptions(): void {
    if (this.#syncing) return;
    this.#syncing = true;

    const previousValue = this.getAttribute('value');
    const liveValue = this.#select.value;

    for (const child of Array.from(this.#select.children)) {
      if (child !== this.#trigger) child.remove();
    }

    const placeholder = this.getAttribute('placeholder');
    if (placeholder && !this.multiple) {
      const placeholderOpt = document.createElement('option');
      placeholderOpt.value = '';
      placeholderOpt.textContent = placeholder;
      placeholderOpt.disabled = true;
      placeholderOpt.hidden = true;
      placeholderOpt.selected = !previousValue && !liveValue;
      this.#select.append(placeholderOpt);
    }

    for (const child of Array.from(this.children)) {
      if (child instanceof HTMLOptionElement || child instanceof HTMLOptGroupElement) {
        this.#select.append(child.cloneNode(true));
      }
    }

    if (previousValue !== null) {
      this.#select.value = previousValue;
    } else if (liveValue) {
      this.#select.value = liveValue;
    }

    this.#syncing = false;
  }

  #syncState(): void {
    this.#select.disabled = this.disabled;
    this.#select.required = this.required;

    if (this.disabled) {
      this.#select.setAttribute('aria-disabled', 'true');
    } else {
      this.#select.removeAttribute('aria-disabled');
    }

    if (this.invalid) {
      this.#select.setAttribute('aria-invalid', 'true');
    } else {
      this.#select.removeAttribute('aria-invalid');
    }

    if (this.required) {
      this.#select.setAttribute('aria-required', 'true');
    } else {
      this.#select.removeAttribute('aria-required');
    }
  }

  #syncLabel(): void {
    const label = this.getAttribute('label');
    if (label) {
      this.#labelText.textContent = label;
      this.#labelEl.removeAttribute('hidden');
    } else {
      this.#labelText.textContent = '';
      this.#labelEl.setAttribute('hidden', '');
    }

    const indicator = this.#labelEl.querySelector('.required-indicator') as HTMLElement;
    if (label && this.required) {
      indicator.removeAttribute('hidden');
    } else {
      indicator.setAttribute('hidden', '');
    }
  }

  #syncMessages(): void {
    const help = this.getAttribute('help');
    const error = this.getAttribute('error');

    if (help) {
      this.#helpEl.textContent = help;
      this.#helpEl.removeAttribute('hidden');
    } else {
      this.#helpEl.textContent = '';
      this.#helpEl.setAttribute('hidden', '');
    }

    if (error) {
      this.#errorEl.textContent = error;
      this.#errorEl.removeAttribute('hidden');
    } else {
      this.#errorEl.textContent = '';
      this.#errorEl.setAttribute('hidden', '');
    }
  }

  #syncAccessibility(): void {
    const ariaLabel = this.getAttribute('aria-label');
    if (ariaLabel) {
      this.#select.setAttribute('aria-label', ariaLabel);
    } else if (!this.getAttribute('label')) {
      this.#select.removeAttribute('aria-label');
    } else {
      this.#select.removeAttribute('aria-label');
    }

    const describedByParts: string[] = [];
    const external = this.getAttribute('aria-describedby');
    if (external) describedByParts.push(external);
    if (this.getAttribute('help') && !this.invalid) describedByParts.push(this.#helpId);
    if (this.invalid && this.getAttribute('error')) describedByParts.push(this.#errorId);

    if (describedByParts.length > 0) {
      this.#select.setAttribute('aria-describedby', describedByParts.join(' '));
    } else {
      this.#select.removeAttribute('aria-describedby');
    }
  }

  #handleChange(event: Event): void {
    this.#internals.setFormValue(this.#select.value);
    this.dispatchEvent(
      new CustomEvent<EkkoChangeEventDetail>('ekko-change', {
        bubbles: true,
        composed: true,
        detail: { value: this.#select.value, originalEvent: event },
      })
    );
  }

  #handleInput(event: Event): void {
    this.#internals.setFormValue(this.#select.value);
    this.dispatchEvent(
      new CustomEvent<EkkoInputEventDetail>('ekko-input', {
        bubbles: true,
        composed: true,
        detail: { value: this.#select.value, originalEvent: event },
      })
    );
  }
}

if (!customElements.get('ekko-select')) {
  customElements.define('ekko-select', EkkoSelect);
}
