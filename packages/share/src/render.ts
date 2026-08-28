import {
  ALL_NETWORKS,
  NETWORKS,
  type NetworkId,
  type OpenStrategy,
} from './networks.js';
import { buildShareLink, buildNostrPayload, normalizeMastodonInstance } from './build-link.js';
import { getTranslation, type LocaleCode, type Translation } from './translations.js';

/**
 * Visual style of the icons ("icon pack"). Not a different icon family — the
 * same inline glyphs, treated differently. `solid` is the default look
 * (brand-coloured chips). `mono`/`bare` inherit the site's own text colour
 * (`currentColor`) so they keep the page's accessible contrast; `outline`
 * uses the brand colour for the ring and glyph.
 */
export type ShareTheme = 'solid' | 'mono' | 'outline' | 'bare';
const THEMES: readonly ShareTheme[] = ['solid', 'mono', 'outline', 'bare'];

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
  /** Estilo visual de los iconos. Default 'solid' (chips de color de marca). */
  theme?: ShareTheme;
}

interface PreparedButton {
  id: NetworkId;
  ariaLabel: string;
  type: OpenStrategy;
  link: string;
  copyPayload?: string;
  textPayload?: string;
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
    // Nostr (id 'no') used to get t.copyLink ("Copy link to clipboard"), which
    // a screen reader announced with no mention of Nostr. It now follows the
    // same "Share on {network}" pattern as the rest; the copy action is still
    // announced via the aria-live "Copied" message on click.
    const label = id === 'em'
      ? t.shareEmail
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
    if (id === 'ma') {
      // Federated: the instance is unknown until click; carry the text to share.
      button.textPayload = `${opts.title} ${opts.url}`;
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
    hideDesktop: opts.hideDesktop,
    hideMobile: opts.hideMobile,
    xHandle: opts.xHandle,
    nostrHashtag: opts.nostrHashtag,
  };
  const t = getTranslation(resolved.locale);
  const buttons = prepareButtons(resolved, t);
  const theme: ShareTheme = opts.theme && THEMES.includes(opts.theme) ? opts.theme : 'solid';

  const labelHtml = resolved.showLabel
    ? `<span class="oksigenia-label" aria-hidden="true">${escapeHtml(t.share)}</span>`
    : '';

  const buttonsHtml = buttons
    .map((b) => {
      const dataLink = b.link ? ` data-link="${escapeAttr(b.link)}"` : '';
      const dataCopy = b.copyPayload ? ` data-copy="${escapeAttr(b.copyPayload)}"` : '';
      const dataText = b.textPayload ? ` data-text="${escapeAttr(b.textPayload)}"` : '';
      const visClass = `${b.hideDesktop ? ' hide-desktop' : ''}${b.hideMobile ? ' hide-mobile' : ''}`;
      return `<button type="button" class="oksigenia-btn o-${b.id}${visClass}" style="--oks-brand:${b.bgColor}" data-type="${b.type}"${dataLink}${dataCopy}${dataText} aria-label="${escapeAttr(b.ariaLabel)}">${b.svg}<span class="oksigenia-sr-only" aria-live="polite"></span></button>`;
    })
    .join('');

