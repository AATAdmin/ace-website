# Design notes: `get-started.html`

Moved out of the page source so they are not visible in view-source on the
live site. These are the decisions for this page: what was deliberately left
out and why, what must not change, and which instructions conflicted.

**Read this before editing the page.**

## Block 1

```
============================================================
  NOTE FOR CLAUDE CODE, the only enquiry route on the site
  ============================================================
  This form posts to POST /api/enquiry and must land on the
  portal's leads screen (Leads.jsx). The endpoint does not exist
  yet, so every submission currently shows the parent phone,
  WhatsApp and email instead. That is deliberate: it never reports
  success on a write that did not persist.

  Payload contract, field by field: docs/ENQUIRY_PAYLOAD.md
  Wider integration brief:          docs/PORTAL_INTEGRATION.md

  "MORE THAN ONE" OPENS A SECOND BOX. Choosing it in the Subject
  select reveals #fSubjects, a checkbox set, and the payload then
  carries both subject (comma-joined, for display) and subjects
  (an array, for the portal to iterate). A lead with more than one
  subject may need more than one tutor, so do not assume one.

  THE FREE TRIAL IS OPTIONAL. Step 1 asks how the family wants to
  start, and 'Straight into lessons' is a real choice, not a
  decoy. It arrives as startWith:'trial'|'lessons'. A lead with
  'lessons' should not be sent trial-booking copy; they have asked
  to begin properly. Do not remove the option or default the site
  back to trial-only.

  PACKAGE INTEREST. A parent can configure a package on pricing.html
  and still tick the free trial. They are not asked about money here,
  but PKG_INTEREST keeps what they chose from the query string, shows
  it in the carry-over line, and sends it as packageInterest. It is
  interest, never a plan: plan stays null on any trial booking. Do
  not turn it into an agreed price, and do not drop it, because it is
  what tells the portal what to offer after the trial.

  THE ONE-TO-ONE PLAN is asked in step 1: sessions a week and how
  they would like to pay. It is asked ONLY of families who chose to
  skip the trial and start lessons. A free trial is free, so anyone
  booking one sees #fTrialNote instead, saying there is nothing to
  pay and the package is worked out afterwards. Do not move these
  questions in front of a trial booking. It only appears for one-to-one, and the
  payload carries plan{sessionsPerWeek,billing,indicativeHourly,
  indicativeMonthly} or null. The figures are an ESTIMATE from the
  published rates, not an agreed price; the ANCHOR table in the
  script must match pricing.html.

  Three things in the payload that change how a lead is handled:
    - filledBy: 'parent' | 'student'. When 'student', contact holds
      a CHILD's details, not an adult's.
    - guardian: populated for student submissions. Must be
      contacted before any lesson is booked, so treat the lead as
      awaiting guardian confirmation, not ready to schedule.
    - over18: true only when a Year 13 student said they enrol on
      their own behalf. The one case where guardian is null
      legitimately.

  student.* is shaped to match the portal's New Student dialog so
  a lead can be promoted without retyping. Fee Plan is left out on
  purpose, it is an admin decision.

  The small group class option is portal-gated: it only appears for
  a (level, subject) pair that classes[] reports as enrolling.
  BAKED_GROUPS in the script is the fallback. Matching is on level
  and subject ONLY, never year: the GCSE Maths class takes Year 10
  and Year 11 alike, so do not add a year to the match.

  PRICES ARE HIDDEN ON A TRIAL BOOKING. While startWith is the free
  trial, the lesson-type pills read "One tutor, one student" and
  "Taught in a small group" instead of showing a rate, because a
  price beside a free thing makes it read as a purchase. syncPlan()
  owns the one-to-one pill, syncGroup() the group one. Do not put a
  rate back on either without checking wantsTrial().

  PRICES COME FROM THE PORTAL. anchors() reads
  ACE_DATA.pricing.oneToOne.byLevel ('11+', 'GCSE', 'A-Level') and
  falls back to BAKED_ANCHOR only when the portal has not answered.
  Everything else derives: bandFor() makes the pill's range from the
  anchor (five sessions a week is 20% off, so the bottom is 0.8x the
  full rate), and rates() makes the quote. Change a rate in the
  portal and the pill, the per-session figures and the estimate all
  move together. The ace:data event re-runs it on a page already
  open. NEVER hardcode a range: A-Level is £36–45, not £28–35, which
  is exactly the bug this replaced. The £10 group figure comes from
  classes[].priceHourly the same way. See
  docs/PRICING_FROM_PORTAL.md, which audits every baked price on
  the site and says what the endpoint needs to return.

  EMAIL NOTIFICATIONS ARE NOT BUILT, and are yours. Nothing on this
  site sends an email, and it cannot: it is static and the repo is
  public, so an SMTP credential here would be readable by anyone.
  When POST /api/enquiry exists, the portal owns every message:

    Enquiry received   family: confirmation naming what they chose
                       and what happens next. ACE: the full payload.
    Trial booked       time, joining link, what to have ready.
    Day before         reminder, to the family.
    After a trial      what the tutor found, and how to continue.
    Rescheduled        or cancelled, to both sides.
    Report saved       the write-up is ready, to the parent.
    Package booked     what was agreed, and when billing starts.

  Two rules. The site never sends: no third-party form service, no
  SMTP key, no client-side email API. And the confirmation must match
  what was submitted, so a trial booking is never sent a payment
  schedule and plan:null is never read as a price of zero. Table and
  triggers: docs/PORTAL_INTEGRATION.md.

  Do not add a form to contact.html. This is the single route.
  ============================================================
```
