import { EkkoBase } from '../base';
import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

export type DialogSize = 'sm' | 'md' | 'lg';

export interface EkkoOpenEventDetail {
  modal: boolean;
}

export interface EkkoCloseEventDetail {
  returnValue: string;
}

export interface EkkoCancelEventDetail {
  originalEvent: Event;
}

export class EkkoDialog extends EkkoBase {
  static get observedAttributes(): string[] {
    return [
      'open',
      'modal',
      'size',
      'disabled',
      'loading',
      'hide-close',
      'close-on-backdrop',
      'heading',
      'description',
      'close-label',
      'alert',
      'aria-label',
      'aria-describedby',
    ];
  }

  #dialog: HTMLDialogElement;
  #headingEl: HTMLHeadingElement;
  #descriptionEl: HTMLParagraphElement;
  #closeBtn: HTMLButtonElement;
  #headerEl: HTMLElement;
  #closeHandler: () => void;
  #cancelHandler: (event: Event) => void;
  #backdropHandler: (event: MouseEvent) => void;
  #closeButtonHandler: (event: Event) => void;
  #headingId: string;
  #descriptionId: string;

  constructor() {
    const uid = Math.random().toString(36).slice(2, 10);
    super(styles);
    this.#headingId = `ekko-dialog-heading-${uid}`;
    this.#descriptionId = `ekko-dialog-description-${uid}`;

    this.shadow.innerHTML = this.#template();

    this.#dialog = this.shadow.querySelector('.dialog') as HTMLDialogElement;
    this.#headingEl = this.shadow.querySelector('.title') as HTMLHeadingElement;
    this.#descriptionEl = this.shadow.querySelector('.description') as HTMLParagraphElement;
    this.#closeBtn = this.shadow.querySelector('.close') as HTMLButtonElement;
    this.#headerEl = this.shadow.querySelector('.header') as HTMLElement;

    this.#closeHandler = this.#handleClose.bind(this);
    this.#cancelHandler = this.#handleCancel.bind(this);
    this.#backdropHandler = this.#handleBackdropClick.bind(this);
    this.#closeButtonHandler = this.#handleCloseButton.bind(this);
  }

  connectedCallback(): void {
    this.upgradeProperty('open');
    this.upgradeProperty('modal');
    this.upgradeProperty('size');
    this.upgradeProperty('disabled');
    this.upgradeProperty('loading');
    this.upgradeProperty('hideClose');
    this.upgradeProperty('closeOnBackdrop');
    this.upgradeProperty('heading');
    this.upgradeProperty('description');

    if (!this.hasAttribute('size')) {
      this.size = 'md';
    }

    this.#dialog.addEventListener('close', this.#closeHandler);
    this.#dialog.addEventListener('cancel', this.#cancelHandler);
    this.#dialog.addEventListener('click', this.#backdropHandler);
    this.#closeBtn.addEventListener('click', this.#closeButtonHandler);

    this.#syncAll();

    if (this.hasAttribute('open') && !this.#dialog.open) {
      this.#openDialog();
    }
  }

  disconnectedCallback(): void {
    this.#dialog.removeEventListener('close', this.#closeHandler);
    this.#dialog.removeEventListener('cancel', this.#cancelHandler);
    this.#dialog.removeEventListener('click', this.#backdropHandler);
    this.#closeBtn.removeEventListener('click', this.#closeButtonHandler);
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    if (name === 'open' && this.#dialog) {
      if (newValue !== null && !this.#dialog.open) {
        this.#openDialog();
      } else if (newValue === null && this.#dialog.open) {
        this.#dialog.close();
      }
    }

    this.#syncAll();
  }

  get open(): boolean {
    return this.hasAttribute('open');
  }
  set open(value: boolean) {
    this.toggleAttribute('open', Boolean(value));
  }

  get modal(): boolean {
    return this.hasAttribute('modal');
  }
  set modal(value: boolean) {
    this.toggleAttribute('modal', Boolean(value));
  }

