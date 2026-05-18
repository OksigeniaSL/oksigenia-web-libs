// CSS heredado del plugin WP oksigenia-access v16.9.
// Separado en dos bloques:
//   · PANEL_CSS — estilos del panel + botón trigger. Van al Shadow DOM
//     del custom element, no contaminan el host site.
//   · EFFECT_CSS — estilos de las clases que afectan al `body`/`html`
//     (zoom, contraste, dyslexia, etc.). Inyectados en `document.head`
//     porque tienen que cruzar el boundary del Shadow DOM.

export const PANEL_CSS = `
:host {
  --oks-btn-size: 55px;
  --oks-bg: #000;
  --oks-icon: #fff;
  --oks-h-bg: #fff;
  --oks-h-icon: #000;
  --oks-z: 9999999;
}
.oks-access-wrapper {
  position: fixed;
  z-index: var(--oks-z);
  line-height: 1;
}
.oks-access-btn {
  width: var(--oks-btn-size);
  height: var(--oks-btn-size);
  border-radius: 50%;
  background: var(--oks-bg);
  color: var(--oks-icon);
  border: 2px solid #fff;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
  padding: 0;
}
.oks-access-btn:hover {
  background: var(--oks-h-bg);
  color: var(--oks-h-icon);
  transform: scale(1.1);
}
.oks-access-btn svg {
  fill: currentColor;
  display: block;
  margin: 0 auto;
  width: 60%;
  height: 60%;
}
.oks-active-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 20px;
  height: 20px;
  background: #25D366;
  border-radius: 50%;
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  pointer-events: none;
}
.oks-active-badge svg { width: 12px; height: 12px; }
.oks-access-wrapper.has-active .oks-active-badge { opacity: 1; }

.oks-access-panel {
  position: fixed;
  width: 340px;
  max-height: 90vh;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  z-index: var(--oks-z);
  display: flex;
  flex-direction: column;
  opacity: 0;
  pointer-events: none;
  transition: 0.2s;
  border: 1px solid rgba(0,0,0,0.1);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  color: #333;
}
.oks-access-panel.is-open { opacity: 1; pointer-events: all; }
.oks-access-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.oks-access-header h3 { margin: 0; font-size: 18px; color: #000; }
.oks-access-close {
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
  padding: 0;
}
.oks-access-close:hover { background: #e0e0e0; border-color: #ccc; }
.oks-access-close svg { width: 24px; height: 24px; stroke-width: 2.5px; }
.oks-access-content { padding: 0 20px 20px; overflow-y: auto; }
.oks-access-title {
  margin: 10px 0 5px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: #888;
}
.oks-access-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.oks-access-opt {
  background: #f9f9f9;
  border: 2px solid #eee;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  min-height: 70px;
  color: #333;
  transition: 0.2s;
  font: inherit;
}
.oks-access-opt.full-width { grid-column: span 2; }
.oks-access-opt.is-active {
  border-color: #000;
  background: #fff;
  box-shadow: 0 0 0 1px #000;
}
.oks-access-opt:hover { background: #000; color: #fff; border-color: #000; }
.oks-icon { font-size: 28px; margin-bottom: 3px; display: block; line-height: 1; }
.oks-icon svg { width: 24px; height: 24px; fill: currentColor; }
.oks-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  text-align: center;
  line-height: 1.2;
}
.oks-levels { display: flex; gap: 3px; height: 5px; width: 50%; margin-top: 5px; }
.oks-levels span { flex: 1; background: #ddd; border-radius: 3px; }
.oks-access-opt[data-level="1"] .oks-levels span:nth-child(1),
.oks-access-opt[data-level="2"] .oks-levels span:nth-child(-n+2),
.oks-access-opt[data-level="3"] .oks-levels span:nth-child(-n+3),
.oks-access-opt[data-level="4"] .oks-levels span:nth-child(-n+4) { background: #000; }
.oks-access-opt:hover .oks-levels span { background: #555; }
.oks-access-footer {
  padding: 12px 20px;
  border-top: 1px solid #eee;
  text-align: center;
}
.oks-access-reset {
  width: 100%;
  padding: 8px;
  border: 2px solid #000;
  color: #000;
  background: transparent;
  font-weight: 700;
  cursor: pointer;
  border-radius: 6px;
  font-size: 12px;
}
.oks-access-reset:hover { background: #000; color: #fff; }
.oks-access-branding { margin-top: 12px; font-size: 12px; color: #000; font-weight: 700; }
.oks-access-branding a { color: #000; text-decoration: none; border-bottom: 1px dotted #000; }

@media (max-width: 768px) {
  .oks-access-panel {
    width: 100%; height: 100%; max-height: 100%;
    top: 0; left: 0; right: 0; bottom: 0;
    border-radius: 0;
  }
  .oks-access-opt { min-height: 88px; padding: 14px 8px; }
  .oks-icon svg { width: 30px; height: 30px; }
  .oks-label { font-size: 12px; line-height: 1.3; }
  .oks-access-grid { gap: 10px; }
  .oks-access-content { padding: 0 16px 24px; }
  .oks-access-title { font-size: 12px; margin: 14px 0 6px; }
  .oks-access-reset { padding: 14px; font-size: 14px; }
}
`;

