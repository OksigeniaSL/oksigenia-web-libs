# Security Policy

## Reporting a vulnerability

If you find a security issue in any package of this repository, please
report it privately rather than opening a public issue.

- **Email**: `dev@oksigenia.cc`
- Use a clear subject line like `[security] @oksigenia/access-panel`.
- Include reproduction steps, affected versions, and any suggested fix.

We aim to acknowledge within 72 hours and ship a fix as soon as possible
depending on severity. Once a fix is released we credit the reporter
in the changelog unless anonymity is requested.

## Threat model

These packages are **client-side, zero-network** libraries:

- They do not call any third-party service.
- They do not set cookies.
- They do not call `fetch`, `XMLHttpRequest`, `WebSocket` or `navigator.sendBeacon`.
- `@oksigenia/share` opens explicit redirects to social networks
  **only** on user click.
- `@oksigenia/access-panel` persists preferences in `localStorage`
  on the consumer's origin only.

The realistic threats are therefore:

1. DOM injection via unescaped user data passed as attributes.
2. Storage poisoning via a malicious actor controlling `localStorage`.
3. Supply-chain compromise (npm token leak, malicious dependency).

If you find anything in those areas — or anything else that worries
you — please write to us.

## Supported versions

Latest minor of each package is supported. Older minors receive
security fixes for 6 months.
