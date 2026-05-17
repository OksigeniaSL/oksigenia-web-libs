# Changelog

This is the high-level changelog for the monorepo. Per-package
changelogs live next to each `package.json`. From the next release
onwards changesets generate them automatically.

## 2026-05-17

- **@oksigenia/access-panel 0.1.1** — Documented CSS custom properties
  (`--oks-btn-size`, `--oks-bg`, `--oks-icon`, `--oks-h-bg`, `--oks-h-icon`)
  for theming the floating trigger button from the host stylesheet.
- **@oksigenia/access-panel 0.1.0** — Initial release. 15 accessibility
  controls (text size, line height, alignment, letter spacing, font
  swap, dyslexia font, contrast, grayscale, hide images, highlight
  links, colorblind filters, reading guide, big cursor, pause
  animations, focus outline). 8 locales: es, en, gn (Guaraní), fr,
  it, de, nl, sv. Web component with Shadow DOM, localStorage
  persistence, focus trap.
- **@oksigenia/share 0.2.0** — Added `hide-desktop` and `hide-mobile`
  attributes to hide specific networks per viewport, restoring
  feature parity with the WordPress plugin.
- **@oksigenia/share 0.1.0** — Initial release. 9 networks (X,
  Bluesky, Threads, WhatsApp, Telegram, LinkedIn, Reddit, Nostr,
  Email) and 8 locales. Web component with Shadow DOM + imperative
  helper. Zero dependencies.
- Monorepo bootstrap. pnpm workspaces, TypeScript strict, tsup
  bundling, Vitest, changesets, MIT license.
