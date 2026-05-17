import { describe, expect, it } from 'vitest';
import { getTranslation, supportedLocales } from '../translations.js';

describe('getTranslation', () => {
  it('returns English by default for unknown locale', () => {
    const t = getTranslation('xx');
    expect(t.share).toBe('SHARE');
  });

  it('resolves base from regional locale (es-PY → es)', () => {
    const t = getTranslation('es-PY');
    expect(t.share).toBe('COMPARTIR');
    expect(t.by).toBe('por');
  });

  it('returns Guaraní strings', () => {
    const t = getTranslation('gn');
    expect(t.share).toBe('MOASÃI');
  });

  it('shareOn template interpolates network name', () => {
    const t = getTranslation('es');
    expect(t.shareOn('X')).toBe('Compartir en X');
  });

  it('handles underscore form (pt_BR → pt)', () => {
    const t = getTranslation('pt_BR');
    expect(t.share).toBe('PARTILHAR');
  });
});

describe('supportedLocales', () => {
  it('includes the 8 published locales', () => {
    const locales = supportedLocales();
    expect(locales).toContain('en');
    expect(locales).toContain('es');
    expect(locales).toContain('gn');
    expect(locales.length).toBe(8);
  });
});
