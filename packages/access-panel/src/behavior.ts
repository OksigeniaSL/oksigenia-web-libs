import { type PanelState, loadState, saveState, DEFAULT_STATE, isStateEmpty } from './state.js';
import { getTranslation } from './translations.js';
import {
  ALL_CONTROLS, PRESETS, filterPresetForEnabled, type ControlId, type PresetId,
} from './controls.js';

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

export interface BehaviorOptions {
  /** Llave localStorage. Default oksiacSettings. */
  storageKey?: string;
  /** Locale para los aria-label dinámicos (nivel de los multinivel). Default en. */
  locale?: string;
  /** Controles que ofrece esta instancia (#1). Default: los 17. Filtra qué
   *  flags puede aplicar un perfil. */
  enabled?: Set<ControlId>;
  /** Desplazamiento máximo del usuario para el trigger en px (#5). 0/ausente
   *  desactiva el nudge (comportamiento actual). */
  nudgeMax?: number;
  /** Contenedor al que confinar los efectos (`scope=`). Si se pasa, las clases
   *  scopables van a este elemento en vez de a `body`, y los efectos no
   *  regionalizables (overlays, daltonismo, cursor) no se aplican. */
  scopeEl?: HTMLElement | null;
}

/** Dispose function with imperative open/close/toggle attached (#2). Calling
 *  the value disposes; the methods drive the panel host-side. */
export interface PanelController {
  (): void;
  open(): void;
  close(): void;
  toggle(): void;
}

function noopController(): PanelController {
  return Object.assign(() => {}, { open() {}, close() {}, toggle() {} });
}

/** Deepest focused element, crossing shadow boundaries — so we can restore
 *  focus to whatever opened the panel (the host's own button in trigger="none"
 *  mode, the floating trigger otherwise). */
function deepActiveElement(): HTMLElement | null {
  let a = document.activeElement as HTMLElement | null;
  while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement as HTMLElement;
  return a;
}

/**
 * Engancha toda la lógica al panel ya renderizado dentro de `root`
 * (que es el shadowRoot del custom element). Devuelve un PanelController:
 * invocarlo limpia; sus métodos abren/cierran el panel.
 */
