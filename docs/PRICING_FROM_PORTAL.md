# Pricing comes from the portal, not the HTML

**Status: done.** Every price a visitor can see on the marketing site is now set
in the portal, at **Website -> Prices**, and reaches the live site through
`/api/public/content` within about a minute. No commit, no deploy.

It was not always so, and the shape of the old problem explains most of the
decisions below: prices were baked into the HTML, some of it tagged for
hydration and some not, and `pricing.html` and `get-started.html` each computed
their own ladder. A price change updated some pages and silently left others
stale, which is the worst of the three possible states.

This note is the contract: what the endpoint returns, where the numbers are
edited, and the two rules that keep it from going back.

## What already works

`assets/live.js` fetches `GET /api/public/site-content` on every page, caches it in
`sessionStorage` for ten minutes, and replaces the text of any `[data-ace]`
element. If the fetch fails, the baked HTML stands, so a portal outage never
breaks a page. Keys it already handles:

| Key | Renders |
|---|---|
| `class.price` | "£10 an hour" |
| `class.priceShort` | "£10" |
| `class.start` | "12 September" |
| `class.startDay` / `class.startMon` | "12" / "Sept" |
| `class.summary` | "GCSE Maths, Years 10 and 11, starting 12 September" |
| `price.oneToOne` | "£28–35" |
| `price.oneToOneFull` | "£28–35 an hour" |
| `price.monthlyDiscount` | "5%" (the further discount for paying a month upfront) |

Tagged and working: `services.html` (class price, class summary, one-to-one
range), the subject pages' class band, `pricing.html`'s group figure.

## Where each figure now comes from

| Figure | Source | Mechanism |
|---|---|---|
| One-to-one hourly rate, per level | `web_price_11plus` / `_pre_gcse` / `_gcse` / `_a_level` | `byLevel` -> `ACE_PRICE.rateFor()` |
| Discount per extra lesson a week | `web_discount_2` … `web_discount_5` | `tiers` -> `ACE_PRICE.ladder()` |
| Monthly-upfront discount | `web_price_monthly_discount` | `monthlyUpfrontDiscount` -> `ACE_PRICE.upfront()` and the `price.monthlyDiscount` tag |
| The advertised range in prose | derived, never stored | `ACE_PRICE.bandFor()` and `price.oneToOne` |
| The group class | `web_group_*` | `classes[0]` -> the `class.*` tags |

All of them are rows in `app_settings`, scoped to the org, seeded by migrations
`20261147` and `20261148` to exactly what the site said at the time -- so wiring
this up changed no published price, it only moved where the number is edited.

Discounts are stored as **rates** (`0.05`), not percentages (`5`). The portal
screen shows percent and converts at the input, so there is one convention in
the database and no chance of a `5` being read as 500%.

## What the endpoint returns

The site reads `pricing` and `classes`. Both now come from the portal; this is
the live shape, not a proposal.

```json
{
  "pricing": {
    "oneToOne": {
      "unit": "hour",
      "byLevel": { "11+": 35, "Pre-GCSE": 35, "GCSE": 35, "A-Level": 45 },
      "tiers": [
        { "sessionsPerWeek": 1, "discount": 0 },
        { "sessionsPerWeek": 2, "discount": 0.05 },
        { "sessionsPerWeek": 3, "discount": 0.10 },
        { "sessionsPerWeek": 4, "discount": 0.15 },
        { "sessionsPerWeek": 5, "discount": 0.20 }
      ],
      "min": 28,
      "max": 45,
      "monthlyUpfrontDiscount": 0.05
    }
  },
  "classes": [
    {
      "mode": "group", "status": "enrolling",
      "level": "GCSE", "subject": "Maths", "year": "Years 10 and 11",
      "priceHourly": 10, "hoursPerWeek": 2, "capacity": 10,
      "startDate": "2026-09-12", "weekday": "Saturday",
      "runsUntil": "2027-07-31"
    }
  ]
}
```

### `tiers` carries a discount, not an hourly rate

An earlier draft of this document specified `{ sessionsPerWeek, hourly }`. That
was wrong, and the reason is worth keeping: there are four levels, so an hourly
ladder is four ladders, and the moment one of them is edited without the others
the page quotes a discount that does not exist at that level. A discount
composes with `byLevel` instead, so one ladder serves every level and there is
exactly one number per commercial decision.

One session a week is a rung with `discount: 0` rather than an omission. It is
the full rate by definition, and a settable "0%" would let the anchor price
disagree with itself.

### The ladder is honoured only whole

`live.js` accepts a live ladder only when it is the same five rungs in the same
order, and falls back to the baked one otherwise. The tier cards and the
segmented control are indexed by position, so a four-rung ladder would shift
every card one place to the left rather than fail visibly.

### One implementation, in `live.js`

`pricing.html` and `get-started.html` both quote one-to-one rates. Each used to
work them out itself -- one from a table of tiers, the other from the formula
"5% off per extra session" -- so they agreed only for as long as the ladder
happened to be a flat 5% a step. The first non-linear ladder would have made the
two pages quote the same family different numbers.

