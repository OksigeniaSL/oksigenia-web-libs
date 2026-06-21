import { afterEach, describe, expect, it } from 'vitest';
import { buildPanelHtml } from '../render.js';
import { bindPanelBehavior, type BehaviorOptions } from '../behavior.js';
import { getTranslation } from '../translations.js';
import { PANEL_CSS, EFFECT_CSS, scopedEffectCss } from '../styles.js';
import { resolveEnabledControls } from '../controls.js';

function mountPanel(opts: BehaviorOptions & { showTrigger?: boolean } = {}) {
  const { showTrigger = true, ...behavior } = opts;
  const host = document.createElement('div');
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = buildPanelHtml({
    t: getTranslation('en'),
    triggerIcon: 'vitruvian',
    position: 'mid-left',
    enabled: behavior.enabled,
    showTrigger,
  });
  const dispose = bindPanelBehavior(shadow, { storageKey: 'test-behavior', locale: 'en', ...behavior });
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

describe('focus highlight colour is themeable', () => {
  it('the focus effect reads --oks-focus-color (default #005fcc), globally and scoped', () => {
    expect(EFFECT_CSS).toContain('var(--oks-focus-color, #005fcc)');
    expect(EFFECT_CSS).toContain('--oks-focus-glow');
    expect(scopedEffectCss('#pane')).toContain('var(--oks-focus-color, #005fcc)');
    // high-contrast keeps its own cyan
    expect(EFFECT_CSS).toContain('#0ff');
  });
});

describe('#2 imperative controller', () => {
  it('open/close/toggle drive the panel and the dispose is callable', () => {
    const { shadow, dispose } = mountPanel();
    const panel = shadow.getElementById('oks-panel')!;
    expect(panel.classList.contains('is-open')).toBe(false);
    dispose.open();
    expect(panel.classList.contains('is-open')).toBe(true);
    expect(panel.hasAttribute('inert')).toBe(false);
    dispose.toggle();
    expect(panel.classList.contains('is-open')).toBe(false);
    expect(panel.hasAttribute('inert')).toBe(true);
    dispose();
  });

  it('works host-driven with no floating trigger (trigger="none")', () => {
    const { shadow, dispose } = mountPanel({ showTrigger: false });
    expect(shadow.getElementById('oks-trigger')).toBeNull();
    const panel = shadow.getElementById('oks-panel')!;
    dispose.open();
    expect(panel.classList.contains('is-open')).toBe(true);
    dispose.close();
    expect(panel.classList.contains('is-open')).toBe(false);
    dispose();
  });

  it('stays open when a host button opens it — the opening click must not bubble-close it', () => {
    const { shadow, dispose } = mountPanel({ showTrigger: false });
    const panel = shadow.getElementById('oks-panel')!;
    // A host button in the light DOM, exactly like Bentos' top-center launcher.
    const hostBtn = document.createElement('button');
    hostBtn.addEventListener('click', () => dispose.toggle());
    document.body.appendChild(hostBtn);

    hostBtn.click(); // bubbles to document where onDocClick lives
    expect(panel.classList.contains('is-open')).toBe(true);
    dispose();
  });
});

describe('#1 presets recompose under curation', () => {
  it('applies only the flags whose controls survive', () => {
    // Exclude the reading guide: the dyslexia preset must still set the font,
    // line-height and letter-spacing but not turn the guide on.
    const enabled = resolveEnabledControls(null, 'reading-guide');
    const { shadow, dispose } = mountPanel({ enabled });
    shadow.querySelector<HTMLButtonElement>('[data-preset="dyslexia"]')!.click();
    expect(document.body.classList.contains('oks-dyslexia')).toBe(true);
    expect(document.body.classList.contains('oks-lh-2')).toBe(true);
    expect(document.body.classList.contains('oks-a11y-guide')).toBe(false);
    dispose();
  });
});

describe('#scope scoped mode', () => {
  it('applies effect classes to the scope element, never to body', () => {
    const scopeEl = document.createElement('div');
    document.body.appendChild(scopeEl);
    const { shadow, dispose } = mountPanel({ scopeEl });
    shadow.querySelector<HTMLButtonElement>('[data-class="oks-a11y-contrast"]')!.click();
    expect(scopeEl.classList.contains('oks-a11y-contrast')).toBe(true);
    expect(document.body.classList.contains('oks-a11y-contrast')).toBe(false);
    dispose();
  });

  it('no-ops (does not touch body) when the scope element is missing', () => {
    const { shadow, dispose } = mountPanel({ scopeEl: null });
    shadow.querySelector<HTMLButtonElement>('[data-class="oks-a11y-contrast"]')!.click();
    expect(document.body.classList.contains('oks-a11y-contrast')).toBe(false);
    dispose();
  });

  it('anchors the dialog over its scope element on open (so panes do not stack)', () => {
    const scopeEl = document.createElement('div');
    document.body.appendChild(scopeEl);
    scopeEl.getBoundingClientRect = () => ({
      top: 100, left: 200, width: 300, height: 400, right: 500, bottom: 500, x: 200, y: 100, toJSON: () => ({}),
    }) as DOMRect;
    const { shadow, dispose } = mountPanel({ scopeEl });
    const panel = shadow.getElementById('oks-panel')!;
    dispose.open();
    expect(panel.style.left).toBe('350px'); // left + width/2
    expect(panel.style.top).toBe('108px');  // top + pad
    expect(panel.style.transform).toBe('translateX(-50%)');
    dispose();
  });
});

describe('#5 bounded nudge', () => {
  it('keyboard arrows move the trigger, clamped to the max and persisted', () => {
    const { shadow, dispose } = mountPanel({ nudgeMax: 80 });
    const trigger = shadow.getElementById('oks-trigger')!;
    const wrapper = shadow.getElementById('oks-wrapper')!;
    // 10 steps of 10px right = 100px requested, clamped to the 80px cap.
    for (let i = 0; i < 10; i++) {
      trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    }
    expect(wrapper.style.translate).toBe('80px 0px');
    expect(JSON.parse(localStorage.getItem('test-behavior::pos')!)).toEqual({ x: 80, y: 0 });
    dispose();
  });

  it('does not bind nudge handlers when nudgeMax is 0 (default)', () => {
    const { shadow, dispose } = mountPanel();
    const trigger = shadow.getElementById('oks-trigger')!;
    const wrapper = shadow.getElementById('oks-wrapper')!;
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(wrapper.style.translate).toBeFalsy();
    expect(localStorage.getItem('test-behavior::pos')).toBeNull();
    dispose();
  });

  it('a drag suppresses the click that would otherwise open the panel', () => {
    const { shadow, dispose } = mountPanel({ nudgeMax: 80 });
    const trigger = shadow.getElementById('oks-trigger')!;
    const panel = shadow.getElementById('oks-panel')!;
    trigger.dispatchEvent(new MouseEvent('pointerdown', { clientX: 0, clientY: 0, button: 0, bubbles: true }));
    document.dispatchEvent(new MouseEvent('pointermove', { clientX: 30, clientY: 0, bubbles: true }));
    document.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));
    expect(shadow.getElementById('oks-wrapper')!.style.translate).toBe('30px 0px');
    trigger.click(); // the click that trails a drag must be swallowed
    expect(panel.classList.contains('is-open')).toBe(false);
    // a subsequent clean click still opens
    trigger.click();
    expect(panel.classList.contains('is-open')).toBe(true);
    dispose();
  });
});
