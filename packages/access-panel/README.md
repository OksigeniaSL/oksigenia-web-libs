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
| `scope` | whole page | A CSS selector (e.g. `#map-pane`) to confine the panel's effects to one container instead of `body`. For multi-pane apps where each region adapts on its own. See below. |

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

### Per-container accessibility (scoped mode)

By default the panel adapts the whole page — which is what a normal content site wants. In a **multi-pane app** (a data dashboard, a scientific viewer, an editor with several panels) you may want each region to adapt on its own: high contrast on the chart pane but the video untouched, bigger text in the data pane but not elsewhere. `scope` confines a panel's effects to one container:

```html
<div id="map-pane">…</div>
<oksigenia-access-panel scope="#map-pane" trigger="none" effects-exclude="canvas"></oksigenia-access-panel>
```

The instance applies its effect classes to `#map-pane` instead of `body` and injects a stylesheet anchored to that selector. Mount one per pane (each with its own `storage-key`) and they coexist without clobbering each other. The dialog opens **over its own pane** (anchored to the scope's box, not a shared viewport corner), so each pane's panel reads as belonging to that pane.

A scoped instance **drops grayscale and the colour-blind filter** — they destroy colour-coded data, which is exactly what scoping protects. **Big cursor and the reading guide / mask** can't be confined to a container either, but they're benign window-level aids, so a scoped panel still offers them and applies them to the **whole window**, with a single shared state across every pane and detached window: toggle from any pane's button and the cursor/guide/mask turns on window-wide while every pane's button reflects it (persisted as a window preference, not per-pane).

A scoped panel uses a **flat layout** — one grid, no visible category headings (they're kept screen-reader-only) — because curated per-pane panels look sparse when each category is its own grid. The classic (non-scoped) panel keeps its categories.

Text size in scoped mode scales the container's `font-size`, so it scales `em`/inherited text inside the pane but **not `rem`** — `rem` is always relative to `<html>` and there is no CSS way to anchor it to a container. Size that pane's text in `em` if you want per-pane text scaling.

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

### Focus highlight colour (for dark themes)

The `focus` control highlights interactive elements with a blue that can vanish on a dark background. Override it with `--oks-focus-color` (and optionally `--oks-focus-glow` for the ring around the current element). Custom properties inherit, so set it where the effect applies — on `:root` for the global panel, or on the scope container for a scoped one:

```css
:root            { --oks-focus-color: #5ee0ff; }  /* dark theme, global   */
#map-pane        { --oks-focus-color: #5ee0ff; }  /* dark theme, scope=   */
```

Default is `#005fcc`. The persistent "all interactive" outline derives a 45% tint from this colour; high-contrast mode overrides both to cyan on its own.

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

You can curate which controls appear with the `controls` / `exclude` attributes (see the attributes table above) if you want a smaller panel for your site; the default is to ship the full set.

## Scientific basis & references

Oksigenia Access is a presentation-layer tool: it lets a visitor adapt how a page is shown to them. The controls map to recognised accessibility standards and, where relevant, to peer-reviewed research. This section documents what each control is grounded in — and, just as importantly, where the evidence is weak, so nothing here claims more authority than it has. A floating panel does not make a site conformant; conformance is editorial work on the content (alt text, transcripts, semantics, source-design contrast, keyboard operability). These references are the basis for the *adaptations the panel offers*, not a conformance claim.

### Standards and legal framework

- **WCAG 2.2** — W3C Recommendation, the technical baseline most controls map to: <https://www.w3.org/TR/WCAG22/>
- **EN 301 549** — the European harmonised accessibility standard (references WCAG).
- **Directive (EU) 2016/2102** — accessibility of public-sector websites and apps: <https://eur-lex.europa.eu/eli/dir/2016/2102/oj>
- **Directive (EU) 2019/882 (European Accessibility Act)** — applies from 28 June 2025: <https://eur-lex.europa.eu/eli/dir/2019/882/oj>
- **Spain — Real Decreto 1112/2018 (BOE)** — transposes Directive 2016/2102: <https://www.boe.es/eli/es/rd/2018/09/07/1112>

### What each control is grounded in

| Control | Basis |
|---|---|
| Text size | WCAG 1.4.4 Resize Text, 1.4.10 Reflow |
| Line height · letter spacing · text alignment | WCAG 1.4.12 Text Spacing (line height ≥ 1.5, letter spacing ≥ 0.12em, word spacing ≥ 0.16em) |
| High contrast | WCAG 1.4.3 (AA), 1.4.6 (AAA), 1.4.11 Non-text Contrast |
| Highlight links | WCAG 1.4.1 Use of Color |
| Big targets | WCAG 2.5.8 Target Size Minimum (AA, 24px), 2.5.5 Enhanced (AAA, 44px) |
| Pause animations | WCAG 2.2.2 Pause/Stop/Hide, 2.3.3 Animation from Interactions; CSS `prefers-reduced-motion` |
| Focus highlight | WCAG 2.4.7 Focus Visible (AA), 2.4.11/2.4.13 Focus Appearance (2.2) |
| Readable font | British Dyslexia Association — Dyslexia Style Guide |
| Reading guide · reading mask · hide images | Cognitive-accessibility reading aids (WCAG cognitive guidance / COGA); no single Success Criterion mandates them |
| Colour-blind filters | Colour-vision-deficiency **simulation** — Viénot, Brettel & Mollon (1999); Brettel, Viénot & Mollon (1997); Machado, Oliveira & Fernandes (2009) |

### Honesty notes

**The colour-blind control is a _simulation_, not a _correction_.** It renders the page as a person with that deficiency would see it — a design/QA aid for people with normal vision, not an aid for a colour-blind visitor (who already sees that way). The matrices are the SVG colour-matrix filters widely used on the web; their rigorous basis is the simulation literature cited above, and the exact circulating values are approximations (for production-grade accuracy see [DaltonLens](https://daltonlens.org/cvd-simulation-svg-filters/)). Helping a colour-blind user is a design problem (colour-blind-safe palettes, shape in addition to colour), not a screen filter.

**"Dyslexia font" has mixed evidence.** Studies on special dyslexia typefaces (e.g. OpenDyslexic) are inconclusive, and several find no benefit over a good standard font. What _is_ evidence-based is spacing (WCAG 1.4.12 and the BDA guide). We offer the font as a common preference, not as a research-backed remedy.

### Sources

- W3C — *Web Content Accessibility Guidelines (WCAG) 2.2*: <https://www.w3.org/TR/WCAG22/> (per-criterion notes: <https://www.w3.org/WAI/WCAG22/Understanding/>)
- Directive (EU) 2016/2102: <https://eur-lex.europa.eu/eli/dir/2016/2102/oj>
- Directive (EU) 2019/882 (European Accessibility Act): <https://eur-lex.europa.eu/eli/dir/2019/882/oj>
- Real Decreto 1112/2018 (BOE): <https://www.boe.es/eli/es/rd/2018/09/07/1112>
- British Dyslexia Association — *Dyslexia Style Guide* (archived copy; the BDA's live document is access-restricted): <https://web.archive.org/web/20250701150153/https://www.bdadyslexia.org.uk/advice/employers/creating-a-dyslexia-friendly-workplace/dyslexia-friendly-style-guide>
- Viénot, F., Brettel, H., & Mollon, J. D. (1999). *Digital video colourmaps for checking the legibility of displays by dichromats.* Color Research & Application.
- Brettel, H., Viénot, F., & Mollon, J. D. (1997). *Computerized simulation of color appearance for dichromats.* JOSA A.
- Machado, G. M., Oliveira, M. M., & Fernandes, L. A. F. (2009). *A physiologically-based model for simulation of color vision deficiency.* IEEE TVCG.
- DaltonLens — *Accurate SVG filters for color blindness simulation*: <https://daltonlens.org/cvd-simulation-svg-filters/>

## License

[MIT](../../LICENSE) © [Oksigenia SL](https://oksigenia.com).
