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
  color: #555;
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
@media (max-width: 480px) {
  .oksigenia-panel { padding: 8px 12px; gap: 8px; justify-content: center; }
  .oksigenia-btn { width: 38px; height: 38px; }
  .oksigenia-btn svg { width: 18px; height: 18px; }
  .oksigenia-label { margin-right: 6px; }
}
@media (prefers-reduced-motion: reduce) {
  .oksigenia-btn { transition: none; }
  .oksigenia-btn:hover { transform: none; }
}
`;
