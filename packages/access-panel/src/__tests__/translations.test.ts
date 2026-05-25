import { describe, expect, it } from 'vitest';
import { getTranslation, supportedLocales } from '../translations.js';

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
