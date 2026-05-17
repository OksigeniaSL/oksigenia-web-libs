// Punto de entrada principal · API imperativa + tipos.
// Para el web component <oksigenia-share>, importar
// '@oksigenia/share/web-component'.

export {
  NETWORKS,
  ALL_NETWORKS,
  type NetworkId,
  type OpenStrategy,
  type NetworkDef,
} from './networks.js';

export {
  buildShareLink,
  buildNostrPayload,
  type BuildLinkInput,
} from './build-link.js';

export {
  getTranslation,
  supportedLocales,
  type LocaleCode,
  type Translation,
} from './translations.js';

export {
  buildShareHtml,
  bindShareEvents,
  type ShareOptions,
} from './render.js';

export { SHARE_CSS } from './styles.js';

import { buildShareHtml, bindShareEvents, type ShareOptions } from './render.js';
import { SHARE_CSS } from './styles.js';

export interface MountResult {
  /** Elemento .oksigenia-panel insertado. */
  panel: HTMLElement;
  /** Limpia listeners y remueve el panel del DOM. */
  destroy: () => void;
}

/**
 * Inserta el panel de botones dentro de `target` (light DOM) y engancha
 * listeners. El CSS NO se inyecta — asegurate de cargar
 * `@oksigenia/share/styles.css` o de inyectar `SHARE_CSS` por tu cuenta.
 *
 * Para inyección automática con shadow DOM aislado, usa el web component:
 * `import '@oksigenia/share/web-component'` y `<oksigenia-share>`.
 */
export function mountShare(
  target: HTMLElement,
  options: ShareOptions = {},
): MountResult {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = buildShareHtml(options);
  const panel = wrapper.firstElementChild as HTMLElement;
  target.appendChild(panel);
  const dispose = bindShareEvents(panel, options);
  return {
    panel,
    destroy: () => {
      dispose();
      panel.remove();
    },
  };
}
