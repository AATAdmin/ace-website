# Design notes: `index.html`

Moved out of the page source so they are not visible in view-source on the
live site. These are the decisions for this page: what was deliberately left
out and why, what must not change, and which instructions conflicted.

**Read this before editing the page.**

## Block 1

```
============================================================
  NOTE FOR CLAUDE CODE, home page
  ============================================================
  Three portal connections touch this page. Full brief:
  docs/PORTAL_INTEGRATION.md

  1. EVENTS ARE PORTAL-CONTROLLED. The workshop band below is not
     hand-edited. assets/live.js fetches GET /api/site-content and
     swaps every [data-ace] value in place. Adding or editing a
     workshop in the portal changes this page with no deploy.
     The values in the HTML are the baked fallback, correct at
     author time, used when there is no JS and no portal.
     Contract: docs/PORTAL_CONTENT_API.md

  2. THE COURSE CHOOSER reads classes[] from the same endpoint to
     decide whether a small group class exists for a stage, and at
     what price. BAKED_GROUPS in the script below is the fallback.
     Opening a second group class should be a portal action, never
     a code change here.

  3. LOG IN and FREE TRIAL are the two nav routes. Log in goes to
     the portal; Free trial goes to get-started.html, which posts
     to POST /api/enquiry and lands on the leads screen.
     Contract: docs/ENQUIRY_PAYLOAD.md

  HERO SURFACE, not a hero image. There is no picture box in the
  hero any more. Instead .surface behind the copy carries real
  notation from all five subjects, handwritten (Caveat, from the
  same Google Fonts request as the body type, so no extra
  connection). It reads as working out on paper rather than a
  printed textbook. Contents: a quadratic, an integral, a
  benzene ring, <span class="mk-v">F</span> = <span class="mk-v">ma</span>, photosynthesis, metaphor, simile, mitosis)
  set large, pale and drifting slowly. Every mark sits right of 58%
  and the grid is masked to fade in from the right, so NOTHING sits
  behind the headline or body copy. Keep it that way when adding
  marks. It is aria-hidden. It hides below 760px, where a phone has no room for
  it. The drift stops under prefers-reduced-motion. Pure CSS, no
  image files.

  The five accent colours used in there are scoped to this graphic.
  Do not spread them to buttons or headings; the site palette is
  teal, cream and ink.

  IMAGERY. There are no photographs on the site yet. If a portal
  screenshot is ever used
  anywhere, it MUST be the family view with dummy data, never the
  admin screens (the originals showed bank balance, margin and
  named students, which is why they were deleted).

  The ACE portal section that used to sit above the closing CTA has
  been REMOVED from this page on purpose. It moves to the logged-in
  side later. Do not restore it here.

  Do not reinstate from older versions of this page: the free
  written assessment, the GCSE Maths platform test link, the inline
  lead form (there is one enquiry route now, get-started.html),
  "matched within 48 hours", or the gold accent colour.
  ============================================================
```

## Block 2

```
PORTAL-DRIVEN. Every [data-ace] value below is replaced at runtime from
     GET /api/site-content, workshops[]: the next one whose end time is in the
     future. data-ace-until is the safety net, it hides this band once the
     workshop has finished even if the portal is unreachable. Change the date
     in the portal, not here. See docs/PORTAL_INTEGRATION.md
```
