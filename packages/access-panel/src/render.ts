import type { Translation } from './translations.js';
import {
  ALL_CONTROLS, PRESET_IDS, presetIsAvailable,
  type ControlId, type PresetId,
} from './controls.js';
import {
  ICON_TXT, ICON_LH, ICON_ALIGN, ICON_FONT, ICON_DYSLEXIA, ICON_LS,
  ICON_CONTRAST, ICON_GRAY, ICON_HIDE, ICON_LINK, ICON_COLORBLIND,
  ICON_GUIDE, ICON_MASK, ICON_TARGETS,
  ICON_CURSOR, ICON_PAUSE, ICON_FOCUS, ICON_CLOSE,
  TRIGGER_ICONS, type TriggerIcon,
} from './icons.js';

export type Position =
  | 'top-left' | 'top-center' | 'top-right'
  | 'mid-left' | 'mid-center' | 'mid-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface RenderOptions {
  t: Translation;
  triggerIcon: TriggerIcon;
  position: Position;
  /** Controls offered by this instance. Defaults to all 17. */
  enabled?: Set<ControlId>;
  /** Render the floating trigger button. `false` for host-driven mode
   *  (`trigger="none"`): the panel renders without its launcher and the host
   *  opens it via `.open()`. Defaults to true. */
  showTrigger?: boolean;
  /** Render the profile presets row. `false` (`presets="none"`) drops it
   *  entirely. Defaults to true; individual presets still self-hide under the
   *  ≥2-control rule. */
  showPresets?: boolean;
  /** Flat layout: one grid with screen-reader-only category headings instead of
   *  visible per-category sections. Used in scoped mode, where heavily-curated
   *  panels look sparse with category breaks. Defaults to false (classic). */
  flatLayout?: boolean;
}

const PRESET_ICON: Record<PresetId, string> = {
  lowvision: ICON_CONTRAST,
  dyslexia: ICON_DYSLEXIA,
  motor: ICON_CURSOR,
  calm: ICON_HIDE,
};

/**
 * HTML del panel completo (trigger + dialog). Pensado para inyectarse
 * dentro del Shadow DOM del custom element.
 */
