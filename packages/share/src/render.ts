import {
  ALL_NETWORKS,
  NETWORKS,
  type NetworkId,
  type OpenStrategy,
} from './networks.js';
import { buildShareLink, buildNostrPayload } from './build-link.js';
import { getTranslation, type LocaleCode, type Translation } from './translations.js';

export interface ShareOptions {
  /** URL absoluta a compartir. Si se omite, `location.href` al render. */
  url?: string;
  /** Título o texto del share. Si se omite, `document.title`. */
  title?: string;
  /** Locale (es, en, gn, …). Default: navegador, fallback en. */
  locale?: LocaleCode | string;
  /** Subconjunto/orden de redes. Default: las 9 en orden canónico. */
  networks?: readonly NetworkId[];
  /** Redes a OCULTAR en viewport ≥769px. */
  hideDesktop?: readonly NetworkId[];
  /** Redes a OCULTAR en viewport ≤768px. */
  hideMobile?: readonly NetworkId[];
  /** Handle de X opcional (con o sin @). */
  xHandle?: string;
  /** Hashtag opcional para el payload Nostr. Default "oksigenia". */
  nostrHashtag?: string;
  /** Mostrar el texto "SHARE" a la izquierda. Default true. */
  showLabel?: boolean;
}

interface PreparedButton {
  id: NetworkId;
  ariaLabel: string;
  type: OpenStrategy;
  link: string;
  copyPayload?: string;
  bgColor: string;
  svg: string;
  hideDesktop: boolean;
  hideMobile: boolean;
}

function prepareButtons(opts: Required<Pick<ShareOptions, 'title' | 'url'>> & ShareOptions, t: Translation): PreparedButton[] {
  const list = opts.networks ?? ALL_NETWORKS;
  const hideDesk = new Set<NetworkId>(opts.hideDesktop ?? []);
  const hideMob = new Set<NetworkId>(opts.hideMobile ?? []);
  const out: PreparedButton[] = [];
  for (const id of list) {
    const def = NETWORKS[id];
    if (!def) continue;
    const label = id === 'em'
      ? t.shareEmail
      : id === 'no'
        ? t.copyLink
        : t.shareOn(def.label);
    const link = buildShareLink({
      network: id,
      title: opts.title,
      url: opts.url,
      xHandle: opts.xHandle,
      byWord: t.by,
    });
    const button: PreparedButton = {
      id,
      ariaLabel: label,
      type: def.open,
      link,
      bgColor: def.color,
      svg: def.svg,
      hideDesktop: hideDesk.has(id),
      hideMobile: hideMob.has(id),
    };
    if (id === 'no') {
      button.copyPayload = buildNostrPayload(opts.title, opts.url, opts.nostrHashtag);
    }
    out.push(button);
  }
  return out;
}

/**
 * Construye el markup HTML del panel de botones. NO lo monta en el DOM;
 * el consumidor decide dónde inyectarlo y si quiere shadow DOM o no.
 */
export function buildShareHtml(opts: ShareOptions = {}): string {
  const resolved: Required<Pick<ShareOptions, 'title' | 'url' | 'locale' | 'showLabel'>> & ShareOptions = {
    title: opts.title ?? (typeof document !== 'undefined' ? document.title : ''),
    url: opts.url ?? (typeof location !== 'undefined' ? location.href : ''),
    locale: opts.locale ?? (typeof navigator !== 'undefined' ? navigator.language : 'en'),
    showLabel: opts.showLabel ?? true,
    networks: opts.networks,
    xHandle: opts.xHandle,
    nostrHashtag: opts.nostrHashtag,
  };
  const t = getTranslation(resolved.locale);
  const buttons = prepareButtons(resolved, t);

  const labelHtml = resolved.showLabel
    ? `<span class="oksigenia-label" aria-hidden="true">${escapeHtml(t.share)}</span>`
    : '';

  const buttonsHtml = buttons
    .map((b) => {
      const dataLink = b.link ? ` data-link="${escapeAttr(b.link)}"` : '';
      const dataCopy = b.copyPayload ? ` data-copy="${escapeAttr(b.copyPayload)}"` : '';
      const visClass = `${b.hideDesktop ? ' hide-desktop' : ''}${b.hideMobile ? ' hide-mobile' : ''}`;
      return `<button type="button" class="oksigenia-btn o-${b.id}${visClass}" style="background:${b.bgColor}" data-type="${b.type}"${dataLink}${dataCopy} aria-label="${escapeAttr(b.ariaLabel)}">${b.svg}<span class="oksigenia-sr-only" aria-live="polite"></span></button>`;
    })
    .join('');

  // role="group" + aria-label cumplen recomendaciones de A11Y / W3C.
  return `<div class="oksigenia-panel" role="group" aria-label="${escapeAttr(t.share)}">${labelHtml}${buttonsHtml}</div>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
  }[c] ?? c));
}
function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, '&#39;');
}

/**
 * Engancha los listeners de click a los botones renderizados dentro de
 * `root`. Devuelve un dispose para limpiar.
 */
export function bindShareEvents(root: ParentNode, opts: ShareOptions = {}): () => void {
  const locale = opts.locale ?? (typeof navigator !== 'undefined' ? navigator.language : 'en');
  const t = getTranslation(locale);
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('.oksigenia-btn'));
  const handler = (e: Event) => {
    e.preventDefault();
    const btn = e.currentTarget as HTMLButtonElement;
    openShare(btn, t);
  };
  for (const b of buttons) b.addEventListener('click', handler);
  return () => {
    for (const b of buttons) b.removeEventListener('click', handler);
  };
}

function openShare(btn: HTMLButtonElement, t: Translation): void {
  const link = btn.getAttribute('data-link') ?? '';
  const type = (btn.getAttribute('data-type') ?? 'tab') as OpenStrategy;
  const live = btn.querySelector<HTMLElement>('.oksigenia-sr-only');

  if (type === 'popup') {
    const w = 600;
    const h = 400;
    const left = (window.innerWidth - w) / 2;
    const top = (window.innerHeight - h) / 2;
    window.open(link, 'oksigenia_share', `width=${w},height=${h},top=${top},left=${left},scrollbars=no`);
    return;
  }
  if (type === 'tab') {
    window.open(link, '_blank', 'noopener');
    return;
  }
  if (type === 'email') {
    window.location.href = link;
    return;
  }
  if (type === 'copy') {
    const text = btn.getAttribute('data-copy') ?? '';
    const done = () => {
      btn.classList.add('copied');
      if (live) live.textContent = t.copied;
      window.setTimeout(() => {
        btn.classList.remove('copied');
        if (live) live.textContent = '';
      }, 2000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => {
        window.prompt(t.copyPrompt, text);
      });
    } else {
      window.prompt(t.copyPrompt, text);
    }
  }
}
