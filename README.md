# SIGNAL

**Know what matters. Understand why. Speak with confidence.**

SIGNAL is an executive intelligence and strategic learning product built for a
senior commercial leader at an Australian polymer resin and packaging-film
distributor with suppliers in Southeast Asia, China, the United States and the
Middle East. In five minutes a day it surfaces the development that matters,
explains the business mechanism behind it, labels what is fact and what is
interpretation, and hands over one question worth asking in a meeting.

It is a Next.js 16 application (App Router, TypeScript, Tailwind CSS 4, Zod)
designed for Vercel. The basic news experience needs no credentials.

## What it does

| View | Route | Purpose |
|---|---|---|
| Today's Signal | `/` | One lead story, up to three supporting stories, a cross-regional signal, one question. Fits a 1440×900 viewport without scrolling. |
| Story | `/stories/[id]` | The reasoning chain: Event → Evidence → Mechanism → Implication → Options → Meeting, with every statement labelled fact, inference, hypothesis or unknown, a confidence rating and a Source & evidence panel. |
| Regions | `/regions/[sea\|china\|usa\|middle-east\|australia\|global]` | Important developments, topic signals, possible implications, key unknowns and cross-regional links per region. A quiet region says so honestly. |
| Meeting briefs | `/brief`, `/brief/[id]` | A one-page, printable brief: the issue, evidence, why it matters, questions, a counterargument, what to monitor, source notes. |
| Learn | `/learn`, `/learn/[slug]` | Eight financial-fluency lessons (gross margin and EBITDA, the three statements, working capital, inventory and service levels, FX exposure, freight and landed cost, supplier price increases, demand trade-offs), each with a knowledge check. |
| Simulators | `/simulators/[slug]` | Seven interactive scenarios with visible assumptions and restrained charts: supplier price change, exchange rate, freight and landed cost, demand slowdown, inventory and stockouts, margin and EBITDA, working capital. |
| Preferences | `/preferences` | Regional and topic emphasis, stored in a cookie. Changes ranking; never invents stories. |
| Sources | `/sources` | Every feed, its purpose, attribution, refresh policy and live/degraded status from the last refresh. |
| JSON | `/api/digest` | The current digest. |
| Refresh | `/api/refresh` | Revalidates the digest on demand (used by the Vercel cron). |

## How the intelligence works

1. **Source registry** (`src/lib/news/sources.ts`). Each feed declares an id,
   publisher, URL, type, regions, topics, refresh interval, maximum age,
   evidence weight and attribution notes. Google News RSS entries are
   discovery mechanisms, not the publisher's own feed; SIGNAL keeps the real
   publisher per item and recovers the original article URL where the
   discovery link allows it.
2. **Fetch and validate** (`fetch.ts`, `parse.ts`). Feeds are fetched
   server-side in parallel with a hard timeout, parsed (RSS 2.0, RSS 1.0/RDF,
   Atom), validated with Zod, and HTML is stripped. A failing feed is reported
   as degraded; the rest of the digest is unaffected.
3. **Canonicalise, classify, deduplicate, rank** (`urls.ts`, `classify.ts`,
   `dedupe.ts`, `rank.ts`). Tracking parameters are removed; regions,
   countries and topics come from a transparent keyword lexicon; near-identical
   headlines collapse to one story; relevance = topic relevance + regional fit
   + evidence quality + materiality + recency − noise, with every component
   recorded as a plain-language reason the reader can see.
4. **Cache** (`pipeline.ts`). The digest is cached with `"use cache"` and
   revalidated every 15 minutes, or on demand through `/api/refresh`. Reader
   preferences re-rank the cached digest without refetching.
5. **Reason** (`src/lib/analysis/`). A rule-based engine matches each story to
   a library of business mechanisms (tariffs and landed cost, FX purchasing
   power, freight and lead times, energy feedstocks, polymer supply balance,
   and more) and produces the chain: event (fact), evidence (what the source
   does and does not establish), mechanism, commercial implication (inference),
   second-order effects (hypothesis), unknowns, proportionate options with
   trade-offs, a meeting contribution (observation, question, counterpoint,
   indicator), a confidence rating with reasons, and the underlying principle
   linked to a lesson. It never asserts a link to a specific supplier,
   contract or shipment.
6. **Optional AI enrichment** (`analysis/ai.ts`). With `ANTHROPIC_API_KEY`
   set, the rule-based draft is refined by Claude under the same labelling
   rules through structured output; any failure or refusal falls back to the
   rule-based analysis.

## Local development

```bash
npm install
cp .env.example .env.local   # optional; nothing is required
npm run dev                  # http://localhost:3000
```

Other scripts:

