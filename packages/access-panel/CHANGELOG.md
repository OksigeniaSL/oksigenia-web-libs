# @oksigenia/access-panel

## 0.7.0

### Minor Changes

- Two refinements to scoped panels (`scope=`):

  **Window-level "global-offerable" controls.** Big cursor and the reading guide / mask can't be confined to a container, but they're benign window-level aids — so a scoped panel now offers them and applies them to the whole window, with a single shared state across every scoped instance and detached window. Toggle from any pane's pill and the cursor/guide/mask turns on window-wide while every pane's button reflects it; it persists as a window preference (synced same-document via an event and cross-window via the `storage` event), not under any one pane's `storage-key`. Grayscale and the colour-blind filter stay out of scoped panels (they destroy colour-coded data) — a scoped instance now drops only those two.

  **Flat layout in scoped mode.** Curated/scoped panels looked sparse because each control category was its own grid, so controls from different categories couldn't share a row. Scoped panels now use a single flat grid; the category headings are kept screen-reader-only (out of the visual flow) so assistive tech keeps the structure, and the trailing button widens to fill any odd gap. The classic (non-scoped) panel is unchanged — it keeps its visible categories.

  Both are scoped-mode only; they don't touch the classic panel or the WordPress/Moodle plugins.

## 0.6.1

### Patch Changes

- Make the `focus` highlight colour themeable via `--oks-focus-color` (default `#005fcc`), with an optional `--oks-focus-glow` for the ring around the current element. The hardcoded blue could vanish on a dark theme; set the variable on `:root` for the global panel, or on the scope container for a scoped one (`scope=`), to keep the highlight visible. Custom properties inherit, so it composes with `scope=`. Default behaviour is unchanged, and high-contrast mode keeps its own cyan.

## 0.6.0

### Minor Changes

- Add `scope=` for per-container accessibility — confine a panel's effects to a host element instead of the whole page, so several panels can each adapt their own region in a multi-pane app (a data dashboard, a scientific viewer, an IDE) without clobbering each other. Opt-in: with no `scope` attribute, behaviour is unchanged.

  - `<oksigenia-access-panel scope="#map-pane">` applies its effect classes to `#map-pane` (not `body`) and injects a per-instance stylesheet anchored to that selector. Multiple scoped instances coexist, each over its own region with its own `storage-key`.
  - A scoped instance auto-excludes the controls that cannot be regionalised: the full-screen overlays (grayscale, reading guide, reading mask), the colour-blind root filter, and the window-level big cursor. A per-pane panel only offers what it can actually confine.
  - Text size in scoped mode scales the container's `font-size`, so it scales `em`/inherited text inside the pane but not `rem` (which is always relative to `<html>`). Hosts that want per-pane text scaling size that pane's text in `em`.
  - `effects-exclude` composes with `scope`: under a scope, the essential-media exclusion is anchored to the scope selector.

  This rounds out the toolkit for embedding the panel in non-generic, multi-region platforms (alongside `effects-exclude` and `trigger="none"`). It is a component-only capability — the generic WordPress/Moodle plugins, whose sites adapt globally, neither expose nor need it.

## 0.5.0

### Minor Changes

