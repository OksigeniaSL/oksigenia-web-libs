<p align="center">
  <img src="https://raw.githubusercontent.com/OksigeniaSL/oksigenia-web-libs/main/packages/share/assets/banner.png" alt="@oksigenia/share — privacy-first social share buttons" />
</p>

# @oksigenia/share

Lightweight, privacy-first social share buttons.

- **Zero dependencies.** ~6 KB gzipped including all 9 SVG icons.
- **No tracking.** No third-party scripts, no cookies, no pings. Just
  the native share-intent URLs of each network, opened on user click.
- **9 networks**: X (Twitter), Bluesky, Threads, WhatsApp, Telegram,
  LinkedIn, Reddit, Nostr (copy-only), Email.
- **8 locales**: en, es, it, nl, de, pt, gn (Guaraní), sv.
- **Two APIs**:
  - Web component `<oksigenia-share>` with Shadow DOM (drop-in, no CSS to load).
  - Imperative helper `mountShare(target, options)` for full control.
- **A11y**: focus-visible outline, `role="group"`, `aria-label`, `aria-live`
  announcement when Nostr copies, respects `prefers-reduced-motion`.

Originally developed by [Oksigenia](https://oksigenia.com) as the
WordPress plugin
[`oksigenia-share`](https://wordpress.org/plugins/oksigenia-share/),
re-packaged as a framework-agnostic web library.

## Install

```sh
npm i @oksigenia/share
# or pnpm/yarn
```

## Use it as a web component

```html
<script type="module">
  import '@oksigenia/share/web-component';
</script>

<oksigenia-share
  url="https://granjaoga.com/articulos/vori-vori"
  title="Vori vori paraguayo"
  locale="es-PY"
  networks="x wa tg li em"
  x-handle="granjaoga"
></oksigenia-share>
```

Attributes:

| Attribute | Default | Notes |
|---|---|---|
| `url` | `location.href` | Absolute URL to share. |
| `title` | `document.title` | Title/text to share. |
| `locale` | `navigator.language` | Falls back to base (`es-PY` → `es`) then to `en`. |
| `networks` | all 9 | Space- or comma-separated subset, in display order. |
| `x-handle` | – | Without `@`; produces `"title by @handle"` on X. |
| `nostr-hashtag` | `oksigenia` | Appended to the copied Nostr payload. |
| `no-label` | – | Boolean; if present, hides the `SHARE` text. |

CSS is encapsulated in the shadow DOM — no global stylesheet to load.

## Use it imperatively (light DOM)

```ts
import { mountShare } from '@oksigenia/share';
import '@oksigenia/share/styles.css'; // load the global styles once

const target = document.querySelector('#share-here')!;
const { destroy } = mountShare(target, {
  title: 'Vori vori paraguayo',
  url: 'https://granjaoga.com/articulos/vori-vori',
  locale: 'es-PY',
  networks: ['x', 'wa', 'tg', 'em'],
  xHandle: 'granjaoga',
});

// later
destroy();
```

## Use it in Astro

```astro
---
const { url, title } = Astro.props;
---
<script>
  import '@oksigenia/share/web-component';
</script>
<oksigenia-share url={url} title={title} locale="es-PY"></oksigenia-share>
```

## Low-level building blocks

```ts
import { buildShareLink, getTranslation, NETWORKS } from '@oksigenia/share';

const link = buildShareLink({
  network: 'wa',
  title: 'Mi receta',
  url: 'https://example.com',
});

const t = getTranslation('es-PY');
// t.share === 'COMPARTIR'
```

## External services touched

The buttons redirect the user (and only on explicit click) to:

- twitter.com / x.com — [Privacy](https://twitter.com/privacy) · [Terms](https://twitter.com/tos)
- bsky.app — [Privacy](https://blueskyweb.xyz/support/privacy-policy) · [Terms](https://blueskyweb.xyz/support/tos)
- threads.net — [Privacy](https://help.instagram.com/519522125107875) · [Terms](https://help.instagram.com/581066165581870)
- whatsapp.com — [Privacy](https://www.whatsapp.com/legal/privacy-policy) · [Terms](https://www.whatsapp.com/legal/terms-of-service)
- telegram.org — [Privacy](https://telegram.org/privacy) · [Terms](https://telegram.org/tos)
- linkedin.com — [Privacy](https://www.linkedin.com/legal/privacy-policy) · [Terms](https://www.linkedin.com/legal/user-agreement)
- reddit.com — [Privacy](https://www.reddit.com/policies/privacy-policy) · [Terms](https://www.redditinc.com/policies/user-agreement)

Nostr copies a text payload to the clipboard (no network call).
Email uses the `mailto:` scheme (handled by the user agent).

## License

[MIT](../../LICENSE) © [Oksigenia SL](https://oksigenia.com).
