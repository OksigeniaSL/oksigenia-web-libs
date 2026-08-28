import type { NetworkId } from './networks.js';

export interface BuildLinkInput {
  network: NetworkId;
  title: string;
  url: string;
  /** Handle X opcional (sin @). Si está, se añade "{title} by @{handle}" al tweet. */
  xHandle?: string;
  /** Conector "by" según locale (i18n). Default "by". */
  byWord?: string;
}

/**
 * Construye la URL del share-intent de cada red. No abre nada, solo devuelve
 * la cadena. Para Nostr (copy-only) devuelve cadena vacía — el contenido
 * que se copia se construye con `buildNostrPayload()`.
 */
export function buildShareLink(input: BuildLinkInput): string {
  const { network, title, url, xHandle, byWord = 'by' } = input;
  const txt = encodeURIComponent(title);
  const urlEnc = encodeURIComponent(url);

  const xText = xHandle
    ? encodeURIComponent(`${title} ${byWord} @${xHandle.replace(/^@/, '')}`)
    : txt;

  switch (network) {
    case 'x':
      return `https://twitter.com/intent/tweet?text=${xText}&url=${urlEnc}`;
    case 'bs':
      return `https://bsky.app/intent/compose?text=${encodeURIComponent(`${title} ${url}`)}`;
    case 'th':
      return `https://www.threads.net/intent/post?text=${encodeURIComponent(`${title} ${url}`)}`;
    case 'wa':
      return `https://api.whatsapp.com/send?text=${txt}%20${urlEnc}`;
    case 'tg':
      return `https://t.me/share/url?url=${urlEnc}&text=${txt}`;
    case 'li':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${urlEnc}`;
    case 'rd':
      return `https://www.reddit.com/submit?url=${urlEnc}&title=${txt}`;
    case 'em':
      return `mailto:?subject=${txt}&body=${urlEnc}`;
    case 'no':
      return '';
    case 'ma':
      // Mastodon is federated: the share URL needs the user's instance, which
      // is only known at click time. Built by `buildMastodonLink()` then.
      return '';
  }
}

/** Normalize a user-typed Mastodon instance to a bare host (or '' if invalid). */
export function normalizeMastodonInstance(raw: string): string {
  let s = (raw || '').replace(/\s+/g, '');
  if (!s) return '';
  s = s.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
  if (s.includes('@')) {
    s = s.split('@').filter(Boolean).at(-1) ?? '';
  }
  s = s.toLowerCase();
  return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(s) ? s : '';
}

/** Build the Mastodon share-intent URL for a given (already-normalized) instance. */
export function buildMastodonLink(instance: string, title: string, url: string): string {
  return `https://${instance}/share?text=${encodeURIComponent(`${title} ${url}`)}`;
}

/**
 * Payload Nostr: el botón Nostr copia esto al portapapeles porque no hay
 * un share-intent oficial. Hashtag configurable.
 */
export function buildNostrPayload(
  title: string,
  url: string,
  hashtag = 'oksigenia',
): string {
  return `${title}\n${url}\n#${hashtag}`;
}
