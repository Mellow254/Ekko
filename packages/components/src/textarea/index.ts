import { EkkoBase } from '../base';
import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

export type TextareaSize = 'sm' | 'md' | 'lg';
export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';
export type TextareaWrap = 'soft' | 'hard' | 'off';

export interface EkkoInputEventDetail {
  value: string;
  originalEvent: Event;
}

export interface EkkoChangeEventDetail {
  value: string;
  originalEvent: Event;
}

// `value` is handled separately — unlike <input>, the textarea element has no
// `value` HTML attribute, so it must be assigned to the `.value` property.
const FORWARDED_ATTRIBUTES = [
  'name',
  'placeholder',
  'rows',
  'cols',
  'wrap',
  'minlength',
  'maxlength',
  'autocomplete',
  'autocapitalize',
  'spellcheck',
  'dirname',
] as const;

export class EkkoTextarea extends EkkoBase {
  static formAssociated = true;

  static get observedAttributes(): string[] {
    return [
      ...FORWARDED_ATTRIBUTES,
      'value',
      'size',
      'resize',
      'disabled',
      'readonly',
      'required',
      'invalid',
      'loading',
      'label',
      'help',
      'error',
      'full-width',
      'aria-label',
      'aria-describedby',
    ];
  }

  #textarea: HTMLTextAreaElement;
  #labelEl: HTMLLabelElement;
  #labelText: HTMLSpanElement;
  #helpEl: HTMLElement;
  #errorEl: HTMLElement;
  #internals: ElementInternals;
  #inputHandler: (event: Event) => void;
  #changeHandler: (event: Event) => void;
  #textareaId: string;
  #helpId: string;
  #errorId: string;

  constructor() {
    const uid = Math.random().toString(36).slice(2, 10);
    const textareaId = `ekko-textarea-${uid}`;
    const helpId = `ekko-textarea-help-${uid}`;
    const errorId = `ekko-textarea-error-${uid}`;

    super(styles);

    this.#textareaId = textareaId;
    this.#helpId = helpId;
    this.#errorId = errorId;

    this.shadow.innerHTML = this.#template();

    this.#labelEl = this.shadow.querySelector('.label') as HTMLLabelElement;
    this.#labelText = this.shadow.querySelector('.label-text') as HTMLSpanElement;
    this.#textarea = this.shadow.querySelector('.textarea') as HTMLTextAreaElement;
    this.#helpEl = this.shadow.querySelector('.help') as HTMLElement;
    this.#errorEl = this.shadow.querySelector('.error') as HTMLElement;

    this.#internals = this.attachInternals();

    this.#inputHandler = this.#handleInput.bind(this);
    this.#changeHandler = this.#handleChange.bind(this);
  }

  connectedCallback(): void {
    this.upgradeProperty('size');
    this.upgradeProperty('resize');
    this.upgradeProperty('value');
    this.upgradeProperty('name');
    this.upgradeProperty('placeholder');
    this.upgradeProperty('rows');
    this.upgradeProperty('cols');
    this.upgradeProperty('wrap');
    this.upgradeProperty('disabled');
    this.upgradeProperty('readOnly');
    this.upgradeProperty('required');
    this.upgradeProperty('invalid');
    this.upgradeProperty('loading');
    this.upgradeProperty('label');

    if (!this.hasAttribute('size')) {
      this.size = 'md';
    }

    this.#textarea.addEventListener('input', this.#inputHandler);
    this.#textarea.addEventListener('change', this.#changeHandler);

    this.#syncAll();
  }

