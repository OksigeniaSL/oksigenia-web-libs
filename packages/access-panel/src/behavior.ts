import { type PanelState, loadState, saveState, DEFAULT_STATE, isStateEmpty } from './state.js';
import { getTranslation } from './translations.js';

const MULTI_KEYS: Record<string, keyof PanelState> = {
  'oks-zoom': 'zoom',
  'oks-lh': 'lh',
  'oks-align': 'align',
  'oks-ls': 'ls',
  'oks-colorblind': 'colorblind',
};

const MULTI_LEVELS: Record<string, number> = {
  'oks-zoom': 4,
  'oks-lh': 3,
  'oks-align': 3,
  'oks-ls': 3,
  'oks-colorblind': 3,
};

const TOGGLE_KEYS: Record<string, keyof PanelState> = {
  'oks-a11y-font': 'font',
  'oks-dyslexia': 'dyslexia',
  'oks-a11y-contrast': 'contrast',
  'oks-a11y-hide': 'hideImages',
  'oks-a11y-links': 'highlightLinks',
  'oks-big-cursor': 'bigCursor',
  'oks-a11y-pause': 'pauseAnim',
  'oks-a11y-focus': 'focusOutline',
  'oks-a11y-bigtargets': 'bigTargets',
};

/** Preset profiles: set the listed flags to true, leave the rest as-is.
 *  Apply is additive — pressing two presets unions their flags. */
const PRESETS: Record<string, Partial<PanelState>> = {
  lowvision: { zoom: 2, contrast: true, highlightLinks: true, bigCursor: true, focusOutline: true },
  dyslexia:  { dyslexia: true, lh: 2, ls: 2, readingGuide: true },
  motor:     { bigCursor: true, bigTargets: true, focusOutline: true },
  calm:      { hideImages: true, pauseAnim: true },
};

export interface BehaviorOptions {
  /** Llave localStorage. Default oksiacSettings. */
  storageKey?: string;
  /** Locale para los aria-label dinámicos (nivel de los multinivel). Default en. */
  locale?: string;
}

/**
 * Engancha toda la lógica al panel ya renderizado dentro de `root`
 * (que es el shadowRoot del custom element). Devuelve un dispose para
 * limpiar.
 */
