# Portal integration, three connections

Everything the marketing site needs from the portal, in one place. The site
is static on Cloudflare Pages, so it can only read JSON and post JSON. It
has no server of its own.

Nothing here is built yet. The site works without all of it, using values
baked into the HTML, so this is an upgrade path and not a blocker.

| # | Connection | Direction | Endpoint | Status |
|---|---|---|---|---|
| 1 | Events and classes drive the site | portal to site | `GET /api/site-content` | not built |
| 2 | Free trial form files a lead | site to portal | `POST /api/enquiry` | not built |
| 3 | Log in and portal links | site to portal | normal links | live |

Full contracts: `docs/PORTAL_CONTENT_API.md` (1) and
`docs/ENQUIRY_PAYLOAD.md` (2).

---

## 1. Events in the portal control the website

The founder adds a workshop or a class in the portal, and the site changes
without a deploy. This is the piece to build first, because it is the one
that stops the site advertising a date that has passed.

**What the site already reads.** `assets/live.js` fetches
`GET /api/site-content` on every page, caches it in `sessionStorage` for
ten minutes, and swaps tagged values in place. If the fetch fails the
baked HTML stands, so a portal outage never breaks a page.

**Where it lands on the site:**

- `index.html`, the workshop band. Reads `workshops[]` and shows the next
  one that has not finished: day, month, name, time window, link.
  Carries `data-ace-until`, so the band hides itself once the finish time
  passes even if the portal is unreachable.
- `workshop.html`, the whole landing page. Name, date, time window,
  countdown, calendar download and the `source` on registrations all
  follow the portal record.
- `index.html`, the course chooser. `classes[]` decides whether a small
  group class is offered for a given stage, and at what price.
- `get-started.html`, the lesson type step. The group class option only
  appears for a (level, subject) pair the portal says is enrolling.
- `pricing.html`, the group class figure. Tagged `data-ace="class.price"`
  but **not yet hydrated**, so this one still needs wiring.

**Admin screens needed in the portal:** create and publish a workshop
(name, subject, year groups, start, end, capacity, url), and set a class
to enrolling, full, running or finished.

**What hydration cannot reach.** `<title>`, the `og:` and `twitter:` tags
and the `EducationEvent` JSON-LD are read by crawlers before any script
runs. Publishing a genuinely new workshop therefore still needs a small
commit to `workshop.html` for those, plus `data-ace-workshop-id` and
`data-ace-until`. Changing the date or capacity of an existing workshop
needs no commit.

---

## 2. The free trial form files a lead

`get-started.html` is the only enquiry route on the site. It posts JSON to
`POST /api/enquiry`, which should create a record on the portal's leads
screen (`Leads.jsx`).

The payload is deliberately shaped like the portal's New Student dialog,
so a lead can be promoted without retyping: `student.fullName`,
`yearGroup`, `school`, `level`, `lessonType`, `subject`. Fee Plan is left
out on purpose, since it is an admin decision.

Three things in the payload that change how a lead should be handled:

- **`filledBy`** is `parent` or `student`. When it is `student`, `contact`
  holds a child's details, not an adult's.
- **`guardian`** is populated for a student submission and must be
  contacted before any lesson is booked. Treat the lead as awaiting
  guardian confirmation, not ready to schedule.
- **`over18`** is `true` only when a Year 13 student said they are
  enrolling on their own behalf. That is the single case where a student
  submission legitimately arrives with `guardian: null`.

Until the endpoint exists, every submission shows the parent phone,
WhatsApp and email, so enquiries arrive by those routes instead of being
lost. **Do not make the endpoint return 2xx on a write that did not
persist**, or a parent will be told their enquiry arrived when it did not.

CORS must allow `https://aceacademictutors.com` and
`https://www.aceacademictutors.com`, and answer the preflight `OPTIONS`.
Without it every submission fails, silently from the visitor's side.

---

## 3. Log in and portal links

Plain links, already live, no work needed unless the URLs change:

