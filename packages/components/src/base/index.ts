import baseCss from './index.css?inline';

const baseStyles = new CSSStyleSheet();
baseStyles.replaceSync(baseCss);

export class EkkoBase extends HTMLElement {
  protected shadow: ShadowRoot;

  constructor(componentStyles: CSSStyleSheet) {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.adoptedStyleSheets = [baseStyles, componentStyles];
  }

  protected upgradeProperty(prop: string): void {
    if (Object.hasOwn(this, prop)) {
      const value = (this as Record<string, unknown>)[prop];
      delete (this as Record<string, unknown>)[prop];
      (this as Record<string, unknown>)[prop] = value;
    }
  }

  protected forwardAriaLabel(target: Element): void {
    const ariaLabel = this.getAttribute('aria-label');
    if (ariaLabel) {
      target.setAttribute('aria-label', ariaLabel);
    } else {
      target.removeAttribute('aria-label');
    }
  }

  protected forwardAriaDescribedby(target: Element): void {
    const ariaDescribedby = this.getAttribute('aria-describedby');
    if (ariaDescribedby) {
      target.setAttribute('aria-describedby', ariaDescribedby);
    } else {
      target.removeAttribute('aria-describedby');
    }
  }
}
