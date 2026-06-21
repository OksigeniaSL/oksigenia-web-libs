import { describe, expect, it } from 'vitest';
import {
  ALL_CONTROLS,
  resolveEnabledControls,
  filterPresetForEnabled,
  presetIsAvailable,
  NON_SCOPABLE_CONTROLS,
  scopedControls,
} from '../controls.js';

describe('resolveEnabledControls (#1 curation)', () => {
  it('returns all 17 when no attributes given', () => {
    expect(resolveEnabledControls(null, null).size).toBe(17);
    expect(ALL_CONTROLS).toHaveLength(17);
  });

  it('whitelist keeps only listed controls', () => {
    const set = resolveEnabledControls('contrast, text-size, colorblind', null);
    expect([...set].sort()).toEqual(['colorblind', 'contrast', 'text-size']);
  });

  it('blacklist removes listed controls from the full set', () => {
    const set = resolveEnabledControls(null, 'reading-guide,reading-mask,hide-images,grayscale');
    expect(set.has('grayscale')).toBe(false);
    expect(set.has('reading-mask')).toBe(false);
    expect(set.has('contrast')).toBe(true);
    expect(set.size).toBe(13);
  });

  it('ignores unknown ids and is case/space tolerant', () => {
    const set = resolveEnabledControls('  CONTRAST , bogus , Text-Size ', null);
    expect([...set].sort()).toEqual(['contrast', 'text-size']);
  });

  it('exclude wins over whitelist when both name a control', () => {
    const set = resolveEnabledControls('contrast,grayscale', 'grayscale');
    expect(set.has('contrast')).toBe(true);
    expect(set.has('grayscale')).toBe(false);
  });
});

describe('preset recomposition under curation (the open design point)', () => {
  it('drops a preset flag whose control is excluded', () => {
    // dyslexia preset = { dyslexia, lh, ls, readingGuide }. Exclude the guide.
    const enabled = resolveEnabledControls(null, 'reading-guide');
    const recomposed = filterPresetForEnabled('dyslexia', enabled);
    expect(recomposed).toEqual({ dyslexia: true, lh: 2, ls: 2 });
    expect('readingGuide' in recomposed).toBe(false);
  });

  it('hides a preset entirely when none of its controls survive', () => {
    // calm preset touches hide-images + pause-anim only.
    const enabled = resolveEnabledControls(null, 'hide-images,pause-anim');
    expect(presetIsAvailable('calm', enabled)).toBe(false);
    expect(filterPresetForEnabled('calm', enabled)).toEqual({});
  });

  it('hides a preset that would collapse to a single control (≥2 rule)', () => {
    // calm has only 2 controls; excluding one leaves a lone control — redundant.
    const enabled = resolveEnabledControls(null, 'hide-images');
    expect(presetIsAvailable('calm', enabled)).toBe(false);
    // lowvision down to one surviving control is hidden too.
    expect(presetIsAvailable('lowvision', resolveEnabledControls('contrast', null))).toBe(false);
  });

  it('keeps a preset that still bundles two or more controls', () => {
    const enabled = resolveEnabledControls('contrast,text-size', null);
    expect(presetIsAvailable('lowvision', enabled)).toBe(true);
    expect(filterPresetForEnabled('lowvision', enabled)).toEqual({ zoom: 2, contrast: true });
  });
});

describe('scoped mode (#scope)', () => {
  it('NON_SCOPABLE_CONTROLS are the full-screen / root-filter effects', () => {
    expect([...NON_SCOPABLE_CONTROLS].sort()).toEqual(
      ['big-cursor', 'colorblind', 'grayscale', 'reading-guide', 'reading-mask'],
    );
  });

  it('scopedControls drops the non-scopable controls, keeps the rest', () => {
    const scoped = scopedControls(resolveEnabledControls(null, null));
    expect(scoped.size).toBe(ALL_CONTROLS.length - NON_SCOPABLE_CONTROLS.length); // 12
    expect(scoped.has('contrast')).toBe(true);
    expect(scoped.has('big-targets')).toBe(true);
    expect(scoped.has('grayscale')).toBe(false);
    expect(scoped.has('colorblind')).toBe(false);
    expect(scoped.has('big-cursor')).toBe(false);
    expect(scoped.has('reading-guide')).toBe(false);
  });
});
