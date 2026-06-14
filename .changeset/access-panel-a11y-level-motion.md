---
'@oksigenia/access-panel': patch
---

Accessibility: multi-step controls (text size, line height, alignment, letter spacing, color-blind) now announce their current level to screen readers via a localized aria-label ("Size, level 2 of 4") instead of only an on/off `aria-pressed` — a screen-reader user can now tell level 1 from level 4. Also adds a `prefers-reduced-motion` block to the panel's own styles so its transitions and hover transforms are disabled for users who ask for reduced motion, matching the share component.
