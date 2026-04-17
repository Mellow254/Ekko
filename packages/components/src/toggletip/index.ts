import { EkkoBase } from '../base';
import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

export type ToggletipPlacement = 'top' | 'right' | 'bottom' | 'left';
export type ToggletipSize = 'sm' | 'md' | 'lg';
export type ToggletipVariant = 'default' | 'inverse';

export interface EkkoShowEventDetail {
  placement: ToggletipPlacement;
}

export interface EkkoHideEventDetail {
  placement: ToggletipPlacement;
}

export class EkkoToggletip extends EkkoBase {
  static get observedAttributes(): string[] {
    return [
      'label',
      'placement',
      'size',
      'variant',
      'disabled',
      'loading',
      'open',
      'aria-label',
      'aria-describedby',
    ];
  }

  #trigger: HTMLButtonElement;
  #popover: HTMLElement;
  #contentEl: HTMLSpanElement;
  #popoverId: string;
  #triggerClickHandler: (event: Event) => void;
  #keydownHandler: (event: KeyboardEvent) => void;
  #documentClickHandler: (event: Event) => void;

  constructor() {
    const uid = Math.random().toString(36).slice(2, 10);
    super(styles);
    this.#popoverId = `ekko-toggletip-${uid}`;
    this.shadow.innerHTML = this.#template();

    this.#trigger = this.shadow.querySelector('.trigger') as HTMLButtonElement;
    this.#popover = this.shadow.querySelector('.popover') as HTMLElement;
    this.#contentEl = this.shadow.querySelector('.content') as HTMLSpanElement;

    this.#triggerClickHandler = this.#handleTriggerClick.bind(this);
    this.#keydownHandler = this.#handleKeydown.bind(this);
    this.#documentClickHandler = this.#handleDocumentClick.bind(this);
  }

  connectedCallback(): void {
    this.upgradeProperty('label');
    this.upgradeProperty('placement');
    this.upgradeProperty('size');
    this.upgradeProperty('variant');
    this.upgradeProperty('disabled');
    this.upgradeProperty('loading');
    this.upgradeProperty('open');

    if (!this.hasAttribute('placement')) {
      this.placement = 'top';
    }
    if (!this.hasAttribute('size')) {
      this.size = 'md';
    }

    this.#trigger.addEventListener('click', this.#triggerClickHandler);
    this.addEventListener('keydown', this.#keydownHandler);
    document.addEventListener('click', this.#documentClickHandler);

    this.#syncContent();
    this.#syncAccessibility();
  }

  disconnectedCallback(): void {
    this.#trigger.removeEventListener('click', this.#triggerClickHandler);
    this.removeEventListener('keydown', this.#keydownHandler);
    document.removeEventListener('click', this.#documentClickHandler);
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    if (name === 'label') {
      this.#syncContent();
    }

    if (name === 'disabled' && newValue !== null && this.hasAttribute('open')) {
      this.removeAttribute('open');
    }

    this.#syncAccessibility();
  }

  get label(): string {
    return this.getAttribute('label') ?? '';
  }
  set label(value: string) {
    this.setAttribute('label', value);
  }

  get placement(): ToggletipPlacement {
    return (this.getAttribute('placement') as ToggletipPlacement) ?? 'top';
  }
  set placement(value: ToggletipPlacement) {
    this.setAttribute('placement', value);
  }

  get size(): ToggletipSize {
    return (this.getAttribute('size') as ToggletipSize) ?? 'md';
  }
  set size(value: ToggletipSize) {
    this.setAttribute('size', value);
  }

  get variant(): ToggletipVariant {
    return (this.getAttribute('variant') as ToggletipVariant) ?? 'default';
  }
  set variant(value: ToggletipVariant) {
    this.setAttribute('variant', value);
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

  get open(): boolean {
    return this.hasAttribute('open');
  }
  set open(value: boolean) {
    this.toggleAttribute('open', Boolean(value));
  }

  show(): void {
    if (this.disabled || this.open) return;
    this.setAttribute('open', '');
    this.dispatchEvent(
      new CustomEvent<EkkoShowEventDetail>('ekko-show', {
        bubbles: true,
        composed: true,
        detail: { placement: this.placement },
      })
    );
  }

  hide(): void {
    if (!this.open) return;
    this.removeAttribute('open');
    this.dispatchEvent(
      new CustomEvent<EkkoHideEventDetail>('ekko-hide', {
        bubbles: true,
        composed: true,
        detail: { placement: this.placement },
      })
    );
  }

  toggle(): void {
    if (this.open) {
      this.hide();
    } else {
      this.show();
    }
  }

  #template(): string {
    return `
      <button part="base" class="trigger" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="${this.#popoverId}">
        <slot name="trigger">i</slot>
      </button>
      <span part="popover" class="popover" role="status" aria-live="polite" id="${this.#popoverId}">
        <span class="content" part="content"><slot></slot></span>
        <span class="spinner" part="spinner" aria-hidden="true"></span>
        <span class="arrow" part="arrow" aria-hidden="true"></span>
      </span>
    `;
  }

  #syncContent(): void {
    const label = this.getAttribute('label');
    if (label !== null && this.#contentEl) {
      const slotted = this.querySelector(':scope > :not([slot])');
      if (!slotted) {
        this.#contentEl.textContent = label;
      }
    }
  }

  #syncAccessibility(): void {
    if (!this.#trigger || !this.#popover) return;

    this.#trigger.setAttribute('aria-expanded', this.open ? 'true' : 'false');

    if (this.disabled) {
      this.#trigger.setAttribute('aria-disabled', 'true');
      this.#trigger.disabled = true;
    } else {
      this.#trigger.removeAttribute('aria-disabled');
      this.#trigger.disabled = false;
    }

    if (this.loading) {
      this.#popover.setAttribute('aria-busy', 'true');
    } else {
      this.#popover.removeAttribute('aria-busy');
    }

    this.forwardAriaLabel(this.#trigger);
    this.forwardAriaDescribedby(this.#trigger);
  }

  #handleTriggerClick(event: Event): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    event.stopPropagation();
    this.toggle();
  }

  #handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.open) {
      event.stopPropagation();
      this.hide();
      this.#trigger.focus();
    }
  }

  #handleDocumentClick(event: Event): void {
    if (!this.open) return;
    const path = event.composedPath();
    if (path.includes(this)) return;
    this.hide();
  }
}

if (!customElements.get('ekko-toggletip')) {
  customElements.define('ekko-toggletip', EkkoToggletip);
}
