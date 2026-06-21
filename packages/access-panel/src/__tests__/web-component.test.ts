import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import '../web-component.js';

beforeAll(() => {
  // Importing the module registers <oksigenia-access-panel>.
  expect(customElements.get('oksigenia-access-panel')).toBeTruthy();
});

afterEach(() => {
  document.body.innerHTML = '';
  document.head.querySelectorAll('style[id^="oks-access-fx-"]').forEach((n) => n.remove());
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
});
