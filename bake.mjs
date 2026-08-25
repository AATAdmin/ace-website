/**
 * bake.mjs — write the portal's FAQ and review copy into the static HTML.
 *
 * Runs as the Cloudflare Pages BUILD COMMAND, so every deploy renders the copy
 * that is in the database at that moment:
 *
 *     node bake.mjs
 *
 * WHY IT IS A BUILD STEP AND NOT A FETCH IN THE PAGE. The FAQs are here for
 * search: Google indexes the markup it is served, and the FAQPage structured data
 * has to match the words a reader can actually see or the markup is worse than
 * useless. Rendering FAQs from JavaScript would take the copy out of the HTML and
 * throw that away. So the answer text lands in the file, at deploy time, and the
 * JSON-LD is regenerated from the SAME rows in the same pass -- which is the only
 * way the two cannot drift.
 *
 * WHAT IT MAY TOUCH. Only the regions between these markers, which is why the
 * markers exist:
 *     <!--ace:faq-->        ... <!--/ace:faq-->          visible FAQ list
 *     <!--ace:faq-schema--> ... <!--/ace:faq-schema-->   FAQPage JSON-LD
 *     <!--ace:reviews-->    ... <!--/ace:reviews-->      visible review cards
 * Everything else in the file is left byte for byte alone.
 *
 * FAILURE IS LOUD AND FATAL. If the portal is unreachable, or answers with no
 * FAQs, this exits non-zero and the Pages build fails -- which leaves the previous
 * good deployment serving. The alternative, writing empty FAQ sections over a
 * working site because an API call timed out, is the worse outcome by a distance.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const ENDPOINT = process.env.SITE_CONTENT_ENDPOINT
  || 'https://portal.aceacademictutors.com/api/public/site-content'

// The endpoint derives the tenant from the request Origin and answers 403 to
// anything it does not recognise, so this header is required, not decorative.
const ORIGIN = process.env.SITE_CONTENT_ORIGIN || 'https://aceacademictutors.com'

// Copied from the existing markup so a baked page is byte-identical to a
// hand-written one. Changing the design means changing it here too.
const STAR = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z"/></svg>'
const PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>'
const GOOGLE_REVIEW_URL = 'https://g.page/r/CbD5T7bBkTfnEBM'

// slug -> file. 'index' is the home page; the rest match their own URL segment.
const PAGE_FILES = {
  index: 'index.html',
  about: 'about.html',
  services: 'services.html',
  pricing: 'pricing.html',
  'get-started': 'get-started.html',
  'maths-tutoring': 'maths-tutoring.html',
  'english-tutoring': 'english-tutoring.html',
  'science-tutoring': 'science-tutoring.html',
  '11-plus-tutoring': '11-plus-tutoring.html',
  'for-schools': 'for-schools.html',
  'become-a-tutor': 'become-a-tutor.html',
  contact: 'contact.html',
}

const warnings = []
const fail = (msg) => { console.error(`\nbake failed: ${msg}\n`); process.exit(1) }

/** Escape for HTML text content. The copy is founder-authored, but it is still
 *  data going into markup, and an unescaped & or < would corrupt the page. */
const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')

/** Curly quotes around a review, matching the hand-written cards. */
const quoted = (s) => '“' + esc(s).replace(/^["“]+|["”]+$/g, '') + '”'

/**
 * Inline links, written in an answer as [pricing page](/pricing).
 *
 * Answers are plain text in the database, but four of them link to the pricing
 * page and losing those links would be a real regression -- an answer that says
 * "the pricing page works it out for you" and does not link to it is worse than
 * one that never mentioned it.
 *
 * Applied AFTER escaping, so everything except this one deliberate pattern is
 * inert markup. Only a site-relative path or an https URL is accepted; anything
 * else (javascript:, data:, protocol-relative) is left as literal text rather
 * than turned into a link.
 */
const LINK = /\[([^\]\n]{1,120})\]\((\/[^)\s]{0,180}|https:\/\/[^)\s]{1,180})\)/g
const links = (s) => s.replace(LINK, (_m, text, href) => `<a href="${href}">${text}</a>`)

/** The same text with links collapsed to their label, for structured data. */
const plain = (s) => String(s ?? '').replace(LINK, (_m, text) => text)

function replaceRegion(html, name, body, file) {
  const open = `<!--ace:${name}-->`
  const close = `<!--/ace:${name}-->`
  const i = html.indexOf(open)
  const j = html.indexOf(close)
  if (i < 0 || j < 0) return null            // this page does not have that region
  if (j < i) fail(`${file}: ${name} markers are in the wrong order`)
  return html.slice(0, i + open.length) + body + html.slice(j)
}

/** A blank line in the stored answer starts a new paragraph, which is how a long
 *  answer stays readable. Several answers on the site were written as two
 *  paragraphs, and collapsing them into one wall of text is a real regression. */
const paras = (s) => String(s ?? '').split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean)

function faqHtml(rows) {
  const items = rows.map((r, n) => [
    `<details${n === 0 ? ' open' : ''}>`,
    `<summary>${esc(r.question)}<span class="fq-i">${PLUS}</span></summary>`,
    `<div class="fq-a">${paras(r.answer).map((t) => `<p>${links(esc(t))}</p>`).join('')}</div>`,
    '</details>',
  ].join('\n'))
  return `<div class="faq">\n${items.join('\n')}\n</div>`
}

