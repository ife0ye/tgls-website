# TGLS — Total Global & Logistics Services Ltd

Company website for an oil & gas logistics operator in Nigeria. Static HTML/CSS/JS,
no build step, deployed on Vercel.

## ⚠️ Missing files — need restoring

Lost in an accidental Finder deletion on **22 September 2026**. Not recoverable locally:
not in the macOS Trash, no Spotlight match, no Time Machine backup or APFS snapshot.
All site code survived — the losses are images only.

**Where to look:** iCloud Drive → **Recently Deleted** (Finder sidebar, or iCloud.com →
Drive). iCloud keeps deleted files for **30 days**, so this window closes around
**22 October 2026**. Also worth checking: the original brand pack, designer emails, or
another device.

### Breaks the live site

- [x] **`Images/NNPC Logo.png`** — restored (492 × 302 PNG). Client logo carousel on
  `index.html` and `clients.html` now resolves correctly.

### Low priority — not used by the live site

Pre-compression originals from `Images/_originals/` (excluded from deploys via
`.vercelignore`). The compressed `.jpg` files the site actually loads are all present,
so losing these only costs the higher-quality sources.

- [ ] `Carousel Image 1.png` … `Carousel Image 7.png`
- [ ] `NNPC Logo.png` (original, higher-res source — the live-size copy is restored above)
- [ ] `OMS logo.png`

Still intact in `_originals/`: `logo.png`, `Renaissance logo.png`,
`westafricaoffshoreserviceslogo.jpeg`.

## Other known issue

The Careers and Vendors forms use `action="mailto:"` with file uploads. This does not
work in browsers — submissions and CV attachments never arrive, while the visitor
believes they applied. Needs a form backend (Formspree, Web3Forms or similar) before
launch.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home — hero slideshow, ticker, logo marquee, overview cards |
| `services.html` | Six service offerings |
| `about.html` | Company background |
| `mission-values.html` | Mission, vision, core values |
| `credentials.html` | NMDPRA / NUPRC operating permits |
| `clients.html` | Client portfolio and partner logos |
| `contact.html` | Addresses, email, phone |
| `careers.html` | Internship + Graduate Trainee programmes, application form |
| `vendors.html` | Vendor categories, requirements, registration form |

Shared across every page: `styles.css`, `script.js`, and the nav/footer markup.

## Running locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

No dependencies, no build, no install.

## Conventions

**Copy is stakeholder-approved.** Change design and markup freely, but not the wording.
After any edit, diff the rendered text against the previous version to confirm nothing
changed.

- **Design tokens** live in `:root` in `styles.css` — navy scale, blue accents, ink text
  greys, paper backgrounds, and `--ease-out` for motion.
- **Buttons:** `.btn-primary` (navy, for light backgrounds), `.btn-cta-primary` (white,
  for dark backgrounds), `.btn-outline` (outline, for dark backgrounds).
- **Scroll reveal:** add `.reveal` to any element; `script.js` staggers it into view.
- **Headline lines:** wrap as `<span class="line"><span>…</span></span>` for the
  line-by-line intro animation.
- **Marquees:** duplicates are cloned by JS at runtime — never hand-duplicate items in
  the HTML.
- **Motion** is IntersectionObserver plus CSS transitions. No animation library.
  Everything degrades to plain fades under `prefers-reduced-motion`.

## Deployment

Vercel, served straight from the repo root. `vercel.json` sets security headers and
image caching; `.vercelignore` keeps `Images/_originals` out of deploys.
