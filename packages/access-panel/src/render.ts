import type { Translation } from './translations.js';
import {
  ICON_TXT, ICON_LH, ICON_ALIGN, ICON_FONT, ICON_DYSLEXIA, ICON_LS,
  ICON_CONTRAST, ICON_GRAY, ICON_HIDE, ICON_LINK, ICON_COLORBLIND,
  ICON_GUIDE, ICON_CURSOR, ICON_PAUSE, ICON_FOCUS, ICON_CLOSE,
  TRIGGER_ICONS, type TriggerIcon,
} from './icons.js';

export type Position = 'top-left' | 'top-right' | 'mid-left' | 'mid-right' | 'bottom-left' | 'bottom-right';

export interface RenderOptions {
  t: Translation;
  triggerIcon: TriggerIcon;
  position: Position;
}

/**
 * HTML del panel completo (trigger + dialog). Pensado para inyectarse
 * dentro del Shadow DOM del custom element.
 */
export function buildPanelHtml(opts: RenderOptions): string {
  const { t, triggerIcon } = opts;
  const trig = TRIGGER_ICONS[triggerIcon];

  const grid = (rows: string[]): string =>
    `<div class="oks-access-grid">${rows.join('')}</div>`;

  const multi = (action: string, prefix: string, levels: number, label: string, icon: string, full = false): string => {
    const fullClass = full ? ' full-width' : '';
    const dots = Array.from({ length: levels }, () => '<span></span>').join('');
    return `<button class="oks-access-opt multi-step${fullClass}" data-action="${action}" data-prefix="${prefix}" data-levels="${levels}" aria-pressed="false" type="button"><span class="oks-icon">${icon}</span><span class="oks-label">${label}</span><div class="oks-levels">${dots}</div></button>`;
  };
  const toggle = (klass: string, label: string, icon: string): string =>
    `<button class="oks-access-opt" data-action="toggle" data-class="${klass}" aria-pressed="false" type="button"><span class="oks-icon">${icon}</span><span class="oks-label">${label}</span></button>`;
  const overlay = (id: string, label: string, icon: string): string =>
    `<button class="oks-access-opt" data-action="overlay" data-target="${id}" aria-pressed="false" type="button"><span class="oks-icon">${icon}</span><span class="oks-label">${label}</span></button>`;
  const guide = (label: string, icon: string): string =>
    `<button class="oks-access-opt" data-action="guide" aria-pressed="false" type="button"><span class="oks-icon">${icon}</span><span class="oks-label">${label}</span></button>`;

  return `
<div class="oks-access-wrapper" id="oks-wrapper" data-position="${opts.position}">
  <button class="oks-access-btn" id="oks-trigger" aria-label="${escapeAttr(t.title)}" aria-expanded="false" aria-controls="oks-panel" type="button">
    ${trig}
  </button>
  <span class="oks-active-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"/></svg></span>
</div>
<div class="oks-access-panel" id="oks-panel" role="dialog" aria-modal="true" aria-labelledby="oks-panel-title" aria-hidden="true">
  <div class="oks-access-header">
    <h3 id="oks-panel-title">${escapeHtml(t.title)}</h3>
    <button class="oks-access-close" id="oks-close" aria-label="${escapeAttr(t.close)}" type="button">${ICON_CLOSE}</button>
  </div>
  <div class="oks-access-content">
    <h4 class="oks-access-title">${escapeHtml(t.txt)}</h4>
    ${grid([
      multi('multi', 'oks-zoom', 4, t.size, ICON_TXT),
      multi('multi', 'oks-lh', 3, t.lh, ICON_LH),
      multi('multi', 'oks-align', 3, t.align, ICON_ALIGN),
      toggle('oks-a11y-font', t.font, ICON_FONT),
      toggle('oks-dyslexia', t.dyslexia, ICON_DYSLEXIA),
      multi('multi', 'oks-ls', 3, t.ls, ICON_LS),
    ])}
    <h4 class="oks-access-title">${escapeHtml(t.vis)}</h4>
    ${grid([
      toggle('oks-a11y-contrast', t.contrast, ICON_CONTRAST),
      overlay('oks-overlay-gray', t.gray, ICON_GRAY),
      toggle('oks-a11y-hide', t.hide, ICON_HIDE),
      toggle('oks-a11y-links', t.links, ICON_LINK),
      multi('colorblind', 'oks-colorblind', 3, t.cb, ICON_COLORBLIND, true),
    ])}
    <h4 class="oks-access-title">${escapeHtml(t.ori)}</h4>
    ${grid([
      guide(t.guide, ICON_GUIDE),
      toggle('oks-big-cursor', t.cursor, ICON_CURSOR),
      toggle('oks-a11y-pause', t.pause, ICON_PAUSE),
      toggle('oks-a11y-focus', t.focus, ICON_FOCUS),
    ])}
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
    case 'top-left':     return { wrap: 'top: 20px; left: 20px;', panel: 'top: 80px; left: 20px;' };
    case 'top-right':    return { wrap: 'top: 20px; right: 20px;', panel: 'top: 80px; right: 20px;' };
    case 'mid-left':     return { wrap: 'top: 50%; left: 20px; transform: translateY(-50%);', panel: 'top: 50%; left: 90px; transform: translateY(-50%);' };
    case 'mid-right':    return { wrap: 'top: 50%; right: 20px; transform: translateY(-50%);', panel: 'top: 50%; right: 90px; transform: translateY(-50%);' };
    case 'bottom-left':  return { wrap: 'bottom: 20px; left: 20px;', panel: 'bottom: 100px; left: 20px;' };
    case 'bottom-right': return { wrap: 'bottom: 20px; right: 20px;', panel: 'bottom: 100px; right: 20px;' };
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