export function buildPanelHtml(opts: RenderOptions): string {
  const { t, triggerIcon } = opts;
  const enabled = opts.enabled ?? new Set(ALL_CONTROLS);
  const showTrigger = opts.showTrigger ?? true;
  const showPresets = opts.showPresets ?? true;
  const flatLayout = opts.flatLayout ?? false;
  const trig = TRIGGER_ICONS[triggerIcon];

  // Each control helper emits its button only when the instance offers it
  // (#1 curation). A control id is stamped as data-control so behavior and
  // tests can resolve it back to the registry.
  const multi = (id: ControlId, prefix: string, levels: number, label: string, icon: string, full = false): string => {
    if (!enabled.has(id)) return '';
    const action = id === 'colorblind' ? 'colorblind' : 'multi';
    const fullClass = full ? ' full-width' : '';
    const dots = Array.from({ length: levels }, () => '<span></span>').join('');
    return `<button class="oks-access-opt multi-step${fullClass}" data-control="${id}" data-action="${action}" data-prefix="${prefix}" data-levels="${levels}" aria-pressed="false" type="button"><span class="oks-icon">${icon}</span><span class="oks-label">${label}</span><div class="oks-levels">${dots}</div></button>`;
  };
  const toggle = (id: ControlId, klass: string, label: string, icon: string): string => {
    if (!enabled.has(id)) return '';
    return `<button class="oks-access-opt" data-control="${id}" data-action="toggle" data-class="${klass}" aria-pressed="false" type="button"><span class="oks-icon">${icon}</span><span class="oks-label">${label}</span></button>`;
  };
  const overlay = (id: ControlId, target: string, label: string, icon: string): string => {
    if (!enabled.has(id)) return '';
    return `<button class="oks-access-opt" data-control="${id}" data-action="overlay" data-target="${target}" aria-pressed="false" type="button"><span class="oks-icon">${icon}</span><span class="oks-label">${label}</span></button>`;
  };
  const simple = (id: ControlId, action: 'guide' | 'mask', label: string, icon: string): string => {
    if (!enabled.has(id)) return '';
    return `<button class="oks-access-opt" data-control="${id}" data-action="${action}" aria-pressed="false" type="button"><span class="oks-icon">${icon}</span><span class="oks-label">${label}</span></button>`;
  };
  const preset = (id: PresetId, label: string): string =>
    `<button class="oks-preset" data-action="preset" data-preset="${id}" type="button"><span class="oks-icon">${PRESET_ICON[id]}</span><span class="oks-label">${label}</span></button>`;

  // A section renders its heading only when it has at least one control —
  // otherwise a curated instance leaves orphan "TEXT" / "VISUAL" titles.
  const section = (title: string, rows: string[]): string => {
    const kept = rows.filter(Boolean);
    if (kept.length === 0) return '';
    return `<h4 class="oks-access-title">${escapeHtml(title)}</h4><div class="oks-access-grid">${kept.join('')}</div>`;
  };

  const presetLabels: Record<PresetId, string> = {
    lowvision: t.pLow, dyslexia: t.pDys, motor: t.pMot, calm: t.pCalm,
  };
  const presetButtons = showPresets
    ? PRESET_IDS.filter((id) => presetIsAvailable(id, enabled)).map((id) => preset(id, presetLabels[id]))
    : [];
  const presetsBlock = presetButtons.length
    ? `<h4 class="oks-access-title">${escapeHtml(t.presets)}</h4><div class="oks-access-presets">${presetButtons.join('')}</div>`
    : '';

  // Atomic control buttons grouped by category. Colour-blind spans full width
  // only in the classic categorised layout; in flat mode the trailing-odd rule
  // (below) fills any gap instead.
  const textBtns = [
    multi('text-size', 'oks-zoom', 4, t.size, ICON_TXT),
    multi('line-height', 'oks-lh', 3, t.lh, ICON_LH),
    multi('text-align', 'oks-align', 3, t.align, ICON_ALIGN),
    toggle('readable-font', 'oks-a11y-font', t.font, ICON_FONT),
    toggle('dyslexia-font', 'oks-dyslexia', t.dyslexia, ICON_DYSLEXIA),
    multi('letter-spacing', 'oks-ls', 3, t.ls, ICON_LS),
  ];
  const visBtns = [
    toggle('contrast', 'oks-a11y-contrast', t.contrast, ICON_CONTRAST),
    overlay('grayscale', 'oks-overlay-gray', t.gray, ICON_GRAY),
    toggle('hide-images', 'oks-a11y-hide', t.hide, ICON_HIDE),
    toggle('highlight-links', 'oks-a11y-links', t.links, ICON_LINK),
    multi('colorblind', 'oks-colorblind', 3, t.cb, ICON_COLORBLIND, !flatLayout),
  ];
  const oriBtns = [
    simple('reading-guide', 'guide', t.guide, ICON_GUIDE),
    simple('reading-mask', 'mask', t.mask, ICON_MASK),
    toggle('big-cursor', 'oks-big-cursor', t.cursor, ICON_CURSOR),
    toggle('big-targets', 'oks-a11y-bigtargets', t.targets, ICON_TARGETS),
    toggle('pause-anim', 'oks-a11y-pause', t.pause, ICON_PAUSE),
    toggle('focus', 'oks-a11y-focus', t.focus, ICON_FOCUS),
  ];

  const addFullWidth = (btn: string): string =>
    btn.replace('class="oks-access-opt', 'class="oks-access-opt full-width');

  // Flat layout (scoped): one grid, screen-reader-only headings, and the
  // trailing button widened when the total is odd so there is no ragged gap.
  const flatContent = (): string => {
    const groups = [
      { title: t.txt, items: textBtns.filter(Boolean) },
      { title: t.vis, items: visBtns.filter(Boolean) },
      { title: t.ori, items: oriBtns.filter(Boolean) },
    ].filter((g) => g.items.length > 0);
    const total = groups.reduce((n, g) => n + g.items.length, 0);
    if (total % 2 === 1 && groups.length > 0) {
      const last = groups[groups.length - 1]!;
      last.items[last.items.length - 1] = addFullWidth(last.items[last.items.length - 1]!);
    }
    const inner = groups
      .map((g) => `<h4 class="oks-access-title oks-sr-only">${escapeHtml(g.title)}</h4>${g.items.join('')}`)
      .join('');
    return `<div class="oks-access-grid oks-flat">${inner}</div>`;
  };

  const controlsHtml = flatLayout
    ? flatContent()
    : section(t.txt, textBtns) + section(t.vis, visBtns) + section(t.ori, oriBtns);

  const triggerBlock = showTrigger ? `
<div class="oks-access-wrapper" id="oks-wrapper" data-position="${opts.position}">
  <button class="oks-access-btn" id="oks-trigger" part="trigger" data-trigger-icon="${triggerIcon}" aria-label="${escapeAttr(t.title)}" aria-expanded="false" aria-controls="oks-panel" type="button">
    ${trig}
  </button>
  <span class="oks-active-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"/></svg></span>
</div>` : '';

  return `${triggerBlock}
<div class="oks-access-panel" id="oks-panel" role="dialog" aria-modal="true" aria-labelledby="oks-panel-title" inert>
  <div class="oks-access-header">
    <h3 id="oks-panel-title">${escapeHtml(t.title)}</h3>
    <button class="oks-access-close" id="oks-close" aria-label="${escapeAttr(t.close)}" type="button">${ICON_CLOSE}</button>
  </div>
  <div class="oks-access-content">
    ${presetsBlock}
    ${controlsHtml}
  </div>
  <div class="oks-access-footer">
    <button class="oks-access-reset" id="oks-reset" type="button">${escapeHtml(t.reset)}</button>
    <div class="oks-access-branding">${escapeHtml(t.dev)} <a href="https://oksigenia.com" target="_blank" rel="noopener noreferrer">Oksigenia</a></div>
  </div>
</div>
`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
  }[c] ?? c));
}
function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, '&#39;');
}

