// Punto de entrada principal · API imperativa + tipos.
// Para el web component, importar '@oksigenia/access-panel/web-component'.

export {
  getTranslation,
  supportedLocales,
  type LocaleCode,
  type Translation,
} from './translations.js';

export {
  type TriggerIcon,
  COLORBLIND_FILTERS_SVG,
} from './icons.js';

export {
  type Position,
  buildPanelHtml,
  positionCss,
} from './render.js';

export {
  type PanelState,
  DEFAULT_STATE,
  loadState,
  saveState,
  isStateEmpty,
} from './state.js';

export { bindPanelBehavior, type BehaviorOptions, type PanelController } from './behavior.js';
export { PANEL_CSS, EFFECT_CSS, scopedEffectCss } from './styles.js';

export {
  type ControlId,
  type PresetId,
  ALL_CONTROLS,
  PRESETS,
  PRESET_IDS,
  resolveEnabledControls,
  NON_SCOPABLE_CONTROLS,
  GLOBAL_OFFERABLE_CONTROLS,
  scopedControls,
} from './controls.js';
