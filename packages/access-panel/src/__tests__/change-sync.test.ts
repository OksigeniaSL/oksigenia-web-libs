import { afterEach, describe, expect, it } from 'vitest';
import '../web-component.js';
import { DEFAULT_STATE, parseState, sanitizeState, type PanelState } from '../state.js';
import type { PanelChangeDetail } from '../behavior.js';

afterEach(() => {
  document.body.innerHTML = '';
  document.body.className = '';
  document.documentElement.className = '';
  localStorage.clear();
});

function mount(attrs: Record<string, string> = {}) {
  const el = document.createElement('oksigenia-access-panel');
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  const events: PanelChangeDetail[] = [];
  // Listen on the document: the event must bubble out of the element.
  const onChange = (e: Event) => events.push((e as CustomEvent<PanelChangeDetail>).detail);
  document.addEventListener('oksiac:change', onChange);
  document.body.appendChild(el);
  const btn = (sel: string) => el.shadowRoot!.querySelector<HTMLButtonElement>(sel)!;
  const stop = () => document.removeEventListener('oksiac:change', onChange);
  return { el, events, btn, stop };
}

describe('oksiac:change', () => {
  it('is not fired on load', () => {
    localStorage.setItem('oksiacSettings', JSON.stringify({ zoom: 2 }));
    const { events, stop } = mount({ locale: 'en' });
    expect(events).toHaveLength(0);
    stop();
  });

  it('fires after a control changes, with the full state', () => {
    const { events, btn, stop } = mount({ locale: 'en' });
    btn('[data-prefix="oks-zoom"]').click();
    expect(events).toHaveLength(1);
    expect(events[0]!.state).toEqual({ ...DEFAULT_STATE, zoom: 1 });
    // Saved before the event goes out.
    expect(JSON.parse(localStorage.getItem('oksiacSettings')!)).toEqual({ zoom: 1 });
    stop();
  });

  it('fires once when a profile is applied', () => {
    const { events, btn, stop } = mount({ locale: 'en' });
    btn('[data-preset="dyslexia"]').click();
    expect(events).toHaveLength(1);
    expect(events[0]!.state.dyslexia).toBe(true);
    stop();
  });

  it('fires on Reset with the default state', () => {
    localStorage.setItem('oksiacSettings', JSON.stringify({ contrast: true }));
    const { events, el, stop } = mount({ locale: 'en' });
    el.shadowRoot!.getElementById('oks-reset')!.click();
    expect(events).toHaveLength(1);
    expect(events[0]!.state).toEqual({ ...DEFAULT_STATE });
    stop();
  });

  it('hands out a copy, not the live state', () => {
    const { events, btn, stop } = mount({ locale: 'en' });
    btn('[data-prefix="oks-zoom"]').click();
    (events[0]!.state as PanelState).zoom = 4;
    btn('[data-prefix="oks-zoom"]').click();
    expect(events[1]!.state.zoom).toBe(2);
    stop();
  });
});

describe('initial-state', () => {
  it('wins over localStorage and is saved there, without firing the event', () => {
    localStorage.setItem('oksiacSettings', JSON.stringify({ contrast: true }));
    const { events, stop } = mount({ locale: 'en', 'initial-state': JSON.stringify({ zoom: 3, dyslexia: true }) });
    expect(document.body.classList.contains('oks-zoom-3')).toBe(true);
    expect(document.body.classList.contains('oks-dyslexia')).toBe(true);
    expect(document.body.classList.contains('oks-a11y-contrast')).toBe(false);
    expect(JSON.parse(localStorage.getItem('oksiacSettings')!)).toEqual({ zoom: 3, dyslexia: true });
    expect(events).toHaveLength(0);
    stop();
  });

  it('an empty object clears what this browser had', () => {
    localStorage.setItem('oksiacSettings', JSON.stringify({ contrast: true }));
    const { stop } = mount({ locale: 'en', 'initial-state': '{}' });
    expect(document.body.classList.contains('oks-a11y-contrast')).toBe(false);
    expect(localStorage.getItem('oksiacSettings')).toBeNull();
    stop();
  });

  it('is ignored when it is not valid JSON or not an object', () => {
    for (const bad of ['{not json', '[1,2]', '"zoom"', 'null', '42']) {
      localStorage.setItem('oksiacSettings', JSON.stringify({ contrast: true }));
      const { el, stop } = mount({ locale: 'en', 'initial-state': bad });
      expect(document.body.classList.contains('oks-a11y-contrast')).toBe(true);
      el.remove();
      document.body.className = '';
      stop();
    }
  });

  it('is read on the first render only: a later re-render keeps the visitor\'s changes', () => {
    const { el, btn, stop } = mount({ locale: 'en', 'initial-state': JSON.stringify({ zoom: 1 }) });
    btn('[data-prefix="oks-zoom"]').click(); // zoom 2
    el.setAttribute('locale', 'es'); // triggers a re-render
    expect(document.body.classList.contains('oks-zoom-2')).toBe(true);
    stop();
  });

  it('still applies when localStorage is blocked', () => {
    const original = Object.getOwnPropertyDescriptor(window, 'localStorage')!;
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() { throw new DOMException('Access is denied for this document.', 'SecurityError'); },
    });
    try {
      const { events, el, stop } = mount({ locale: 'en', 'initial-state': JSON.stringify({ zoom: 2 }) });
      expect(document.body.classList.contains('oks-zoom-2')).toBe(true);
      el.shadowRoot!.querySelector<HTMLButtonElement>('[data-prefix="oks-zoom"]')!.click();
      expect(events).toHaveLength(1);
      expect(events[0]!.state.zoom).toBe(3);
      stop();
    } finally {
      Object.defineProperty(window, 'localStorage', original);
    }
  });
});

describe('sanitizeState / parseState', () => {
  it('keeps known keys with valid values only', () => {
    expect(sanitizeState({ zoom: 2, lh: 9, align: 1.5, colorblind: -1, dyslexia: true, contrast: 'yes', evil: '<x>' }))
      .toEqual({ ...DEFAULT_STATE, zoom: 2, dyslexia: true });
  });

  it('accepts 1 for toggles (older WordPress format)', () => {
    expect(sanitizeState({ font: 1 })!.font).toBe(true);
  });

  it('returns null for non-objects', () => {
    expect(sanitizeState(null)).toBeNull();
    expect(sanitizeState([])).toBeNull();
    expect(sanitizeState('x')).toBeNull();
    expect(parseState('{bad')).toBeNull();
    expect(parseState('')).toBeNull();
    expect(parseState(null)).toBeNull();
  });

  it('loadState drops junk it finds in localStorage', async () => {
    const { loadState } = await import('../state.js');
    localStorage.setItem('k', JSON.stringify({ zoom: 99, contrast: true, extra: 1 }));
    expect(loadState('k')).toEqual({ ...DEFAULT_STATE, contrast: true });
  });
});
