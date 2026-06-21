// Web component <oksigenia-access-panel>. Importar este módulo
// registra el custom element y monta el panel + sus efectos globales.

import { buildPanelHtml, positionCss, type Position } from './render.js';
import { bindPanelBehavior, type PanelController } from './behavior.js';
import { resolveEnabledControls } from './controls.js';
import { PANEL_CSS, EFFECT_CSS } from './styles.js';
import { COLORBLIND_FILTERS_SVG } from './icons.js';
import { getTranslation } from './translations.js';
import type { TriggerIcon } from './icons.js';

const OBSERVED = [
  'locale', 'position', 'position-mobile', 'trigger-icon', 'storage-key',
  'controls', 'exclude', 'trigger', 'effects-exclude', 'nudge', 'presets',
] as const;
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
  'top-left', 'top-center', 'top-right',
  'mid-left', 'mid-center', 'mid-right',
  'bottom-left', 'bottom-center', 'bottom-right',
];
const VALID_ICONS: readonly TriggerIcon[] = ['vitruvian', 'wheelchair', 'eye', 'universal', 'porthole'];

let fxSeq = 0;

export class OksigeniaAccessPanelElement extends HTMLElement {
  static get observedAttributes(): readonly string[] {
    return OBSERVED;
  }

  private _controller: PanelController | null = null;
  private readonly _fxId = `oks-access-fx-${++fxSeq}`;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    ensureGlobalStyles();
    this.render();
  }

  disconnectedCallback(): void {
    this._controller?.();
    this._controller = null;
    if (typeof document !== 'undefined') document.getElementById(this._fxId)?.remove();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  /** Imperative API (#2): open / close / toggle the panel from the host.
   *  Useful with `trigger="none"`, where the host drives its own button. */
  open(): void { this._controller?.open(); }
  close(): void { this._controller?.close(); }
  toggle(): void { this._controller?.toggle(); }

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

  /** `nudge` (bare) ⇒ default 80px cap; `nudge="50"` ⇒ 50; absent/invalid ⇒ off. */
  private getNudgeMax(): number {
    if (!this.hasAttribute('nudge')) return 0;
    const raw = this.getAttribute('nudge');
    if (raw == null || raw.trim() === '') return 80;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  /** Inject the per-instance effects-exclude rule (#4): under high-contrast,
   *  drop the destructive filter from selectors the host marks as essential
   *  media (video, canvas, scientific imagery). Grayscale is handled by not
   *  offering the control (curation), not here. */
  private updateEffectsExclude(): void {
    if (typeof document === 'undefined') return;
    const sel = (this.getAttribute('effects-exclude') ?? '')
      .split(',').map((s) => s.trim()).filter(Boolean);
    const existing = document.getElementById(this._fxId) as HTMLStyleElement | null;
    if (sel.length === 0) { existing?.remove(); return; }
    const style = existing ?? document.createElement('style');
    if (!existing) { style.id = this._fxId; document.head.appendChild(style); }
    const list = sel.join(', ');
    style.textContent =
      `body.oks-a11y-contrast :is(${list}), body.oks-a11y-contrast :is(${list}) * { filter: none !important; }`;
  }

  private render(): void {
    const shadow = this.shadowRoot;
    if (!shadow) return;
    this._controller?.();

    const position = this.getPosition();
    const positionMobile = this.getPositionMobile();
    const enabled = resolveEnabledControls(this.getAttribute('controls'), this.getAttribute('exclude'));
    const showTrigger = this.getAttribute('trigger') !== 'none';
    const showPresets = (this.getAttribute('presets') ?? '').trim().toLowerCase() !== 'none';

    const html = buildPanelHtml({
      t: getTranslation(this.getLocale()),
      triggerIcon: this.getTriggerIcon(),
      position,
      enabled,
      showTrigger,
      showPresets,
    });
    shadow.innerHTML = `<style>${PANEL_CSS}${positionCss(position, positionMobile)}</style>${html}`;
    this._controller = bindPanelBehavior(shadow, {
      storageKey: this.getAttribute('storage-key') ?? undefined,
      locale: this.getLocale(),
      enabled,
      nudgeMax: this.getNudgeMax(),
    });
    this.updateEffectsExclude();
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
