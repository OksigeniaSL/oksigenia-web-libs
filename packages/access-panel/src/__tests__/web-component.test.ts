import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import '../web-component.js';

beforeAll(() => {
  // Importing the module registers <oksigenia-access-panel>.
  expect(customElements.get('oksigenia-access-panel')).toBeTruthy();
});

afterEach(() => {
  document.body.innerHTML = '';
  document.head.querySelectorAll('style[id^="oks-access-fx-"], style[id^="oks-access-scope-"]').forEach((n) => n.remove());
  localStorage.clear();
});

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
    const style = document.head.querySelector<HTMLStyleElement>('style[id^="oks-access-fx-"]');
    expect(style).toBeTruthy();
    expect(style!.textContent).toContain('body.oks-a11y-contrast :is(video, canvas, .no-a11y-filter)');
    expect(style!.textContent).toContain('filter: none !important');
  });

  it('removes its effects-exclude style on disconnect', () => {
    const el = mount({ locale: 'en', 'effects-exclude': 'video' });
    expect(document.head.querySelector('style[id^="oks-access-fx-"]')).toBeTruthy();
    el.remove();
    expect(document.head.querySelector('style[id^="oks-access-fx-"]')).toBeNull();
  });

  it('scope= auto-excludes non-scopable controls and injects scoped CSS (#scope)', () => {
    const pane = document.createElement('div');
    pane.id = 'pane';
    document.body.appendChild(pane);
    const el = mount({ locale: 'en', scope: '#pane' });
    const sr = el.shadowRoot!;
    // non-scopable controls are gone
    expect(sr.querySelector('[data-control="grayscale"]')).toBeNull();
    expect(sr.querySelector('[data-control="colorblind"]')).toBeNull();
    expect(sr.querySelector('[data-control="big-cursor"]')).toBeNull();
    expect(sr.querySelector('[data-control="reading-guide"]')).toBeNull();
    // scopable ones stay
    expect(sr.querySelector('[data-control="contrast"]')).toBeTruthy();
    expect(sr.querySelector('[data-control="big-targets"]')).toBeTruthy();
    // per-instance scoped style anchored to #pane, never to body
    const style = document.head.querySelector<HTMLStyleElement>('style[id^="oks-access-scope-"]');
    expect(style).toBeTruthy();
    expect(style!.textContent).toContain('#pane.oks-a11y-contrast');
    expect(style!.textContent).not.toContain('body.oks');
  });

  it('effects-exclude under scope uses the scope base selector', () => {
    const pane = document.createElement('div');
    pane.id = 'pane3';
    document.body.appendChild(pane);
    mount({ locale: 'en', scope: '#pane3', 'effects-exclude': 'video, canvas' });
    const fx = document.head.querySelector<HTMLStyleElement>('style[id^="oks-access-fx-"]');
    expect(fx!.textContent).toContain('#pane3.oks-a11y-contrast :is(video, canvas)');
    expect(fx!.textContent).not.toContain('body.oks-a11y-contrast');
  });

  it('removes its scoped style on disconnect', () => {
    const pane = document.createElement('div');
    pane.id = 'pane2';
    document.body.appendChild(pane);
    const el = mount({ locale: 'en', scope: '#pane2' });
    expect(document.head.querySelector('style[id^="oks-access-scope-"]')).toBeTruthy();
    el.remove();
    expect(document.head.querySelector('style[id^="oks-access-scope-"]')).toBeNull();
  });
});
