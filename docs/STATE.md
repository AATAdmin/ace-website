# Site state

**Read this before proposing any change.** It is the authoritative record of what is
in the repo right now. Do not infer current state from memory or an earlier
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

**All 17 pages are live.** The home-page-only phase is over: `_redirects` has been
deleted and every page is reachable again.

`index` `services` `pricing` `get-started` `about` `workshop` `portal` `for-schools`
`become-a-tutor` `contact` `maths-tutoring` `english-tutoring` `science-tutoring`
`11-plus-tutoring` `privacy` `terms` `safeguarding`

- `get-started.html` is the **only enquiry route**. `contact.html` has no form, by
  design. `get-started` is `noindex` and out of the sitemap.
- `privacy`, `terms`, `safeguarding` are **unreviewed template text**, `noindex`, and
  out of the sitemap pending legal review.
- `workshop.html` has **no site header**, deliberately: it is a campaign landing page.
  It does carry the footer.
- `sitemap.xml` carries 13 URLs.

## Conventions

- Chrome is **inlined**, not injected. Header, nav and footer are duplicated verbatim
  across the pages that have them. Change one, change all.
- Every page renders fully with **JavaScript disabled**. Verify before pushing.
- `assets/chrome.js` owns the mobile menu, scroll shadow, reveals, counters,
  `[data-year]`, and first-touch attribution capture. It no longer injects chrome.
- `assets/live.js` hydrates portal-driven values. **Every such value is also baked
  into the HTML**, so a page is correct with no JS and no portal. Never delete a baked
  value and rely on the fetch.
- **Asset URLs are content-versioned.** `site.css`, `chrome.js` and `live.js` are
  referenced as `assets/<file>?v=<md5-8>`. Pages serves HTML with `max-age=0` but
  assets with `max-age=14400`, so an unversioned filename lets a browser pair new
  markup with four-hour-old CSS. That happened at launch: the old stylesheet had no
  `.topbar` rules and the topbar SVGs, which carry no width or height, filled the
  viewport. **Whenever one of those three files changes, regenerate its token in all
  17 pages before pushing.** The generator is idempotent and strips any existing
  `?v=` first.
- Static `og:` and `twitter:card` tags in every `<head>`.
- **No em-dashes in displayed text.** En-dashes in ranges are correct.
- British English. Relative links only (except `rel="canonical"`, which is absolute).
- `site.css` defines only `a{color:inherit}` — there is no base link colour, so an
  anchor dropped into styled prose becomes invisible. Give the component its own
  colour, or do the deliberate base-colour pass across every page.

## The enquiry route

`get-started.html` posts to `https://portal.aceacademictutors.com/api/enquiry`.
**This endpoint exists and works** — verified end to end returning `201 {ok:true}`.

- Payload is **flat snake_case**: `name`, `email`, `phone`, `child_name`,
  `year_group`, `subject`, `message`, `campaign`, `company`, plus `utm_*`,
  `landing_page`, `referrer`. A nested payload 400s as missing name and contact.
- `company` is a **required honeypot** — must exist in the markup and stay empty.
- Everything the form captures beyond the contact fields is written into `message`
  (2000 char cap), because the portal stores one free-text field.
- Only a 2xx counts as success. On failure the form shows phone and email.
- Attribution is **first-touch**, captured by `chrome.js` into `sessionStorage`
  (`ace:attr`) on the first page of a visit.
- Serving the site on `http://127.0.0.1:5180` posts to **ACE Test Centre**, not the
  live org. Use that origin for any form testing.

## Open items

- **`GET /api/site-content` does not exist yet.** It would make workshop dates,
  enrolling classes and prices editable from the portal instead of in HTML.
  Contracts: `docs/PORTAL_CONTENT_API.md`, `docs/PRICING_FROM_PORTAL.md`.
- Package purchase / subscription links are switched off pending somewhere to send
  people. Contract: `docs/PACKAGES_AND_SUBSCRIPTIONS.md`.
- No email notification fires on a new enquiry; leads land in the portal only.
- Legal review of the three legal pages. Once done, remove `noindex` and add them to
  `sitemap.xml`. The privacy notice predates the `filledBy` / `guardian` / `over18`
  fields and does not cover a student enrolling on their own behalf.
- Four screenshot slots in `services.html` await real images. **Any portal screenshot
  must be the family view with dummy data, never an admin screen.**
- `for-schools.html` is thin.
- `sitemap.xml` `lastmod` values are stale.
- Each page carries an HTML comment note block recording its decisions. These ship in
  public page source (~40KB). Whether to keep them there is an open question.

## Out of scope

`D:\cc_projects\ace-website` is an unrelated, undeployed Next.js site. Not this project.
