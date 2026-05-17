# @oksigenia/access-panel

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
