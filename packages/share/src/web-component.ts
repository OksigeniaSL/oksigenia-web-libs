// Web component <oksigenia-share>. Importar este módulo registra el
// custom element. Usa Shadow DOM para encapsular CSS — funciona sin
// que el host site cargue ningún stylesheet.

import { buildShareHtml, bindShareEvents } from './render.js';
import { SHARE_CSS } from './styles.js';
import { ALL_NETWORKS, type NetworkId } from './networks.js';

const OBSERVED = [
  'url',
  'title',
  'locale',
  'networks',
  'x-handle',
  'nostr-hashtag',
  'no-label',
] as const;

export class OksigeniaShareElement extends HTMLElement {
  static get observedAttributes(): readonly string[] {
    return OBSERVED;
  }

  private _dispose: (() => void) | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.render();
  }

  disconnectedCallback(): void {
    this._dispose?.();
    this._dispose = null;
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.render();
  }

  private parseNetworks(): readonly NetworkId[] | undefined {
    const attr = this.getAttribute('networks');
    if (!attr) return undefined;
    const ids = attr.split(/[,\s]+/).filter(Boolean) as NetworkId[];
    return ids.filter((id) => (ALL_NETWORKS as readonly string[]).includes(id));
  }

  private render(): void {
    const shadow = this.shadowRoot;
    if (!shadow) return;
    this._dispose?.();

    const html = buildShareHtml({
      url: this.getAttribute('url') ?? undefined,
      title: this.getAttribute('title') ?? undefined,
      locale: this.getAttribute('locale') ?? undefined,
      networks: this.parseNetworks(),
      xHandle: this.getAttribute('x-handle') ?? undefined,
      nostrHashtag: this.getAttribute('nostr-hashtag') ?? undefined,
      showLabel: !this.hasAttribute('no-label'),
    });
    shadow.innerHTML = `<style>${SHARE_CSS}</style>${html}`;
    this._dispose = bindShareEvents(shadow, {
      locale: this.getAttribute('locale') ?? undefined,
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('oksigenia-share')) {
  customElements.define('oksigenia-share', OksigeniaShareElement);
}

declare global {
  interface HTMLElementTagNameMap {
    'oksigenia-share': OksigeniaShareElement;
  }
}
