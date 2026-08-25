# ACE marketing site: handoff to Claude Code

Static site for **aceacademictutors.com**. 17 HTML pages plus assets. No build step,
no framework, no dependencies to install.

---

## 1. Build contract

| | |
|---|---|
| Repo | `AATAdmin/ace-website`, public, branch `main` |
| Host | Cloudflare Pages, auto-deploy on push to `main` |
| Framework preset | None |
| Build command | *(empty)* |
| Output directory | `/` |
| Node version | Not applicable, nothing is compiled |

Every push to `main` goes live in about a minute. **The repo is public, so nothing
secret goes in it, ever.**

Cloudflare edge-caches HTML, so reading the live site straight after a push can show
a stale page. Read the repo for current state.

**Do not touch DNS beyond apex and www.** The `aceacademictutors.com` zone carries
live Google Workspace email (`MX -> smtp.google.com`) plus `portal.` and
`internal.` subdomains pointing at Vercel.

---

## 2. How the pages are wired

**Chrome is inlined, not injected.** The header, nav and footer are duplicated
verbatim across all 17 pages. Change one, change all seventeen. Every page also
carries the `<noscript>` style line above `<header>` and static `og:` /
`twitter:card` tags in `<head>`.

**Every page must render with JavaScript disabled**: header, nav, footer, phone and
email all present in raw HTML. Test with JS off before pushing.

`assets/chrome.js` no longer injects chrome. It owns the mobile menu, scroll shadow,
reveal animations, counters and `[data-year]`. Leave it loaded.

`assets/live.js` hydrates portal-driven values (workshop dates, which classes are
enrolling, prices). **Every one of those values is ALSO baked into the HTML**, so a
page is correct with no JavaScript and no portal. Never delete a baked value and rely
on the fetch.

---

## 3. Standing rules

- **No em-dashes in displayed text.** En-dashes in numeric ranges are correct:
  "Years 3–6", "KS1–KS2", "£28–35".
- **British English** throughout: organise, personalised, maths.
- **No invented social proof.** No statistics, review counts, star ratings or
  testimonials. Real reviews only, with consent and attribution. If none are
  supplied, omit the section rather than filling it. Do not add placeholder
  testimonials "to fill in later"; placeholders ship.
- **Relative links only.**
- **Never write a price range as a literal string.** Derive it from the rates, so one
  number changing cannot leave a second number stale. See
  `docs/PRICING_FROM_PORTAL.md`.
- **"University-educated tutors", never "qualified teachers".** The latter has a
  specific regulated meaning in the UK and is a different claim.

### A trap in site.css that has bitten twice

`site.css` defines exactly one anchor rule, `a{color:inherit}`. There is **no
site-level link colour**, so any anchor dropped into styled body prose inherits that
paragraph's colour and becomes invisible. Two links were lost that way and found only
on review.

Either give the component its own link colour, or add a real base `a` / `a:hover`
colour to `site.css`. The second closes the whole class of bug but would recolour
wrapped-card and nav anchors across all 17 pages, so it needs its own deliberate pass
with every page checked. **Recommended, but not something to slip into an unrelated
edit.**

---

## 4. The inline notes are the real documentation

**Every page carries an HTML comment block at the top of `<body>`.** It records the
decisions for that page: what was deliberately left out and why, what must not be
changed, what claims are and are not evidenced, and which instructions conflicted.

**Read a page's note block before editing that page.** Several of them exist
specifically to stop a future edit reintroducing something that was removed on
purpose. Examples of what they protect:

- `about.html` carries the register rules (no comparisons, no "why choose us",
  understate, banned words) and the list of what was cut to satisfy them.
- `get-started.html` carries the enquiry payload contract and the rule that a
  success screen may only appear on a 2xx.
- `become-a-tutor.html` records that no pay rate is published anywhere.
- `pricing.html` records that each figure has exactly one home on the page.

---

## 5. Page inventory

| Page | Role | Notes |
|---|---|---|
| `index.html` | Home. Course chooser routes 11+ / GCSE / A-Level | Largest file. Section-level edits, not whole-file |
| `services.html` | How we teach. Clickable six-step flow chart | Four screenshot slots waiting on real images |
| `pricing.html` | Guided chooser: lesson type, then stage, then price | One-to-one rates are per level. Group class £10/hr |
| `get-started.html` | **The only enquiry route on the site.** Progressive-reveal form | `noindex`. Posts to the portal, fails loud |
| `about.html` | The company, how lessons run, progress tracking, tutors | Written as an organisation, no founder biographies |
| `workshop.html` | Free GCSE Maths workshop landing page | Tutor is unnamed; name before it goes out |
| `portal.html` | What the portal is, for parents | |
| `for-schools.html` | B2B surface | Thinnest page. Deserves work if schools are a real channel |
| `become-a-tutor.html` | Tutor recruitment | No pay rate published, by instruction |
| `contact.html` | Contact details only | **No form, deliberately.** One enquiry route, and it is get-started |
| `maths-tutoring.html` | Subject page | |
| `english-tutoring.html` | Subject page | |
| `science-tutoring.html` | Subject page | |
| `11-plus-tutoring.html` | Subject page | |
| `privacy.html` | Legal | `noindex`, out of sitemap, pending legal review |
| `terms.html` | Legal | `noindex`, out of sitemap, pending legal review |
| `safeguarding.html` | Legal | `noindex`, out of sitemap, pending legal review |

