---
'@oksigenia/share': patch
---

Accessibility + hardening: the Nostr button now exposes a network-specific aria-label ("Share on Nostr") instead of the generic "Copy link to clipboard", so screen readers announce it consistently with the other networks (the copy action is still announced via the aria-live "Copied" message). Also adds `noopener` to the popup share strategy (X, LinkedIn, Reddit) so the share target can't reach back into the opener page — the same hardening the tab strategy already had.
