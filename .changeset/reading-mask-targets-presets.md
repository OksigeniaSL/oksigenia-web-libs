---
"@oksigenia/access-panel": minor
---

Add **reading mask** (dark overlay that follows the cursor with a lit reading band, complementary to the existing reading guide), **big targets** (boosts interactive hit-area to 44×44 minimum per WCAG 2.5.5/2.5.8 with `padding` + `min-*` only, no layout-breaking `display` changes), and **4 additive profile presets** (low vision, dyslexia, motor, no distractions) that bundle related toggles in one click. Presets are triggers, not modes — they apply flags and let the user adjust afterwards; a 250 ms flash gives click feedback without a persistent active state.

Also fixes a latent Shadow DOM event-target bug in the document-level "click outside the panel" handler. `panel.contains(e.target)` returned `false` for any click originating inside the panel because the target is retargeted to the host element when the event crosses the shadow boundary. Replaced with `e.composedPath()` which is shadow-aware, so the panel no longer closes spuriously on its own button clicks.

New fields in `PanelState` (`readingMask`, `bigTargets`), new translation keys for all 8 locales (`mask`, `targets`, `presets`, `pLow`, `pDys`, `pMot`, `pCalm`), and two new SVG icons (`ICON_MASK`, `ICON_TARGETS`).
