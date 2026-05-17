import { describe, expect, it } from 'vitest';
import { buildShareLink, buildNostrPayload } from '../build-link.js';

const TITLE = 'Vori vori paraguayo';
const URL = 'https://granjaoga.com/articulos/vori-vori';

describe('buildShareLink', () => {
  it('builds X tweet without handle', () => {
    const link = buildShareLink({ network: 'x', title: TITLE, url: URL });
    expect(link).toContain('twitter.com/intent/tweet');
    expect(link).toContain(encodeURIComponent(TITLE));
    expect(link).toContain(encodeURIComponent(URL));
    expect(link).not.toContain('%40');
  });

  it('includes X handle when provided', () => {
    const link = buildShareLink({ network: 'x', title: TITLE, url: URL, xHandle: 'granjaoga' });
    expect(decodeURIComponent(link)).toContain('by @granjaoga');
  });

  it('strips leading @ from X handle', () => {
    const link = buildShareLink({ network: 'x', title: TITLE, url: URL, xHandle: '@granjaoga' });
    expect(decodeURIComponent(link)).toContain('by @granjaoga');
    expect(decodeURIComponent(link)).not.toContain('@@');
  });

  it('uses byWord locale-aware', () => {
    const link = buildShareLink({ network: 'x', title: TITLE, url: URL, xHandle: 'granjaoga', byWord: 'por' });
    expect(decodeURIComponent(link)).toContain('por @granjaoga');
  });

  it('builds Bluesky intent', () => {
    const link = buildShareLink({ network: 'bs', title: TITLE, url: URL });
    expect(link).toContain('bsky.app/intent/compose');
  });

  it('builds Threads intent', () => {
    const link = buildShareLink({ network: 'th', title: TITLE, url: URL });
    expect(link).toContain('threads.net/intent/post');
  });

  it('builds WhatsApp deeplink', () => {
    const link = buildShareLink({ network: 'wa', title: TITLE, url: URL });
    expect(link).toContain('api.whatsapp.com/send');
  });

  it('builds Telegram share url', () => {
    const link = buildShareLink({ network: 'tg', title: TITLE, url: URL });
    expect(link).toContain('t.me/share/url');
  });

  it('builds LinkedIn share offsite', () => {
    const link = buildShareLink({ network: 'li', title: TITLE, url: URL });
    expect(link).toContain('linkedin.com/sharing/share-offsite');
  });

  it('builds Reddit submit', () => {
    const link = buildShareLink({ network: 'rd', title: TITLE, url: URL });
    expect(link).toContain('reddit.com/submit');
  });

  it('builds mailto for email', () => {
    const link = buildShareLink({ network: 'em', title: TITLE, url: URL });
    expect(link.startsWith('mailto:?')).toBe(true);
  });

  it('returns empty string for Nostr', () => {
    expect(buildShareLink({ network: 'no', title: TITLE, url: URL })).toBe('');
  });
});

describe('buildNostrPayload', () => {
  it('joins title + url + hashtag', () => {
    expect(buildNostrPayload(TITLE, URL, 'granjaoga')).toBe(
      `${TITLE}\n${URL}\n#granjaoga`,
    );
  });
  it('defaults hashtag to oksigenia', () => {
    expect(buildNostrPayload(TITLE, URL)).toContain('#oksigenia');
  });
});
