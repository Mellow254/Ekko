import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'date'
  | 'datetime-local'
  | 'month'
  | 'week'
  | 'time'
  | 'color'
  | 'file'
  | 'range';

export type InputSize = 'sm' | 'md' | 'lg';

export interface EkkoInputEventDetail {
  value: string;
  originalEvent: Event;
}

export interface EkkoChangeEventDetail {
  value: string;
  originalEvent: Event;
}

// Attributes forwarded verbatim from host → inner <input>. The native input
// enforces per-type semantics (e.g. min/max on number, accept on file).
const FORWARDED_ATTRIBUTES = [
  'type',
  'name',
  'placeholder',
  'value',
  'min',
  'max',
  'step',
  'minlength',
  'maxlength',
  'pattern',
  'autocomplete',
  'autocapitalize',
  'inputmode',
  'list',
  'multiple',
  'accept',
  'spellcheck',
] as const;

export class EkkoInput extends HTMLElement {
  static formAssociated = true;

  static get observedAttributes(): string[] {
    return [
      ...FORWARDED_ATTRIBUTES,
      'size',
      'disabled',
      'readonly',
      'required',
      'invalid',
      'label',
      'help',
      'error',
      'full-width',
      'aria-label',
      'aria-describedby',
    ];
  }

  #shadow: ShadowRoot;
  #input: HTMLInputElement;
  #labelEl: HTMLLabelElement;
  #labelText: HTMLSpanElement;
  #helpEl: HTMLElement;
  #errorEl: HTMLElement;
  #control: HTMLElement;
  #startSlot: HTMLSlotElement;
  #endSlot: HTMLSlotElement;
  #internals: ElementInternals;
  #inputHandler: (event: Event) => void;
  #changeHandler: (event: Event) => void;
  #slotChangeHandler: () => void;
  #inputId: string;
  #helpId: string;
  #errorId: string;

  constructor() {
    super();

    this.#shadow = this.attachShadow({ mode: 'open' });
    this.#shadow.adoptedStyleSheets = [styles];

    const uid = Math.random().toString(36).slice(2, 10);
    this.#inputId = `ekko-input-${uid}`;
    this.#helpId = `ekko-input-help-${uid}`;
    this.#errorId = `ekko-input-error-${uid}`;

    this.#shadow.innerHTML = this.#template();

    this.#labelEl = this.#shadow.querySelector('.label') as HTMLLabelElement;
    this.#labelText = this.#shadow.querySelector('.label-text') as HTMLSpanElement;
    this.#control = this.#shadow.querySelector('.control') as HTMLElement;
    this.#input = this.#shadow.querySelector('.input') as HTMLInputElement;
    this.#helpEl = this.#shadow.querySelector('.help') as HTMLElement;
    this.#errorEl = this.#shadow.querySelector('.error') as HTMLElement;
    this.#startSlot = this.#shadow.querySelector('slot[name="start"]') as HTMLSlotElement;
    this.#endSlot = this.#shadow.querySelector('slot[name="end"]') as HTMLSlotElement;

    this.#internals = this.attachInternals();

    this.#inputHandler = this.#handleInput.bind(this);
    this.#changeHandler = this.#handleChange.bind(this);
    this.#slotChangeHandler = this.#handleSlotChange.bind(this);
  }

  connectedCallback(): void {
    if (!this.hasAttribute('type')) {
      this.type = 'text';
    }
    if (!this.hasAttribute('size')) {
      this.size = 'md';
    }

    this.#input.addEventListener('input', this.#inputHandler);
    this.#input.addEventListener('change', this.#changeHandler);
    this.#startSlot.addEventListener('slotchange', this.#slotChangeHandler);
    this.#endSlot.addEventListener('slotchange', this.#slotChangeHandler);

    this.#syncAll();
    this.#handleSlotChange();
  }

