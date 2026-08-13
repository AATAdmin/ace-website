# Site state

**Read this before proposing any change.** It is the authoritative record of what is
in the repo right now. Do not infer current state from memory or from an earlier
conversation. If this file and your recollection disagree, this file is right.

Kept current by the implementing chat on every push to `main`.

- **Live:** https://aceacademictutors.com and https://www.aceacademictutors.com
- **Repo:** `AATAdmin/ace-website`, branch `main`
- **Host:** Cloudflare Pages. No build command, output `/`, no framework.
- **Deploy:** merge to `main` deploys automatically, roughly one minute.
  Branch pushes do **not** deploy and produce **no public preview URL**.
- **Read exact current source:**
  `https://raw.githubusercontent.com/AATAdmin/ace-website/main/<file>`

## Pages

All 15 pages have **static header and footer inlined** and render fully with
JavaScript disabled. There are no `site-header-slot` / `site-footer-slot` divs left.

| File | `data-page` | Active nav link |
|---|---|---|
| `index.html` | `home` | none |
| `about.html` | `about` | About |
| `services.html` | `services` | Services |
| `pricing.html` | `pricing` | Pricing |
| `for-schools.html` | `schools` | For Schools |
| `become-a-tutor.html` | `tutor` | mobile menu only |
| `contact.html` | `contact` | mobile menu only |
| `portal.html` | `portal` | none |
| `maths-tutoring.html` | `maths` | none |
| `english-tutoring.html` | `english` | none |
| `science-tutoring.html` | `science` | none |
| `11-plus-tutoring.html` | `elevenplus` | none |
| `privacy.html` | `privacy` | none, noindex |
| `terms.html` | `terms` | none, noindex |
| `safeguarding.html` | `safeguarding` | none, noindex |

`assets/`: `site.css`, `chrome.js`, `site.webmanifest`, `favicon.png`,
`apple-touch-icon.png`, `logo-full.png`, `logo-icon.png`, `logo-reversed.png`,
`portal-dashboard.jpeg`, `portal-calendar.jpeg`, `portal-sessions.jpeg`.
Plus `robots.txt` and `sitemap.xml` at root. `image-slot.js` is deliberately gone.

## Conventions

- **`chrome.js` no longer injects chrome.** It still owns the mobile menu, header
  scroll shadow, reveal-on-scroll, counters and the `[data-year]` refresh. Its slot
  injection is a dead no-op and its active-link pass is idempotent. Leave it loaded.
- Header and footer markup is **duplicated verbatim across all 15 pages**. Change one,
  change all fifteen, or it drifts.
- Every page carries the `<noscript>` style line directly above `<header>`.
- Every page has static `og:` and `twitter:card` tags in `<head>`. Keep them static so
  link previews work without JS.
- **No em-dashes in displayed text.** En-dashes in ranges ("Years 3–6") are correct.
- Relative links only. No absolute `https://aceacademictutors.com/...` in `href`.

## Open items

- **`POST /api/enquiry` does not exist** on the portal. `contact.html` posts to it and
  correctly falls back to phone + email on any non-2xx or network failure. Until the
  endpoint is built, every submission takes the fallback path, so enquiries arrive by
  phone and email only. Needs CORS for both apex and www, plus rate limiting.
- `privacy.html`, `terms.html`, `safeguarding.html` are **unreviewed template text**,
  carrying `noindex, follow` and excluded from `sitemap.xml` pending legal review.
- `sitemap.xml` `lastmod` values all read `2026-06-02` and are stale.
- Testimonials: none with consent yet, so no testimonial section ships.

## Handoff format

**Design → implementer.** State the goal, the SHA you read, and then either:
- a **complete file** (preferred for page redesigns; no string matching to go wrong), or
- **exact old → new strings** for small edits.

Say what must not change. Do not assert what is currently in the repo; read it.

**Implementer → Design.** Report the commit SHA, screenshots of affected pages at
desktop and mobile widths, anything implemented differently from the request and why,
and any discrepancy found against the request's assumptions.

## Out of scope

`D:\cc_projects\ace-website` is an unrelated, undeployed Next.js site. It is not this
project and nothing from it ships here.