| Where | Link | Goes to |
|---|---|---|
| Header, every page | Log in | `https://portal.aceacademictutors.com` |
| Mobile menu | Log in | `https://portal.aceacademictutors.com` |
| Footer | Family &amp; tutor portal | `https://portal.aceacademictutors.com` |
| Home, portal section | Students and parents | `portal.html` then the portal |
| Home, portal section | Tutors | `become-a-tutor.html` |

Two notes. The portal is on Vercel and the site is on Cloudflare Pages, so
these are cross-origin links and not a shared session; a parent clicking
Log in will land on the portal's own sign-in. And `portal.html` on the
marketing site is an explainer page, not the portal itself, so keep the
distinction when editing nav labels.

---

## Order I would build these in

1. `POST /api/enquiry`, because enquiries are currently arriving only by
   phone and email and the leads screen stays empty.
2. `GET /api/site-content` with `workshops[]`, so a finished workshop
   stops advertising itself.
3. `classes[]` in the same endpoint, so opening a second group class is a
   portal action rather than a code change.
4. Retire the last baked prices. `pricing.html` computes its tiers from
   hardcoded anchors, so it needs `pricing.oneToOne.tiers` from the
   endpoint rather than a tag. Full audit and JSON shape:
   `docs/PRICING_FROM_PORTAL.md`.

---

## Package purchase and subscriptions

Not built, and not the site's job. A parent resolves a full package on
`pricing.html` (level, subject, sessions a week, billing) but there is nothing
to buy at the end of it, so every route ends at an enquiry. Turning that into a
registration, a first payment and later a subscription is portal work.

Spec, including the URL shape the site would use and the rules on it:
`docs/PACKAGES_AND_SUBSCRIPTIONS.md`. Assigned to Claude Code.

The only site change it needs is the CTA hrefs on `pricing.html`.

---

## Legal review, outstanding

`privacy.html`, `terms.html` and `safeguarding.html` are unreviewed template
text. All three carry `&lt;meta name="robots" content="noindex, follow"&gt;` and are
out of `sitemap.xml` until a human has read them.

Two things to settle in that review, both left deliberately untouched:

1. **The retired offer survives in the legal copy.** `privacy.html` section 3
   says "arrange your free consultation", and `terms.html` mentions a
   consultation three times. The free 15-minute consultation no longer exists;
   the site offers a free trial lesson, and the trial itself is now optional
   (`startWith: 'trial' | 'lessons'`). The wording needs updating by someone
   who can approve legal text, not by find-and-replace.
2. **The privacy notice should describe the enquiry payload as it actually is.**
   It predates `filledBy`, `guardian` and `over18`, so it does not cover the
   case where a Year 13 student enrols on their own behalf. See
   `docs/ENQUIRY_PAYLOAD.md`.

Once reviewed, remove the noindex tags and add all three back to
`sitemap.xml`.

---

## Email notifications, not built

The marketing site sends no email and cannot: it is static, and the repo is
public, so an SMTP credential in it would be readable by anyone. Every message
below belongs to the portal, fired by its own events.

| Trigger | To the family | To ACE |
|---|---|---|
| Enquiry received (`POST /api/enquiry`) | Confirmation naming what they chose, and what happens next | The full payload, linked to the lead |
| Free trial booked | Time, joining link, what to have ready | Assignment to a tutor |
| Day before a trial or lesson | Reminder with the joining link | — |
| After a trial | What the tutor found, and how to continue | Outcome, so the lead can be closed |
| Rescheduled or cancelled | New time, or confirmation | Same |
| Report saved after a lesson | The write-up is ready in the portal | — |
| Package or class booked | What was agreed, and when billing starts | Same |

Two rules:

1. **The site never sends.** No third-party form service, no SMTP key, no
   client-side email API. The site posts to the portal; the portal decides what
   to send.
2. **The message must match what was submitted.** The payload carries
   `startWith`, `lessonType`, `plan` and `packageInterest` (see
   `docs/ENQUIRY_PAYLOAD.md`). A trial booking must never receive a payment
   schedule, and `plan: null` must never be read as a price of zero.

Until this exists, the site tells families we will be in touch and that promise
is kept by hand.
