// Estado interno del panel y persistencia en localStorage.
// Compatible con el formato del plugin WP oksigenia-access v16.9
// para preservar la preferencia del usuario entre sitios (mismo
// storage key por defecto).

export interface PanelState {
  /** Niveles 1..4 → 0 desactivado. */
  zoom: number;
  /** Niveles 1..3 → 0 desactivado. */
  lh: number;
  /** Niveles 1..3 → 0 desactivado. */
  align: number;
  /** Niveles 1..3 → 0 desactivado. */
  ls: number;
  /** Niveles 1..3 (1=protanopia, 2=deuteranopia, 3=tritanopia). 0 desactivado. */
  colorblind: number;
  /** Toggles. */
  font: boolean;
  dyslexia: boolean;
  contrast: boolean;
  hideImages: boolean;
  highlightLinks: boolean;
  bigCursor: boolean;
  pauseAnim: boolean;
  focusOutline: boolean;
  /** Overlay escala de grises (excluyente con contrast). */
  grayOverlay: boolean;
  /** Guía horizontal de lectura. */
  readingGuide: boolean;
  /** Máscara de lectura: oscurece todo menos una banda alrededor del cursor. */
  readingMask: boolean;
  /** Aumenta el hit-area de interactivos a 44×44 mínimo (WCAG 2.5.5/2.5.8). */
  bigTargets: boolean;
}

export const DEFAULT_STATE: Readonly<PanelState> = Object.freeze({
  zoom: 0,
  lh: 0,
  align: 0,
  ls: 0,
  colorblind: 0,
  font: false,
  dyslexia: false,
  contrast: false,
  hideImages: false,
  highlightLinks: false,
  bigCursor: false,
  pauseAnim: false,
  focusOutline: false,
  grayOverlay: false,
  readingGuide: false,
  readingMask: false,
  bigTargets: false,
});

/** Highest level of each multi-step control; 0 is always "off". */
const LEVEL_MAX: Readonly<Record<string, number>> = Object.freeze({
  zoom: 4,
  lh: 3,
  align: 3,
  ls: 3,
  colorblind: 3,
});

/**
 * Turns anything parsed from JSON into a clean PanelState: only the known
 * keys, levels as integers within range, toggles as booleans. Unknown keys
 * and out-of-range values fall back to the default. Returns null when the
 * input isn't a plain object at all.
 *
 * Toggles also accept 1, the way older WordPress builds stored them.
 */
export function sanitizeState(input: unknown): PanelState | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const src = input as Record<string, unknown>;
  const out: PanelState = { ...DEFAULT_STATE };
  for (const key of Object.keys(DEFAULT_STATE) as Array<keyof PanelState>) {
    const v = src[key];
    if (v === undefined) continue;
    if (key in LEVEL_MAX) {
      if (typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= LEVEL_MAX[key]!) {
        (out as unknown as Record<string, number>)[key] = v;
      }
    } else if (v === true || v === 1) {
      (out as unknown as Record<string, boolean>)[key] = true;
    }
  }
  return out;
}

/** Parses a JSON string (e.g. the `initial-state` attribute) into a clean
 *  PanelState, or null when it isn't valid JSON for a state object. */
export function parseState(json: string | null | undefined): PanelState | null {
  if (json == null || json.trim() === '') return null;
  try {
    return sanitizeState(JSON.parse(json));
  } catch {
    return null;
  }
}

export function loadState(key: string): PanelState {
  // The typeof check lives inside the try: when storage is blocked (cookies
  // off, sandboxed iframe) merely touching window.localStorage throws.
  try {
    if (typeof localStorage === 'undefined') return { ...DEFAULT_STATE };
    return parseState(localStorage.getItem(key)) ?? { ...DEFAULT_STATE };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveState(key: string, state: PanelState): void {
  try {
    if (typeof localStorage === 'undefined') return;
    // Solo serializamos lo que esté activo, igual que el plugin WP.
    const out: Partial<PanelState> = {};
    for (const [k, v] of Object.entries(state) as Array<[keyof PanelState, unknown]>) {
      if (typeof v === 'number' && v > 0) (out as Record<string, unknown>)[k] = v;
      else if (typeof v === 'boolean' && v) (out as Record<string, unknown>)[k] = v;
    }
    if (Object.keys(out).length === 0) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(out));
    }
  } catch {
    // Fail silent — localStorage puede estar bloqueado en algunos
    // navegadores (modo privado de Safari, por ejemplo).
  }
}

export function isStateEmpty(state: PanelState): boolean {
  return (
    state.zoom === 0 &&
    state.lh === 0 &&
    state.align === 0 &&
    state.ls === 0 &&
    state.colorblind === 0 &&
    !state.font &&
    !state.dyslexia &&
    !state.contrast &&
    !state.hideImages &&
    !state.highlightLinks &&
    !state.bigCursor &&
    !state.pauseAnim &&
    !state.focusOutline &&
    !state.grayOverlay &&
    !state.readingGuide &&
    !state.readingMask &&
    !state.bigTargets
  );
}
