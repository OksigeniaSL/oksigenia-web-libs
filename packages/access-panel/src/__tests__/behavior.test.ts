import { afterEach, describe, expect, it } from 'vitest';
import { buildPanelHtml } from '../render.js';
import { bindPanelBehavior } from '../behavior.js';
import { getTranslation } from '../translations.js';

function mountPanel() {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = buildPanelHtml({
    t: getTranslation('en'),
    triggerIcon: 'vitruvian',
    position: 'mid-left',
  });
  const dispose = bindPanelBehavior(shadow, { storageKey: 'test-behavior' });
  return { host, shadow, dispose };
}

afterEach(() => {
  localStorage.clear();
  document.body.innerHTML = '';
  document.body.className = '';
  document.documentElement.className = '';
});

describe('applyState body class hygiene', () => {
  it('toggling effects leaves no junk tokens or duplicates on body', () => {
    const { shadow, dispose } = mountPanel();
    const font = shadow.querySelector<HTMLButtonElement>('[data-class="oks-a11y-font"]')!;
    const links = shadow.querySelector<HTMLButtonElement>('[data-class="oks-a11y-links"]')!;
    const cursor = shadow.querySelector<HTMLButtonElement>('[data-class="oks-big-cursor"]')!;

    font.click();
    cursor.click();
    links.click();
    links.click();
    font.click();
    font.click();

    const tokens = document.body.className.split(/\s+/).filter(Boolean);
    expect(tokens.every((t) => !t.startsWith('-'))).toBe(true);
    expect(new Set(tokens).size).toBe(tokens.length);
    expect(tokens).toContain('oks-a11y-font');
    expect(tokens).toContain('oks-big-cursor');
    expect(tokens).not.toContain('oks-a11y-links');
    dispose();
  });

  it('does not strip host site classes outside the oks- namespace', () => {
    document.body.className = 'site-theme dark-mode';
    const { shadow, dispose } = mountPanel();
    shadow.querySelector<HTMLButtonElement>('[data-class="oks-a11y-font"]')!.click();
    expect(document.body.classList.contains('site-theme')).toBe(true);
    expect(document.body.classList.contains('dark-mode')).toBe(true);
    dispose();
  });
});

describe('focus trap', () => {
  it('includes the footer branding link in the Tab cycle', () => {
    const { shadow, dispose } = mountPanel();
    shadow.getElementById('oks-trigger')!.click();
    const panel = shadow.getElementById('oks-panel')!;
    expect(panel.classList.contains('is-open')).toBe(true);

    const link = panel.querySelector<HTMLAnchorElement>('.oks-access-branding a')!;
    link.focus();
    const firstButton = panel.querySelector<HTMLButtonElement>('button:not([disabled])')!;
    const ev = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    document.dispatchEvent(ev);
    // The link is the last focusable in the panel, so Tab must wrap.
    expect(ev.defaultPrevented).toBe(true);
    expect(shadow.activeElement).toBe(firstButton);
    dispose();
  });
});
