import { EkkoBase } from '../base';
import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

export type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left';
export type TooltipSize = 'sm' | 'md' | 'lg';
export type TooltipVariant = 'default' | 'inverse';

export interface EkkoShowEventDetail {
  placement: TooltipPlacement;
}

export interface EkkoHideEventDetail {
  placement: TooltipPlacement;
}

const DEFAULT_SHOW_DELAY = 200;
const DEFAULT_HIDE_DELAY = 0;

export class EkkoTooltip extends EkkoBase {
  static get observedAttributes(): string[] {
    return [
      'label',
      'placement',
      'size',
      'variant',
      'disabled',
      'loading',
      'open',
      'show-delay',
      'hide-delay',
      'aria-label',
      'aria-describedby',
    ];
  }

  #tooltip: HTMLElement;
  #labelEl: HTMLSpanElement;
  #defaultSlot: HTMLSlotElement;
  #trigger: Element | null;
  #tooltipId: string;
  #showTimer: number | null;
  #hideTimer: number | null;
  #pointerEnterHandler: () => void;
  #pointerLeaveHandler: () => void;
  #focusInHandler: (event: FocusEvent) => void;
  #focusOutHandler: (event: FocusEvent) => void;
  #keydownHandler: (event: KeyboardEvent) => void;
  #slotChangeHandler: () => void;

  constructor() {
    const uid = Math.random().toString(36).slice(2, 10);
    super(styles);
    this.#tooltipId = `ekko-tooltip-${uid}`;
    this.shadow.innerHTML = this.#template();

    this.#tooltip = this.shadow.querySelector('.tooltip') as HTMLElement;
    this.#labelEl = this.shadow.querySelector('.label') as HTMLSpanElement;
    this.#defaultSlot = this.shadow.querySelector('slot:not([name])') as HTMLSlotElement;
    this.#trigger = null;
    this.#showTimer = null;
    this.#hideTimer = null;

    this.#pointerEnterHandler = this.#handlePointerEnter.bind(this);
    this.#pointerLeaveHandler = this.#handlePointerLeave.bind(this);
    this.#focusInHandler = this.#handleFocusIn.bind(this);
    this.#focusOutHandler = this.#handleFocusOut.bind(this);
    this.#keydownHandler = this.#handleKeydown.bind(this);
    this.#slotChangeHandler = this.#syncTrigger.bind(this);
  }

