# Oksigenia web libs

Librerías web minimalistas, sin dependencias, privacy-first. FOSS bajo MIT.

Originadas como plugins de WordPress de [Oksigenia](https://oksigenia.com) y
re-empaquetadas como librerías web vanilla / web components para uso en
cualquier stack moderno (Astro, React, Vue, Svelte, HTML plano).

## Paquetes

| Paquete | npm | Descripción |
|---|---|---|
| [`@oksigenia/share`](./packages/share) | [![npm](https://img.shields.io/npm/v/@oksigenia/share.svg)](https://www.npmjs.com/package/@oksigenia/share) | Botones de compartir social, zero-dependency, sin tracking. |
| [`@oksigenia/access-panel`](./packages/access-panel) | [![npm](https://img.shields.io/npm/v/@oksigenia/access-panel.svg)](https://www.npmjs.com/package/@oksigenia/access-panel) | Panel de accesibilidad con 14 controles y 9 idiomas. |

## Principios

- **Zero JS dependencies en runtime.** Pesos en KB, no en MB.
- **Sin cookies, sin tracking, sin pings a terceros.** Sólo el redirect
  explícito que el usuario inicia.
- **Web component + helper imperativo.** Funciona en HTML plano o como
  isla en frameworks.
- **A11y por defecto.** Focus management, `aria-*`, `prefers-reduced-motion`.
- **i18n con diccionario local.** Locales paraguayos (`es-PY`, `gn`)
  como ciudadanos de primera clase.

## Desarrollo

```bash
pnpm install
pnpm build
pnpm test
```

## Licencia

[MIT](./LICENSE) © Oksigenia SL.
