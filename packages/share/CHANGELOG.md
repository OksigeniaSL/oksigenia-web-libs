# @oksigenia/share

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