Both now read `window.ACE_PRICE`, defined at the top of `live.js`, which is
loaded synchronously above every page script:

```js
ACE_PRICE.rateFor(level)                  // full hourly rate
ACE_PRICE.ladder()                        // [0, .05, .10, .15, .20]
ACE_PRICE.discountFor(sessionsPerWeek)
ACE_PRICE.upfront()                       // monthly-upfront discount
ACE_PRICE.hourly(level, sessions, upfront)// what a family actually pays
ACE_PRICE.bandFor(level)                  // { lo, hi } for prose
ACE_PRICE.pct(rate)                       // "5%"
```

**Never compute a price outside it.** `qa/price-ladder-sync.mjs` in the portal
repo asserts the two pages agree at every rung on a deliberately non-linear
ladder, and fails on any script error either page throws while painting.

## Build order, and where it got to

1. ~~**Return `pricing.oneToOne.tiers` and `monthlyUpfrontDiscount`.**~~ Done.
   `readPricing()` in the portal's `api/public/content.js` sends both, from
   `app_settings` keys prefixed `web_`.
2. ~~**Tag the `get-started.html` pill descriptions.**~~ Done differently, and
   better: the pills are painted by the page's own script through `ACE_PRICE`,
   so they follow a portal change without a `data-ace` round trip. The tags are
   still the right mechanism for prose, and `price.monthlyDiscount` was added
   for the "a further 5% off" sentences.
3. ~~**Add an admin screen.**~~ Done. Portal -> Website -> Prices
   (`src/features/siteContent/PricingPanel.jsx`). Four level rates, the
   four-rung ladder, the monthly-upfront discount and the advertised group
   class, with a preview of what a parent will be quoted.

### What is still baked, and will go stale

The `<meta name="description">` tags and the FAQPage JSON-LD on `pricing.html`
carry literal figures ("from £35 an hour, falling to £28... a further 5%").
Those are served to crawlers before any script runs, so `live.js` cannot fix
them, and `bake.mjs` does not touch them today. **A price change in the portal
will not update them.** Either add a marker region to `bake.mjs` the way the FAQ
regions work, or accept that they need a hand edit when a headline price moves.

## Two rules to keep

- **Never remove a baked fallback.** They are what the page shows when the portal
  is unreachable, and a page with no price is worse than a page with a slightly
  old one.
- **Every new price, anywhere on the site, gets a `[data-ace]` tag when it is
  written.** The stale-price problem comes back the moment one is added
  untagged. If a needed key does not exist yet, add it to `live.js` rather than
  leaving the figure bare.

Related: `docs/PORTAL_CONTENT_API.md` for the full response shape,
`docs/PORTAL_INTEGRATION.md` for the three site-to-portal connections.

---

## One-to-one rates are per level, not one range

Added after a real bug: the Get started form showed **£28–35 an hour** for
every level, including A-Level, whose range is **£36–45**. The range was a
hardcoded string, so it could not follow the level the family picked and could
not follow a price change in the portal either.

### What the endpoint should send

```json
{
  "pricing": {
    "oneToOne": {
      "unit": "hour",
      "byLevel": { "11+": 35, "GCSE": 35, "A-Level": 45 }
    }
  }
}
```

`byLevel` is **the full hourly rate at one session a week**, per level. It is
the only figure the portal needs to send. Everything the site displays is
derived from it:

| Shown | Derived how |
|---|---|
| The pill's range for a chosen level | `0.8 x rate` to `rate` (five sessions a week is 20% off) |
| The sitewide range on other pages | cheapest level at 0.8x, to dearest at full rate |
| Per-session figures and the estimate | `rate x (1 - 0.05 x (sessions - 1))`, then 5% off for paying monthly upfront |

Send `min` and `max` alongside `byLevel` only to override the displayed
range editorially. If they are absent the site computes them.

### How a price change reaches the site

1. The rate changes in the portal.
2. `live.js` fetches `/api/public/site-content`, sets `window.ACE_DATA`, updates
   every `[data-ace="price.*"]` element, then fires `ace:data`.
3. `get-started.html` listens for `ace:data` and re-runs `syncPlan()`, so the
   pill range and the quote update on a page that is already open.

No code edit, no deploy. The baked figures stay as the no-JavaScript fallback
and must not be deleted.

### The rule

Never write a price range as a literal string. Derive it from the rates, so
one number changing in the portal cannot leave a second number stale.

---

## A group class is scoped by level and subject, not by year group

The GCSE Maths class takes Year 10 and Year 11 students alike, because they sit
the same GCSE. `year` on a `classes[]` entry is **display text only**: it is
shown after the class name and never used to decide who is eligible.

The site matches a family to a class on `(level, subject)`. Do not filter on
year anywhere, and do not put a year in a `get-started.html` carry-over link
for a group class, or a Year 11 parent will arrive at the form pre-set to
Year 10.
