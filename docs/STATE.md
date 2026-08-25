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
- **Design note blocks live in `docs/notes/<page>.md`, not in the page source.** They
  used to ship as HTML comments, ~36KB visible in view-source on the live site,
  including notes on which claims were and were not evidenced. Same content, same
  purpose: **read `docs/notes/<page>.md` before editing that page.** Short functional
  comments (a line explaining the honeypot, or where a link goes) stay inline.
- Static `og:` and `twitter:card` tags in every `<head>`.
- **Social proof must be evidenced.** Two forms are permitted, both linked to the
  Google listing: the rating badge (`[data-google-rating]`, Google's live figure) and
  **verbatim, named quotes from real Google reviews** (home page `.rvs` section).
  Quotes must never be edited beyond truncation, never paraphrased, and never
  detached from their link. Invented or unverifiable testimonials remain banned.
  **No schema markup for the quotes**: Google prohibits marking up reviews sourced
  from third-party platforms, its own included. Refresh the figure (currently 5.0
  from 10) and re-verify quoted reviews still exist as part of the monthly pass.
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

- **Prices** are still baked into HTML. Making them portal-editable is the next
  candidate to move, using the same machinery as the FAQs below.
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

## FAQs and reviews come from the portal (2026-08-25)

The FAQ copy on `pricing`, `maths-tutoring`, `english-tutoring`, `science-tutoring`
and `11-plus-tutoring`, and the review quotes on `index`, are no longer edited in
these files. They live in the portal and are written in at BUILD time by
`bake.mjs`, which Cloudflare Pages now runs as its build command.

**If you are proposing a change to an FAQ answer or a review quote, say so in the
proposal rather than editing the HTML** -- a bake overwrites it on the next deploy.

`bake.mjs` may only touch the regions between these markers. Everything else in
each file is left byte for byte alone, so the rest of the page is yours as before:

    <!--ace:faq-->        ... <!--/ace:faq-->          the visible FAQ list
    <!--ace:faq-schema--> ... <!--/ace:faq-schema-->   the FAQPage JSON-LD
    <!--ace:reviews-->    ... <!--/ace:reviews-->      the review cards

**Do not delete or move those markers.** The bake fails the build if a page has a
visible FAQ region without a matching schema region, on purpose: visible copy whose
structured data has drifted is worse for search than no structured data at all.

Two conventions in the stored text, both handled by the bake:
a blank line starts a new paragraph, and `[label](/path)` becomes a link
(collapsed to just the label inside the JSON-LD, which must stay plain prose).

The design of the markup is unchanged and still lives here: the bake reproduces
the existing `<details>` / `<summary>` / `.fq-a` and `.rv-c` structure exactly. It
was verified against the hand-written pages before it was switched on, 29 of 29
entries byte-identical. If the design of an FAQ block should change, change it
here and in `bake.mjs` together.
