import { describe, expect, it } from 'vitest';
import { getTranslation, getTranslationLang, supportedLocales } from '../translations.js';

describe('access-panel translations', () => {
  it('returns Spanish for es-PY', () => {
    const t = getTranslation('es-PY');
    expect(t.title).toBe('Accesibilidad');
  });

  it('returns Guaraní for gn', () => {
    const t = getTranslation('gn');
    expect(t.title).toBe('Oikeha (Accesibilidad)');
  });

  it('falls back to English', () => {
    const t = getTranslation('zz');
    expect(t.title).toBe('Accessibility');
  });

  it('exposes 8 locales', () => {
    expect(supportedLocales().length).toBe(8);
  });

  it('labels outside English keep their language\'s case and are not abbreviated', () => {
    for (const code of supportedLocales().filter((c) => c !== 'en')) {
      const t = getTranslation(code);
      const labels = [t.font, t.dyslexia, t.gray, t.hide, t.links, t.guide, t.mask, t.targets, t.cursor, t.pause,
        t.ls, t.cb, t.focus, t.pLow, t.pDys, t.pMot, t.pCalm, t.reset, t.fold, t.unfold];
      for (const label of labels) {
        expect(label, `${code}: ${label}`).not.toMatch(/\.$/);
        if (code !== 'de') {
          const words = label.split(/\s+/).slice(1);
          expect(words.some((w) => /^\p{Lu}\p{Ll}/u.test(w)), `${code}: ${label}`).toBe(false);
        }
      }
    }
  });

  it('getTranslationLang names the language the labels are in', () => {
    expect(getTranslationLang('es-PY')).toBe('es');
    expect(getTranslationLang('gn')).toBe('gn');
    expect(getTranslationLang('zz')).toBe('en');
  });

  it('every locale defines the new mask / targets / preset keys', () => {
    for (const code of supportedLocales()) {
      const t = getTranslation(code);
      expect(t.mask).toBeTruthy();
      expect(t.targets).toBeTruthy();
      expect(t.presets).toBeTruthy();
      expect(t.pLow).toBeTruthy();
      expect(t.pDys).toBeTruthy();
      expect(t.pMot).toBeTruthy();
      expect(t.pCalm).toBeTruthy();
    }
  });
});