  get size(): DialogSize {
    return (this.getAttribute('size') as DialogSize) ?? 'md';
  }
  set size(value: DialogSize) {
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

  get hideClose(): boolean {
    return this.hasAttribute('hide-close');
  }
  set hideClose(value: boolean) {
    this.toggleAttribute('hide-close', Boolean(value));
  }

  get closeOnBackdrop(): boolean {
    return this.hasAttribute('close-on-backdrop');
  }
  set closeOnBackdrop(value: boolean) {
    this.toggleAttribute('close-on-backdrop', Boolean(value));
  }

  get heading(): string {
    return this.getAttribute('heading') ?? '';
  }
  set heading(value: string) {
    this.setAttribute('heading', value);
  }

  get description(): string {
    return this.getAttribute('description') ?? '';
  }
  set description(value: string) {
    this.setAttribute('description', value);
  }

  get returnValue(): string {
    return this.#dialog.returnValue;
  }
  set returnValue(value: string) {
    this.#dialog.returnValue = value;
  }

  show(): void {
    if (this.disabled) return;
    this.modal = false;
    if (!this.#dialog.open) this.#dialog.show();
    if (!this.hasAttribute('open')) this.setAttribute('open', '');
    this.#dispatchOpen(false);
  }

  showModal(): void {
    if (this.disabled) return;
    this.modal = true;
    if (!this.#dialog.open) this.#dialog.showModal();
    if (!this.hasAttribute('open')) this.setAttribute('open', '');
    this.#dispatchOpen(true);
  }

  close(returnValue?: string): void {
    if (returnValue !== undefined) {
      this.#dialog.close(returnValue);
    } else {
      this.#dialog.close();
    }
  }

  #template(): string {
    return `
      <dialog part="base" class="dialog">
        <button type="button" class="close" part="close" aria-label="Close">
          <svg class="close-icon" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4 L12 12 M12 4 L4 12"></path>
          </svg>
        </button>
        <div class="layout">
          <header class="header" part="header">
            <h2 class="title" id="${this.#headingId}" part="title" hidden></h2>
            <p class="description" id="${this.#descriptionId}" part="description" hidden></p>
          </header>
          <div class="body" part="body">
            <slot></slot>
          </div>
          <footer class="footer" part="footer">
            <slot name="footer"></slot>
          </footer>
        </div>
        <div class="spinner" part="spinner" aria-hidden="true"></div>
      </dialog>
    `;
  }

  #openDialog(): void {
    if (this.#dialog.open) return;
    if (this.modal) {
      this.#dialog.showModal();
    } else {
      this.#dialog.show();
    }
    this.#dispatchOpen(this.modal);
  }

  #syncAll(): void {
    if (!this.#dialog) return;
    this.#syncHeading();
    this.#syncDescription();
    this.#syncCloseLabel();
    this.#syncHeader();
    this.#syncAccessibility();
  }

  #syncHeader(): void {
    const hasContent = Boolean(this.getAttribute('heading') || this.getAttribute('description'));
    this.#headerEl.toggleAttribute('hidden', !hasContent);
  }

  #syncHeading(): void {
    const heading = this.getAttribute('heading');
    if (heading) {
      this.#headingEl.textContent = heading;
      this.#headingEl.removeAttribute('hidden');
    } else {
      this.#headingEl.textContent = '';
      this.#headingEl.setAttribute('hidden', '');
    }
  }

  #syncDescription(): void {
    const description = this.getAttribute('description');
    if (description) {
      this.#descriptionEl.textContent = description;
      this.#descriptionEl.removeAttribute('hidden');
    } else {
      this.#descriptionEl.textContent = '';
      this.#descriptionEl.setAttribute('hidden', '');
    }
  }

  #syncCloseLabel(): void {
    const label = this.getAttribute('close-label') ?? 'Close';
    this.#closeBtn.setAttribute('aria-label', label);
  }

  #syncAccessibility(): void {
    this.#dialog.setAttribute('role', this.hasAttribute('alert') ? 'alertdialog' : 'dialog');

    if (this.loading) {
      this.#dialog.setAttribute('aria-busy', 'true');
    } else {
      this.#dialog.removeAttribute('aria-busy');
    }

    const hostAriaLabel = this.getAttribute('aria-label');
    if (hostAriaLabel) {
      this.#dialog.setAttribute('aria-label', hostAriaLabel);
      this.#dialog.removeAttribute('aria-labelledby');
    } else if (this.getAttribute('heading')) {
      this.#dialog.setAttribute('aria-labelledby', this.#headingId);
      this.#dialog.removeAttribute('aria-label');
    } else {
      this.#dialog.removeAttribute('aria-label');
      this.#dialog.removeAttribute('aria-labelledby');
    }

    const externalDescribedBy = this.getAttribute('aria-describedby');
    const parts: string[] = [];
    if (externalDescribedBy) parts.push(externalDescribedBy);
    if (this.getAttribute('description')) parts.push(this.#descriptionId);

    if (parts.length > 0) {
      this.#dialog.setAttribute('aria-describedby', parts.join(' '));
    } else {
      this.#dialog.removeAttribute('aria-describedby');
    }
  }

  #handleClose(): void {
    if (this.hasAttribute('open')) {
      this.removeAttribute('open');
    }
    this.dispatchEvent(
      new CustomEvent<EkkoCloseEventDetail>('ekko-close', {
        bubbles: true,
        composed: true,
        detail: { returnValue: this.#dialog.returnValue },
      })
    );
  }

  #handleCancel(event: Event): void {
    const cancelEvent = new CustomEvent<EkkoCancelEventDetail>('ekko-cancel', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { originalEvent: event },
    });
    const allowed = this.dispatchEvent(cancelEvent);
    if (!allowed) {
      event.preventDefault();
    }
  }

  #handleCloseButton(event: Event): void {
    event.preventDefault();
    this.close();
  }

  #handleBackdropClick(event: MouseEvent): void {
    if (!this.closeOnBackdrop || !this.modal) return;
    if (event.target === this.#dialog) {
      this.close();
    }
  }

  #dispatchOpen(modal: boolean): void {
    this.dispatchEvent(
      new CustomEvent<EkkoOpenEventDetail>('ekko-open', {
        bubbles: true,
        composed: true,
        detail: { modal },
      })
    );
  }
}

if (!customElements.get('ekko-dialog')) {
  customElements.define('ekko-dialog', EkkoDialog);
}
