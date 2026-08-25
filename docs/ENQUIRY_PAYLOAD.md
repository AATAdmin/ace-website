# Enquiry payload, website to portal

The website's Get started form posts here. It does not exist yet, so every
submission currently takes the failure path and the parent is shown phone,
WhatsApp and email. Nothing is silently lost, but nothing reaches the
leads screen either.

    POST https://portal.aceacademictutors.com/api/enquiry
    Content-Type: application/json

## `startWith`

`'trial'` or `'lessons'`. The family's own choice, asked in step 1 of the
form. `'trial'` is the default and the recommended route, but
`'lessons'` is a real option: the family has said they do not want a
trial and would like to begin properly.

Handle the two differently. A `'lessons'` lead should not be sent
trial-booking copy, and should go straight to scheduling and fee plan.

## Body

```json
{
  "source": "website-get-started",
  "submittedAt": "2026-08-24T19:04:11.482Z",
  "student": {
    "fullName": "Aisha Rahman",
    "yearGroup": "Year 10",
    "school": "Sacred Heart of Mary",
    "level": "GCSE",
    "lessonType": "Small group class",
    "subject": "Maths"
  },
  "filledBy": "parent",
  "contact": {
    "name": "Nadia Rahman",
    "email": "nadia@example.com",
    "phone": "07700 900123"
  },
  "guardian": null,
  "notes": "Predicted a 5, wants a 7. Struggles with algebra.",
  "consent": true
}
```

### Field notes

- `student.fullName`, `yearGroup`, `level`, `lessonType`, `subject` are
  required by the form. `school` and `notes` may be empty strings.
- `level` is one of `11+`, `GCSE`, `A-Level`.
- `lessonType` is `One-to-one` or `Small group class`. The group option is
  hidden entirely when `/api/site-content` reports no enrolling group
  class, so it can only arrive when one exists.
- `consent` is always `true` on arrival, since the checkbox is required.
  Store it with `submittedAt` as the record of consent.
- `filledBy` is `parent` or `student`. **When it is `student`, `guardian`
  is populated and `contact` holds the student's own details**, so do not
  assume `contact` is an adult. `guardian.name` and `guardian.phone` are
  required by the form in that case; `guardian.email` is optional.
  When `filledBy` is `parent`, `guardian` is `null` and `contact` is the
  parent.
- `over18` is `true` only when a Year 13 student ticked the box saying they
  are enrolling on their own behalf. That is the one case where a student
  submission arrives with `guardian: null`. Every other school year
  requires a guardian.
- **Safeguarding:** a student-submitted lead must not be progressed to a
  booked lesson until the guardian has been contacted. The site tells the
  student this explicitly, so the portal should reflect it, e.g. flag the
  lead as awaiting guardian confirmation rather than ready to schedule.
- `source` identifies the form. Other values in use: `website-home-assessment`
  (home page chooser) and `workshop-<id>` (workshop registrations, where the
  id comes from the portal's own workshop record).

### These map onto the portal's New Student screen

`student.*` is deliberately shaped like the fields on that dialog, so a
lead can be promoted to a student without re-typing: Full Name, Year
Group, School, Level, Lesson Type. Fee Plan is left to the portal, since
it is an admin decision and the parent should not be choosing it.

## Response contract

- **2xx** means saved. The website shows the confirmation. Return a body
  if you like; the site ignores it.
- **Anything else, including a network failure or a CORS rejection**,
  shows the contact fallback. Do not return 200 on a write that did not
  persist, or a parent will be told their enquiry arrived when it did not.

## CORS

`Access-Control-Allow-Origin` must include `https://aceacademictutors.com`
and `https://www.aceacademictutors.com`, and the endpoint must answer the
preflight `OPTIONS`. Without it every submission fails, and it fails
quietly from the visitor's point of view.

## Spam

The form has no captcha. If that becomes a problem, prefer a server-side
check on the portal over adding a third-party widget to a static page.

---

## plan

Present only when `student.lessonType` is `One-to-one` **and**
`startWith` is `lessons`. `null` otherwise.

`null` therefore means one of two things, and `startWith` tells you which:

- `startWith: 'trial'` — the family is booking a free trial. They were
  deliberately not asked about sessions or payment, because the trial is free
  and asking makes it feel like a purchase. **Agree the package after the
  trial, not before.**
- `startWith: 'lessons'` with `lessonType: 'Small group class'` — the group
  class has one fixed price, so there is nothing to choose.

Both questions are required once asked, so a lead with
`startWith: 'lessons'` and `lessonType: 'One-to-one'` always carries a plan.

```json
"plan": {
  "sessionsPerWeek": 3,
  "billing": "monthly-upfront",
  "indicativeHourly": 31.5,
  "indicativeMonthly": 378
}
```

| Field | Values |
|---|---|
| `sessionsPerWeek` | 1 to 5 |
| `billing` | `monthly-upfront` \| `billed-monthly` \| `null` |
| `indicativeHourly` | number, an estimate |
| `indicativeMonthly` | number, an estimate |

**The figures are an estimate, not an agreed price.** They are computed on the
site from the published rates: 11+ and GCSE start at £35 an hour, A-Level at
£45, 5% off per extra session a week to 20% at five, and a further 5% for
paying the month upfront. The site says as much next to the question.

Two consequences for the portal:

1. **Do not treat `indicativeMonthly` as a quote.** Recompute from the real
   rate table before anything is billed. If the site's anchors have drifted
   from the portal's, the portal is right.
2. **`billing` tells you how to open the conversation.** A family who chose
   `monthly-upfront` has already accepted the 5% discount terms; a family who
   chose `billed-monthly` has not, and should not be pushed to.

Until `/api/site-content` carries rates, the anchors are duplicated in
`pricing.html` and `get-started.html`. See `docs/PRICING_FROM_PORTAL.md`.

---

## `packageInterest`

Present when `startWith` is `trial` **and** the family arrived from
pricing.html having already configured a package. `null` otherwise.

```json
{ "sessionsPerWeek": 5, "billing": "monthly-upfront", "source": "pricing-page" }
```

This is **interest, not a commitment**. `plan` is still `null` on a trial
booking, because a free trial is free and nobody is asked to agree a package
before it. But the parent did choose one on the pricing page, so the portal
should know what they were looking at.

Use it to make the after-trial conversation concrete: this family was pricing
five sessions a week paid monthly upfront, so quote that, rather than starting
the conversation from nothing.

Do not treat it as an agreed schedule, and do not bill from it.
