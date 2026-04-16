import { EkkoBase } from '../base';
import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

export type RadioSize = 'sm' | 'md' | 'lg';

export interface EkkoChangeEventDetail {
  checked: boolean;
  value: string;
  originalEvent: Event;
}

export class EkkoRadio extends EkkoBase {
  static formAssociated = true;

  static get observedAttributes(): string[] {
    return [
      'checked',
      'disabled',
      'required',
      'name',
      'value',
      'size',
      'aria-label',
      'aria-describedby',
    ];
  }

  #input: HTMLInputElement;
  #internals: ElementInternals;
  #changeHandler: (event: Event) => void;
  #keydownHandler: (event: KeyboardEvent) => void;
  #defaultChecked = false;

  constructor() {
    super(styles);
    this.shadow.innerHTML = this.#template();

    this.#input = this.shadow.querySelector('.input') as HTMLInputElement;
    this.#internals = this.attachInternals();
    this.#changeHandler = this.#handleChange.bind(this);
    this.#keydownHandler = this.#handleKeyDown.bind(this);
  }

  connectedCallback(): void {
    this.upgradeProperty('checked');
    this.upgradeProperty('disabled');
    this.upgradeProperty('required');
    this.upgradeProperty('name');
    this.upgradeProperty('value');
    this.upgradeProperty('size');

    if (!this.hasAttribute('size')) {
      this.size = 'md';
    }

    this.#defaultChecked = this.hasAttribute('checked');
    if (this.#defaultChecked) {
      this.#input.checked = true;
    }
    this.#syncFormValue();

    this.#input.addEventListener('change', this.#changeHandler);
    this.#input.addEventListener('keydown', this.#keydownHandler);

    this.#syncAccessibility();
    queueMicrotask(() => this.#updateGroupTabindex());
  }

  disconnectedCallback(): void {
    this.#input.removeEventListener('change', this.#changeHandler);
    this.#input.removeEventListener('keydown', this.#keydownHandler);
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    if (name === 'checked') {
      const isChecked = newValue !== null;
      this.#input.checked = isChecked;
      if (isChecked) this.#uncheckSiblings();
      this.#syncFormValue();
      this.#updateGroupTabindex();
    }

    if (name === 'disabled' || name === 'name') {
      this.#updateGroupTabindex();
    }

    this.#syncAccessibility();
  }

  get checked(): boolean {
    return this.#input?.checked ?? false;
  }
  set checked(val: boolean) {
    const isChecked = Boolean(val);
    if (this.#input) this.#input.checked = isChecked;
    this.toggleAttribute('checked', isChecked);
    if (isChecked) this.#uncheckSiblings();
    this.#syncFormValue();
    this.#updateGroupTabindex();
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

  get size(): RadioSize {
    return (this.getAttribute('size') as RadioSize) ?? 'md';
  }
  set size(val: RadioSize) {
    this.setAttribute('size', val);
  }

  get form(): HTMLFormElement | null {
    return this.#internals.form;
  }

  focus(options?: FocusOptions): void {
    this.#input?.focus(options);
  }

  formResetCallback(): void {
    this.#input.checked = this.#defaultChecked;
    this.toggleAttribute('checked', this.#defaultChecked);
    this.#syncFormValue();
    this.#updateGroupTabindex();
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  #template(): string {
    return `
      <label class="label">
        <input part="base" class="input" type="radio" />
        <span class="circle" aria-hidden="true"></span>
        <span class="label-text"><slot></slot></span>
      </label>
    `;
  }

  #syncAccessibility(): void {
    if (!this.#input) return;

    this.#input.disabled = this.disabled;
    this.#input.required = this.required;

    if (this.disabled) {
      this.#input.setAttribute('aria-disabled', 'true');
    } else {
      this.#input.removeAttribute('aria-disabled');
    }

    this.forwardAriaLabel(this.#input);
    this.forwardAriaDescribedby(this.#input);
  }

  #syncFormValue(): void {
    if (!this.#internals) return;
    this.#internals.setFormValue(this.#input?.checked ? this.value : null);
  }

  #handleChange(event: Event): void {
    if (this.#input.checked) {
      this.toggleAttribute('checked', true);
      this.#uncheckSiblings();
      this.#updateGroupTabindex();
    }
    this.#syncFormValue();
    this.dispatchEvent(
      new CustomEvent<EkkoChangeEventDetail>('ekko-change', {
        bubbles: true,
        composed: true,
        detail: {
          checked: this.#input.checked,
          value: this.value,
          originalEvent: event,
        },
      })
    );
  }

  #handleKeyDown(event: KeyboardEvent): void {
    if (this.disabled) return;

    const isForward = event.key === 'ArrowDown' || event.key === 'ArrowRight';
    const isBackward = event.key === 'ArrowUp' || event.key === 'ArrowLeft';
    if (!isForward && !isBackward) return;

    const members = this.#getGroupMembers().filter((r) => !r.disabled);
    if (members.length < 2) return;

    event.preventDefault();

    const idx = members.indexOf(this);
    const delta = isForward ? 1 : -1;
    const nextIdx = (idx + delta + members.length) % members.length;
    const next = members[nextIdx];

    next.checked = true;
    next.focus();
    next.dispatchEvent(
      new CustomEvent<EkkoChangeEventDetail>('ekko-change', {
        bubbles: true,
        composed: true,
        detail: {
          checked: true,
          value: next.value,
          originalEvent: event,
        },
      })
    );
  }

  #uncheckSiblings(): void {
    for (const sibling of this.#getGroupMembers()) {
      if (sibling !== this && sibling.checked) {
        sibling.checked = false;
      }
    }
  }

  refreshTabindex(): void {
    if (!this.#input) return;
    const members = this.#getGroupMembers();
    if (members.length === 0) return;

    const enabled = members.filter((r) => !r.disabled);
    const checked = enabled.find((r) => r.checked);
    const tabbable = checked ?? enabled[0];

    if (this === tabbable) {
      this.#input.removeAttribute('tabindex');
    } else {
      this.#input.setAttribute('tabindex', '-1');
    }
  }

  #updateGroupTabindex(): void {
    for (const member of this.#getGroupMembers()) {
      if (member instanceof EkkoRadio) {
        member.refreshTabindex();
      }
    }
  }

  #getGroupMembers(): EkkoRadio[] {
    if (!this.name) return [this];
    const scope: ParentNode =
      this.#internals.form ?? (this.getRootNode() as Document | ShadowRoot | null) ?? document;
    const selector = `ekko-radio[name="${CSS.escape(this.name)}"]`;
    return Array.from(scope.querySelectorAll<EkkoRadio>(selector));
  }
}

if (!customElements.get('ekko-radio')) {
  customElements.define('ekko-radio', EkkoRadio);
}
