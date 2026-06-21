<p align="center">
  <img src="https://raw.githubusercontent.com/OksigeniaSL/oksigenia-web-libs/main/packages/access-panel/assets/banner.png" alt="@oksigenia/access-panel — accessibility panel web component" />
</p>

# @oksigenia/access-panel

<img src="https://raw.githubusercontent.com/OksigeniaSL/oksigenia-web-libs/main/packages/access-panel/assets/icon.png" alt="" width="80" align="right" />

Accessibility panel as a web component. Drop in one tag, get 17 controls and
4 profile presets.

- **17 atomic controls**: text size (4 levels), line height (3), text alignment
  (3), letter spacing (3), readable font toggle, dyslexia font toggle, high
  contrast, grayscale overlay, hide images, highlight links, colorblind filters
  (3 types), reading guide, reading mask, big cursor, big targets (44×44 hit
  area, WCAG 2.5.5), pause animations, focus outlines.
- **4 profile presets** (additive — pressing several unions their flags):
  low vision, dyslexia, motor, no distractions.
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
  <img src="https://raw.githubusercontent.com/OksigeniaSL/oksigenia-web-libs/main/packages/access-panel/assets/screenshot.png" alt="Open accessibility panel showing profile presets and Text, Visual and Orientation sections" width="320" />
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
| `position` | `mid-left` | The 3×3 grid: `top-left`, `top-center`, `top-right`, `mid-left`, `mid-center`, `mid-right`, `bottom-left`, `bottom-center`, `bottom-right`. |
| `position-mobile` | inherits `position` | Optional. Same values as `position`. Applied on viewports ≤768px. Useful when the desktop position overlaps mobile hero CTAs. |
| `trigger-icon` | `vitruvian` | One of `vitruvian`, `wheelchair`, `eye`, `universal`, `porthole`. `porthole` frames the standard glyph in a ring without replacing it. |
| `storage-key` | `oksiacSettings` | localStorage key for persisted preferences. |
| `controls` | all 17 | Whitelist of control ids to offer, comma-separated (e.g. `contrast,text-size,colorblind`). Anything not listed is hidden. |
| `exclude` | none | Blacklist of control ids to remove from the full set (e.g. `reading-guide,reading-mask,grayscale`). Applied after `controls`. |
| `presets` | all four | `none` drops the profiles row. A profile also self-hides once curation leaves it bundling fewer than two controls (a one-control profile is redundant with that control). |
| `trigger` | floating | `none` renders the panel without its floating launcher; open it from your own button via `.open()`. |
| `effects-exclude` | none | CSS selectors kept free of the destructive high-contrast filter (e.g. `video, canvas, .no-a11y-filter`) — for surfaces where colour is information. |
| `nudge` | off | Present (or `nudge="50"` for a custom px cap, default 80) lets the user reposition the trigger within bounds, by drag or arrow keys, persisted per instance. |

Control ids for `controls`/`exclude`: `text-size`, `line-height`, `text-align`, `readable-font`, `dyslexia-font`, `letter-spacing`, `contrast`, `grayscale`, `hide-images`, `highlight-links`, `colorblind`, `reading-guide`, `reading-mask`, `big-cursor`, `big-targets`, `pause-anim`, `focus`.

### Driving the panel from your own button

With `trigger="none"`, mount the panel and open it from anywhere:

```html
<oksigenia-access-panel id="a11y" trigger="none" controls="contrast,text-size,colorblind"></oksigenia-access-panel>
<button id="a11y-btn">Accessibility</button>
<script type="module">
  import '@oksigenia/access-panel/web-component';
  const panel = document.getElementById('a11y');
  document.getElementById('a11y-btn').addEventListener('click', () => panel.toggle());
</script>
```

`.open()`, `.close()` and `.toggle()` are available on the element. The floating trigger is also exposed as `::part(trigger)` if you want to restyle it instead of replacing it.

## Theming with CSS variables

The trigger button colors are exposed as CSS custom properties on the
element itself, so you can theme it from your host stylesheet without
touching JS. Same approach as native form controls.

```css
oksigenia-access-panel {
  --oks-btn-size: 60px;    /* default 55px     */
  --oks-bg:     #be5d38;   /* idle bg          */
  --oks-icon:   #ffffff;   /* idle icon        */
  --oks-h-bg:   #ffffff;   /* hover bg         */
  --oks-h-icon: #be5d38;   /* hover icon       */
  --oks-z:      999999;    /* z-index (default 9999999) — lower it if the
                              trigger sits above modals you don't want it
                              to cover; raise it if another floating widget
                              covers it. */
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

## Use it in Ghost (CMS)

Ghost has no plugin system for frontend components, but Code Injection
covers this case in one snippet. In the admin, go to **Settings → Code
injection → Site Footer** and paste:

```html
<oksigenia-access-panel locale="en" position="bottom-left"></oksigenia-access-panel>
<script type="module" src="https://cdn.jsdelivr.net/npm/@oksigenia/access-panel/dist/web-component.js"></script>
```

Save. Reload any page on the site — the floating trigger appears.
Same attributes as above (`locale`, `position`, `trigger-icon`, etc.)
work as inline attributes on the tag.

The snippet above loads the bundle from jsDelivr, which logs requests
like any third-party CDN. To keep everything first-party, download
`dist/web-component.js` from npm or GitHub, upload it as a theme asset
(`assets/access-panel.js` in your active Ghost theme), and point the
`<script src=…>` at your own domain. Same component, no third-party hop.

Discussion on the Ghost forum (questions, issues, feedback):
<https://forum.ghost.org/t/accessibility-panel-for-ghost-via-code-injection-web-component-45-kb-no-tracking/62940>.

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
