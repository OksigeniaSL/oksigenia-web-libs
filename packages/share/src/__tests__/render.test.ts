import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildShareHtml, bindShareEvents } from '../render.js';
import { mountShare } from '../index.js';

describe('buildShareHtml', () => {
  it('renders the 9 default networks', () => {
    const html = buildShareHtml({ title: 'X', url: 'https://x.test' });
    const matches = html.match(/class="oksigenia-btn /g);
    expect(matches).toHaveLength(9);
  });

  it('respects the networks subset', () => {
    const html = buildShareHtml({
      title: 'X',
      url: 'https://x.test',
      networks: ['x', 'wa', 'tg'],
    });
    const matches = html.match(/class="oksigenia-btn /g);
    expect(matches).toHaveLength(3);
    expect(html).toContain('o-x');
    expect(html).toContain('o-wa');
    expect(html).toContain('o-tg');
    expect(html).not.toContain('o-li');
  });

  it('hides label when showLabel=false', () => {
    const html = buildShareHtml({
      title: 'X',
      url: 'https://x.test',
      showLabel: false,
    });
    expect(html).not.toContain('oksigenia-label');
  });

  it('escapes title attributes', () => {
    const html = buildShareHtml({
      title: '<script>alert(1)</script>',
      url: 'https://x.test',
    });
    expect(html).not.toContain('<script>alert');
    expect(html).toContain('&lt;script&gt;');
  });

  it('applies hide-desktop and hide-mobile classes per network', () => {
    const html = buildShareHtml({
      title: 'X',
      url: 'https://x.test',
      networks: ['x', 'wa', 'tg'],
      hideDesktop: ['x'],
      hideMobile: ['wa'],
    });
    expect(html).toMatch(/o-x[^"]* hide-desktop/);
    expect(html).toMatch(/o-wa[^"]* hide-mobile/);
    expect(html).not.toMatch(/o-tg[^"]* hide-/);
  });

  it('gives the Nostr button a network-specific aria-label, not "copy link"', () => {
    const en = buildShareHtml({ title: 'X', url: 'https://x.test', networks: ['no'], locale: 'en' });
    expect(en).toContain('aria-label="Share on Nostr"');
    expect(en).not.toContain('Copy link to clipboard');
    const es = buildShareHtml({ title: 'X', url: 'https://x.test', networks: ['no'], locale: 'es' });
    expect(es).toContain('aria-label="Compartir en Nostr"');
  });

  it('uses Guarani aria-labels when locale=gn', () => {
    const html = buildShareHtml({
      title: 'X',
      url: 'https://x.test',
      locale: 'gn',
      networks: ['x'],
    });
    expect(html).toContain('aria-label="Emoasãi X (Twitter)-pe"');
  });
});

describe('mountShare + bindShareEvents', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('mounts panel into target and removes on destroy', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    const result = mountShare(root, { title: 'X', url: 'https://x.test' });
    expect(root.querySelector('.oksigenia-panel')).not.toBeNull();
    result.destroy();
    expect(root.querySelector('.oksigenia-panel')).toBeNull();
  });

  it('opens popup for X click', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    mountShare(root, { title: 'X', url: 'https://x.test', networks: ['x'] });
    const spy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const btn = root.querySelector<HTMLButtonElement>('.o-x')!;
    btn.click();
    expect(spy).toHaveBeenCalled();
    const call = spy.mock.calls[0]!;
    expect(call[0]).toContain('twitter.com/intent/tweet');
    // popup strategy must harden window.opener like the tab strategy does
    expect(call[2]).toContain('noopener');
    spy.mockRestore();
  });

  it('centers the popup against the screen, not the viewport', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    mountShare(root, { title: 'X', url: 'https://x.test', networks: ['x'] });
    Object.defineProperty(window, 'screenX', { value: 200, configurable: true });
    Object.defineProperty(window, 'screenY', { value: 100, configurable: true });
    Object.defineProperty(window, 'outerWidth', { value: 1600, configurable: true });
    Object.defineProperty(window, 'outerHeight', { value: 900, configurable: true });
    const spy = vi.spyOn(window, 'open').mockImplementation(() => null);
    root.querySelector<HTMLButtonElement>('.o-x')!.click();
    const features = spy.mock.calls[0]![2] as string;
    expect(features).toContain(`left=${200 + (1600 - 600) / 2}`);
    expect(features).toContain(`top=${100 + (900 - 400) / 2}`);
    spy.mockRestore();
  });

  it('returns dispose that unbinds listeners', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    root.innerHTML = buildShareHtml({ title: 'X', url: 'https://x.test', networks: ['wa'] });
    const dispose = bindShareEvents(root);
    const spy = vi.spyOn(window, 'open').mockImplementation(() => null);
    dispose();
    root.querySelector<HTMLButtonElement>('.o-wa')!.click();
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