  connectedCallback(): void {
    this.upgradeProperty('label');
    this.upgradeProperty('placement');
    this.upgradeProperty('size');
    this.upgradeProperty('variant');
    this.upgradeProperty('disabled');
    this.upgradeProperty('loading');
    this.upgradeProperty('open');
    this.upgradeProperty('showDelay');
    this.upgradeProperty('hideDelay');

    if (!this.hasAttribute('placement')) {
      this.placement = 'top';
    }
    if (!this.hasAttribute('size')) {
      this.size = 'md';
    }

    this.addEventListener('pointerenter', this.#pointerEnterHandler);
    this.addEventListener('pointerleave', this.#pointerLeaveHandler);
    this.addEventListener('focusin', this.#focusInHandler);
    this.addEventListener('focusout', this.#focusOutHandler);
    this.addEventListener('keydown', this.#keydownHandler);
    this.#defaultSlot.addEventListener('slotchange', this.#slotChangeHandler);

    this.#syncTrigger();
    this.#syncAccessibility();
  }

  disconnectedCallback(): void {
    this.removeEventListener('pointerenter', this.#pointerEnterHandler);
    this.removeEventListener('pointerleave', this.#pointerLeaveHandler);
    this.removeEventListener('focusin', this.#focusInHandler);
    this.removeEventListener('focusout', this.#focusOutHandler);
    this.removeEventListener('keydown', this.#keydownHandler);
    this.#defaultSlot.removeEventListener('slotchange', this.#slotChangeHandler);
    this.#clearTimers();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    if (name === 'label') {
      this.#syncLabel();
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

  get placement(): TooltipPlacement {
    return (this.getAttribute('placement') as TooltipPlacement) ?? 'top';
  }
  set placement(value: TooltipPlacement) {
    this.setAttribute('placement', value);
  }

  get size(): TooltipSize {
    return (this.getAttribute('size') as TooltipSize) ?? 'md';
  }
  set size(value: TooltipSize) {
    this.setAttribute('size', value);
  }

  get variant(): TooltipVariant {
    return (this.getAttribute('variant') as TooltipVariant) ?? 'default';
  }
  set variant(value: TooltipVariant) {
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

  get showDelay(): number {
    const val = this.getAttribute('show-delay');
    return val === null ? DEFAULT_SHOW_DELAY : Number(val);
  }
  set showDelay(value: number) {
    this.setAttribute('show-delay', String(value));
  }

  get hideDelay(): number {
    const val = this.getAttribute('hide-delay');
    return val === null ? DEFAULT_HIDE_DELAY : Number(val);
  }
  set hideDelay(value: number) {
    this.setAttribute('hide-delay', String(value));
  }

  show(): void {
    if (this.disabled || this.open) return;
    this.#clearTimers();
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
    this.#clearTimers();
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
      <slot></slot>
      <span part="base" class="tooltip" role="tooltip" id="${this.#tooltipId}">
        <span class="label" part="label"></span>
        <slot name="content"></slot>
        <span class="spinner" part="spinner" aria-hidden="true"></span>
        <span class="arrow" part="arrow" aria-hidden="true"></span>
      </span>
    `;
  }

  #syncLabel(): void {
    this.#labelEl.textContent = this.getAttribute('label') ?? '';
  }

  #syncTrigger(): void {
    const assigned = this.#defaultSlot.assignedElements({ flatten: true });
    const next = assigned[0] ?? null;

    if (this.#trigger && this.#trigger !== next) {
      this.#removeTriggerDescribedby(this.#trigger);
    }

    this.#trigger = next;
    if (this.#trigger) {
      this.#applyTriggerDescribedby(this.#trigger);
    }
  }

  #applyTriggerDescribedby(trigger: Element): void {
    const existing = trigger.getAttribute('aria-describedby');
    const ids = new Set(existing ? existing.split(/\s+/).filter(Boolean) : []);
    ids.add(this.#tooltipId);
    trigger.setAttribute('aria-describedby', Array.from(ids).join(' '));
  }

  #removeTriggerDescribedby(trigger: Element): void {
    const existing = trigger.getAttribute('aria-describedby');
    if (!existing) return;
    const ids = existing.split(/\s+/).filter((id) => id && id !== this.#tooltipId);
    if (ids.length === 0) {
      trigger.removeAttribute('aria-describedby');
    } else {
      trigger.setAttribute('aria-describedby', ids.join(' '));
    }
  }

  #syncAccessibility(): void {
    if (!this.#tooltip) return;

    if (this.loading) {
      this.#tooltip.setAttribute('aria-busy', 'true');
    } else {
      this.#tooltip.removeAttribute('aria-busy');
    }

    this.forwardAriaLabel(this.#tooltip);
    this.forwardAriaDescribedby(this.#tooltip);
  }

  #clearTimers(): void {
    if (this.#showTimer !== null) {
      clearTimeout(this.#showTimer);
      this.#showTimer = null;
    }
    if (this.#hideTimer !== null) {
      clearTimeout(this.#hideTimer);
      this.#hideTimer = null;
    }
  }

  #scheduleShow(): void {
    if (this.disabled || this.open) return;
    if (this.#hideTimer !== null) {
      clearTimeout(this.#hideTimer);
      this.#hideTimer = null;
    }
    const delay = Math.max(0, this.showDelay);
    if (delay === 0) {
      this.show();
      return;
    }
    this.#showTimer = window.setTimeout(() => {
      this.#showTimer = null;
      this.show();
    }, delay);
  }

  #scheduleHide(): void {
    if (!this.open && this.#showTimer === null) return;
    if (this.#showTimer !== null) {
      clearTimeout(this.#showTimer);
      this.#showTimer = null;
    }
    const delay = Math.max(0, this.hideDelay);
    if (delay === 0) {
      this.hide();
      return;
    }
    this.#hideTimer = window.setTimeout(() => {
      this.#hideTimer = null;
      this.hide();
    }, delay);
  }

  #handlePointerEnter(): void {
    this.#scheduleShow();
  }

  #handlePointerLeave(): void {
    this.#scheduleHide();
  }

  #handleFocusIn(event: FocusEvent): void {
    // Only react to focus within the slotted trigger, not the shadow tooltip itself
    if (this.#trigger && event.target instanceof Node && this.#trigger.contains(event.target)) {
      this.#scheduleShow();
    }
  }

  #handleFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (next instanceof Node && this.contains(next)) return;
    this.#scheduleHide();
  }

  #handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.open) {
      event.stopPropagation();
      this.hide();
    }
  }
}

if (!customElements.get('ekko-tooltip')) {
  customElements.define('ekko-tooltip', EkkoTooltip);
}
