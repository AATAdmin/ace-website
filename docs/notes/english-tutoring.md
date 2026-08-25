# Design notes: `english-tutoring.html`

Moved out of the page source so they are not visible in view-source on the
live site. These are the decisions for this page: what was deliberately left
out and why, what must not change, and which instructions conflicted.

**Read this before editing the page.**

## Block 1

```
============================================================
  NOTE FOR CLAUDE CODE, english tutoring
  ============================================================
  One of four subject pages, all built from the same template:
  maths-tutoring, english-tutoring, science-tutoring and
  11-plus-tutoring. Change the shared shape in all four or in
  none, or they will drift apart.

  The subject accent is set as three custom properties on <body>
  (--ac, --tint, --tintl) and nothing else in the file hardcodes a
  colour. To recolour a subject, change those three values.

  CARRY-OVER. Every CTA passes this page's subject through to
  get-started.html as query parameters, so the form arrives
  pre-filled. See docs/PORTAL_INTEGRATION.md.

  HYDRATION. Any class price, date or summary must carry a
  [data-ace] tag so assets/live.js can replace it from
  GET /api/site-content. Baked values are the fallback only.
  Keys available: class.price, class.priceShort, class.start,
  class.summary, price.oneToOne, price.oneToOneFull.

  No pass rates, no grade improvements, no student numbers and no
  testimonials on these pages. None have been supplied with
  consent, and inventing them is not an option.

  Do not reinstate: the free written assessment, the 15-minute
  consultation, "matched within 48 hours", or the gold accent.
  ============================================================
```