  disconnectedCallback(): void {
    this.#textarea.removeEventListener('input', this.#inputHandler);
    this.#textarea.removeEventListener('change', this.#changeHandler);
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

  get size(): TextareaSize {
    return (this.getAttribute('size') as TextareaSize) ?? 'md';
  }
  set size(value: TextareaSize) {
    this.setAttribute('size', value);
  }

  get resize(): TextareaResize {
    return (this.getAttribute('resize') as TextareaResize) ?? 'vertical';
  }
  set resize(value: TextareaResize) {
    this.setAttribute('resize', value);
  }

  get value(): string {
    return this.#textarea?.value ?? this.getAttribute('value') ?? '';
  }
  set value(val: string) {
    if (this.#textarea) this.#textarea.value = val;
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

  get rows(): number {
    const val = this.getAttribute('rows');
    return val === null ? (this.#textarea?.rows ?? 2) : Number(val);
  }
  set rows(val: number) {
    this.setAttribute('rows', String(val));
  }

  get cols(): number {
    const val = this.getAttribute('cols');
    return val === null ? (this.#textarea?.cols ?? 20) : Number(val);
  }
  set cols(val: number) {
    this.setAttribute('cols', String(val));
  }

  get wrap(): TextareaWrap {
    return (this.getAttribute('wrap') as TextareaWrap) ?? 'soft';
  }
  set wrap(val: TextareaWrap) {
    this.setAttribute('wrap', val);
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

  get loading(): boolean {
    return this.hasAttribute('loading');
  }
  set loading(val: boolean) {
    this.toggleAttribute('loading', Boolean(val));
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
    return this.#textarea.validity;
  }

  get validationMessage(): string {
    return this.#textarea.validationMessage;
  }

  get textLength(): number {
    return this.#textarea?.textLength ?? 0;
  }

  checkValidity(): boolean {
    return this.#textarea.checkValidity();
  }

  reportValidity(): boolean {
    return this.#textarea.reportValidity();
  }

  setCustomValidity(message: string): void {
    this.#textarea.setCustomValidity(message);
    this.#internals.setValidity(this.#textarea.validity, message, this.#textarea);
  }

  focus(options?: FocusOptions): void {
    this.#textarea.focus(options);
  }

  blur(): void {
    this.#textarea.blur();
  }

  select(): void {
    if (typeof this.#textarea.select === 'function') this.#textarea.select();
  }

  setSelectionRange(
    start: number | null,
    end: number | null,
    direction?: 'forward' | 'backward' | 'none'
  ): void {
    if (typeof this.#textarea.setSelectionRange === 'function') {
      this.#textarea.setSelectionRange(start, end, direction);
    }
  }

  setRangeText(
    replacement: string,
    start?: number,
    end?: number,
    selectionMode?: SelectionMode
  ): void {
    if (typeof this.#textarea.setRangeText !== 'function') return;
    if (start === undefined || end === undefined) {
      this.#textarea.setRangeText(replacement);
    } else {
      this.#textarea.setRangeText(replacement, start, end, selectionMode);
    }
    this.#internals.setFormValue(this.#textarea.value);
  }

  #template(): string {
    return `
      <div class="field">
        <label class="label" for="${this.#textareaId}" hidden>
          <span class="label-text"></span>
          <span class="required-indicator" aria-hidden="true" hidden>*</span>
        </label>
        <div class="control" part="control">
          <textarea
            part="base"
            class="textarea"
            id="${this.#textareaId}"
          ></textarea>
          <div class="spinner" aria-hidden="true"></div>
        </div>
        <div class="help" id="${this.#helpId}" part="help" hidden></div>
        <div class="error" id="${this.#errorId}" part="error" role="alert" hidden></div>
      </div>
    `;
  }

  #syncAll(): void {
    if (!this.#textarea) return;
    this.#syncForwardedAttributes();
    this.#syncValue();
    this.#syncState();
    this.#syncLabel();
    this.#syncMessages();
    this.#syncAccessibility();
    this.#internals.setFormValue(this.#textarea.value);
  }

  #syncForwardedAttributes(): void {
    for (const attr of FORWARDED_ATTRIBUTES) {
      const val = this.getAttribute(attr);
      if (val === null) {
        this.#textarea.removeAttribute(attr);
      } else {
        this.#textarea.setAttribute(attr, val);
      }
    }
  }

  #syncValue(): void {
    const attrValue = this.getAttribute('value');
    if (attrValue !== null && this.#textarea.value !== attrValue) {
      this.#textarea.value = attrValue;
    }
  }

  #syncState(): void {
    this.#textarea.disabled = this.disabled || this.loading;
    this.#textarea.readOnly = this.readOnly;
    this.#textarea.required = this.required;

    if (this.disabled || this.loading) {
      this.#textarea.setAttribute('aria-disabled', 'true');
    } else {
      this.#textarea.removeAttribute('aria-disabled');
    }

    if (this.loading) {
      this.#textarea.setAttribute('aria-busy', 'true');
    } else {
      this.#textarea.removeAttribute('aria-busy');
    }

    if (this.invalid) {
      this.#textarea.setAttribute('aria-invalid', 'true');
    } else {
      this.#textarea.removeAttribute('aria-invalid');
    }

    if (this.required) {
      this.#textarea.setAttribute('aria-required', 'true');
    } else {
      this.#textarea.removeAttribute('aria-required');
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
      this.#textarea.setAttribute('aria-label', ariaLabel);
    } else {
      this.#textarea.removeAttribute('aria-label');
    }

    const describedByParts: string[] = [];
    const external = this.getAttribute('aria-describedby');
    if (external) describedByParts.push(external);
    if (this.getAttribute('help') && !this.invalid) describedByParts.push(this.#helpId);
    if (this.invalid && this.getAttribute('error')) describedByParts.push(this.#errorId);

    if (describedByParts.length > 0) {
      this.#textarea.setAttribute('aria-describedby', describedByParts.join(' '));
    } else {
      this.#textarea.removeAttribute('aria-describedby');
    }
  }

  #handleInput(event: Event): void {
    this.#internals.setFormValue(this.#textarea.value);
    this.dispatchEvent(
      new CustomEvent<EkkoInputEventDetail>('ekko-input', {
        bubbles: true,
        composed: true,
        detail: { value: this.#textarea.value, originalEvent: event },
      })
    );
  }

  #handleChange(event: Event): void {
    this.#internals.setFormValue(this.#textarea.value);
    this.dispatchEvent(
      new CustomEvent<EkkoChangeEventDetail>('ekko-change', {
        bubbles: true,
        composed: true,
        detail: { value: this.#textarea.value, originalEvent: event },
      })
    );
  }
}

if (!customElements.get('ekko-textarea')) {
  customElements.define('ekko-textarea', EkkoTextarea);
}
