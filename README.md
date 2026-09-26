# TGLS, Total Global & Logistics Services Ltd

Company website for an oil & gas logistics operator in Nigeria, live at
[totalgloballimited.com](https://totalgloballimited.com). Static HTML/CSS/JS with no
build step and no third-party requests, deployed on Vercel.

## Setup required before launch

The Careers and Vendors forms submit through [Web3Forms](https://web3forms.com), which
delivers file uploads (CVs, CAC documents, tax clearance, etc.) by email. Both forms carry
a placeholder access key and show a "not connected yet" message until it's set:

1. Get a free access key at [web3forms.com](https://web3forms.com) (just needs an email
   address to verify, no account or password).
2. In `careers.html` and `vendors.html`, replace `YOUR_WEB3FORMS_ACCESS_KEY` in the
   hidden `access_key` input with the real key.
3. Submit each form once to confirm the email arrives.

## Project layout

| Path | Contents |
| --- | --- |
| `index.html` | Home: hero slideshow, ticker, logo marquee, overview cards |
| `services.html` | Six service offerings |
| `about.html` | Company background |
| `mission-values.html` | Mission, vision, core values |
| `credentials.html` | NMDPRA / NUPRC operating permits |
| `clients.html` | Client portfolio and partner logos |
| `contact.html` | Addresses, email, phone |
| `careers.html` | Internship + Graduate Trainee programmes, application form |
| `vendors.html` | Vendor categories, requirements, registration form |
| `404.html` | Not-found page (uses root-relative `/` paths, since it can be served at any URL) |
| `styles.css`, `script.js` | Shared by every page |
| `icons.svg` | Icon sprite ([Lucide](https://lucide.dev), ISC license) |
| `fonts/` | Self-hosted Instrument Sans + Instrument Serif Italic (SIL OFL, licenses included) |
| `Images/` | Hero photos `hero-1..7.jpg`, client logos `client-*.{png,jpg}`, `logo.png`, favicons, `og-image.jpg` (link previews) |
| `Images/_originals/` | High-res source files, excluded from deploys |
| `robots.txt`, `sitemap.xml` | Search engine indexing |

The nav and footer markup is repeated in every page, so change all ten files (including
`404.html`) together.

## Running locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

No dependencies, no build, no install. A VS Code Live Server-style extension works too.
Icons need the page served over HTTP (not opened as a file) because they load from
`icons.svg`.

## Conventions

**Copy is stakeholder-approved.** Change design and markup freely, but not the wording.
After any edit, diff the rendered text against the previous version to confirm nothing
changed.

- **Design tokens** live in `:root` in `styles.css`: navy scale, blue accents, ink text
  greys, paper backgrounds, and `--ease-out` for motion. Size things in `rem` so they
  scale up on large monitors (the root font size grows above 1600px wide).
- **Buttons:** `.btn-primary` (navy, for light backgrounds), `.btn-cta-primary` (white,
  for dark backgrounds), `.btn-outline` (outline, for dark backgrounds).
- **Icons:** `<svg class="icon" aria-hidden="true"><use href="icons.svg#map-pin"></use></svg>`.
  They size to the surrounding `font-size` and take `color`. To add one, copy its
  `<path>`s from [lucide.dev](https://lucide.dev) into a new `<symbol id="…" viewBox="0 0 24 24">`
  in `icons.svg`.
- **Hero photos** are real `<img>` elements (`.page-hero-media` on inner pages,
  `.hero-slide` on the home page) so browsers start downloading them immediately. Home
  slides after the first use `data-src` and load once the page has finished loading.
- **Scroll reveal:** add `.reveal` to any element; `script.js` staggers it into view.
- **Headline lines:** wrap as `<span class="line"><span>...</span></span>` for the
  line-by-line intro animation.
- **Marquees:** duplicates are cloned by JS at runtime (enough to fill any screen width),
  never hand-duplicate items in the HTML.
- **Motion** is IntersectionObserver plus CSS transitions. No animation library.
  Everything degrades to plain fades under `prefers-reduced-motion`.

## Security

- `vercel.json` sends a strict **Content-Security-Policy**: only this site's own scripts,
  styles, images and fonts load, and data can only be sent to Web3Forms. It also sets
  `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy` and `Permissions-Policy`.
- **Keep the CSP hashes in sync.** The policy allows exactly two inline scripts by their
  sha256 hash: the one-line `js` class script in every page's `<head>`, and the
  speculation-rules JSON in `script.js`. If you change either, the browser will block it
  and print the new hash in the console; paste that into `vercel.json`.
- Don't add inline `style="…"` attributes or `<style>` blocks; the CSP blocks them. Put
  styles in `styles.css` (setting `element.style` from JavaScript is fine).
- Forms have a honeypot field against bot spam, and file inputs reject files over 5MB.
- No secrets live in this repo. The Web3Forms access key is designed to be public;
  Web3Forms rate-limits and validates on their side.
- `.vercelignore` keeps this README and `Images/_originals` off the live site.

## Performance notes

- Every page loads its one hero photo, two preloaded font files, `styles.css`,
  `script.js` and `icons.svg`, all from the site's own domain.
- Chrome and Edge prerender the next page when a visitor hovers a link (speculation
  rules in `script.js`); other browsers get a hover prefetch.
- Fonts are cached for a year (`immutable`), images for a week. HTML, CSS and JS
  revalidate on every visit so deploys show up immediately.
- Hero photos are 1920px progressive JPEGs at quality ~62, which is plenty under the dark
  overlays. Keep new ones around 100–300KB.