`sitemap.xml` carries 13 URLs. `get-started.html` and the three legal pages are
deliberately excluded.

---

## 6. Questions only the founders can answer

These block work. Each one is also flagged in the relevant page's note block.

1. **Are lessons recorded?** `index.html`, `services.html` and `workshop.html`
   claim it, and the home page headline depends on it. It was not ticked when the
   founders were asked what the infrastructure includes, and a later brief listing
   what is built and live did not include it. `about.html` therefore does not claim
   it. **If the answer is no, it must come off the other pages too.**
2. **Are tutors interviewed before they teach?** "and interviewed" was removed from
   the safeguarding list because a founder interview was not among the confirmed
   vetting steps. If interviews happen, it goes back.
3. **Free 15-minute consultation, or free trial lesson?** The consultation was
   retired across all 17 pages and replaced with a free trial lesson: one full hour,
   no card, no obligation. Three separate briefs have since asked for the
   consultation back. It cannot exist on one page alone. **Pick one.**
4. **Does Hamza still teach?** Two briefs say he does. The founders said in chat that
   neither founder teaches and the teaching is done by tutors. `about.html`
   therefore says nothing either way.
5. **Are small group classes running, or launching?** The founders said they are
   taught, present tense. A brief said group teaching is not running yet and that the
   largest group ever run held three students. `pricing.html` currently sells a GCSE
   Maths group class at £10/hr. These cannot both be right.
6. **How many years of tutoring?** Founder answers said 13+. Two briefs said about
   two years. `about.html` reconciles it as thirteen years of tutoring and the
   company founded in 2024, which is an inference. Confirm or correct.
7. **A photograph of Hamza.** Real photographs only; stock imagery of people is
   forbidden and that rule is right. His avatar is a monogram until one exists.
8. **A formal role title for Anum**, if one exists. Asked for twice, never supplied.
9. **Legal review of `privacy.html`, `terms.html`, `safeguarding.html`.** All
   three are unreviewed template text. Two things to settle in that review: the
   retired consultation still appears in the legal copy, and the privacy notice
   predates the `filledBy` / `guardian` / `over18` fields, so it does not cover a
   Year 13 student enrolling on their own behalf. Once reviewed, remove the
   `noindex` tags and add all three back to `sitemap.xml`.

### One note on CLAUDE.md

`CLAUDE.md` states one-to-one pricing as £28–35/hour. That is still correct for 11+
and GCSE. **A-Level is £36–45**, set in this session, and the group class is £10/hour.
CLAUDE.md wants updating to match.

---

## 7. Outstanding work

### In `ace-portal`, not this repo

1. **`POST /api/enquiry`.** Does not exist. Until it does, every enquiry takes the
   fallback path and arrives by phone and email rather than reaching Leads.jsx.
   Payload contract: `docs/ENQUIRY_PAYLOAD.md`.
2. **`GET /api/site-content`.** Would make workshop dates, enrolling classes and
   prices editable from the portal admin instead of in HTML. Contract:
   `docs/PORTAL_CONTENT_API.md` and `docs/PRICING_FROM_PORTAL.md`.
3. **Package purchase and subscription links.** A "Book this package" button exists on
   `pricing.html` and is deliberately switched off until there is somewhere to send
   people. Contract: `docs/PACKAGES_AND_SUBSCRIPTIONS.md`.
4. **Email notifications** for enquiries and other customer interactions. Noted in
   `docs/PORTAL_INTEGRATION.md`.

### In this repo

5. The base `a` / `a:hover` colour pass on `site.css` (section 3 above).
6. Real screenshots for the four slots in `services.html`. **Any portal screenshot
   must be the family view with dummy data, never an admin screen.** Earlier ones
   showed balances, margin and the names of real students.
7. `for-schools.html` needs proper work if schools are a real channel.
8. Refresh `sitemap.xml` `lastmod` values as pages change.

---

## 8. Docs

| File | What it covers |
|---|---|
| `docs/PORTAL_INTEGRATION.md` | The three site-to-portal connections, plus the legal review items |
| `docs/ENQUIRY_PAYLOAD.md` | Field-by-field contract for `POST /api/enquiry` |
| `docs/PORTAL_CONTENT_API.md` | Shape of `GET /api/site-content` |
| `docs/PRICING_FROM_PORTAL.md` | How prices reach the site, and the derive-never-hardcode rule |
| `docs/PACKAGES_AND_SUBSCRIPTIONS.md` | Package purchase and subscription flow |

---

## 9. Working agreement that has held so far

Design work is written here and handed over as either a complete file or exact
old-to-new strings. Mechanical work, conversions, refactors, build config, deploy and
verification are Claude Code's. Two rules that prevented most of the problems:

- **If an instruction does not match the current file contents exactly, stop and say
  so** rather than guessing. It means the repo moved and the instruction is stale.
- **Verify with JavaScript disabled** before committing.
