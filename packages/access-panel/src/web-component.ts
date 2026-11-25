// Web component <oksigenia-access-panel>. Importar este módulo
// registra el custom element y monta el panel + sus efectos globales.

import { buildPanelHtml, positionCss, type Position } from './render.js';
import { bindPanelBehavior, type PanelController, type PanelChangeDetail } from './behavior.js';
import { parseState } from './state.js';
import { resolveEnabledControls, scopedControls } from './controls.js';
import { PANEL_CSS, EFFECT_CSS, scopedEffectCss } from './styles.js';
import { createSheet, DocumentStyle } from './sheets.js';
import { COLORBLIND_FILTERS_SVG } from './icons.js';
import { getTranslation, getTranslationLang } from './translations.js';
import type { TriggerIcon } from './icons.js';

const OBSERVED = [
  'locale', 'position', 'position-mobile', 'trigger-icon', 'storage-key',
  'controls', 'exclude', 'trigger', 'effects-exclude', 'nudge', 'presets', 'scope', 'fold',
] as const;
const STYLE_ID = 'oksigenia-access-effects';
const FILTERS_ID = 'oksigenia-access-filters';
const GUIDE_ID = 'oks-reading-guide';
const MASK_ID = 'oks-reading-mask';

const effectStyle = new DocumentStyle(STYLE_ID);

function ensureGlobalStyles(): void {
  if (typeof document === 'undefined') return;
  effectStyle.set(document, EFFECT_CSS);
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
  /** `initial-state` is read on the first render only: later re-renders
   *  (another attribute changing) must not undo what the visitor did since. */
  private _initialStateRead = false;
  /** Set between connectedCallback and disconnectedCallback. When the parser
   *  upgrades the element, attributeChangedCallback runs once per attribute
   *  before connectedCallback, already with `isConnected`. */
  private _mounted = false;
  private readonly _seq = ++fxSeq;
  private readonly _fxStyle = new DocumentStyle(`oks-access-fx-${this._seq}`);
  private readonly _scopeStyle = new DocumentStyle(`oks-access-scope-${this._seq}`);

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this._mounted = true;
    ensureGlobalStyles();
    this.render();
  }

  disconnectedCallback(): void {
    this._mounted = false;
    this._controller?.();
    this._controller = null;
    this._fxStyle.remove();
    this._scopeStyle.remove();
  }

  attributeChangedCallback(): void {
    if (this._mounted) this.render();
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
   *  offering the control (curation), not here. The class is doubled so the
   *  rule outweighs the effect's own `img` rule wherever each one lands. */
  private updateEffectsExclude(base: string): void {
    if (typeof document === 'undefined') return;
    const sel = (this.getAttribute('effects-exclude') ?? '')
      .split(',').map((s) => s.trim()).filter(Boolean);
    if (sel.length === 0) { this._fxStyle.remove(); return; }
    const list = sel.join(', ');
    const on = `${base}.oks-a11y-contrast.oks-a11y-contrast`;
    this._fxStyle.set(document, `${on} :is(${list}), ${on} :is(${list}) * { filter: none !important; }`);
  }

  /** Inject the per-instance scoped effect CSS (`scope=`): the scopable effects
   *  anchored to the host's container instead of `body`, so several panels
   *  regionalise their own zone without clobbering each other. */
  private updateScopeStyle(scope: string | null): void {
    if (typeof document === 'undefined') return;
    if (!scope) { this._scopeStyle.remove(); return; }
    this._scopeStyle.set(document, scopedEffectCss(scope));
  }

  private render(): void {
    const shadow = this.shadowRoot;
    if (!shadow) return;
    this._controller?.();

    const position = this.getPosition();
    const positionMobile = this.getPositionMobile();
    const scope = this.getAttribute('scope')?.trim() || null;
    // Scoped instances drop the non-regionalisable controls (overlays, colour-
    // blind root filter, big cursor) — a per-pane panel only offers what it
    // can confine.
    let enabled = resolveEnabledControls(this.getAttribute('controls'), this.getAttribute('exclude'));
    if (scope) enabled = scopedControls(enabled);
    const showTrigger = this.getAttribute('trigger') !== 'none';
    const showPresets = (this.getAttribute('presets') ?? '').trim().toLowerCase() !== 'none';
    const fold = (this.getAttribute('fold') ?? '').trim().toLowerCase();
    const showFold = fold !== 'none';

    const html = buildPanelHtml({
      t: getTranslation(this.getLocale()),
      triggerIcon: this.getTriggerIcon(),
      position,
      enabled,
      showTrigger,
      showPresets,
      showFold,
      lang: getTranslationLang(this.getLocale()),
      flatLayout: scope != null, // scoped panels use the flat (no-category) layout
    });
    const css = `${PANEL_CSS}${positionCss(position, positionMobile)}`;
    const sheet = createSheet(this.ownerDocument, css);
    shadow.innerHTML = sheet ? html : `<style>${css}</style>${html}`;
    if (sheet) shadow.adoptedStyleSheets = [sheet];
    // undefined ⇒ global mode; element|null ⇒ scoped (null = scope not found yet,
    // effects no-op rather than leaking to body).
    const scopeEl = scope ? (document.querySelector(scope) as HTMLElement | null) : undefined;
    // Invalid JSON or a non-object is ignored silently: localStorage stands.
    const initialState = this._initialStateRead ? null : parseState(this.getAttribute('initial-state'));
    this._initialStateRead = true;
    this._controller = bindPanelBehavior(shadow, {
      storageKey: this.getAttribute('storage-key') ?? undefined,
      locale: this.getLocale(),
      enabled,
      nudgeMax: this.getNudgeMax(),
      scopeEl,
      initialState,
      startFoldedMobile: fold === 'start-mobile',
    });
    this.updateScopeStyle(scope);
    this.updateEffectsExclude(scope ?? 'body');
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('oksigenia-access-panel')) {
  customElements.define('oksigenia-access-panel', OksigeniaAccessPanelElement);
}

declare global {
  interface HTMLElementTagNameMap {
    'oksigenia-access-panel': OksigeniaAccessPanelElement;
  }
  interface HTMLElementEventMap {
    'oksiac:change': CustomEvent<PanelChangeDetail>;
  }
}
