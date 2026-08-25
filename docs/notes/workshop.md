# Design notes: `workshop.html`

Moved out of the page source so they are not visible in view-source on the
live site. These are the decisions for this page: what was deliberately left
out and why, what must not change, and which instructions conflicted.

**Read this before editing the page.**

## Block 1

```
============================================================
  NOTE FOR CLAUDE CODE, portal-controlled event page
  ============================================================
  This whole page follows one workshop record from the portal.
  GET /api/site-content -> workshops[] -> the next one that has
  not finished. See docs/PORTAL_INTEGRATION.md

  Hydrated at runtime: the name, date, time window, countdown,
  the .ics calendar download, and the 'source' on registrations
  (which follows the workshop id, so November sign-ups do not
  file under September).

  NOT hydrated, because crawlers read them before scripts run.
  Publishing a genuinely NEW workshop needs a commit here for:
    - <title>, description, canonical
    - og: and twitter: tags
    - the EducationEvent JSON-LD block
    - data-ace-workshop-id and data-ace-until on <body>/<section>
    - the "Year 10 and Year 11" subhead and the form's year options
  Changing the date or capacity of an EXISTING workshop needs no
  commit at all.

  This page deliberately has no site nav and a slim footer: it is a
  standalone landing page, and the standard footer links to English
  and Science, which do not belong on a Maths-only advert.
  ============================================================
```