interface PositionRules {
  wrap: string;
  panel: string;
}

function positionRules(position: Position): PositionRules {
  switch (position) {
    case 'top-left':      return { wrap: 'top: 20px; left: 20px;', panel: 'top: 80px; left: 20px;' };
    case 'top-center':    return { wrap: 'top: 20px; left: 50%; transform: translateX(-50%);', panel: 'top: 80px; left: 50%; transform: translateX(-50%);' };
    case 'top-right':     return { wrap: 'top: 20px; right: 20px;', panel: 'top: 80px; right: 20px;' };
    case 'mid-left':      return { wrap: 'top: 50%; left: 20px; transform: translateY(-50%);', panel: 'top: 50%; left: 90px; transform: translateY(-50%);' };
    case 'mid-center':    return { wrap: 'top: 50%; left: 50%; transform: translate(-50%, -50%);', panel: 'top: 50%; left: 50%; transform: translate(-50%, -50%);' };
    case 'mid-right':     return { wrap: 'top: 50%; right: 20px; transform: translateY(-50%);', panel: 'top: 50%; right: 90px; transform: translateY(-50%);' };
    case 'bottom-left':   return { wrap: 'bottom: 20px; left: 20px;', panel: 'bottom: 100px; left: 20px;' };
    case 'bottom-center': return { wrap: 'bottom: 20px; left: 50%; transform: translateX(-50%);', panel: 'bottom: 100px; left: 50%; transform: translateX(-50%);' };
    case 'bottom-right':  return { wrap: 'bottom: 20px; right: 20px;', panel: 'bottom: 100px; right: 20px;' };
  }
}

/** Mapea Position a CSS para wrapper y panel. Inyectado en el Shadow DOM.
 *  `mobile` opcional aplica una posición distinta del wrapper en viewport ≤768px. */
export function positionCss(position: Position, mobile?: Position): string {
  const d = positionRules(position);
  // El wrapper (trigger) se posiciona siempre con la regla desktop.
  // El panel solo recibe estas reglas en desktop: en móvil PANEL_CSS lo pone
  // fullscreen y este override sobrescribiría top/left/transform dejándolo
  // desplazado fuera del viewport.
  let css = `.oks-access-wrapper { ${d.wrap} }`;
  css += `@media (min-width: 769px) { .oks-access-panel { ${d.panel} } }`;
  if (mobile && mobile !== position) {
    const m = positionRules(mobile);
    css += `@media (max-width: 768px) { .oks-access-wrapper { top: auto; right: auto; bottom: auto; left: auto; transform: none; ${m.wrap} } }`;
  }
  return css;
}
