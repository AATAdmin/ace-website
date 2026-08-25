# Portal-driven website content

The marketing site is static (Cloudflare Pages, no server). Volatile
content is baked into the HTML at author time **and** fetched from the
portal at runtime, so the site is correct in three situations:

1. **No JavaScript.** The baked HTML renders. Values are whatever was
   last committed.
2. **Portal unreachable.** The baked HTML renders, and any workshop whose
   finish time has passed is hidden by `data-ace-until`.
3. **Normal.** `assets/live.js` fetches the endpoint below and replaces
   the baked values in place.

The site never blocks on the portal and never shows a loading state.

## Endpoint

    GET https://portal.aceacademictutors.com/api/site-content

- Public, unauthenticated, read only. It must expose **nothing** that is
  not already public on the website: no names, no pupil data, no
  finance. Only what a visitor should read.
- `Access-Control-Allow-Origin` must include `https://aceacademictutors.com`
  and `https://www.aceacademictutors.com`. Without CORS the fetch fails
  silently and the site falls back to baked values.
- `Cache-Control: public, max-age=300` is plenty. The site also caches in
  `sessionStorage` for 10 minutes.

## Response shape

```json
{
  "updated": "2026-08-13T09:00:00Z",
  "workshops": [
    {
      "id": "gcse-maths-head-start-2026-09-05",
      "name": "The GCSE Maths Head Start",
      "subject": "Maths",
      "years": ["Year 10", "Year 11"],
      "start": "2026-09-05T10:00:00+01:00",
      "end": "2026-09-05T11:30:00+01:00",
      "capacity": 30,
      "placesLeft": 30,
      "free": true,
      "url": "workshop.html",
      "published": true
    }
  ],
  "classes": [
    {
      "id": "gcse-maths-2026",
      "name": "GCSE Maths",
      "subject": "Maths",
      "stage": "gcse",
      "year": "Years 10 and 11",
      "mode": "group",
      "priceHourly": 10,
      "priceMonthly": null,
      "startDate": "2026-09-12",
      "weekday": "Saturday",
      "hoursPerWeek": 2,
      "runsUntil": "2027-07-31",
      "capacity": 10,
      "placesLeft": 4,
      "status": "enrolling"
    }
  ],
  "assessments": [
    {
      "stage": "gcse",
      "subject": "Maths",
      "minutes": 30,
      "url": "https://portal.aceacademictutors.com/assessment/gcse-maths",
      "live": true
    }
  ],
  "pricing": {
    "oneToOne": { "min": 28, "max": 35, "unit": "hour" },
    "monthlyUpfrontDiscount": 0.05
  }
}
```

### Rules the site applies

- **Which workshop shows.** The next one where `published !== false` and
  `end` is in the future, earliest first. Everything else is ignored, so
  a finished workshop disappears from the site with no deploy.
- **Group class availability.** The wizard offers a small group class for
  a `(subject, stage)` pair only when `classes[]` contains an entry with
  `mode: "group"` and `status: "enrolling"` for that pair. Adding a
  second group class in the portal makes it appear on the site. No code
  change.
- **`status`** is one of `enrolling`, `full`, `running`, `finished`.
  `full` still shows the class but the site says places have gone;
  `running` and `finished` hide it from the enrolment routes.
- **Assessments.** `assessments[]` lists the tests that exist on the
  platform. Where one matches the visitor's stage, the home page links
  straight to `url` and the child takes it there. Where none matches, the
  page falls back to the enquiry form and says a tutor will arrange it.
  `live: false` retires a test without deleting it. Only GCSE Maths
  exists today, so every other stage currently takes the form path.
- **Prices.** `pricing.oneToOne` drives the `£28–35` figures. For a group
  class, `priceHourly` is the headline the site shows, e.g. `£10 an hour`.
  `priceMonthly` is the fallback used only when `priceHourly` is absent, so
  set one or the other rather than both. Changing either in the portal
  changes the figure on the home page chooser and the Get started form
  with no deploy.

  One exception: the group-class figure on `pricing.html` is baked into the
  HTML and tagged `data-ace="class.price"`, but nothing hydrates it yet.
  Until that binding exists, changing the price in the portal will leave
  `pricing.html` stale. Worth wiring when you build the endpoint.

### What the site does NOT read from the portal

Copy, headings and page structure stay in the HTML. This endpoint is for
facts that change on their own: dates, availability, prices. Do not move
prose into it.

## Markup contract

Authors bake the current value as the element's text and tag it:

```html
<!-- hidden automatically once the finish time passes -->
<div class="wband" data-ace-scope="workshop" data-ace-until="2026-09-05T11:30:00+01:00">
  <div class="wdate">
    <div class="wd" data-ace="workshop.day">5</div>
    <div class="wm" data-ace="workshop.mon">Sept</div>
  </div>
  <h3><span data-ace="workshop.name">The GCSE Maths Head Start</span>, free</h3>
  <p><span data-ace="workshop.window">10:00 to 11:30</span>,
     <span data-ace="workshop.places">30</span> places</p>
  <a data-ace-href="workshop" href="workshop.html">Reserve a place</a>
</div>

<!-- shown only when there is no upcoming workshop -->
<div data-ace-empty="workshop" hidden>...</div>
```

Available keys: `workshop.name`, `workshop.date`, `workshop.dateShort`,
`workshop.day`, `workshop.mon`, `workshop.start`, `workshop.end`,
`workshop.window`, `workshop.capacity`, `workshop.places`,
`workshop.subject`, `price.oneToOne`, `price.oneToOneFull`.

Anything more complex listens for the event:

```js
document.addEventListener('ace:data', function(e){ /* e.detail */ });
```

`window.ACE_DATA` holds the payload once loaded.

## What hydration cannot reach

`<title>`, the `og:`/`twitter:` tags and the JSON-LD `EducationEvent` on
`workshop.html` are author-time values. Search engines and link previews
read the HTML before scripts run, so hydrating them changes nothing that
matters and they would still be stale in a shared link.

**So when you publish a genuinely new workshop, `workshop.html` needs a
commit**: title, description, canonical, `og:`/`twitter:` tags, the
JSON-LD block, and `data-ace-workshop-id` / `data-ace-until` on the page.
The visible copy, dates, times, capacity and the enquiry `source` all
hydrate on their own, so the commit is only about crawlers.

Date and capacity changes to an existing workshop need no commit.

Also author-time on `workshop.html`, so check them in that same commit:
the "for Year 10 and Year 11" subhead and the registration form's year
options. A workshop for different years needs both changed by hand.

## Load order

```html
<script src="assets/chrome.js"></script>
<script src="assets/live.js"></script>
<script>/* page scripts, which may read window.ACE_DATA */</script>
```

## Still to build, portal side

`GET /api/site-content` does not exist yet. Neither does
`POST /api/enquiry`, which both forms already target and fail gracefully
without. Until the content endpoint exists the site runs entirely on
baked values, which is a working state, not a broken one.

Admin screens needed to make this useful: create and publish a workshop
(name, subject, years, start, end, capacity), and mark a class as
enrolling, full, running or finished.
