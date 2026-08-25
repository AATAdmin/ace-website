# Design notes: `pricing.html`

Moved out of the page source so they are not visible in view-source on the
live site. These are the decisions for this page: what was deliberately left
out and why, what must not change, and which instructions conflicted.

**Read this before editing the page.**

## Block 1

```
============================================================
  NOTE FOR CLAUDE CODE, pricing
  ============================================================
  THE PAGE OPENS FROM THE CHOOSER at the top: lesson type, then
  stage, then the whole answer in ONE section. #stepAns holds the
  price, the frequency control, the totals and what is included, for
  whichever path was chosen. There is no separate calculator block
  and no class card below it: those were removed because they
  restated the same figures a scroll away. Group classes exist for GCSE only, so picking
  group + 11+ or A-Level shows a note and falls through to the
  one-to-one prices rather than a dead end.

  RATES COME FROM THE PORTAL. anchors() reads
  ACE_DATA.pricing.oneToOne.byLevel and falls back to BAKED_ANCHOR
  (11+ and GCSE £35 an hour, A-Level £45) only when the portal has
  not answered. Everything on the page derives from it: the answer
  column, the tier cards, the calculator, the chips in column 1 and
  the prose. The discount mechanics are shared, 5% per extra session
  a week to 20% at five, plus 5% for paying monthly upfront, so a new
  stage means one line in BAKED_ANCHOR and one key from the portal.
  The ace:data listener repaints a page that is already open.

  With JS off, a <noscript> rule shows both paths and every stage at
  once, so the prices are still readable.

  STALE PRICING WAS THE RISK ON THIS PAGE, and is now handled: it
  does not print figures, it COMPUTES them from anchors(), which
  prefers portal data. Before that was wired, a
  price change in the portal updated services.html and the subject
  pages but leaves this page, the one parents actually read for
  prices, out of date.

  TO FIX: have the endpoint return pricing.oneToOne.tiers and
  monthlyUpfrontDiscount, then build PLANS from window.ACE_DATA
  when it exists and fall back to the array when it does not. One
  change, and the cards and the calculator both follow the portal.
  Full brief, with the JSON shape and the audit of every remaining
  baked price on the site: docs/PRICING_FROM_PORTAL.md

  BOTH QUESTIONS SIT SIDE BY SIDE and the answer is a full-width band
  beneath them (#stepAns spans the grid), so the block reads as
  choose, choose, then price. Do not put the answer back beside the
  questions: it appeared before the second question was answered,
  which is what made the guidance unreadable.

  THE KPI ROW (#kpis) shows the alternatives WITHIN the chosen path,
  never the headline figure itself: one-to-one lists frequencies two
  to five, because the answer box already states one a week, and the
  group row lists the month, the hours and the term but not the
  hourly rate. Figures come from groupClass(), which reads
  ACE_DATA.classes, and from plans(), which reads anchors(). Nothing
  here reads a [data-ace] span: those were display text and were
  deleted with the panel they lived in.

  A MONTH IS FOUR CLASSES. groupMonthly() derives it from
  priceHourly x hoursPerWeek x 4 unless the portal sends
  priceMonthly. Never hardcode a monthly figure: an hourly rate and a
  monthly rate sitting side by side must agree, and £10 an hour for
  two hours a week is not £165 a month.

  THE TRIAL IS OFFERED ONCE ON THIS PAGE, in the answer box, where a
  parent has just seen a price. The nav carries it on every page. The
  closing band deliberately does NOT sell the trial: it is for the
  parent who does not know which option fits, so it routes to contact
  and the phone number instead. Two further blocks selling the trial
  were removed from this page. Do not add another.

  ONE BOOKING BUTTON, WITH THE TRIAL AS A CHECKBOX. This page is
  about what lessons cost, so it does not sell the free trial as a
  rival call to action. #wantTrial is ticked by default and simply
  sets start=trial in the link; unticking it sets start=lessons and
  the family goes straight to a schedule. Do not put a separate
  "Book a free trial" button back on this page.

  "BOOK THIS PACKAGE" It carries the exact choice (level, sessions a week,
  billing, or the class) into get-started.html, which pre-fills the
  form, so a parent who has already decided does not answer the same
  questions again. When the portal can take a registration, flipping
  PACKAGE_CHECKOUT.enabled sends the same button to /register with
  the same parameters. Never put a price in either URL.

  BUYING A PACKAGE IS BUILT BUT SWITCHED OFF. #ansBuy ("Register and
  set up this package") and packageUrl() are in place and produce the
  URL agreed in docs/PACKAGES_AND_SUBSCRIPTIONS.md. It is hidden
  because PACKAGE_CHECKOUT.enabled is false and the portal has no
  /register page yet, so enabling it now would send parents to a 404.

  TO TURN IT ON: set PACKAGE_CHECKOUT.enabled to true, and change
  .base if the portal path differs. That is the whole change. Check
  the parameter names against what the portal actually accepts first.

  A PRICE MUST NEVER TRAVEL IN THE URL. Send sessions and billing and
  let the portal price it. Do not add an amount parameter.

  The free trial stays the primary action either way. A parent who
  wants to try before paying must not have to find that route.

  EACH FIGURE HAS ONE HOME. The answer box states the price for the
  choice made. The KPI ladder states the OTHER frequencies, or the
  group month. The calculator states TOTALS ONLY, per month and per
  week, and deliberately no longer shows an hourly rate or a discount
  chip, because the ladder directly above it already does. The group
  term lives in the Saturdays panel, not in a KPI card. Adding a
  figure means deciding what it replaces.

  THE ANSWER BOX OWNS THE PRICE, and it is the ONLY place on the page
  a figure appears. The chooser options describe the format ("One
  tutor, one student", "Taught as a small group"), never a price:
  they used to read "From £28 an hour" beside an answer box saying
  £45, which is worse than repetition because the two disagreed.
  #stepAns states the figure and the discount rule once. Everything below it carries only detail it does
  not already give: the group card carries the day, the term dates and
  what is included, and the calculator carries the frequency ladder.
  Do not restate a price or the 5% rule below the answer box, in any
  path. That was the original complaint on this page.

  THERE ARE NO TIER CARDS. They restated the figures the answer box
  and the calculator already give, so a family read the same price
  three times on one screen. The calculator is now the only place
  the frequency ladder appears. Do not reinstate a static table.
  The anchors are real: £35/hr at one session a week down to £28/hr
  at five, 5% steps, and a further 5% for paying monthly upfront.

  Every CTA points at get-started.html, the single enquiry route.
  Do not reinstate "Start with a free assessment" or the 15-minute
  consultation.
  ============================================================
```

## Block 2

```
ONE booking button. The trial is a checkbox on it, not a rival
                 button: this page answers what lessons cost, and a parent who
                 wants a free lesson first can say so on the way through.
                 While PACKAGE_CHECKOUT.enabled is false the button goes to
                 get-started.html carrying the choice; flip the flag and it
                 goes to the portal's /register. Spec: docs/PACKAGES_AND_SUBSCRIPTIONS.md
```
