# Pricing must come from the portal, not the HTML

**For Claude Code.** Every price on the marketing site is currently baked into
the HTML. Some of it is already tagged for hydration, some is not, and one page
computes its own figures in JavaScript. That means a price change in the portal
updates some pages and silently leaves others stale, which is the worst of the
three possible states.

This note lists every remaining baked price, what the endpoint needs to return,
and the order to do it in.

## What already works

`assets/live.js` fetches `GET /api/site-content` on every page, caches it in
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

Tagged and working: `services.html` (class price, class summary, one-to-one
range), the subject pages' class band, `pricing.html`'s group figure.

## What is still baked

Audited across all 15 pages. These are the untagged prices:

**`pricing.html`** is the important one. It does not just print figures, it
**computes** them: a `PLANS` array in the inline script holds the £35 to £28
anchors, derives every per-session tier, applies the 5% monthly discount, and
drives the calculator. So the page cannot simply be tagged; it needs the anchors
themselves to come from the endpoint.

- `£35` and `£28` anchors in `PLANS`
- the derived monthly figures (`£378`, `£94.50` appear in the baked HTML)
- the 5% monthly-upfront discount rate

**`index.html`** — `£10` and `£28–35` inside the course chooser's JavaScript
(`BAKED_GROUPS`, `rate()`). These already prefer `window.ACE_DATA` when it
exists, so they degrade correctly; they are the fallback, not a bug. Leave them.

**`get-started.html`** — `£10` and `£28–35` in the lesson-type pill descriptions
and `BAKED_GROUPS`. Same pattern as index: fallbacks. Worth tagging the pill
text so a live price shows there too.

**`become-a-tutor.html`** — the only `£28-35` on that page is inside an HTML
comment warning not to imply the parent rate is what a tutor is paid. Not
displayed. Leave it alone.

## What the endpoint needs to return

The site reads `pricing` and `classes`. To retire the last baked figures,
`pricing` needs the anchors rather than only the range:

```json
{
  "pricing": {
    "oneToOne": {
      "min": 28,
      "max": 35,
      "unit": "hour",
      "tiers": [
        { "sessionsPerWeek": 1, "hourly": 35 },
        { "sessionsPerWeek": 2, "hourly": 33 },
        { "sessionsPerWeek": 3, "hourly": 31 },
        { "sessionsPerWeek": 4, "hourly": 30 },
        { "sessionsPerWeek": 5, "hourly": 28 }
      ],
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

The tier list matters. `pricing.html` currently derives the middle tiers by
interpolation, and if the business ever wants a non-linear ladder the site will
be wrong in a way nobody notices.

## Order to build in

1. **Return `pricing.oneToOne.tiers` and `monthlyUpfrontDiscount`.** Then change
   `pricing.html` so `PLANS` is built from `window.ACE_DATA` when present and
   falls back to the current array when not. One change, and the whole page plus
   the calculator follow the portal.
2. **Tag the `get-started.html` pill descriptions** with `class.price` and
   `price.oneToOneFull`.
3. **Add an admin screen** for the one-to-one ladder and the group class, so a
   price change is a portal action and never a commit.

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
2. `live.js` fetches `/api/site-content`, sets `window.ACE_DATA`, updates
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
