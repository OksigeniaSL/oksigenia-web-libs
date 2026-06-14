# @oksigenia/share

## 0.2.4

### Patch Changes

- b810d7f: Accessibility + hardening: the Nostr button now exposes a network-specific aria-label ("Share on Nostr") instead of the generic "Copy link to clipboard", so screen readers announce it consistently with the other networks (the copy action is still announced via the aria-live "Copied" message). Also adds `noopener` to the popup share strategy (X, LinkedIn, Reddit) so the share target can't reach back into the opener page — the same hardening the tab strategy already had.

## 0.2.3

### Patch Changes

- 41a34d0: Fix `hide-desktop` / `hide-mobile` being silently dropped: `buildShareHtml` never passed them through, so the per-viewport visibility classes were never emitted. Also fix share popups (X, LinkedIn, Reddit) opening off-center: top/left are screen coordinates, now computed from `screenX`/`outerWidth` instead of viewport size.

## 0.2.2

### Patch Changes

- Fix share bar label styling. The label now inherits the surrounding text color (`currentColor`) instead of a hardcoded grey, so it stays readable on dark backgrounds. On narrow viewports (≤480px) the label moves to its own centered row instead of wrapping awkwardly next to the buttons.

## 0.2.1

### Patch Changes

Include `CHANGELOG.md` in the published npm tarball (this file now ships
with the package). The `files` array in `package.json` was an allow-list
that excluded the changelog. Also adds the initial changelog entries for
0.1.0 and 0.2.0, copied from the monorepo root. Pure packaging fix —
no runtime change.

## 0.2.0

### Minor Changes

Added `hide-desktop` and `hide-mobile` attributes to hide specific networks per viewport, restoring feature parity with the WordPress plugin.

## 0.1.0

### Minor Changes

Initial release. 9 networks (X, Bluesky, Threads, WhatsApp, Telegram, LinkedIn, Reddit, Nostr, Email) and 8 locales. Web component with Shadow DOM + imperative helper. Zero dependencies.