// Estilos globales aplicados al document. NO van al Shadow DOM porque
// tienen que afectar al body del host site.
export const EFFECT_CSS = `
html.oks-colorblind-1 { filter: url('#oks-filter-protanopia'); }
html.oks-colorblind-2 { filter: url('#oks-filter-deuteranopia'); }
html.oks-colorblind-3 { filter: url('#oks-filter-tritanopia'); }

body.oks-zoom-1 *:not(header):not(header *):not(nav):not(nav *) { font-size: 1.05em !important; }
body.oks-zoom-2 *:not(header):not(header *):not(nav):not(nav *) { font-size: 1.10em !important; }
body.oks-zoom-3 *:not(header):not(header *):not(nav):not(nav *) { font-size: 1.15em !important; }
body.oks-zoom-4 *:not(header):not(header *):not(nav):not(nav *) { font-size: 1.20em !important; }

body.oks-lh-1 * { line-height: 1.6 !important; }
body.oks-lh-2 * { line-height: 1.9 !important; }
body.oks-lh-3 * { line-height: 2.2 !important; }

body.oks-a11y-font { font-family: Arial, sans-serif !important; }

body.oks-dyslexia * {
  font-family: 'Comic Sans MS', 'Verdana', sans-serif !important;
  letter-spacing: 0.05em !important;
  word-spacing: 0.1em !important;
  line-height: 1.6 !important;
}

body.oks-a11y-hide img { opacity: 0 !important; visibility: hidden !important; }
body.oks-a11y-links a { text-decoration: underline !important; background: #ff0 !important; color: #000 !important; }

body.oks-align-1 * { text-align: left !important; }
body.oks-align-2 * { text-align: center !important; }
body.oks-align-3 * { text-align: right !important; }

body.oks-a11y-pause * { animation: none !important; transition: none !important; }

body.oks-ls-1 * { letter-spacing: 0.05em !important; }
body.oks-ls-2 * { letter-spacing: 0.10em !important; }
body.oks-ls-3 * { letter-spacing: 0.16em !important; }

body.oks-a11y-focus a:not(oksigenia-access-panel):not(oksigenia-access-panel *),
body.oks-a11y-focus button:not(oksigenia-access-panel):not(oksigenia-access-panel *),
body.oks-a11y-focus input,
body.oks-a11y-focus select,
body.oks-a11y-focus textarea {
  outline: 2px dashed rgba(0, 95, 204, 0.45) !important;
  outline-offset: 2px !important;
}
body.oks-a11y-focus *:focus-visible {
  outline: 3px solid #005fcc !important;
  outline-offset: 3px !important;
  box-shadow: 0 0 0 6px rgba(0, 95, 204, 0.25) !important;
}

body.oks-a11y-contrast.oks-a11y-focus *:focus,
body.oks-a11y-contrast.oks-a11y-focus *:focus-visible {
  outline-color: #0ff !important;
  box-shadow: 0 0 0 6px rgba(0, 255, 255, 0.3) !important;
}

@media (pointer: fine) {
  body.oks-big-cursor, body.oks-big-cursor a, body.oks-big-cursor button {
    cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'%3E%3Cpath d='M4 2L4 18L8 14L11 21L14 19.5L11 13L15.5 13Z' stroke='white' stroke-width='4' stroke-linejoin='round' fill='white'/%3E%3Cpath d='M4 2L4 18L8 14L11 21L14 19.5L11 13L15.5 13Z' fill='black'/%3E%3C/svg%3E") 8 4, auto !important;
  }
}

body.oks-a11y-contrast,
body.oks-a11y-contrast *:not(oksigenia-access-panel):not(oksigenia-access-panel *) {
  background-color: #000 !important;
  color: #ff0 !important;
  border-color: #ff0 !important;
  text-shadow: none !important;
  box-shadow: none !important;
}
body.oks-a11y-contrast img { filter: grayscale(100%) contrast(120%) !important; }
body.oks-a11y-contrast a:not(oksigenia-access-panel *) { color: #0ff !important; text-decoration: underline !important; }

/* High-contrast applies background:#000 to every descendant of body to flip
   the page to inverted colours. That selector also catches our own overlays
   (.oks-reading-guide, .oks-overlay-effect), which would then paint a solid
   black band on top of the text and defeat their purpose. Restore the
   overlay-specific values here so they keep working in high-contrast mode. */
body.oks-a11y-contrast .oks-reading-guide {
  background-color: rgba(255, 255, 0, 0.25) !important;
  border-top-color: #ff0 !important;
  border-bottom-color: #ff0 !important;
}
body.oks-a11y-contrast .oks-overlay-effect {
  background-color: transparent !important;
}

.oks-overlay-effect {
  position: fixed; top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 999990;
  display: none;
  backdrop-filter: grayscale(100%);
}
.oks-overlay-effect.is-active { display: block; }

.oks-reading-guide {
  position: fixed; left: 0;
  width: 100%; height: 50px;
  background: rgba(255, 255, 0, 0.2);
  border-top: 3px solid red;
  border-bottom: 3px solid red;
  pointer-events: none;
  z-index: 2147483647;
  display: none;
  transform: translateY(-50%);
}
body.oks-a11y-guide .oks-reading-guide { display: block; }
`;