export function bindPanelBehavior(root: ShadowRoot, opts: BehaviorOptions = {}): PanelController {
  const storageKey = opts.storageKey ?? 'oksiacSettings';
  const t = getTranslation(opts.locale ?? 'en');
  const enabled = opts.enabled ?? new Set(ALL_CONTROLS);
  const nudgeMax = Math.max(0, opts.nudgeMax ?? 0);

  const trigger = root.getElementById('oks-trigger') as HTMLButtonElement | null;
  const panel = root.getElementById('oks-panel') as HTMLDivElement | null;
  const closeBtn = root.getElementById('oks-close') as HTMLButtonElement | null;
  const resetBtn = root.getElementById('oks-reset') as HTMLButtonElement | null;
  const wrapper = root.getElementById('oks-wrapper') as HTMLDivElement | null;
  const opts$ = Array.from(root.querySelectorAll<HTMLButtonElement>('.oks-access-opt, .oks-preset'));

  // trigger + wrapper are optional (trigger="none" host-driven mode); the
  // panel itself and its close/reset are required.
  if (!panel || !closeBtn || !resetBtn) {
    return noopController();
  }

  let state: PanelState = loadState(storageKey);

  // `scopeEl === undefined` → global mode (apply to body). Defined → scoped.
  const scoped = opts.scopeEl !== undefined;

  // ─── Global-offerable controls in scoped mode ───────────────────
  // big cursor + reading guide/mask can't be confined to a container, but they
  // are benign window-level aids, so a scoped panel still offers them and
  // applies them GLOBALLY (to body) with a single shared state across every
  // instance/window — persisted under a fixed key (not the per-pane
  // storage-key). Toggle from any pane → whole window + every pane's button
  // reflects it. Synced same-document via a custom event and cross-window via
  // the `storage` event.
  const GLOBAL_KEY = 'oksiac::global';
  type GlobalState = { bigCursor: boolean; readingGuide: boolean; readingMask: boolean };
  const GLOBAL_MAP: Array<{ flag: keyof GlobalState; cls: string; match: (b: HTMLButtonElement) => boolean }> = [
    { flag: 'bigCursor', cls: 'oks-big-cursor', match: (b) => b.getAttribute('data-class') === 'oks-big-cursor' },
    { flag: 'readingGuide', cls: 'oks-a11y-guide', match: (b) => b.getAttribute('data-action') === 'guide' },
    { flag: 'readingMask', cls: 'oks-a11y-mask', match: (b) => b.getAttribute('data-action') === 'mask' },
  ];
  const globalOfferableOf = (b: HTMLButtonElement) => GLOBAL_MAP.find((x) => x.match(b));
  const loadGlobal = (): GlobalState => {
    try {
      const r = JSON.parse(localStorage.getItem(GLOBAL_KEY) ?? '{}') as Partial<GlobalState>;
      return { bigCursor: !!r.bigCursor, readingGuide: !!r.readingGuide, readingMask: !!r.readingMask };
    } catch { return { bigCursor: false, readingGuide: false, readingMask: false }; }
  };
  const saveGlobal = (g: GlobalState): void => {
    try {
      if (g.bigCursor || g.readingGuide || g.readingMask) localStorage.setItem(GLOBAL_KEY, JSON.stringify(g));
      else localStorage.removeItem(GLOBAL_KEY);
    } catch { /* fail silent */ }
  };
  const applyGlobal = (g: GlobalState): void => {
    document.body.classList.toggle('oks-big-cursor', g.bigCursor);
    document.body.classList.toggle('oks-a11y-guide', g.readingGuide);
    document.body.classList.toggle('oks-a11y-mask', g.readingMask);
    for (const btn of opts$) {
      const m = globalOfferableOf(btn);
      if (!m) continue;
      btn.classList.toggle('is-active', g[m.flag]);
      btn.setAttribute('aria-pressed', g[m.flag] ? 'true' : 'false');
    }
  };
  const refreshGlobal = (): void => { if (scoped) applyGlobal(loadGlobal()); };
  // A preset applied in scoped mode may set global-offerable flags on `state`;
  // route them to the shared global state instead of the per-pane state.
  const syncGlobalFromState = (): void => {
    if (!scoped) return;
    const g = loadGlobal();
    let changed = false;
    if (state.bigCursor) { g.bigCursor = true; state.bigCursor = false; changed = true; }
    if (state.readingGuide) { g.readingGuide = true; state.readingGuide = false; changed = true; }
    if (state.readingMask) { g.readingMask = true; state.readingMask = false; changed = true; }
    if (changed) { saveGlobal(g); applyGlobal(g); document.dispatchEvent(new CustomEvent('oksiac:globalchange')); }
  };

  // ─── Render-from-state ──────────────────────────────────────────
  function applyState(): void {
    const fxRoot: HTMLElement | null = scoped ? (opts.scopeEl ?? null) : document.body;
    const rootEl = document.documentElement;
    if (fxRoot) {
      for (const cls of Array.from(fxRoot.classList)) {
        if (cls.startsWith('oks-')) fxRoot.classList.remove(cls);
      }
    }
    if (!scoped) [1, 2, 3].forEach((l) => rootEl.classList.remove(`oks-colorblind-${l}`));

    if (fxRoot) {
      if (state.zoom > 0) fxRoot.classList.add(`oks-zoom-${state.zoom}`);
      if (state.lh > 0) fxRoot.classList.add(`oks-lh-${state.lh}`);
      if (state.align > 0) fxRoot.classList.add(`oks-align-${state.align}`);
      if (state.ls > 0) fxRoot.classList.add(`oks-ls-${state.ls}`);
      if (state.font) fxRoot.classList.add('oks-a11y-font');
      if (state.dyslexia) fxRoot.classList.add('oks-dyslexia');
      if (state.contrast) fxRoot.classList.add('oks-a11y-contrast');
      if (state.hideImages) fxRoot.classList.add('oks-a11y-hide');
      if (state.highlightLinks) fxRoot.classList.add('oks-a11y-links');
      if (state.pauseAnim) fxRoot.classList.add('oks-a11y-pause');
      if (state.focusOutline) fxRoot.classList.add('oks-a11y-focus');
      if (state.bigTargets) fxRoot.classList.add('oks-a11y-bigtargets');
    }

    // Non-scopable effects apply only in global mode (auto-excluded when scoped).
    if (!scoped) {
      if (state.colorblind > 0) rootEl.classList.add(`oks-colorblind-${state.colorblind}`);
      if (state.bigCursor) document.body.classList.add('oks-big-cursor');
      if (state.readingGuide) document.body.classList.add('oks-a11y-guide');
      if (state.readingMask) document.body.classList.add('oks-a11y-mask');
      ensureOverlay().classList.toggle('is-active', state.grayOverlay);
    }

    syncButtonsFromState();
    wrapper?.classList.toggle('has-active', !isStateEmpty(state));
  }

  function syncButtonsFromState(): void {
    for (const btn of opts$) {
      // Global-offerable buttons (scoped mode) are driven by applyGlobal, not
      // by the per-pane state — leave them alone here.
      if (scoped && globalOfferableOf(btn)) continue;
      const action = btn.getAttribute('data-action');
      if (action === 'multi' || action === 'colorblind') {
        const prefix = btn.getAttribute('data-prefix') ?? '';
        const key = MULTI_KEYS[prefix];
        if (!key) continue;
        const lvl = state[key] as number;
        btn.setAttribute('data-level', String(lvl));
        btn.classList.toggle('is-active', lvl > 0);
        btn.setAttribute('aria-pressed', lvl > 0 ? 'true' : 'false');
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
    }
  }

  // ─── Click handlers ─────────────────────────────────────────────
  const onOptClick = (e: MouseEvent): void => {
    const btn = e.currentTarget as HTMLButtonElement;
    // Global-offerable controls in scoped mode toggle the shared window state,
    // apply globally, and broadcast — not the per-pane state.
    if (scoped) {
      const go = globalOfferableOf(btn);
      if (go) {
        const g = loadGlobal();
        g[go.flag] = !g[go.flag];
        saveGlobal(g);
        applyGlobal(g);
        document.dispatchEvent(new CustomEvent('oksiac:globalchange'));
        return;
      }
    }
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
      if (klass === 'oks-a11y-contrast' && state.contrast) state.grayOverlay = false;
    } else if (action === 'overlay') {
      state.grayOverlay = !state.grayOverlay;
      if (state.grayOverlay) state.contrast = false;
    } else if (action === 'guide') {
      state.readingGuide = !state.readingGuide;
    } else if (action === 'mask') {
      state.readingMask = !state.readingMask;
    } else if (action === 'preset') {
      const id = btn.getAttribute('data-preset') as PresetId | null;
      // Recompose the preset to the controls this instance still offers (#1):
      // a profile never sets a flag the user can't see or undo here.
      if (id && PRESETS[id]) Object.assign(state, filterPresetForEnabled(id, enabled));
      btn.classList.add('is-flashing');
      setTimeout(() => btn.classList.remove('is-flashing'), 250);
      syncGlobalFromState(); // route any global-offerable flags to window state
    }
    applyState();
    saveState(storageKey, state);
  };

  const onReset = (): void => {
    state = { ...DEFAULT_STATE };
    applyState();
    saveState(storageKey, state);
    // The global-offerable controls (big cursor, reading guide/mask) live in the
    // shared window state, not this pane's — clear them too and tell every pane.
    if (scoped) {
      const cleared: GlobalState = { bigCursor: false, readingGuide: false, readingMask: false };
      saveGlobal(cleared);
      applyGlobal(cleared);
      document.dispatchEvent(new CustomEvent('oksiac:globalchange'));
    }
  };

  // ─── Open / close (also exposed imperatively, #2) ───────────────
  let opener: HTMLElement | null = null;
  // When the host opens us from its own button (trigger="none"), that click
  // keeps bubbling to document, where onDocClick would treat it as an
  // outside-click and close us in the same gesture. Ignore the doc-click for
  // the current event-loop turn after opening.
  let ignoreDocClose = false;

  // In scoped mode the dialog anchors to its container (over the pane's top),
  // not to a shared viewport corner — otherwise several scoped panels open in
  // the same spot and read as one. Computed from the scope's box on open and
  // kept in place while open (scroll/resize).
  const positionScopedDialog = (): void => {
    const el = opts.scopeEl;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return; // not laid out yet
    const pad = 8;
    panel.style.top = `${Math.max(pad, r.top + pad)}px`;
    panel.style.bottom = 'auto';
    panel.style.left = `${r.left + r.width / 2}px`;
    panel.style.right = 'auto';
    panel.style.transform = 'translateX(-50%)';
  };

  const openPanel = (): void => {
    if (panel.classList.contains('is-open')) return;
    opener = deepActiveElement();
    panel.classList.add('is-open');
    panel.removeAttribute('inert');
    if (opts.scopeEl) positionScopedDialog();
    trigger?.setAttribute('aria-expanded', 'true');
    ignoreDocClose = true;
    setTimeout(() => { ignoreDocClose = false; }, 0);
    const first = panel.querySelector<HTMLElement>('button:not([disabled])');
    first?.focus();
  };
  const closePanel = (): void => {
    if (!panel.classList.contains('is-open')) return;
    panel.classList.remove('is-open');
    panel.setAttribute('inert', '');
    trigger?.setAttribute('aria-expanded', 'false');
    // Restore focus to the trigger, or to whatever opened us host-side.
    if (trigger) trigger.focus();
    else if (opener?.isConnected) opener.focus();
    opener = null;
  };
  const togglePanel = (): void => {
    if (panel.classList.contains('is-open')) closePanel();
    else openPanel();
  };

  let suppressClick = false;
  const onTriggerClick = (e: MouseEvent): void => {
    e.stopPropagation();
    // A click that ended a drag must not also open the panel.
    if (suppressClick) { suppressClick = false; return; }
    togglePanel();
  };

  const onDocClick = (e: MouseEvent): void => {
    if (!panel.classList.contains('is-open')) return;
    if (ignoreDocClose) return;
    const path = e.composedPath();
    if (path.includes(panel)) return;
    if (trigger && path.includes(trigger)) return;
    if (wrapper && path.includes(wrapper)) return;
    closePanel();
  };

  const onKeyDown = (e: KeyboardEvent): void => {
    if (!panel.classList.contains('is-open')) return;
    if (e.key === 'Escape') { closePanel(); return; }
    if (e.key !== 'Tab') return;
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

  // ─── Bounded nudge: user repositions the trigger within limits (#5) ──
  // An accessibility feature in itself — a user with a reduced visual field,
  // a screen magnifier, or left-handed reach can move the launcher out of
  // their way. Bounded so it can never be lost off-screen or buried.
  const NUDGE_KEY = `${storageKey}::pos`;
  const clampMax = (v: number): number => Math.max(-nudgeMax, Math.min(nudgeMax, v));
  let nudge = { x: 0, y: 0 };

  const loadNudge = (): void => {
    if (nudgeMax <= 0) return;
    try {
      const raw = localStorage.getItem(NUDGE_KEY);
      if (!raw) return;
      const p = JSON.parse(raw) as { x?: unknown; y?: unknown };
      if (typeof p?.x === 'number' && typeof p?.y === 'number') {
        nudge = { x: clampMax(p.x), y: clampMax(p.y) };
      }
    } catch { /* localStorage blocked / corrupt — ignore */ }
  };
  const saveNudge = (): void => {
    try {
      if (nudge.x === 0 && nudge.y === 0) localStorage.removeItem(NUDGE_KEY);
      else localStorage.setItem(NUDGE_KEY, JSON.stringify(nudge));
    } catch { /* fail silent */ }
  };
  const applyNudge = (): void => {
    // The `translate` property composes with the anchor's `transform`
    // (translateY(-50%) etc.) instead of overwriting it.
    if (wrapper) wrapper.style.translate = `${nudge.x}px ${nudge.y}px`;
  };
  // Clamp a tentative offset to ±max AND to the viewport, so the button never
  // leaves the screen regardless of anchor.
  const clampOffset = (x: number, y: number): { x: number; y: number } => {
    x = clampMax(x); y = clampMax(y);
    if (wrapper) {
      const r = wrapper.getBoundingClientRect();
      const pad = 4;
      const baseLeft = r.left - nudge.x;
      const baseTop = r.top - nudge.y;
      const vw = window.innerWidth || 0;
      const vh = window.innerHeight || 0;
      if (r.width > 0 && vw > 0) x = Math.max(pad - baseLeft, Math.min(vw - pad - r.width - baseLeft, x));
      if (r.height > 0 && vh > 0) y = Math.max(pad - baseTop, Math.min(vh - pad - r.height - baseTop, y));
    }
    return { x, y };
  };

  let dragStart: { px: number; py: number; ox: number; oy: number } | null = null;
  let didDrag = false;
  const DRAG_THRESHOLD = 4;
  const onPointerDown = (e: PointerEvent): void => {
    if (nudgeMax <= 0 || e.button !== 0) return;
    dragStart = { px: e.clientX, py: e.clientY, ox: nudge.x, oy: nudge.y };
    didDrag = false;
    trigger?.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent): void => {
    if (!dragStart) return;
    const dx = e.clientX - dragStart.px;
    const dy = e.clientY - dragStart.py;
    if (!didDrag && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    didDrag = true;
    nudge = clampOffset(dragStart.ox + dx, dragStart.oy + dy);
    applyNudge();
    e.preventDefault();
  };
  const onPointerUp = (): void => {
    if (!dragStart) return;
    dragStart = null;
    if (didDrag) { saveNudge(); suppressClick = true; }
  };
  // Keyboard nudge — the accessible counterpart to drag (never drag-only on an
  // a11y control). Arrows move while the trigger is focused; Shift = fine step.
  const onTriggerKey = (e: KeyboardEvent): void => {
    if (nudgeMax <= 0) return;
    const step = e.shiftKey ? 1 : 10;
    let dx = 0; let dy = 0;
    if (e.key === 'ArrowLeft') dx = -step;
    else if (e.key === 'ArrowRight') dx = step;
    else if (e.key === 'ArrowUp') dy = -step;
    else if (e.key === 'ArrowDown') dy = step;
    else return;
    e.preventDefault();
    nudge = clampOffset(nudge.x + dx, nudge.y + dy);
    applyNudge();
    saveNudge();
  };

  // ─── Reading guide + mask follow the pointer ────────────────────
  const onMove = (e: MouseEvent | TouchEvent): void => {
    // Read the body classes (not local state) so guide/mask follow the cursor
    // whether they were set per-instance (global mode) or window-wide (scoped).
    const guideOn = document.body.classList.contains('oks-a11y-guide');
    const maskOn = document.body.classList.contains('oks-a11y-mask');
    if (!guideOn && !maskOn) return;
    const y = (e as TouchEvent).touches?.[0]?.clientY ?? (e as MouseEvent).clientY;
    if (typeof y !== 'number') return;
    if (guideOn) {
      const guide = document.getElementById('oks-reading-guide');
      if (guide) guide.style.top = `${y}px`;
    }
    if (maskOn) {
      const mask = document.getElementById('oks-reading-mask');
      if (mask) mask.style.setProperty('--oks-mask-y', `${y}px`);
    }
  };

  // ─── Bind ───────────────────────────────────────────────────────
  trigger?.addEventListener('click', onTriggerClick);
  closeBtn.addEventListener('click', closePanel);
  resetBtn.addEventListener('click', onReset);
  for (const btn of opts$) btn.addEventListener('click', onOptClick);
  document.addEventListener('click', onDocClick);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('mousemove', onMove);
  document.addEventListener('touchmove', onMove, { passive: true });

  // Keep the scoped dialog anchored to its pane while open.
  const onReposition = (): void => {
    if (opts.scopeEl && panel.classList.contains('is-open')) positionScopedDialog();
  };
  // Sync the window-level global-offerable controls: same-document via our
  // custom event, cross-window/detached via the localStorage `storage` event.
  const onGlobalChange = (): void => refreshGlobal();
  const onStorage = (e: StorageEvent): void => { if (e.key === GLOBAL_KEY) refreshGlobal(); };
  if (scoped) {
    window.addEventListener('scroll', onReposition, true);
    window.addEventListener('resize', onReposition);
    document.addEventListener('oksiac:globalchange', onGlobalChange);
    window.addEventListener('storage', onStorage);
  }

  if (nudgeMax > 0 && trigger) {
    loadNudge();
    applyNudge();
    // Affordance + let the drag own the gesture instead of the page scrolling.
    trigger.style.cursor = 'grab';
    trigger.style.touchAction = 'none';
    trigger.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    trigger.addEventListener('keydown', onTriggerKey);
  }

  // Aplicar el estado guardado al cargar.
  applyState();
  refreshGlobal(); // pick up the shared window-level controls (scoped only)

  const dispose = (): void => {
    trigger?.removeEventListener('click', onTriggerClick);
    closeBtn.removeEventListener('click', closePanel);
    resetBtn.removeEventListener('click', onReset);
    for (const btn of opts$) btn.removeEventListener('click', onOptClick);
    document.removeEventListener('click', onDocClick);
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('touchmove', onMove);
    if (scoped) {
      window.removeEventListener('scroll', onReposition, true);
      window.removeEventListener('resize', onReposition);
      document.removeEventListener('oksiac:globalchange', onGlobalChange);
      window.removeEventListener('storage', onStorage);
    }
    trigger?.removeEventListener('pointerdown', onPointerDown);
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    trigger?.removeEventListener('keydown', onTriggerKey);
  };

  return Object.assign(dispose, { open: openPanel, close: closePanel, toggle: togglePanel });
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
