# Product

<!-- impeccable:product-schema 1 -->

<!-- Written from the founding build brief. The brief answered the init
     interview in full and asked that implementation not be interrupted
     with avoidable questions, so no interview round was run. Facts marked
     (inferred) are reasonable readings of the brief, not confirmed answers. -->

## Platform

web

## Stack

Pinned by the brief: Next.js App Router, TypeScript, Tailwind CSS, Zod, a
feed parser, Vercel-compatible server functions. No database unless a
clear need appears.

## Users

A senior commercial leader at Primaplas, an Australian polymer resin and
packaging-film distributor: the General Manager of Key Suppliers, who
manages suppliers across Southeast Asia, China, the USA and the Middle
East. They open SIGNAL most mornings for about five minutes, often on a
phone before work and on a desktop at a desk, to understand what matters
in the world today, connect it to commercial decisions, and walk into
meetings able to contribute with confidence.

The product refers to this person only as a professional. It never
references family relationships or the circumstances of its creation.

## Product Purpose

SIGNAL is an executive intelligence and strategic learning product.
Tagline: "Know what matters. Understand why. Speak with confidence."

It selects the few developments that matter, explains why they matter,
connects them to commercial mechanisms (trade, currency, energy,
materials, freight, demand, regulation), evaluates risks and alternative
explanations, offers sharper questions, and builds independent strategic
judgement over time.

Success: in five minutes the reader knows the day's most important
development, why it matters commercially, which supplier region is
implicated, what the evidence is, and one thoughtful question to carry
into a meeting.

## Positioning

Not a news aggregator and not a generated-summary dashboard. The
mechanism a neighbouring product cannot truthfully copy: every story is
assessed against four named supplier regions plus the Australian lens,
run through an explicit reasoning chain (event → evidence → business
mechanism → commercial implication → options → meeting contribution)
with facts, inferences, hypotheses and unknowns labelled, and every
material conclusion traceable to dated sources.

## Operating Context

- Four supplier regions as confirmed priorities: Southeast Asia, China,
  USA, Middle East. Australia is the home-market and impact lens. Balanced
  coverage is required; the product must not drift into a China-only feed.
- SEA and the Middle East are diverse; name countries when evidence
  supports it.
- Subject areas: trade, tariffs, sanctions, geopolitics; manufacturing and
  industrial policy; freight, shipping, ports; energy, commodities,
  plastics, polymers, petrochemicals; currency, inflation, rates, growth;
  demand, pricing, margins, working capital, inventory; regulation,
  sustainability, trade restrictions; technology and structural change.
- Rituals: a morning read; meeting preparation; occasional deeper reading
  of a lesson or scenario.
- Works without private company systems, confidential data, or paid AI
  credentials. Optional AI enrichment may be configured by env var.

## Capabilities and Constraints

- Server-side news ingestion from a maintained source registry (RSS/Atom),
  with validation, canonical URLs, deduplication, relevance ranking,
  caching, timestamps and clear degraded-source states.
- Views: Today's Signal; Regional intelligence (SEA, China, USA, Middle
  East, Australia & global); story reading view with the reasoning chain
  and a Source & evidence panel; Meeting brief; Financial fluency lessons
  and commercial simulators; Preferences for regional and topic emphasis.
- Never invent supplier relationships, contracts, costs, performance,
  identities, titles or internal business data. Illustrative numbers in
  lessons and simulators are labelled illustrative.
- No fake KPIs, invented risk scores, gauges or decorative charts.
- Use the company name only where it has a legitimate purpose, such as a
  labelled "Business relevance" section.
- Do not reproduce full copyrighted articles; concise summaries,
  attribution and links only.
- Undecided (brief silent): persistence of preferences beyond the browser
  (inferred: cookie-based, no database for v1).

## Brand Commitments

- Name: SIGNAL. Tagline above.
- Visual identity derives from Primaplas's verified public site
  (primaplas.com.au), used with restraint as a premium professional
  interpretation, not a copy of the marketing site. Verified colours from
  the site's stylesheet and logo: navy #231E4B (wordmark, text), coral
  #EE5F5B (headings, logo bars), cyan #40C2D5 / #70C5D8 (logo bars),
  yellow #FABB14 / #FDCD11, blue #2062AF / #2665B0, slate #8187A3. Site
  typefaces are Gotham Rounded (licensed, unavailable) and Libre Franklin.
  No brand approval is claimed.
- Voice: measured, commercially aware, intelligent, plain English. No
  corporate jargon, no inflated consultant language, no hype.
- References for principles only (not copying): Linear, Superhuman,
  Vercel, Raycast, an excellent business publication's editorial
  intelligence. The brief also asks for watercolour illustration and
  New Yorker / NYT-calibre data graphics.

## Evidence on Hand

- Primaplas logo (full colour and white PNG) and theme stylesheet,
  downloaded from primaplas.com.au during this build.
- Candidate feed URLs from the brief (RBA RSS directory, ABS statistics,
  DFAT trade statistics, Google News RSS discovery for Reuters, BBC World).
  Live availability must be checked; none may be claimed verified until
  fetched successfully.
- No customer data, testimonials, financials, supplier lists or internal
  documents exist. Future work must not fabricate them.

## Product Principles

1. Relevance before popularity: rank by commercial relevance, evidence
   quality, materiality and recency.
2. Reasoning over summary: explain mechanisms, second-order effects and
   alternative readings; label fact, inference, hypothesis and unknown.
3. Evidence is visible: source, date, what it establishes and what it
   does not, one tap away and never buried.
4. Actionable and teaching: every brief ends in a question, an indicator
   and a principle the reader can reuse.
5. Calm surface, intelligent depth: the primary overview fits a desktop
   viewport; depth is progressive, never forced onto the opening screen.

## Accessibility & Inclusion

Semantic HTML, keyboard navigation with visible focus, reduced-motion
respected, contrast at or above WCAG AA, comfortable touch targets, no
horizontal overflow, readable on a phone.
