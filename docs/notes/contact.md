# Design notes: `contact.html`

Moved out of the page source so they are not visible in view-source on the
live site. These are the decisions for this page: what was deliberately left
out and why, what must not change, and which instructions conflicted.

**Read this before editing the page.**

## Block 1

```
============================================================
  NOTE FOR CLAUDE CODE, read before diffing this file
  ============================================================
  This page was rebuilt from scratch as a pure contact page. The
  multi-step enquiry form that used to live here is DELIBERATELY
  REMOVED, and that includes your submitLead()/finish() fix from
  commit ea76a20.

  This is not a regression and must not be reverted.

  Reason: the site now has ONE enquiry route, get-started.html.
  Two competing forms on one site meant two payload shapes, two
  places to fix, and a parent choosing between them. get-started.html
  uses the same fail-loud pattern you built: it awaits the POST,
  checks response.ok, and shows phone, WhatsApp and email on any
  failure, so a lost enquiry is never reported as success.

  Do NOT re-add a form to contact.html.

  Where the moved parts now live:
    - enquiry form + payload ....... get-started.html
    - payload contract ............. docs/ENQUIRY_PAYLOAD.md
    - portal-driven content ........ docs/PORTAL_CONTENT_API.md

  Also retired site-wide, so do not reinstate from older pages:
    - the free 15-minute consultation (replaced by a free trial
      lesson: one full hour, free of charge, every subject and stage)
    - the free written assessment, including the GCSE Maths
      platform test link
    - "matched within 48 hours"
    - the gold accent colour (--gold / --gold-soft are deleted from
      assets/site.css; the palette is teal, cream and ink only)
  ============================================================
```
