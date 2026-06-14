import { afterEach, describe, expect, it } from 'vitest';
import { buildPanelHtml } from '../render.js';
import { bindPanelBehavior } from '../behavior.js';
import { getTranslation } from '../translations.js';
import { PANEL_CSS } from '../styles.js';

function mountPanel() {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = buildPanelHtml({
    t: getTranslation('en'),
    triggerIcon: 'vitruvian',
    position: 'mid-left',
  });
  const dispose = bindPanelBehavior(shadow, { storageKey: 'test-behavior', locale: 'en' });
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

describe('multi-step controls announce the level to screen readers', () => {
  it('sets "Size, level N of 4" on the zoom button and clears it at level 0', () => {
    const { shadow, dispose } = mountPanel();
    const zoom = shadow.querySelector<HTMLButtonElement>('[data-prefix="oks-zoom"]')!;
    // Starts at level 0 → no aria-label (falls back to visible text), not pressed.
    expect(zoom.hasAttribute('aria-label')).toBe(false);
    expect(zoom.getAttribute('aria-pressed')).toBe('false');

    zoom.click(); // 1
    zoom.click(); // 2
    expect(zoom.getAttribute('aria-label')).toBe('Size, level 2 of 4');
    expect(zoom.getAttribute('aria-pressed')).toBe('true');

    zoom.click(); zoom.click(); zoom.click(); // 3 → 4 → 0 (cycles back)
    expect(zoom.hasAttribute('aria-label')).toBe(false);
    expect(zoom.getAttribute('aria-pressed')).toBe('false');
    dispose();
  });
});

describe('panel styles respect reduced motion', () => {
  it('PANEL_CSS carries a prefers-reduced-motion block', () => {
    expect(PANEL_CSS).toContain('prefers-reduced-motion');
  });
});
