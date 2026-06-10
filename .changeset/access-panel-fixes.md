---
'@oksigenia/access-panel': patch
---

Fix body class cleanup leaving junk tokens that piled up on every click: two-hyphen classes like `oks-a11y-font` were split by the old regex, leaving `-font` residue behind. Cleanup now removes `oks-` tokens via classList. Also fix the focus trap skipping the footer branding link: `a[href]` is now part of the Tab cycle, so keyboard users can reach it and Tab no longer escapes the panel from it.
