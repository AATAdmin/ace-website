# Package purchase and subscriptions

**Status: not built. This is a handoff spec for Claude Code, to be implemented
in the `ace-portal` repo once the site is handed over.**

Nothing on the marketing site buys anything today. Every route ends at
`get-started.html`, which posts an enquiry and hands off to a human. This
document describes the piece that turns a chosen package into a registration
and, later, a subscription.

Do not build any of this into the marketing site. It is a static site on
Cloudflare Pages with no server, so it cannot hold a card, a customer record or
a webhook. The site's job is to carry the choice; the portal's job is to charge
for it.

---

## What the parent is choosing

The pricing page already resolves a complete package before any link is
clicked. For one-to-one that is:

| Field | Values | Where it comes from |
|---|---|---|
| `level` | `11+`, `Pre-GCSE`, `GCSE`, `A-Level` | step 2 on `pricing.html` |
| `subject` | `Maths`, `English`, `Science`, `11+` | asked on `get-started.html` |
| `sessions` | `1`-`5` a week | the frequency control |
| `billing` | `Monthly`, `Monthly upfront` | the upfront checkbox |
| `hourly` | derived | `rate x (1 - 0.05 x (sessions - 1))`, then 5% off if upfront |
| `monthly` | derived | `hourly x sessions x 4` |

For the group class it is `level`, `subject`, and the class's own
`priceHourly` and `hours`. See `docs/PRICING_FROM_PORTAL.md` for the rates
contract, which the portal already owns.

## What the site should send

One URL, carrying the resolved package as query parameters:

```
https://portal.aceacademictutors.com/register
  ?level=A-Level
  &subject=Maths
  &sessions=5
  &billing=upfront
  &type=one-to-one
  &source=website-pricing
```

Two rules on that link:

1. **Never send a price.** Send `sessions` and `billing` and let the portal
   price it from its own rates. A price in a URL is a price a parent can edit.
2. **Treat every parameter as untrusted.** Validate against the real option
   lists server side, exactly as `get-started.html` already does with its
   carry-over parameters, and fall back to asking rather than guessing.

## What the portal needs to do

1. **Accept the package on `/register`** and pre-fill the registration form
   from it, so a parent who has already chosen five sessions a week does not
   choose again.
2. **Create the student and the parent record**, linked, with the package
   attached. A Year 13 student may be registering on their own behalf, so the
   guardian is optional in exactly one case. See `docs/ENQUIRY_PAYLOAD.md`,
   which already carries `filledBy`, `guardian` and `over18`.
3. **Take payment for the first month.** A package of N sessions a week is
   billed as four lessons per weekly session per month. Whether the first
   charge is taken at registration or after the free trial is a business
   decision, not a technical one, and the founder should settle it before this
   is built.
4. **Leave the trial alone.** A free trial booking must not enter a payment
   flow at all. The site deliberately does not ask a trial booker about
   sessions or payment, so those leads arrive with `plan: null` and
   `startWith: 'trial'`. Agree the package after the trial.

## Subscriptions, phase two

Recurring billing is the second step, not the first. The order that de-risks it:

1. **One-off month first.** Prove registration, pricing and the first charge
   before anything recurs.
2. **Then convert to a subscription** for families who continue, at the same
   monthly figure, with the sessions-per-week count as the quantity so a change
   in frequency is a quantity change rather than a new plan.
3. **A subscription must be pausable.** Tutoring stops for exams, holidays and
   illness. A plan that can only be cancelled will be cancelled.
4. **Price changes must not silently reprice existing families.** When a rate
   changes in the portal, existing subscriptions keep their agreed rate until
   the parent is told. The portal owns rates for the site's display; it must
   not treat that as authority to re-bill.

## What the site needs from you, when this lands

Only one thing: **the URL shape you settle on.** Give the founder the final
parameter names and the site's package CTAs can be pointed at it. Currently
they point at `get-started.html`, which is the right default while there is
nothing to buy.

If the shape above is what you build, no site change is needed beyond swapping
the CTA hrefs, which is a one-line edit per path on `pricing.html`.
