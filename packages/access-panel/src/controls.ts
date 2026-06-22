// Single source of truth for the panel's control catalogue.
//
// Each atomic control has a stable, human-readable id (the value the host
// passes in `controls=` / `exclude=`). Render, behavior and the web component
// all resolve curation against this registry so the three never drift.
//
// The ids are part of the public API — they are documented and used by hosts —
// so treat renames as breaking.

import type { PanelState } from './state.js';

export type ControlId =
  | 'text-size'
  | 'line-height'
  | 'text-align'
  | 'readable-font'
  | 'dyslexia-font'
  | 'letter-spacing'
  | 'contrast'
  | 'grayscale'
  | 'hide-images'
  | 'highlight-links'
  | 'colorblind'
  | 'reading-guide'
  | 'reading-mask'
  | 'big-cursor'
  | 'big-targets'
  | 'pause-anim'
  | 'focus';

/** Render order (also the order `exclude=`/`controls=` are validated against). */
export const ALL_CONTROLS: readonly ControlId[] = [
  'text-size', 'line-height', 'text-align', 'readable-font', 'dyslexia-font', 'letter-spacing',
  'contrast', 'grayscale', 'hide-images', 'highlight-links', 'colorblind',
  'reading-guide', 'reading-mask', 'big-cursor', 'big-targets', 'pause-anim', 'focus',
];

/** Control id → the PanelState field it drives. */
export const CONTROL_STATE_KEY: Readonly<Record<ControlId, keyof PanelState>> = {
  'text-size': 'zoom',
  'line-height': 'lh',
  'text-align': 'align',
  'readable-font': 'font',
  'dyslexia-font': 'dyslexia',
  'letter-spacing': 'ls',
  'contrast': 'contrast',
  'grayscale': 'grayOverlay',
  'hide-images': 'hideImages',
  'highlight-links': 'highlightLinks',
  'colorblind': 'colorblind',
  'reading-guide': 'readingGuide',
  'reading-mask': 'readingMask',
  'big-cursor': 'bigCursor',
  'big-targets': 'bigTargets',
  'pause-anim': 'pauseAnim',
  'focus': 'focusOutline',
};

/** Reverse of CONTROL_STATE_KEY, for mapping a preset's flags back to controls. */
const STATE_KEY_CONTROL = Object.fromEntries(
  Object.entries(CONTROL_STATE_KEY).map(([control, key]) => [key, control as ControlId]),
) as Record<keyof PanelState, ControlId>;

export type PresetId = 'lowvision' | 'dyslexia' | 'motor' | 'calm';

/** Preset profiles: set the listed flags, leave the rest as-is.
 *  Apply is additive — pressing two presets unions their flags. */
export const PRESETS: Readonly<Record<PresetId, Partial<PanelState>>> = {
  lowvision: { zoom: 2, contrast: true, highlightLinks: true, bigCursor: true, focusOutline: true },
  dyslexia:  { dyslexia: true, lh: 2, ls: 2, readingGuide: true },
  motor:     { bigCursor: true, bigTargets: true, focusOutline: true },
  calm:      { hideImages: true, pauseAnim: true },
};

export const PRESET_IDS: readonly PresetId[] = ['lowvision', 'dyslexia', 'motor', 'calm'];

/** Control ids a preset touches (used to hide/recompose it under curation). */
export function presetControlIds(id: PresetId): ControlId[] {
  return Object.keys(PRESETS[id]).map((k) => STATE_KEY_CONTROL[k as keyof PanelState]);
}

/**
 * Resolve which controls an instance offers from its `controls=` (whitelist)
 * and `exclude=` (blacklist) attributes. Both optional; unknown ids ignored.
 * No attributes ⇒ all 17 (current behavior).
 */
export function resolveEnabledControls(
  controlsAttr?: string | null,
  excludeAttr?: string | null,
): Set<ControlId> {
  const valid = new Set(ALL_CONTROLS);
  const parse = (raw: string | null | undefined): ControlId[] =>
    (raw ?? '')
      .split(',')
      .map((s) => s.trim().toLowerCase() as ControlId)
      .filter((s) => valid.has(s));

  const whitelist = controlsAttr != null ? parse(controlsAttr) : null;
  let enabled = whitelist && whitelist.length > 0 ? new Set(whitelist) : new Set(ALL_CONTROLS);

  if (excludeAttr != null) {
    for (const id of parse(excludeAttr)) enabled.delete(id);
  }
  return enabled;
}

/**
 * Controls that can't be confined to a container AND shouldn't even be offered
 * in a scoped panel: grayscale (a full-screen overlay that destroys colour
 * data) and the colour-blind root `filter` (destroys data + the open
 * simulation-vs-correction question). A scoped instance drops these entirely.
 */
export const NON_SCOPABLE_CONTROLS: readonly ControlId[] = ['grayscale', 'colorblind'];

/**
 * Controls that can't be *scoped* but ARE benign window-level aids, so a scoped
 * panel still offers them and applies them globally (to the whole window) with
 * a shared, cross-instance state: big cursor and the reading guide / mask.
 * Toggling from any pane affects the whole window and every pane's button
 * reflects it. (Unlike grayscale/colour-blind, these don't falsify data.)
 */
export const GLOBAL_OFFERABLE_CONTROLS: readonly ControlId[] = [
  'big-cursor', 'reading-guide', 'reading-mask',
];

/** Remove the controls a scoped instance doesn't offer at all (grayscale, colour-blind). */
export function scopedControls(enabled: Set<ControlId>): Set<ControlId> {
  const out = new Set(enabled);
  for (const id of NON_SCOPABLE_CONTROLS) out.delete(id);
  return out;
}

/**
 * Recompose a preset for a curated instance: keep only the flags whose control
 * is still offered. The open design point Bentos flagged — a preset in a window
 * that excludes its controls (e.g. "dyslexia" where the dyslexia font and
 * reading guide are gone) collapses to whatever it can still legitimately set,
 * and is hidden entirely (see `presetIsAvailable`) when nothing remains.
 */
export function filterPresetForEnabled(
  id: PresetId,
  enabled: Set<ControlId>,
): Partial<PanelState> {
  const out: Partial<PanelState> = {};
  for (const [k, v] of Object.entries(PRESETS[id]) as Array<[keyof PanelState, never]>) {
    if (enabled.has(STATE_KEY_CONTROL[k])) out[k] = v;
  }
  return out;
}

/**
 * A preset shows only if it still bundles **two or more** controls after
 * curation. A profile is a combination — one that collapses to a single
 * control is redundant with that control's own button, so it is hidden.
 */
export function presetIsAvailable(id: PresetId, enabled: Set<ControlId>): boolean {
  return presetControlIds(id).filter((c) => enabled.has(c)).length >= 2;
}
