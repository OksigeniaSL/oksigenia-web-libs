import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import '../web-component.js';

beforeAll(() => {
  // Importing the module registers <oksigenia-access-panel>.
  expect(customElements.get('oksigenia-access-panel')).toBeTruthy();
});

afterEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
});

/** Text of the document sheets that contain `needle`. */
function adopted(needle: string): string[] {
  return document.adoptedStyleSheets
    .map((s) => Array.from(s.cssRules).map((r) => r.cssText).join('\n'))
    .filter((css) => css.includes(needle));
}
const FX = 'oks-a11y-contrast.oks-a11y-contrast';

function mount(attrs: Record<string, string> = {}) {
  const el = document.createElement('oksigenia-access-panel');
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  return el as HTMLElement & { open(): void; close(): void; toggle(): void };
}

describe('<oksigenia-access-panel> wiring', () => {
  it('renders the panel into its shadow root', () => {
    const el = mount({ locale: 'en' });
    expect(el.shadowRoot?.getElementById('oks-panel')).toBeTruthy();
    expect(el.shadowRoot?.getElementById('oks-trigger')).toBeTruthy();
  });

  it('trigger="none" hides the launcher but .open() still works (#2)', () => {
    const el = mount({ locale: 'en', trigger: 'none' });
    expect(el.shadowRoot?.getElementById('oks-trigger')).toBeNull();
    const panel = el.shadowRoot!.getElementById('oks-panel')!;
    el.open();
    expect(panel.classList.contains('is-open')).toBe(true);
  });

  it('curation attributes prune the controls (#1)', () => {
    const el = mount({ locale: 'en', controls: 'contrast,text-size' });
    const opts = el.shadowRoot!.querySelectorAll('.oks-access-opt');
    expect(opts).toHaveLength(2);
  });

  it('presets="none" drops the profiles row', () => {
    const el = mount({ locale: 'en', presets: 'none' });
    expect(el.shadowRoot!.querySelector('.oks-preset')).toBeNull();
    // atomic controls untouched
    expect(el.shadowRoot!.querySelectorAll('.oks-access-opt').length).toBe(17);
  });

  it('effects-exclude injects a contrast filter override (#4)', () => {
    mount({ locale: 'en', 'effects-exclude': 'video, canvas, .no-a11y-filter' });
    const [css] = adopted(FX);
    expect(css).toContain(`body.${FX} :is(video, canvas, .no-a11y-filter)`);
    expect(css).toContain('filter: none !important');
  });

  it('follows effects-exclude as it changes and drops the rule when it is emptied', () => {
    const el = mount({ locale: 'en', 'effects-exclude': 'video' });
    el.setAttribute('effects-exclude', 'canvas');
    expect(adopted(FX)).toHaveLength(1);
    expect(adopted(FX)[0]).toContain(':is(canvas)');
    el.removeAttribute('effects-exclude');
    expect(adopted(FX)).toHaveLength(0);
  });

  it('removes its effects-exclude style on disconnect', () => {
    const el = mount({ locale: 'en', 'effects-exclude': 'video' });
    expect(adopted(FX)).toHaveLength(1);
    el.remove();
    expect(adopted(FX)).toHaveLength(0);
  });

  it('scope= auto-excludes non-scopable controls and injects scoped CSS (#scope)', () => {
    const pane = document.createElement('div');
    pane.id = 'pane';
    document.body.appendChild(pane);
    const el = mount({ locale: 'en', scope: '#pane' });
    const sr = el.shadowRoot!;
    // grayscale + colour-blind are dropped entirely
    expect(sr.querySelector('[data-control="grayscale"]')).toBeNull();
    expect(sr.querySelector('[data-control="colorblind"]')).toBeNull();
    // global-offerable (cursor/guide/mask) ARE offered — applied globally
    expect(sr.querySelector('[data-control="big-cursor"]')).toBeTruthy();
    expect(sr.querySelector('[data-control="reading-guide"]')).toBeTruthy();
    expect(sr.querySelector('[data-control="reading-mask"]')).toBeTruthy();
    // scopable ones stay
    expect(sr.querySelector('[data-control="contrast"]')).toBeTruthy();
    expect(sr.querySelector('[data-control="big-targets"]')).toBeTruthy();
    // per-instance scoped style anchored to #pane, never to body
    const [css] = adopted('#pane.');
    expect(css).toContain('#pane.oks-a11y-contrast');
    expect(css).not.toContain('body.oks');
  });

  it('effects-exclude under scope uses the scope base selector', () => {
    const pane = document.createElement('div');
    pane.id = 'pane3';
    document.body.appendChild(pane);
    mount({ locale: 'en', scope: '#pane3', 'effects-exclude': 'video, canvas' });
    const [fx] = adopted(FX);
    expect(fx).toContain(`#pane3.${FX} :is(video, canvas)`);
    expect(fx).not.toContain('body.oks-a11y-contrast');
  });

  it('removes its scoped style on disconnect', () => {
    const pane = document.createElement('div');
    pane.id = 'pane2';
    document.body.appendChild(pane);
    const el = mount({ locale: 'en', scope: '#pane2' });
    expect(adopted('#pane2.')).toHaveLength(1);
    el.remove();
    expect(adopted('#pane2.')).toHaveLength(0);
  });

  it('shares one effects sheet between panels', () => {
    mount({ locale: 'en' });
    mount({ locale: 'en' });
    expect(adopted('body.oks-a11y-hide')).toHaveLength(1);
  });

  it('waits for connectedCallback: upgrading an element renders it once', () => {
    const el = document.createElement('oksigenia-access-panel') as HTMLElement & {
      attributeChangedCallback(): void;
    };
    const render = vi.spyOn(el as unknown as { render(): void }, 'render');
    Object.defineProperty(el, 'isConnected', { value: true, configurable: true });
    el.setAttribute('locale', 'en');
    el.setAttribute('effects-exclude', 'img, video');
    expect(render).not.toHaveBeenCalled();
    delete (el as unknown as { isConnected?: boolean }).isConnected;
    document.body.appendChild(el);
    expect(render).toHaveBeenCalledTimes(1);
  });
});

describe('styles under a strict CSP', () => {
  it('adds no <style> element and no style attribute in markup', () => {
    const el = mount({ locale: 'en', 'effects-exclude': 'img', scope: 'body' });
    expect(document.querySelectorAll('style[id^="oks"]')).toHaveLength(0);
    expect(el.shadowRoot!.querySelector('style')).toBeNull();
    expect(el.shadowRoot!.adoptedStyleSheets).toHaveLength(1);
    expect(el.shadowRoot!.innerHTML).not.toMatch(/\sstyle=/);
    expect(document.getElementById('oksigenia-access-filters')!.innerHTML).not.toMatch(/\sstyle=/);
  });

  it('falls back to <style> without constructable stylesheets', () => {
    const view = document.defaultView as unknown as Record<string, unknown>;
    const { CSSStyleSheet: original } = view;
    view.CSSStyleSheet = undefined;
    try {
      const el = mount({ locale: 'en', 'effects-exclude': 'img' });
      expect(el.shadowRoot!.querySelector('style')!.textContent).toContain('.oks-access-panel');
      const fx = document.head.querySelector('style[id^="oks-access-fx-"]');
      expect(fx!.textContent).toContain(`body.${FX} :is(img)`);
      el.remove();
      expect(document.head.querySelector('style[id^="oks-access-fx-"]')).toBeNull();
    } finally {
      view.CSSStyleSheet = original;
    }
  });
});
