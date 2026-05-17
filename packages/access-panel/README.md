<p align="center">
  <img src="https://raw.githubusercontent.com/OksigeniaSL/oksigenia-web-libs/main/packages/access-panel/assets/banner.png" alt="@oksigenia/access-panel — accessibility panel web component" />
</p>

# @oksigenia/access-panel

<img src="https://raw.githubusercontent.com/OksigeniaSL/oksigenia-web-libs/main/packages/access-panel/assets/icon.png" alt="" width="80" align="right" />

Accessibility panel as a web component. Drop in one tag, get 15 controls.

- **15 controls**: text size (4 levels), line height (3), text alignment (3),
  letter spacing (3), readable font toggle, dyslexia font toggle, high contrast,
  grayscale overlay, hide images, highlight links, colorblind filters (3 types),
  reading guide, big cursor, pause animations, focus outlines.
- **8 locales**: es, en, gn (Guaraní), fr, it, de, nl, sv.
- **Privacy-first**: zero dependencies, no analytics, no remote calls. User
  preferences persist in `localStorage` only.
- **Shadow DOM**: panel CSS is encapsulated; only the `body.oks-*` effect
  classes (zoom, contrast, etc.) are inserted into `document.head`, with a
  single, scoped `<style id="oksigenia-access-effects">`.
- **A11y**: `role="dialog"`, `aria-modal`, focus trap, Escape closes,
  `aria-pressed` on every control, `prefers-reduced-motion`-friendly.

Originally developed by [Oksigenia](https://oksigenia.com) as the
WordPress plugin
[`oksigenia-access`](https://wordpress.org/plugins/oksigenia-access/),
re-packaged as a framework-agnostic web library.

## Screenshot

<p align="center">
  <img src="https://raw.githubusercontent.com/OksigeniaSL/oksigenia-web-libs/main/packages/access-panel/assets/screenshot.png" alt="Open accessibility panel showing Text, Visual and Orientation sections with 15 controls" width="320" />
</p>

## Install

```sh
npm i @oksigenia/access-panel
```

## Use it as a web component

```html
<script type="module">
  import '@oksigenia/access-panel/web-component';
</script>

<oksigenia-access-panel
  locale="es-PY"
  position="mid-left"
  trigger-icon="vitruvian"
></oksigenia-access-panel>
```

Attributes:

| Attribute | Default | Notes |
|---|---|---|
| `locale` | `navigator.language` | One of `es`, `en`, `gn`, `fr`, `it`, `de`, `nl`, `sv`. Regional variants (`es-PY` → `es`) work. |
| `position` | `mid-left` | One of `top-left`, `top-right`, `mid-left`, `mid-right`, `bottom-left`, `bottom-right`. |
| `position-mobile` | inherits `position` | Optional. Same values as `position`. Applied on viewports ≤768px. Useful when the desktop position overlaps mobile hero CTAs. |
| `trigger-icon` | `vitruvian` | One of `vitruvian`, `wheelchair`, `eye`, `universal`. |
| `storage-key` | `oksiacSettings` | localStorage key for persisted preferences. |

## Theming with CSS variables

The trigger button colors are exposed as CSS custom properties on the
element itself, so you can theme it from your host stylesheet without
touching JS. Same approach as native form controls.

```css
oksigenia-access-panel {
  --oks-btn-size: 60px;    /* default 55px  */
  --oks-bg:     #be5d38;   /* idle bg       */
  --oks-icon:   #ffffff;   /* idle icon     */
  --oks-h-bg:   #ffffff;   /* hover bg      */
  --oks-h-icon: #be5d38;   /* hover icon    */
}
```

The variables only affect the floating trigger button. The panel
internals (cards, levels, contrast modes) stay locked to neutral
greys/blacks on purpose: the panel is a tool the user expects to
look the same on every site, not a branded surface.

If you need to brand the panel itself, fork the package and customize
`PANEL_CSS` — the building blocks are exported from
`@oksigenia/access-panel`.

## Use it in Astro

```astro
---
// src/layouts/Base.astro
---
<script>
  import '@oksigenia/access-panel/web-component';
</script>
<oksigenia-access-panel locale="es-PY"></oksigenia-access-panel>
```

## Low-level building blocks

If you want to render the panel manually or write your own behavior
on top, the building blocks are exported:

```ts
import {
  buildPanelHtml,
  bindPanelBehavior,
  loadState,
  saveState,
  PANEL_CSS,
  EFFECT_CSS,
  getTranslation,
} from '@oksigenia/access-panel';
```

## Why a single component instead of 15

Each control was hand-picked from real-world accessibility audits and
user feedback collected across 2-3 years on the WordPress side. They
intentionally cover three orthogonal axes:

- **Text** (6 controls): size, line height, alignment, font swap, dyslexia
  font, letter spacing.
- **Vision** (5 controls): contrast, grayscale, hide images, highlight links,
  colorblind filters.
- **Orientation** (4 controls): reading guide, big cursor, pause animations,
  focus outline.

You can disable individual controls by hiding them with CSS in the
shadow root if you want a smaller panel for your site, but the API
contract is to ship the full set.

## License

[MIT](../../LICENSE) © [Oksigenia SL](https://oksigenia.com).
