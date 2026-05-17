import { describe, expect, it } from 'vitest';
import { buildPanelHtml } from '../render.js';
import { getTranslation } from '../translations.js';

describe('buildPanelHtml', () => {
  it('renders the 15 controls', () => {
    const html = buildPanelHtml({
      t: getTranslation('en'),
      triggerIcon: 'vitruvian',
      position: 'mid-left',
    });
    const matches = html.match(/class="oks-access-opt/g);
    expect(matches).toHaveLength(15);
  });

  it('uses Spanish labels with locale es', () => {
    const html = buildPanelHtml({
      t: getTranslation('es'),
      triggerIcon: 'vitruvian',
      position: 'mid-left',
    });
    expect(html).toContain('Tamaño');
    expect(html).toContain('Daltonismo');
    expect(html).toContain('Cursor Grande');
  });

  it('uses Guaraní labels with locale gn', () => {
    const html = buildPanelHtml({
      t: getTranslation('gn'),
      triggerIcon: 'vitruvian',
      position: 'mid-left',
    });
    expect(html).toContain('Tuichakue');
    expect(html).toContain('Cursor Guasu');
  });

  it('marks colorblind button as full-width', () => {
    const html = buildPanelHtml({
      t: getTranslation('en'),
      triggerIcon: 'vitruvian',
      position: 'mid-left',
    });
    expect(html).toContain('multi-step full-width');
    expect(html).toContain('data-action="colorblind"');
  });
});
