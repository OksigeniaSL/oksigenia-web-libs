# Oksigenia web libs

Minimalist, zero-dependency, privacy-first web libraries. FOSS, MIT licensed.

Originally developed as [Oksigenia](https://oksigenia.com) WordPress plugins
and re-packaged as framework-agnostic vanilla web libraries / web components
for use in any modern stack (Astro, React, Vue, Svelte, plain HTML).

## Packages

| Package | npm | Description |
|---|---|---|
| [`@oksigenia/share`](./packages/share) | [![npm](https://img.shields.io/npm/v/@oksigenia/share.svg)](https://www.npmjs.com/package/@oksigenia/share) | Social share buttons. Zero dependencies, no tracking. 9 networks, 8 locales. |
| [`@oksigenia/access-panel`](./packages/access-panel) | [![npm](https://img.shields.io/npm/v/@oksigenia/access-panel.svg)](https://www.npmjs.com/package/@oksigenia/access-panel) | Accessibility panel with 15 controls and 8 locales (incl. Guaraní). |

## Principles

- **Zero JS dependencies at runtime.** Sized in KB, not MB.
- **No cookies, no tracking, no third-party pings.** Only the explicit
  redirect that the user initiates.
- **Web component + imperative helper.** Works in plain HTML or as an
  island in any framework.
- **A11y by default.** Focus management, `aria-*` attributes,
  `prefers-reduced-motion` aware.
- **i18n with local dictionary.** Paraguayan locales (`es-PY`, `gn`)
  are first-class citizens.

## Development

```bash
pnpm install
pnpm build
pnpm test
```

## License

[MIT](./LICENSE) © Oksigenia SL.
