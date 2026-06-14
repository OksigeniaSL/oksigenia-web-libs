// Web component <oksigenia-access-panel>. Importar este módulo
// registra el custom element y monta el panel + sus efectos globales.

import { buildPanelHtml, positionCss, type Position } from './render.js';
import { bindPanelBehavior } from './behavior.js';
import { PANEL_CSS, EFFECT_CSS } from './styles.js';
import { COLORBLIND_FILTERS_SVG } from './icons.js';
import { getTranslation } from './translations.js';
import type { TriggerIcon } from './icons.js';

const OBSERVED = ['locale', 'position', 'position-mobile', 'trigger-icon', 'storage-key'] as const;
const STYLE_ID = 'oksigenia-access-effects';
const FILTERS_ID = 'oksigenia-access-filters';
const GUIDE_ID = 'oks-reading-guide';
const MASK_ID = 'oks-reading-mask';

function ensureGlobalStyles(): void {
  if (typeof document === 'undefined') return;
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = EFFECT_CSS;
    document.head.appendChild(style);
  }
  if (!document.getElementById(FILTERS_ID)) {
    const wrap = document.createElement('div');
    wrap.id = FILTERS_ID;
    wrap.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;';
    wrap.innerHTML = COLORBLIND_FILTERS_SVG;
    document.body.appendChild(wrap);
  }
  if (!document.getElementById(GUIDE_ID)) {
    const guide = document.createElement('div');
    guide.id = GUIDE_ID;
    guide.className = 'oks-reading-guide';
    document.body.appendChild(guide);
  }
  if (!document.getElementById(MASK_ID)) {
    const mask = document.createElement('div');
    mask.id = MASK_ID;
    mask.className = 'oks-reading-mask';
    document.body.appendChild(mask);
  }
}

const VALID_POSITIONS: readonly Position[] = [
  'top-left', 'top-right', 'mid-left', 'mid-right', 'bottom-left', 'bottom-right',
];
const VALID_ICONS: readonly TriggerIcon[] = ['vitruvian', 'wheelchair', 'eye', 'universal'];

export class OksigeniaAccessPanelElement extends HTMLElement {
  static get observedAttributes(): readonly string[] {
    return OBSERVED;
  }

  private _dispose: (() => void) | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    ensureGlobalStyles();
    this.render();
  }

  disconnectedCallback(): void {
    this._dispose?.();
    this._dispose = null;
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  private getPosition(): Position {
    const attr = (this.getAttribute('position') ?? 'mid-left') as Position;
    return VALID_POSITIONS.includes(attr) ? attr : 'mid-left';
  }

  private getPositionMobile(): Position | undefined {
    const attr = this.getAttribute('position-mobile') as Position | null;
    return attr && VALID_POSITIONS.includes(attr) ? attr : undefined;
  }

  private getTriggerIcon(): TriggerIcon {
    const attr = (this.getAttribute('trigger-icon') ?? 'vitruvian') as TriggerIcon;
    return VALID_ICONS.includes(attr) ? attr : 'vitruvian';
  }

  private getLocale(): string {
    return this.getAttribute('locale')
      ?? (typeof navigator !== 'undefined' ? navigator.language : 'en');
  }

  private render(): void {
    const shadow = this.shadowRoot;
    if (!shadow) return;
    this._dispose?.();

    const position = this.getPosition();
    const positionMobile = this.getPositionMobile();
    const html = buildPanelHtml({
      t: getTranslation(this.getLocale()),
      triggerIcon: this.getTriggerIcon(),
      position,
    });
    shadow.innerHTML = `<style>${PANEL_CSS}${positionCss(position, positionMobile)}</style>${html}`;
    this._dispose = bindPanelBehavior(shadow, {
      storageKey: this.getAttribute('storage-key') ?? undefined,
      locale: this.getLocale(),
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('oksigenia-access-panel')) {
  customElements.define('oksigenia-access-panel', OksigeniaAccessPanelElement);
}

declare global {
  interface HTMLElementTagNameMap {
    'oksigenia-access-panel': OksigeniaAccessPanelElement;
  }
}
