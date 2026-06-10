---
'@oksigenia/share': patch
---

Fix `hide-desktop` / `hide-mobile` being silently dropped: `buildShareHtml` never passed them through, so the per-viewport visibility classes were never emitted. Also fix share popups (X, LinkedIn, Reddit) opening off-center: top/left are screen coordinates, now computed from `screenX`/`outerWidth` instead of viewport size.
