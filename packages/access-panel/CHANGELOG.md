# @oksigenia/access-panel

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