  disconnectedCallback(): void {
    this.#input.removeEventListener('input', this.#inputHandler);
    this.#input.removeEventListener('change', this.#changeHandler);
    this.#startSlot.removeEventListener('slotchange', this.#slotChangeHandler);
    this.#endSlot.removeEventListener('slotchange', this.#slotChangeHandler);
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

  get type(): InputType {
    return (this.getAttribute('type') as InputType) ?? 'text';
  }
  set type(value: InputType) {
    this.setAttribute('type', value);
  }

  get size(): InputSize {
    return (this.getAttribute('size') as InputSize) ?? 'md';
  }
  set size(value: InputSize) {
    this.setAttribute('size', value);
  }

  get value(): string {
    return this.#input?.value ?? this.getAttribute('value') ?? '';
  }
  set value(val: string) {
    if (this.#input) this.#input.value = val;
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

  get disabled(): boolean {
    return this.hasAttribute('disabled');
  }
  set disabled(val: boolean) {
    this.toggleAttribute('disabled', Boolean(val));
  }

  get readOnly(): boolean {
    return this.hasAttribute('readonly');
  }
  set readOnly(val: boolean) {
    this.toggleAttribute('readonly', Boolean(val));
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

  get form(): HTMLFormElement | null {
    return this.#internals.form;
  }

  get validity(): ValidityState {
    return this.#input.validity;
  }

  get validationMessage(): string {
    return this.#input.validationMessage;
  }

  checkValidity(): boolean {
    return this.#input.checkValidity();
  }

  reportValidity(): boolean {
    return this.#input.reportValidity();
  }

  setCustomValidity(message: string): void {
    this.#input.setCustomValidity(message);
    this.#internals.setValidity(this.#input.validity, message, this.#input);
  }

  focus(options?: FocusOptions): void {
    this.#input.focus(options);
  }

  blur(): void {
    this.#input.blur();
  }

  select(): void {
    if (typeof this.#input.select === 'function') this.#input.select();
  }

  setSelectionRange(
    start: number | null,
    end: number | null,
    direction?: 'forward' | 'backward' | 'none'
  ): void {
    if (typeof this.#input.setSelectionRange === 'function') {
      this.#input.setSelectionRange(start, end, direction);
    }
  }

  #template(): string {
    return `
      <div class="field">
        <label class="label" for="${this.#inputId}" hidden>
          <span class="label-text"></span>
          <span class="required-indicator" aria-hidden="true" hidden>*</span>
        </label>
        <div class="control" part="control">
          <slot name="start"></slot>
          <input
            part="base"
            class="input"
            id="${this.#inputId}"
            type="text"
          />
          <slot name="end"></slot>
        </div>
        <div class="help" id="${this.#helpId}" part="help" hidden></div>
        <div class="error" id="${this.#errorId}" part="error" role="alert" hidden></div>
      </div>
    `;
  }

  #syncAll(): void {
    if (!this.#input) return;
    this.#syncForwardedAttributes();
    this.#syncState();
    this.#syncLabel();
    this.#syncMessages();
    this.#syncAccessibility();
    this.#internals.setFormValue(this.#input.value);
  }

  #syncForwardedAttributes(): void {
    for (const attr of FORWARDED_ATTRIBUTES) {
      const val = this.getAttribute(attr);
      if (val === null) {
        this.#input.removeAttribute(attr);
      } else {
        this.#input.setAttribute(attr, val);
      }
    }
    if (!this.hasAttribute('type')) {
      this.#input.setAttribute('type', 'text');
    }
  }

  #syncState(): void {
    this.#input.disabled = this.disabled;
    this.#input.readOnly = this.readOnly;
    this.#input.required = this.required;

    if (this.disabled) {
      this.#input.setAttribute('aria-disabled', 'true');
    } else {
      this.#input.removeAttribute('aria-disabled');
    }

    if (this.invalid) {
      this.#input.setAttribute('aria-invalid', 'true');
    } else {
      this.#input.removeAttribute('aria-invalid');
    }

    if (this.required) {
      this.#input.setAttribute('aria-required', 'true');
    } else {
      this.#input.removeAttribute('aria-required');
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
      this.#input.setAttribute('aria-label', ariaLabel);
    } else if (!this.getAttribute('label')) {
      this.#input.removeAttribute('aria-label');
    } else {
      this.#input.removeAttribute('aria-label');
    }

    const describedByParts: string[] = [];
    const external = this.getAttribute('aria-describedby');
    if (external) describedByParts.push(external);
    if (this.getAttribute('help') && !this.invalid) describedByParts.push(this.#helpId);
    if (this.invalid && this.getAttribute('error')) describedByParts.push(this.#errorId);

    if (describedByParts.length > 0) {
      this.#input.setAttribute('aria-describedby', describedByParts.join(' '));
    } else {
      this.#input.removeAttribute('aria-describedby');
    }
  }

  #handleSlotChange(): void {
    const hasStart = this.#startSlot.assignedNodes({ flatten: true }).length > 0;
    const hasEnd = this.#endSlot.assignedNodes({ flatten: true }).length > 0;
    this.#control.classList.toggle('has-start', hasStart);
    this.#control.classList.toggle('has-end', hasEnd);
  }

  #handleInput(event: Event): void {
    this.#internals.setFormValue(this.#input.value);
    this.dispatchEvent(
      new CustomEvent<EkkoInputEventDetail>('ekko-input', {
        bubbles: true,
        composed: true,
        detail: { value: this.#input.value, originalEvent: event },
      })
    );
  }

  #handleChange(event: Event): void {
    this.#internals.setFormValue(this.#input.value);
    this.dispatchEvent(
      new CustomEvent<EkkoChangeEventDetail>('ekko-change', {
        bubbles: true,
        composed: true,
        detail: { value: this.#input.value, originalEvent: event },
      })
    );
  }
}

if (!customElements.get('ekko-input')) {
  customElements.define('ekko-input', EkkoInput);
}