function faqSchema(rows) {
  const doc = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: rows.map((r) => ({
      '@type': 'Question',
      name: r.question,
      // Schema text is plain prose, not markup: paragraphs join with a single
      // space (as the hand-written schema did) and link syntax collapses to its
      // label, so a reader of the structured data never sees "[text](/url)".
      acceptedAnswer: { '@type': 'Answer', text: plain(paras(r.answer).join(' ')) },
    })),
  }
  // JSON.stringify handles the escaping; the only thing it will not escape is a
  // literal </script> inside a string, which would end the block early.
  const json = JSON.stringify(doc, null, 1).replace(/<\//g, '<\\/')
  return `<script type="application/ld+json">\n${json}\n</script>`
}

function reviewsHtml(rows) {
  const cards = rows.map((r) => [
    '      <div class="rv-c">',
    `        <span class="gs" aria-hidden="true">${STAR.repeat(Math.max(1, Math.min(5, r.rating || 5)))}</span>`,
    `        <blockquote>${quoted(r.quote)}</blockquote>`,
    // Middle dot, not an em dash: it is what the hand-written cards use, and the
    // house rule is no em dashes in anything a visitor reads.
    `        <cite>${esc(r.author)} · <a href="${GOOGLE_REVIEW_URL}" target="_blank" rel="noopener">Google review</a></cite>`,
    '      </div>',
  ].join('\n'))
  return `<div class="rvs">\n${cards.join('\n')}\n    </div>`
}

async function main() {
  console.log(`bake: reading ${ENDPOINT}`)

  let payload
  try {
    const res = await fetch(ENDPOINT, { headers: { Origin: ORIGIN } })
    if (!res.ok) fail(`the portal answered ${res.status}. Previous deployment stays live.`)
    payload = await res.json()
  } catch (e) {
    fail(`could not reach the portal (${e?.message || e}). Previous deployment stays live.`)
  }

  const faqs = payload.faqs ?? []
  const reviews = payload.reviews ?? []

  // An empty FAQ list is far more likely to be a broken query than a deliberate
  // decision to remove every question from the site, so treat it as a failure.
  if (faqs.length === 0) fail('the portal returned no FAQs. Refusing to publish empty FAQ sections.')

  console.log(`bake: ${faqs.length} FAQs, ${reviews.length} reviews (updated ${payload.updatedAt ?? 'unknown'})`)

  // Group by page. One row can name several pages, which is the whole reason the
  // database holds 15 rows for 29 places they appear.
  const byPage = new Map()
  for (const f of faqs) {
    for (const slug of f.pages ?? []) {
      if (!byPage.has(slug)) byPage.set(slug, [])
      byPage.get(slug).push(f)
    }
  }

  let written = 0

  for (const [slug, rows] of byPage) {
    const file = PAGE_FILES[slug]
    if (!file) { warnings.push(`unknown page "${slug}" on ${rows.length} FAQ(s) — nothing written`); continue }
    if (!existsSync(file)) { warnings.push(`${file} does not exist — "${slug}" FAQs not written`); continue }

    const before = readFileSync(file, 'utf-8')
    let html = before

    const withFaq = replaceRegion(html, 'faq', faqHtml(rows), file)
    if (withFaq === null) {
      warnings.push(`${file} has no <!--ace:faq--> region, so ${rows.length} FAQ(s) for "${slug}" are not shown`)
      continue
    }
    html = withFaq

    const withSchema = replaceRegion(html, 'faq-schema', faqSchema(rows), file)
    if (withSchema === null) {
      // Visible copy without matching structured data is a correctness problem
      // for search, not a cosmetic one.
      fail(`${file} has a visible FAQ region but no <!--ace:faq-schema--> region. The structured data would drift from the page.`)
    }
    html = withSchema

    if (html !== before) {
      writeFileSync(file, html, 'utf-8')
      written += 1
      console.log(`  ${file.padEnd(24)} ${rows.length} FAQ${rows.length === 1 ? '' : 's'}`)
    } else {
      console.log(`  ${file.padEnd(24)} unchanged`)
    }
  }

  // ── reviews (home page only today) ────────────────────────────────────────
  if (reviews.length) {
    const file = PAGE_FILES.index
    const before = readFileSync(file, 'utf-8')
    const html = replaceRegion(before, 'reviews', reviewsHtml(reviews), file)
    if (html === null) {
      warnings.push(`${file} has no <!--ace:reviews--> region, so ${reviews.length} review(s) are not shown`)
    } else if (html !== before) {
      writeFileSync(file, html, 'utf-8')
      written += 1
      console.log(`  ${file.padEnd(24)} ${reviews.length} review${reviews.length === 1 ? '' : 's'}`)
    }
  }

  if (warnings.length) {
    console.log('\nwarnings:')
    warnings.forEach((w) => console.log(`  - ${w}`))
  }
  console.log(`\nbake: ${written} file${written === 1 ? '' : 's'} written`)
}

main().catch((e) => fail(e?.stack || String(e)))