- Make the panel context-aware so it fits non-generic platforms (multi-window data tools, video/3D viewers, scientific imaging) without forking. Everything here is opt-in: with none of the new attributes set, the markup and behaviour are byte-for-byte what they were. No breaking changes.

  - **Control curation** — `controls="contrast,text-size,colorblind"` (whitelist) and/or `exclude="reading-guide,reading-mask,grayscale"` (blacklist) pick which of the 17 controls an instance offers. A window with only a video or a 3D scene can drop the prose controls (line height, reading guide/mask) that are noise there. Section headings disappear when all their controls are gone. A profile preset recomposes to whatever it can still legitimately set, and hides once it would bundle fewer than two controls — a profile that collapses to a single control is redundant with that control's own button. `presets="none"` drops the profiles row entirely, for tools that don't want it. Control ids are stamped as `data-control` on each button.

  - **Programmatic open + host-driven trigger** — `trigger="none"` renders the panel without its floating launcher, and the element exposes `.open()`, `.close()`, `.toggle()`. A host can open the panel from its own button inside an existing control cluster — for layouts with no room for a floating trigger. Focus returns to whatever opened the panel.

  - **Bounded effect exclusion** — `effects-exclude="video, canvas, .no-a11y-filter"` keeps the high-contrast filter off elements where colour is information (a marine video, a depth-coded canvas, scientific imagery), so high-contrast still fixes the UI without destroying data. Grayscale is intentionally not excludable per surface (a full-screen `backdrop-filter` can't be reverted by a descendant) — drop the grayscale control via `exclude=` on instances where colour is data.

  - **Nine-anchor placement** — `position` now accepts the full 3×3 grid: the existing six plus `top-center`, `mid-center`, `bottom-center`. The host declares where its free gap is instead of the component assuming a corner.

  - **Bounded nudge** — `nudge` (or `nudge="50"` for a custom px cap) lets the user reposition the trigger within limits, by drag or by arrow keys while it is focused, persisted per instance and clamped so it can never be lost off-screen. This is itself an accessibility affordance: a reduced visual field, a screen magnifier or one-handed reach can move the launcher out of the way without burying it.

  - **Porthole trigger** — `trigger-icon="porthole"` frames the standard accessibility glyph in a metal ring (the glyph is never replaced, preserving discoverability). The trigger button is also exposed as `::part(trigger)` for hosts that want to compose their own frame.

## 0.4.4

### Patch Changes

- b810d7f: Accessibility: multi-step controls (text size, line height, alignment, letter spacing, color-blind) now announce their current level to screen readers via a localized aria-label ("Size, level 2 of 4") instead of only an on/off `aria-pressed` — a screen-reader user can now tell level 1 from level 4. Also adds a `prefers-reduced-motion` block to the panel's own styles so its transitions and hover transforms are disabled for users who ask for reduced motion, matching the share component.

## 0.4.3

### Patch Changes

- 93bdea9: Fix body class cleanup leaving junk tokens that piled up on every click: two-hyphen classes like `oks-a11y-font` were split by the old regex, leaving `-font` residue behind. Cleanup now removes `oks-` tokens via classList. Also fix the focus trap skipping the footer branding link: `a[href]` is now part of the Tab cycle, so keyboard users can reach it and Tab no longer escapes the panel from it.

## 0.4.2

### Patch Changes

Fix `aria-hidden-focus` (axe / Lighthouse, severity _serious_): while closed, `#oks-panel` kept `aria-hidden="true"` but still held ~24 focusable controls (buttons, inputs, `[tabindex]`). An `aria-hidden` element with focusable descendants is a violation — a keyboard or screen-reader user can land "inside" something hidden from assistive tech — and it contradicted the `aria-modal="true"` on the same element.

The closed state now uses the `inert` attribute instead of `aria-hidden`. `inert` removes the panel from both the tab order and the accessibility tree, so its controls are genuinely unreachable while closed, and the `aria-modal`/`aria-hidden` contradiction is gone. On open we `removeAttribute('inert')`; on close we `setAttribute('inert', '')` before returning focus to the trigger. The dialog pattern (focus moves in on open, Esc closes, focus returns to the trigger, Tab is trapped while open) was already in place and is unchanged.

`inert` is supported in Chrome/Edge 102+, Firefox 112+ and Safari 15.5+. No API change.

## 0.4.1

### Patch Changes

Include `CHANGELOG.md` in the published npm tarball. The `files` array in
`package.json` was an allow-list that excluded the changelog, so consumers
using `npm view` or reading their installed `node_modules` had no
visibility into release notes. Pure packaging fix — no runtime change.

## 0.4.0

### Minor Changes

- 8d395a3: Add **reading mask** (dark overlay that follows the cursor with a lit reading band, complementary to the existing reading guide), **big targets** (boosts interactive hit-area to 44×44 minimum per WCAG 2.5.5/2.5.8 with `padding` + `min-*` only, no layout-breaking `display` changes), and **4 additive profile presets** (low vision, dyslexia, motor, no distractions) that bundle related toggles in one click. Presets are triggers, not modes — they apply flags and let the user adjust afterwards; a 250 ms flash gives click feedback without a persistent active state.

  Also fixes a latent Shadow DOM event-target bug in the document-level "click outside the panel" handler. `panel.contains(e.target)` returned `false` for any click originating inside the panel because the target is retargeted to the host element when the event crosses the shadow boundary. Replaced with `e.composedPath()` which is shadow-aware, so the panel no longer closes spuriously on its own button clicks.

  New fields in `PanelState` (`readingMask`, `bigTargets`), new translation keys for all 8 locales (`mask`, `targets`, `presets`, `pLow`, `pDys`, `pMot`, `pCalm`), and two new SVG icons (`ICON_MASK`, `ICON_TARGETS`).

## 0.3.8

### Patch Changes

Mobile panel densified and big-cursor option hidden on touch devices. The WP plugin already did this; the web component lagged behind. Three concrete changes inside the `@media (max-width: 768px)` block:

- `.oks-access-opt[data-class="oks-big-cursor"] { display: none; }` — the option only makes sense with a mouse; `pointer: coarse` devices never see it.
- `.oks-access-opt[data-class="oks-a11y-focus"] { grid-column: span 2; }` — fills the gap left by the hidden cursor button so the grid stays even.
- Compacted spacing: `min-height` 88 → 72 px (still well above the 44×44 minimum from WCAG 2.5.5), padding 14/8 → 10/8, gap 10 → 8, icons 30 → 26, content padding 16/24 → 14/20, section titles 14/6 → 10/4. Result: all 14 controls fit one screen on common mobile viewports (~640-844 px high) without scrolling.

## 0.3.7

### Patch Changes

Real fix for the mobile panel overflow reported on granjaoga.com. The grid `minmax(0, 1fr)` change in 0.3.6 was a red herring — the actual cause was in `positionCss()`. Dynamic position rules (`top: 50%; left: 90px; transform: translateY(-50%)` for `position="mid-left"`, etc.) were injected into the Shadow DOM **after** the mobile `@media (max-width: 768px)` block that puts the panel fullscreen. The dynamic rules sat at the bottom of the stylesheet, so they overrode `top`, `left`, `transform` on mobile too, leaving the panel `width: 100%` but anchored at `left: 90px` — clipping its right side by 90px on narrow viewports. Position rules for `.oks-access-panel` now live inside `@media (min-width: 769px)` so they only apply on desktop. Wrapper (trigger button) rules are unaffected.

## 0.3.6

### Patch Changes

Mobile responsive fix: the option grid (`.oks-access-grid`) used `grid-template-columns: 1fr 1fr`, which lets each column grow to its min-content. On narrow viewports, long labels (FUENTE DISLEXIA, LINKS DESTACADOS, INTERLINEADO) pushed the second column off-screen — the right half of the panel was clipped on mobile. Switched to `minmax(0, 1fr) minmax(0, 1fr)`, added `min-width: 0` on `.oks-access-opt` and `overflow-wrap: anywhere; word-break: break-word;` on `.oks-label`. The panel now fits the viewport on every device.

## 0.3.5

### Patch Changes

First release published via **npm Trusted Publishing (GitHub Actions OIDC)** instead of a long-lived publish token. Same code as 0.3.4 — this bump exists to validate the OIDC-based publish workflow. The published tarball ships with an [npm provenance attestation](https://docs.npmjs.com/generating-provenance-statements) that links the package back to the exact commit + workflow run that produced it (verifiable in the [sigstore transparency log](https://search.sigstore.dev/)).

## 0.3.4

### Patch Changes

- Fix: text-size levels had no visible effect on sites whose CSS sizes things in `rem` (anchored to `<html>`).

  The 0.3.3 fix moved `oks-zoom-*` from the universal selector to `<body>` with percent values, which only moves descendants that inherit `font-size` from `<body>`. Sites whose CSS uses `rem` (anchored to `<html>`) saw no change at all.

  Anchor the change at `<html>` via `:has(body.oks-zoom-N)` so the root font-size updates once and every `rem` descendant scales cleanly. No compounding, no missed descendants, hard-coded `px` intentionally left alone.

  `:has()` is supported in Chrome 105+, Safari 15.4+ and Firefox 121+.

## 0.3.3

### Patch Changes

Re-publish of the same content shipped as 0.3.2 below — the 0.3.2 tarball on
the npm registry went out without the `dist/` directory because the local
build had errored just before `npm pack` (a stray backtick inside a template
literal made `tsup` fail) and the publish proceeded anyway. **Do not use
0.3.2** — it is missing all compiled output. Use 0.3.3.

## 0.3.2 (broken — DO NOT USE)

### Patch Changes

- Fix: Text-size levels (`oks-zoom-1` through `oks-zoom-4`) blew up the layout exponentially.

  The previous rules applied `font-size: 1.20em !important` to every descendant of `<body>` via `*`. Since `em` is relative to the parent, doing that at every nesting level compounded the factor — a heading three levels deep ended up at `1.20³ = 1.73×` its intended size, which is why headings spilled out of the viewport at level 3 and the page became unusable at level 4.

  New rules target the `<body>` only with percentage values (10 / 20 / 35 / 50%). `font-size` inherits natively, so descendants using `em` or `rem` scale exactly once. Hard-coded `px` values are intentionally left alone — that's what the browser's own zoom is for.

  No new API. No behavioural change when the controls are off.

## 0.3.1

### Patch Changes

- Fix: reading guide painted a solid black band on top of the text when **High contrast** was also active.

  The high-contrast mode flips every descendant of `<body>` to `background-color: #000 !important; color: #ff0`. That selector was also catching the reading-guide overlay (`.oks-reading-guide`), overriding its semi-transparent yellow with an opaque black, which defeated the purpose of the feature.

  Two corrective rules added right after the high-contrast block: the reading guide keeps its translucent yellow background and gets `#ff0` borders (visible on the new black page), and `.oks-overlay-effect` is forced back to `transparent` for the same reason.

  No behavioural change when high-contrast is off. No new API.

## 0.3.0

### Minor Changes

- Expose `--oks-z` CSS custom property to control the trigger and panel z-index from outside the Shadow DOM.

  Default unchanged (`9999999`). Consumers can lower it to sit below specific modals, or raise it to outrank other floating widgets:

  ```css
  oksigenia-access-panel {
    --oks-z: 99999;
  }
  ```

  This makes the z-index deterministic across browsers — previously, attempts to control the trigger's stacking from outside via the host element's z-index were best-effort because the trigger is `position: fixed` inside the Shadow DOM and creates its own stacking context.