```bash
npm run build       # production build
npm run start       # serve the production build
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # Vitest: pipeline, ranking, dedupe, analysis, calculators, simulators
npm run illustrate  # regenerate the watercolour plates (needs Python, numpy, opencv-python-headless)
node scripts/screenshot.mjs [baseUrl] [outDir] [routes...]   # desktop + mobile captures (needs Playwright)
```

### Working without outbound network access

Set `SIGNAL_FIXTURE_DIR=fixtures/dev-feeds` to read synthetic feeds from disk
instead of the network. The fixtures are invented for interface development
and testing; the interface shows a **Development fixtures** badge whenever
this mode is active. It is never enabled by default.

## Configuration

Copy `.env.example`; every variable is optional.

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Enables AI enrichment of the analysis. Unset means fully rule-based. |
| `SIGNAL_AI_MODEL` | Model for enrichment (default `claude-opus-5-5`). |
| `CRON_SECRET` | Protects `/api/refresh`. Vercel sends it automatically for cron invocations. |
| `SIGNAL_USER_AGENT` | Overrides the User-Agent sent to feed publishers. |
| `SIGNAL_FIXTURE_DIR` | Development only: read feeds from local XML files. |

Sources are configured in `src/lib/news/sources.ts`. To add one, append a
`SourceDefinition`; to pause one, set `active: false`. Region and topic
lexicons live in `src/lib/news/classify.ts`; business mechanisms in
`src/lib/analysis/mechanisms.ts`; lessons and simulators in `src/lib/learn/`.

## Deployment on Vercel

1. Import the repository in Vercel. The framework preset is Next.js; no build
   settings need changing.
2. Optionally add `ANTHROPIC_API_KEY` and `CRON_SECRET` as environment
   variables.
3. `vercel.json` schedules `/api/refresh` every 20 minutes so the digest stays
   fresh between visits. Without the cron, the digest still revalidates on
   demand after 15 minutes of staleness.
4. No database is needed. Preferences live in a cookie; the digest lives in
   the Next.js data cache.

## Source status and limitations

- **Verification.** A feed is described as live only when it has been fetched
  successfully; the Sources page reports the result of the last refresh for
  each feed, including the error for a degraded one, and `npm run test:live`
  prints the same report from the command line. During this build the three
  Reserve Bank feeds (media releases, speeches, Statement on Monetary
  Policy), the Reuters business and world discovery feeds, BBC World and BBC
  Business, and all seven regional and topical discovery feeds were fetched
  successfully. The ABS no longer publishes an RSS feed (its statistics
  index and the legacy AUSSTATS feed both return 404) and no departmental
  DFAT feed could be verified, so those two sources use Google News
  discovery scoped to `abs.gov.au` and `dfat.gov.au`, which keeps the agency
  as the publisher and links to its own pages; both were fetched
  successfully. The ABS statistics page and the DFAT statistics page are
  linked from each source's attribution as context.
- **Google News discovery.** Newer Google News links encode the article in a
  form that cannot be decoded without a round trip to Google, which SIGNAL
  does not make. Those stories link through Google's redirector and the
  Source & evidence panel says so.
- **Summaries.** Feeds carry headlines and short descriptions; SIGNAL does not
  fetch or reproduce article bodies. Analysis is therefore based on what the
  feed states and is labelled accordingly.
- **Reasoning.** The rule-based engine is a transparent library of
  mechanisms, not a model of the business. Everything beyond the quoted
  source is labelled as inference, hypothesis or unknown, and exposure is
  always described as dependent on details the report does not establish.
- **Brand.** The visual identity derives from Primaplas's public website
  (navy #231E4B, coral #EE5F5B, cyan #40C2D5, yellow #FABB14, blue #2062AF,
  slate #8187A3, verified from the site's stylesheet and logo). The site's
  typeface, Gotham Rounded, is licensed and not used; SIGNAL sets UI in
  Schibsted Grotesk and long-form reading in Literata. No brand approval is
  claimed.
- **Illustrations.** The watercolour plates in `public/illustrations/` are
  generated procedurally by `scripts/illustrate.py` (OpenCV and numpy); each
  carries a `.json` sidecar describing how it was made. No photographs are
  used.
- **Privacy.** No analytics, no accounts, no external calls from the browser.
  The only cookie is the preferences cookie.

## Project layout

```
src/app/              routes (Today, stories, regions, brief, learn, simulators, preferences, sources, api)
src/components/       shell, chain, claims, source panel, charts, simulator, knowledge check
src/lib/news/         source registry, fetch, parse, urls, classify, dedupe, rank, pipeline, fixtures
src/lib/analysis/     mechanism library, reasoning engine, optional AI enrichment
src/lib/learn/        lessons, calculators, simulators
scripts/              illustrate.py (watercolour plates), screenshot.mjs (Playwright captures)
fixtures/dev-feeds/   synthetic feeds for development without network access
public/illustrations/ generated plates with provenance sidecars
```