  // role="group" + aria-label cumplen recomendaciones de A11Y / W3C.
  return `<div class="oksigenia-panel oks-theme-${theme}" role="group" aria-label="${escapeAttr(t.share)}">${labelHtml}${buttonsHtml}</div>`;
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
    // window.open top/left are screen coordinates, so center against the
    // browser window's screen position — not the viewport.
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
    // noopener severs window.opener so the share target can't drive our page
    // back (reverse tabnabbing). Same hardening the 'tab' strategy already has.
    window.open(link, 'oksigenia_share', `noopener,width=${w},height=${h},top=${top},left=${left},scrollbars=no`);
    return;
  }
  if (type === 'tab') {
    window.open(link, '_blank', 'noopener');
    return;
  }
  if (type === 'mastodon') {
    openMastodonShare(btn, t);
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

const OKSIGENIA_MA_KEY = 'oksigenia_share_mastodon_instance';

/**
 * Mastodon is federated, so there is no single share URL. On click we need the
 * user's instance: if we already remember it (localStorage, this device only),
 * open the share composer straight away; otherwise ask with an accessible dialog.
 */
function openMastodonShare(btn: HTMLButtonElement, t: Translation): void {
  const text = btn.getAttribute('data-text') ?? '';
  let saved = '';
  try {
    saved = window.localStorage.getItem(OKSIGENIA_MA_KEY) ?? '';
  } catch {
    /* localStorage may be blocked; fall through to asking every time. */
  }
  const norm = normalizeMastodonInstance(saved);
  if (norm) {
    window.open(`https://${norm}/share?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    return;
  }
  askMastodonInstance(text, btn, t);
}

function setStyle(el: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
  Object.assign(el.style, styles);
}

function askMastodonInstance(text: string, trigger: HTMLElement, t: Translation): void {
  const doc = document;
  const backdrop = doc.createElement('div');
  setStyle(backdrop, {
    position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: '2147483000', padding: '16px',
  });

  const modal = doc.createElement('div');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'oksigenia-ma-title');
  modal.setAttribute('aria-describedby', 'oksigenia-ma-desc');
  setStyle(modal, {
    background: '#fff', color: '#1a1a1a', borderRadius: '12px', padding: '20px',
    maxWidth: '340px', width: '100%', boxSizing: 'border-box',
    boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
    font: '14px/1.4 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  });

  const h = doc.createElement('h2');
  h.id = 'oksigenia-ma-title';
  h.textContent = t.maTitle;
  setStyle(h, { margin: '0 0 6px', fontSize: '17px', color: '#1a1a1a' });

  const desc = doc.createElement('p');
  desc.id = 'oksigenia-ma-desc';
  desc.textContent = t.maDesc;
  setStyle(desc, { margin: '0 0 12px', fontSize: '13px', color: '#555' });

  const label = doc.createElement('label');
  label.setAttribute('for', 'oksigenia-ma-input');
  label.textContent = t.maLabel;
  setStyle(label, { display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' });

  const input = doc.createElement('input');
  input.id = 'oksigenia-ma-input';
  input.type = 'text';
  input.setAttribute('inputmode', 'url');
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('spellcheck', 'false');
  input.placeholder = t.maPlaceholder;
  setStyle(input, {
    width: '100%', boxSizing: 'border-box', padding: '9px 10px',
    border: '1px solid #bbb', borderRadius: '8px', fontSize: '14px',
  });

  const err = doc.createElement('div');
  err.setAttribute('aria-live', 'assertive');
  setStyle(err, { color: '#b00020', fontSize: '12px', minHeight: '16px', marginTop: '6px' });

  const actions = doc.createElement('div');
  setStyle(actions, { display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '14px' });

  const mkBtn = (labelTxt: string, primary: boolean): HTMLButtonElement => {
    const b = doc.createElement('button');
    b.type = 'button';
    b.textContent = labelTxt;
    setStyle(b, {
      padding: '9px 16px', borderRadius: '8px', border: '1px solid transparent',
      fontSize: '14px', fontWeight: '600', cursor: 'pointer',
      background: primary ? '#6364FF' : '#eee', color: primary ? '#fff' : '#333',
    });
    return b;
  };
  const btnCancel = mkBtn(t.maCancel, false);
  const btnShare = mkBtn(t.maShare, true);
  actions.append(btnCancel, btnShare);
  modal.append(h, desc, label, input, err, actions);
  backdrop.append(modal);
  doc.body.append(backdrop);

  const focusables: HTMLElement[] = [input, btnCancel, btnShare];
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'Tab') {
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  const close = (): void => {
    doc.removeEventListener('keydown', onKey, true);
    backdrop.remove();
    if (typeof trigger.focus === 'function') trigger.focus();
  };
  const submit = (): void => {
    const norm = normalizeMastodonInstance(input.value);
    if (!norm) {
      err.textContent = t.maError;
      input.focus();
      input.select();
      return;
    }
    try { window.localStorage.setItem(OKSIGENIA_MA_KEY, norm); } catch { /* ignore */ }
    close();
    window.open(`https://${norm}/share?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };

  btnCancel.addEventListener('click', close);
  btnShare.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  doc.addEventListener('keydown', onKey, true);
  input.focus();
}
