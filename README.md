# TGLS, Total Global & Logistics Services Ltd

Company website for an oil & gas logistics operator in Nigeria. Static HTML/CSS/JS,
no build step, deployed on Vercel.

## Setup required before launch

The Careers and Vendors forms submit through [Web3Forms](https://web3forms.com) so file
uploads (CVs, CAC documents, tax clearance, etc.) actually get delivered by email. Both
forms currently carry a placeholder access key and will show a friendly "not connected
yet" message until it's set:

1. Get a free access key at [web3forms.com](https://web3forms.com) (just needs an email
   address to verify, no account or password).
2. In `careers.html` and `vendors.html`, replace `YOUR_WEB3FORMS_ACCESS_KEY` in the
   hidden `access_key` input with the real key.
3. Submit each form once to confirm the email arrives.

Until that's done, both forms still validate and show a clear status message; they just
won't send anywhere.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home, hero slideshow, ticker, logo marquee, overview cards |
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

No dependencies, no build, no install. A VS Code Live Server-style extension works too.

## Security notes

- Form submissions go through Web3Forms over HTTPS, with a honeypot field on each form
  to filter out basic bot spam.
- File inputs reject anything over 5MB client side before it's sent.
- The Font Awesome stylesheet is loaded from cdnjs with a Subresource Integrity hash
  (`integrity` + `crossorigin`), so the page refuses it if the CDN ever serves something
  that doesn't match.
- `vercel.json` sets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`, and `Strict-Transport-Security` on every response.
- No secrets live in this repo. The Web3Forms access key above is meant to be public
  client side; Web3Forms rate-limits and validates on their end, the same model
  Formspree and similar services use.

## Conventions

**Copy is stakeholder-approved.** Change design and markup freely, but not the wording.
After any edit, diff the rendered text against the previous version to confirm nothing
changed.

- **Design tokens** live in `:root` in `styles.css`: navy scale, blue accents, ink text
  greys, paper backgrounds, and `--ease-out` for motion.
- **Buttons:** `.btn-primary` (navy, for light backgrounds), `.btn-cta-primary` (white,
  for dark backgrounds), `.btn-outline` (outline, for dark backgrounds).
- **Scroll reveal:** add `.reveal` to any element; `script.js` staggers it into view.
- **Headline lines:** wrap as `<span class="line"><span>...</span></span>` for the
  line-by-line intro animation.
- **Marquees:** duplicates are cloned by JS at runtime, never hand-duplicate items in
  the HTML.
- **Motion** is IntersectionObserver plus CSS transitions. No animation library.
  Everything degrades to plain fades under `prefers-reduced-motion`.

## Deployment

Vercel, served straight from the repo root. `vercel.json` sets security headers and
image caching; `.vercelignore` keeps `Images/_originals` out of deploys.
