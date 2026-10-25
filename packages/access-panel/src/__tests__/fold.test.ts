import { afterEach, describe, expect, it } from 'vitest';
import '../web-component.js';
import { DEFAULT_STATE, isStateEmpty, parseState } from '../state.js';
import { positionCss } from '../render.js';
import { getTranslation, supportedLocales } from '../translations.js';
import type { PanelChangeDetail } from '../behavior.js';

afterEach(() => {
  document.body.innerHTML = '';
  document.body.className = '';
  document.documentElement.className = '';
  localStorage.clear();
});

function mount(attrs: Record<string, string> = {}) {
  const el = document.createElement('oksigenia-access-panel');
  el.setAttribute('locale', 'en');
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  const events: PanelChangeDetail[] = [];
  const onChange = (e: Event) => events.push((e as CustomEvent<PanelChangeDetail>).detail);
  document.addEventListener('oksiac:change', onChange);
  document.body.appendChild(el);
  const root = el.shadowRoot!;
  const wrapper = root.getElementById('oks-wrapper')!;
  const trigger = root.getElementById('oks-trigger') as HTMLButtonElement;
  const panel = root.getElementById('oks-panel')!;
  const fold = root.getElementById('oks-fold') as HTMLButtonElement | null;
  const stop = () => document.removeEventListener('oksiac:change', onChange);
  return { el, root, wrapper, trigger, panel, fold, events, stop };
}

describe('fold the trigger', () => {
  it('renders the fold button in the footer, unfolded by default', () => {
    const { wrapper, fold, stop } = mount();
    expect(fold).not.toBeNull();
    expect(fold!.textContent).toBe('Hide Button');
    expect(wrapper.classList.contains('is-folded')).toBe(false);
    stop();
  });

  it('folds, closes the panel, saves and tells the host', () => {
    const { el, wrapper, trigger, panel, fold, events, stop } = mount();
    el.open();
    fold!.click();
    expect(wrapper.classList.contains('is-folded')).toBe(true);
    expect(panel.classList.contains('is-open')).toBe(false);
    expect(el.shadowRoot!.activeElement).toBe(trigger);
    expect(fold!.textContent).toBe('Show Button');
    expect(JSON.parse(localStorage.getItem('oksiacSettings')!)).toEqual({ folded: true });
    expect(events).toHaveLength(1);
    expect(events[0]!.state).toEqual({ ...DEFAULT_STATE, folded: true });
    stop();
  });

  it('the folded tab still opens the panel, and the same button unfolds it', () => {
    localStorage.setItem('oksiacSettings', JSON.stringify({ folded: true }));
    const { wrapper, trigger, panel, fold, stop } = mount();
    expect(wrapper.classList.contains('is-folded')).toBe(true);
    trigger.click();
    expect(panel.classList.contains('is-open')).toBe(true);
    fold!.click();
    expect(wrapper.classList.contains('is-folded')).toBe(false);
    expect(panel.classList.contains('is-open')).toBe(true);
    expect(localStorage.getItem('oksiacSettings')).toBeNull();
    stop();
  });

  it('comes back folded from initial-state (the host account)', () => {
    const { wrapper, stop } = mount({ 'initial-state': '{"folded":true,"zoom":1}' });
    expect(wrapper.classList.contains('is-folded')).toBe(true);
    expect(document.body.classList.contains('oks-zoom-1')).toBe(true);
    stop();
  });

  it('is not an active effect, and Reset keeps it', () => {
    expect(isStateEmpty({ ...DEFAULT_STATE, folded: true })).toBe(true);
    localStorage.setItem('oksiacSettings', JSON.stringify({ folded: true, contrast: true }));
    const { root, wrapper, events, stop } = mount();
    expect(wrapper.classList.contains('has-active')).toBe(true);
    root.getElementById('oks-reset')!.click();
    expect(wrapper.classList.contains('is-folded')).toBe(true);
    expect(wrapper.classList.contains('has-active')).toBe(false);
    expect(events[0]!.state).toEqual({ ...DEFAULT_STATE, folded: true });
    stop();
  });

  it('drops the nudge while folded and restores it on unfold', () => {
    localStorage.setItem('oksiacSettings::pos', JSON.stringify({ x: 30, y: -20 }));
    const { el, wrapper, fold, stop } = mount({ nudge: '' });
    expect(wrapper.style.translate).toBe('30px -20px');
    el.open();
    fold!.click();
    expect(wrapper.style.translate).toBe('');
    el.open();
    fold!.click();
    expect(wrapper.style.translate).toBe('30px -20px');
    stop();
  });

  it('fold="none" removes the button and ignores a stored fold', () => {
    localStorage.setItem('oksiacSettings', JSON.stringify({ folded: true }));
    const { wrapper, fold, stop } = mount({ fold: 'none' });
    expect(fold).toBeNull();
    expect(wrapper.classList.contains('is-folded')).toBe(false);
    stop();
  });

  it('has no fold button without a trigger', () => {
    const { root, stop } = mount({ trigger: 'none' });
    expect(root.getElementById('oks-fold')).toBeNull();
    stop();
  });

  it('keeps "folded" through sanitising', () => {
    expect(parseState('{"folded":true}')).toEqual({ ...DEFAULT_STATE, folded: true });
    expect(parseState('{"folded":"yes"}')).toEqual({ ...DEFAULT_STATE });
  });
});

describe('fold edge per position', () => {
  it('sends left anchors to the left edge and right ones to the right', () => {
    expect(positionCss('bottom-left')).toContain('.oks-access-wrapper.is-folded { left: 0; }');
    expect(positionCss('mid-right')).toContain('.oks-access-wrapper.is-folded { right: 0; }');
    expect(positionCss('mid-center')).toContain('right: 0; transform: translateY(-50%);');
  });

  it('keeps the bottom-center tab above the host bar', () => {
    expect(positionCss('bottom-center')).toContain('bottom: var(--oks-bottom-offset, 0px);');
  });

  it('follows position-mobile on phones', () => {
    const css = positionCss('mid-left', 'bottom-right');
    const mobile = css.slice(css.indexOf('@media (max-width: 768px)'));
    expect(mobile).toContain('.oks-access-wrapper.is-folded {');
    expect(mobile).toContain('right: 0;');
    expect(mobile).toContain('border-radius: 10px 0 0 10px;');
  });
});

describe('panel language', () => {
  it('the dialog carries the language of its labels', () => {
    const { el, stop } = mount({ locale: 'es-ES' });
    expect(el.shadowRoot!.getElementById('oks-panel')!.getAttribute('lang')).toBe('es');
    stop();
    const second = mount({ locale: 'zz' });
    expect(second.el.shadowRoot!.getElementById('oks-panel')!.getAttribute('lang')).toBe('en');
    second.stop();
  });
});

describe('fold translations', () => {
  it('every locale names both fold labels', () => {
    for (const code of supportedLocales()) {
      const t = getTranslation(code);
      expect(t.fold).toBeTruthy();
      expect(t.unfold).toBeTruthy();
      expect(t.fold).not.toBe(t.unfold);
    }
  });
});
