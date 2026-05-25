import { afterEach, describe, expect, it } from 'vitest';
import { loadState, saveState, DEFAULT_STATE, isStateEmpty } from '../state.js';

afterEach(() => {
  localStorage.clear();
});

describe('state persistence', () => {
  it('loads default when key missing', () => {
    const s = loadState('test-key');
    expect(s).toEqual(DEFAULT_STATE);
  });

  it('saves and reloads only active values', () => {
    saveState('test-key', { ...DEFAULT_STATE, zoom: 2, dyslexia: true });
    const raw = JSON.parse(localStorage.getItem('test-key') ?? '{}');
    expect(raw).toEqual({ zoom: 2, dyslexia: true });
    const back = loadState('test-key');
    expect(back.zoom).toBe(2);
    expect(back.dyslexia).toBe(true);
    expect(back.contrast).toBe(false);
  });

  it('removes the key entirely when state is empty', () => {
    saveState('test-key', { ...DEFAULT_STATE, zoom: 1 });
    expect(localStorage.getItem('test-key')).not.toBeNull();
    saveState('test-key', { ...DEFAULT_STATE });
    expect(localStorage.getItem('test-key')).toBeNull();
  });

  it('isStateEmpty detects default', () => {
    expect(isStateEmpty({ ...DEFAULT_STATE })).toBe(true);
    expect(isStateEmpty({ ...DEFAULT_STATE, zoom: 1 })).toBe(false);
    expect(isStateEmpty({ ...DEFAULT_STATE, font: true })).toBe(false);
    expect(isStateEmpty({ ...DEFAULT_STATE, readingMask: true })).toBe(false);
    expect(isStateEmpty({ ...DEFAULT_STATE, bigTargets: true })).toBe(false);
  });

  it('handles corrupt JSON gracefully', () => {
    localStorage.setItem('test-key', '{not-json}');
    expect(loadState('test-key')).toEqual(DEFAULT_STATE);
  });
});
