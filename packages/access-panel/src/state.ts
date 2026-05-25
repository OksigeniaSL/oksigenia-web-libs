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

export function loadState(key: string): PanelState {
  if (typeof localStorage === 'undefined') return { ...DEFAULT_STATE };
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as Partial<PanelState> | null;
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_STATE };
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveState(key: string, state: PanelState): void {
  if (typeof localStorage === 'undefined') return;
  try {
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
