# @oksigenia/access-panel

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