export function bindPanelBehavior(root: ShadowRoot, opts: BehaviorOptions = {}): () => void {
  const storageKey = opts.storageKey ?? 'oksiacSettings';
  const t = getTranslation(opts.locale ?? 'en');
  const trigger = root.getElementById('oks-trigger') as HTMLButtonElement | null;
  const panel = root.getElementById('oks-panel') as HTMLDivElement | null;
  const closeBtn = root.getElementById('oks-close') as HTMLButtonElement | null;
  const resetBtn = root.getElementById('oks-reset') as HTMLButtonElement | null;
  const wrapper = root.getElementById('oks-wrapper') as HTMLDivElement | null;
  const opts$ = Array.from(root.querySelectorAll<HTMLButtonElement>('.oks-access-opt, .oks-preset'));

  if (!trigger || !panel || !closeBtn || !resetBtn || !wrapper) {
    return () => {};
  }

  let state: PanelState = loadState(storageKey);

  // ─── Render-from-state ──────────────────────────────────────────
  // Aplica `state` al DOM (clases en body/html + estado de los botones).
  function applyState(): void {
    const body = document.body;
    const root = document.documentElement;
    // Clear everything of ours before re-applying. Token by token via
    // classList: a regex over className used to split two-hyphen classes
    // (oks-a11y-font → "-font" residue) and leave junk piling up.
    for (const cls of Array.from(body.classList)) {
      if (cls.startsWith('oks-')) body.classList.remove(cls);
    }
    [1, 2, 3].forEach((l) => root.classList.remove(`oks-colorblind-${l}`));

    if (state.zoom > 0) body.classList.add(`oks-zoom-${state.zoom}`);
    if (state.lh > 0) body.classList.add(`oks-lh-${state.lh}`);
    if (state.align > 0) body.classList.add(`oks-align-${state.align}`);
    if (state.ls > 0) body.classList.add(`oks-ls-${state.ls}`);
    if (state.colorblind > 0) root.classList.add(`oks-colorblind-${state.colorblind}`);
    if (state.font) body.classList.add('oks-a11y-font');
    if (state.dyslexia) body.classList.add('oks-dyslexia');
    if (state.contrast) body.classList.add('oks-a11y-contrast');
    if (state.hideImages) body.classList.add('oks-a11y-hide');
    if (state.highlightLinks) body.classList.add('oks-a11y-links');
    if (state.bigCursor) body.classList.add('oks-big-cursor');
    if (state.pauseAnim) body.classList.add('oks-a11y-pause');
    if (state.focusOutline) body.classList.add('oks-a11y-focus');
    if (state.readingGuide) body.classList.add('oks-a11y-guide');
    if (state.readingMask) body.classList.add('oks-a11y-mask');
    if (state.bigTargets) body.classList.add('oks-a11y-bigtargets');

    const overlay = ensureOverlay();
    overlay.classList.toggle('is-active', state.grayOverlay);

    syncButtonsFromState();
    wrapper?.classList.toggle('has-active', !isStateEmpty(state));
  }

  function syncButtonsFromState(): void {
    for (const btn of opts$) {
      const action = btn.getAttribute('data-action');
      if (action === 'multi' || action === 'colorblind') {
        const prefix = btn.getAttribute('data-prefix') ?? '';
        const key = MULTI_KEYS[prefix];
        if (!key) continue;
        const lvl = state[key] as number;
        btn.setAttribute('data-level', String(lvl));
        btn.classList.toggle('is-active', lvl > 0);
        btn.setAttribute('aria-pressed', lvl > 0 ? 'true' : 'false');
        // Announce the current level to screen readers (aria-pressed alone only
        // says on/off). At level 0 we drop the aria-label so the button falls
        // back to its visible text. The max comes from data-levels on the button.
        const max = parseInt(btn.getAttribute('data-levels') ?? '0', 10);
        const lbl = btn.querySelector('.oks-label')?.textContent?.trim() ?? '';
        if (lvl > 0 && max > 0) btn.setAttribute('aria-label', t.level(lbl, lvl, max));
        else btn.removeAttribute('aria-label');
      } else if (action === 'toggle') {
        const klass = btn.getAttribute('data-class') ?? '';
        const key = TOGGLE_KEYS[klass];
        if (!key) continue;
        const val = state[key] as boolean;
        btn.classList.toggle('is-active', val);
        btn.setAttribute('aria-pressed', val ? 'true' : 'false');
      } else if (action === 'overlay') {
        btn.classList.toggle('is-active', state.grayOverlay);
        btn.setAttribute('aria-pressed', state.grayOverlay ? 'true' : 'false');
      } else if (action === 'guide') {
        btn.classList.toggle('is-active', state.readingGuide);
        btn.setAttribute('aria-pressed', state.readingGuide ? 'true' : 'false');
      } else if (action === 'mask') {
        btn.classList.toggle('is-active', state.readingMask);
        btn.setAttribute('aria-pressed', state.readingMask ? 'true' : 'false');
      }
      // Preset buttons don't carry persistent active state — they apply
      // a bundle of flags and let the user adjust afterwards.
    }
  }

  // ─── Click handlers ─────────────────────────────────────────────
  const onOptClick = (e: MouseEvent): void => {
    const btn = e.currentTarget as HTMLButtonElement;
    const action = btn.getAttribute('data-action');
    if (action === 'multi') {
      const prefix = btn.getAttribute('data-prefix') ?? '';
      const key = MULTI_KEYS[prefix];
      const max = MULTI_LEVELS[prefix] ?? 0;
      if (!key) return;
      const lvl = ((state[key] as number) + 1) % (max + 1);
      (state[key] as number) = lvl;
    } else if (action === 'colorblind') {
      state.colorblind = (state.colorblind + 1) % 4;
    } else if (action === 'toggle') {
      const klass = btn.getAttribute('data-class') ?? '';
      const key = TOGGLE_KEYS[klass];
      if (!key) return;
      (state[key] as boolean) = !(state[key] as boolean);
      // Contrast y grayOverlay son mutuamente excluyentes.
      if (klass === 'oks-a11y-contrast' && state.contrast) state.grayOverlay = false;
    } else if (action === 'overlay') {
      state.grayOverlay = !state.grayOverlay;
      if (state.grayOverlay) state.contrast = false;
    } else if (action === 'guide') {
      state.readingGuide = !state.readingGuide;
    } else if (action === 'mask') {
      state.readingMask = !state.readingMask;
    } else if (action === 'preset') {
      const id = btn.getAttribute('data-preset') ?? '';
      const preset = PRESETS[id];
      if (preset) Object.assign(state, preset);
      // Transient click feedback — see styles.ts .oks-preset.is-flashing.
      btn.classList.add('is-flashing');
      setTimeout(() => btn.classList.remove('is-flashing'), 250);
    }
    applyState();
    saveState(storageKey, state);
  };

  const onReset = (): void => {
    state = { ...DEFAULT_STATE };
    applyState();
    saveState(storageKey, state);
  };

  const openPanel = (): void => {
    panel.classList.add('is-open');
    panel.removeAttribute('inert');
    trigger.setAttribute('aria-expanded', 'true');
    const first = panel.querySelector<HTMLElement>('button:not([disabled])');
    first?.focus();
  };
  const closePanel = (): void => {
    panel.classList.remove('is-open');
    // inert (not aria-hidden) while closed: its focusable controls leave the
    // tab order and the accessibility tree, fixing the aria-hidden-focus
    // violation. inert also blurs any focus held inside before we restore it.
    panel.setAttribute('inert', '');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus();
  };
  const onTriggerClick = (e: MouseEvent): void => {
    e.stopPropagation();
    if (panel.classList.contains('is-open')) closePanel();
    else openPanel();
  };

  const onDocClick = (e: MouseEvent): void => {
    if (!panel.classList.contains('is-open')) return;
    // Clicks that originate inside our Shadow DOM are retargeted to the
    // host element when they bubble to `document`, so `panel.contains(t)`
    // returns false even though the user clicked something *inside* the
    // panel. composedPath() preserves the full path across shadow
    // boundaries — use that to detect "click stayed within the widget".
    const path = e.composedPath();
    if (path.includes(panel) || path.includes(trigger) || path.includes(wrapper)) return;
    closePanel();
  };

  const onKeyDown = (e: KeyboardEvent): void => {
    if (!panel.classList.contains('is-open')) return;
    if (e.key === 'Escape') { closePanel(); return; }
    if (e.key !== 'Tab') return;
    // a[href] included: the branding link in the footer is focusable too —
    // buttons alone would make the trap skip it (or leak when it has focus).
    const focusable = Array.from(panel.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]'));
    if (focusable.length === 0) return;
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    const active = root.activeElement as HTMLElement | null;
    if (e.shiftKey) {
      if (active === first) { e.preventDefault(); last.focus(); }
    } else {
      if (active === last) { e.preventDefault(); first.focus(); }
    }
  };

  // ─── Reading guide + mask follow the pointer ────────────────────
  const onMove = (e: MouseEvent | TouchEvent): void => {
    if (!state.readingGuide && !state.readingMask) return;
    const y = (e as TouchEvent).touches?.[0]?.clientY ?? (e as MouseEvent).clientY;
    if (typeof y !== 'number') return;
    if (state.readingGuide) {
      const guide = document.getElementById('oks-reading-guide');
      if (guide) guide.style.top = `${y}px`;
    }
    if (state.readingMask) {
      const mask = document.getElementById('oks-reading-mask');
      if (mask) mask.style.setProperty('--oks-mask-y', `${y}px`);
    }
  };

  // ─── Bind ───────────────────────────────────────────────────────
  trigger.addEventListener('click', onTriggerClick);
  closeBtn.addEventListener('click', closePanel);
  resetBtn.addEventListener('click', onReset);
  for (const btn of opts$) btn.addEventListener('click', onOptClick);
  document.addEventListener('click', onDocClick);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('mousemove', onMove);
  document.addEventListener('touchmove', onMove, { passive: true });

  // Aplicar el estado guardado al cargar.
  applyState();

  return () => {
    trigger.removeEventListener('click', onTriggerClick);
    closeBtn.removeEventListener('click', closePanel);
    resetBtn.removeEventListener('click', onReset);
    for (const btn of opts$) btn.removeEventListener('click', onOptClick);
    document.removeEventListener('click', onDocClick);
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('touchmove', onMove);
  };
}

function ensureOverlay(): HTMLElement {
  let el = document.getElementById('oks-overlay-gray');
  if (!el) {
    el = document.createElement('div');
    el.id = 'oks-overlay-gray';
    el.className = 'oks-overlay-effect';
    document.body.appendChild(el);
  }
  return el;
}
