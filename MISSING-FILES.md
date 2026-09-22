# Missing files — to restore

Files lost in an accidental Finder deletion on **22 September 2026**. Not recoverable
locally: they were not in the Trash, Spotlight found no copies, and there was no Time
Machine backup or APFS snapshot on the machine.

All site code (HTML, CSS, JS, config) survived intact. Only images were lost.

## 1. Needs fixing — site is visibly broken

| File | Details |
| --- | --- |
| `Images/NNPC Logo.png` | 472 × 278 PNG, ~29 KB |

Referenced by the client logo carousel on **`index.html`** and **`clients.html`**.
Until it is replaced, both pages show a broken image in that strip.

**To fix:** drop a replacement in at `Images/NNPC Logo.png` — no code change needed, the
filename is already referenced. A transparent PNG roughly 470 × 280 matches the others.
Best sources: the original brand pack, a designer's email, or another machine/cloud copy.

## 2. Low priority — not used by the live site

Backup copies lost from `Images/_originals/` (pre-compression originals, excluded from
deploys by `.vercelignore`):

- `Carousel Image 1.png` … `Carousel Image 7.png`
- `NNPC Logo.png`
- `OMS logo.png`

The compressed `.jpg` versions the site actually loads are all present and working, so
this only means the higher-quality sources are gone. Still in `_originals`: `logo.png`,
`Renaissance logo.png`, `westafricaoffshoreserviceslogo.jpeg`.

## Separately — pre-existing, unrelated to the deletion

The Careers and Vendors forms use `action="mailto:"` with file uploads, which does not
work in browsers; submissions and CV attachments never arrive. Needs a form backend
(e.g. Formspree, Web3Forms) before launch.
