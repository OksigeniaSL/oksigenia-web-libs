import { describe, expect, it } from 'vitest';
import { buildPanelHtml, positionCss } from '../render.js';
import { getTranslation } from '../translations.js';
import { resolveEnabledControls } from '../controls.js';

const t = getTranslation('en');

describe('buildPanelHtml', () => {
  it('renders the 17 atomic controls', () => {
    const html = buildPanelHtml({
      t: getTranslation('en'),
      triggerIcon: 'vitruvian',
      position: 'mid-left',
    });
    const matches = html.match(/class="oks-access-opt/g);
    expect(matches).toHaveLength(17);
  });

  it('renders the 4 preset shortcuts', () => {
    const html = buildPanelHtml({
      t: getTranslation('en'),
      triggerIcon: 'vitruvian',
      position: 'mid-left',
    });
    const matches = html.match(/class="oks-preset"/g);
    expect(matches).toHaveLength(4);
    expect(html).toContain('data-preset="lowvision"');
    expect(html).toContain('data-preset="dyslexia"');
    expect(html).toContain('data-preset="motor"');
    expect(html).toContain('data-preset="calm"');
  });

  it('renders the reading mask and big-targets controls', () => {
    const html = buildPanelHtml({
      t: getTranslation('en'),
      triggerIcon: 'vitruvian',
      position: 'mid-left',
    });
    expect(html).toContain('data-action="mask"');
    expect(html).toContain('data-class="oks-a11y-bigtargets"');
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

  it('stamps each control with a stable data-control id', () => {
    const html = buildPanelHtml({ t, triggerIcon: 'vitruvian', position: 'mid-left' });
    expect(html).toContain('data-control="contrast"');
    expect(html).toContain('data-control="grayscale"');
    expect(html).toContain('data-control="reading-mask"');
    expect((html.match(/data-control="/g) ?? [])).toHaveLength(17);
  });
});

describe('#1 curation in markup', () => {
  it('renders only whitelisted controls', () => {
    const html = buildPanelHtml({
      t, triggerIcon: 'vitruvian', position: 'mid-left',
      enabled: resolveEnabledControls('contrast,text-size,colorblind', null),
    });
    expect((html.match(/class="oks-access-opt/g) ?? [])).toHaveLength(3);
    expect(html).toContain('data-control="contrast"');
    expect(html).not.toContain('data-control="reading-guide"');
  });

  it('drops a section heading when all its controls are excluded', () => {
    // Orientation section = guide, mask, big-cursor, big-targets, pause-anim, focus.
    const enabled = resolveEnabledControls(null,
      'reading-guide,reading-mask,big-cursor,big-targets,pause-anim,focus');
    const html = buildPanelHtml({ t, triggerIcon: 'vitruvian', position: 'mid-left', enabled });
    expect(html).not.toContain(t.ori);
    expect(html).toContain(t.txt); // other headings survive
  });

  it('hides a preset whose controls are all excluded', () => {
    const enabled = resolveEnabledControls(null, 'hide-images,pause-anim');
    const html = buildPanelHtml({ t, triggerIcon: 'vitruvian', position: 'mid-left', enabled });
    expect(html).not.toContain('data-preset="calm"');
    expect(html).toContain('data-preset="motor"');
  });

  it('drops the whole presets section under heavy curation (≥2 rule)', () => {
    // Only one control survives → no preset can bundle two → no presets row.
    const enabled = resolveEnabledControls('contrast', null);
    const html = buildPanelHtml({ t, triggerIcon: 'vitruvian', position: 'mid-left', enabled });
    expect(html).not.toContain('oks-preset');
    expect(html).not.toContain(t.presets);
  });

  it('drops presets when showPresets is false (presets="none")', () => {
    const html = buildPanelHtml({ t, triggerIcon: 'vitruvian', position: 'mid-left', showPresets: false });
    expect(html).not.toContain('oks-preset');
    expect(html).not.toContain(t.presets);
    // atomic controls still render
    expect(html).toContain('data-control="contrast"');
  });
});

describe('#2 host-driven trigger', () => {
  it('omits the floating trigger when showTrigger is false', () => {
    const html = buildPanelHtml({ t, triggerIcon: 'vitruvian', position: 'mid-left', showTrigger: false });
    expect(html).not.toContain('id="oks-trigger"');
    expect(html).not.toContain('oks-access-wrapper');
    // the dialog itself is still rendered
    expect(html).toContain('id="oks-panel"');
  });

  it('exposes the trigger as ::part and tags its icon preset', () => {
    const html = buildPanelHtml({ t, triggerIcon: 'porthole', position: 'mid-left' });
    expect(html).toContain('part="trigger"');
    expect(html).toContain('data-trigger-icon="porthole"');
  });
});

describe('#5 nine-anchor placement', () => {
  it('positions the new center anchors', () => {
    expect(positionCss('top-center')).toContain('left: 50%');
    expect(positionCss('bottom-center')).toContain('bottom: 20px');
    expect(positionCss('mid-center')).toContain('translate(-50%, -50%)');
  });
});
