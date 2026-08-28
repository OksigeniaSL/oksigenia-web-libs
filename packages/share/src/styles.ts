// CSS del panel de botones. Se inyecta inline en el Shadow DOM
// (cuando se usa el web component) o se importa como `dist/styles.css`
// si se usa el helper imperativo en light DOM.

export const SHARE_CSS = `
:host { display: block; }
.oksigenia-panel {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 30px 0;
  padding: 10px 18px;
  background: rgba(0,0,0,0.03);
  border-radius: 60px;
  width: fit-content;
  flex-wrap: wrap;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
.oksigenia-label {
  font-weight: 800;
  font-size: 11px;
  margin-right: 12px;
  text-transform: uppercase;
  color: currentColor;
  letter-spacing: 1.5px;
}
.oksigenia-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: var(--oks-brand);
  /* Buttons don't inherit color from the page by default (they use a UA system
     colour), which makes currentColor glyphs unpredictable — especially under
     an OS dark theme. Inherit so mono/bare/outline glyphs follow the page's
     own, already-contrasted text colour on any background. */
  color: inherit;
  cursor: pointer;
  transition: transform .2s, filter .2s, box-shadow .2s;
  box-shadow: 0 3px 6px rgba(0,0,0,0.1);
  position: relative;
  text-decoration: none !important;
  padding: 0;
  overflow: visible;
}
.oksigenia-btn:hover {
  transform: translateY(-3px);
  filter: brightness(1.1);
  box-shadow: 0 5px 12px rgba(0,0,0,0.2);
}
.oksigenia-btn:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}
.oksigenia-btn svg {
  width: 22px;
  height: 22px;
  fill: #fff;
  pointer-events: none;
}
.oksigenia-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}
.o-no.copied { background: #00a884 !important; }
.o-no.copied svg { fill: #fff !important; }

/* --- Icon themes (opt-in via theme="…"; default is solid) ---------------
   Same inline glyphs, different treatment. The brand colour arrives as the
   --oks-brand custom property set inline on each button. solid is the base
   rules above; the packs below only override how that colour is applied. */

/* mono: neutral chip, glyph in the site's own text colour; brand on hover. */
.oks-theme-mono .oksigenia-btn {
  background: rgba(127,127,127,0.14);
  box-shadow: none;
}
.oks-theme-mono .oksigenia-btn svg { fill: currentColor; }
.oks-theme-mono .oksigenia-btn:hover,
.oks-theme-mono .oksigenia-btn:focus-visible { background: var(--oks-brand); }
.oks-theme-mono .oksigenia-btn:hover svg,
.oks-theme-mono .oksigenia-btn:focus-visible svg { fill: #fff; }

/* outline: transparent chip, brand-coloured ring + glyph; fills on hover. */
.oks-theme-outline .oksigenia-btn {
  background: transparent;
  border: 2px solid var(--oks-brand);
  box-shadow: none;
}
.oks-theme-outline .oksigenia-btn svg { fill: var(--oks-brand); }
.oks-theme-outline .oksigenia-btn:hover,
.oks-theme-outline .oksigenia-btn:focus-visible { background: var(--oks-brand); }
.oks-theme-outline .oksigenia-btn:hover svg,
.oks-theme-outline .oksigenia-btn:focus-visible svg { fill: #fff; }
/* X and Threads use pure black as their brand colour, which vanishes on a dark
   background. In outline, fall back to the page's text colour so the ring and
   glyph stay visible on any background. */
.oks-theme-outline .o-x,
.oks-theme-outline .o-th { border-color: currentColor; }
.oks-theme-outline .o-x svg,
.oks-theme-outline .o-th svg { fill: currentColor; }

/* bare: no chip, just glyphs in the site's text colour; brand on hover. The
   44px hit area is kept (WCAG 2.5.8) — only the background is removed. */
.oks-theme-bare .oksigenia-btn {
  background: transparent;
  box-shadow: none;
}
.oks-theme-bare .oksigenia-btn svg { fill: currentColor; }
.oks-theme-bare .oksigenia-btn:hover svg,
.oks-theme-bare .oksigenia-btn:focus-visible svg { fill: var(--oks-brand); }
/* X and Threads brand-black would disappear on dark; keep them adaptive. */
.oks-theme-bare .o-x:hover svg, .oks-theme-bare .o-x:focus-visible svg,
.oks-theme-bare .o-th:hover svg, .oks-theme-bare .o-th:focus-visible svg { fill: currentColor; }

@media (min-width: 769px) { .hide-desktop { display: none !important; } }
@media (max-width: 768px) { .hide-mobile { display: none !important; } }
@media (max-width: 480px) {
  .oksigenia-panel { padding: 8px 12px; gap: 8px; justify-content: center; }
  .oksigenia-btn { width: 38px; height: 38px; }
  .oksigenia-btn svg { width: 18px; height: 18px; }
  .oksigenia-label { flex-basis: 100%; width: 100%; margin: 0 0 6px; text-align: center; }
}
@media (prefers-reduced-motion: reduce) {
  .oksigenia-btn { transition: none; }
  .oksigenia-btn:hover { transform: none; }
}
`;
