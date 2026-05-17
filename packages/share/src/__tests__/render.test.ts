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
