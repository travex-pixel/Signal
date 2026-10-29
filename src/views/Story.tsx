import Link from "next/link";
import type { Analysis } from "@/lib/analysis/types";
import type { Story } from "@/lib/news/types";
import { AskSignal } from "@/components/AskSignal";
import { Chain } from "@/components/Chain";
import { ClaimList, KindLegend, KindTag } from "@/components/Claims";
import { SourcePanel } from "@/components/SourcePanel";
import { StoryMeta } from "@/components/StoryMeta";
import { ButtonLink } from "@/components/Button";
import { SyntheticBadge } from "@/components/SyntheticBadge";
import { IconArrow, IconExternal } from "@/components/shell/icons";

/**
 * The full reasoning for one story. Pure: the live story page and a saved
 * past day both render it, each passing its own links and analysis.
 */
export function StoryArticle({
  story,
  analysis,
  now,
  fixtures,
  selfHref,
  briefHref,
  crumbs,
  ask,
}: {
  story: Story;
  analysis: Analysis;
  now: Date;
  fixtures?: boolean;
  selfHref: string;
  briefHref: string;
  crumbs: { href: string; label: string }[];
  ask: boolean;
}) {
  const region = story.regions[0];
  return (
    <article className="mx-auto w-full max-w-[1280px] px-4 md:px-8 pt-6 md:pt-8 pb-10">
      <nav aria-label="Breadcrumb" className="flex items-center gap-3 text-[12.5px] text-ink-3">
        <span>
          {crumbs.map((c, i) => (
            <span key={c.href}>
              {i > 0 ? <span aria-hidden="true" className="mx-1.5">/</span> : null}
              <Link href={c.href} className="hover:text-ink">{c.label}</Link>
            </span>
          ))}
        </span>
        <SyntheticBadge show={fixtures} />
      </nav>

      <div className="mt-5 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
        <div className="min-w-0 max-w-[calc(68ch+4rem)] paper px-5 py-6 md:px-8 md:py-8">
          <StoryMeta story={story} now={now} />
          <h1 className="mt-3 mb-0 text-[26px] md:text-[34px] leading-[1.12] font-semibold tracking-[-0.015em] text-ink text-balance">{story.title}</h1>
          <p className="mt-4 mb-0 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13.5px]">
            <a href={story.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-blue-text hover:text-navy transition-colors duration-150">
              Read at {story.publisher} <IconExternal />
            </a>
            <Link href={briefHref} className="inline-flex items-center gap-1 font-semibold text-blue-text hover:text-navy transition-colors duration-150">
              Meeting brief <IconArrow />
            </Link>
          </p>

          <div className="mt-7 sticky top-0 z-10 -mx-5 px-5 md:-mx-8 md:px-8 py-3 bg-surface/95 backdrop-blur border-b border-hairline">
            <Chain href={selfHref} region={region} compact />
          </div>

          <div className="prose-signal mt-8">
            <section id="event" className="scroll-mt-28">
              <h2>What happened</h2>
              <ClaimList claims={analysis.event} />
            </section>

            <section id="evidence" className="scroll-mt-28">
              <h2>How sure we are</h2>
              <p className="!mb-3 text-[15px] text-ink-2 font-sans">What the source shows, what it does not show, and how confident SIGNAL is.</p>
              <ul className="font-sans text-[15px] space-y-2">
                {analysis.evidence.establishes.map((e, i) => (
                  <li key={`e${i}`}><span className="font-semibold text-ok">The source shows.</span> {e}</li>
                ))}
                {analysis.evidence.doesNotEstablish.map((e, i) => (
                  <li key={`d${i}`}><span className="font-semibold text-warn">The source does not show.</span> {e}</li>
                ))}
              </ul>
              <p className="mt-4 font-sans text-[15px]">
                <span className="inline-block rounded-sm px-1.5 py-[1px] text-[11px] font-semibold uppercase tracking-[0.06em] bg-navy-100 text-navy mr-2 align-middle">
                  {analysis.confidence.level} confidence
                </span>
                <span className="text-ink-2">{analysis.confidence.reason}</span>
              </p>
            </section>

            <section id="mechanism" className="scroll-mt-28">
              <h2>How it works</h2>
              {analysis.mechanisms.map((m, i) => (
                <div key={m.id} className={i > 0 ? "mt-5 pt-5 border-t border-hairline" : ""}>
                  <p className="!mb-1 font-sans text-[14px] font-semibold text-ink">{m.name}</p>
                  <p>{m.chain}</p>
                </div>
              ))}
            </section>

            <section id="implication" className="scroll-mt-28">
              <h2>What it means for an importer</h2>
              <ClaimList claims={analysis.implication} />
              <h2 className="!mt-7">What could follow</h2>
              <ClaimList claims={analysis.secondOrder} />
              <div className="mt-7 rounded-lg bg-surface-2 border border-hairline px-5 py-4">
                <p className="!mb-1 font-sans text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-3">Business relevance</p>
                <p className="!mb-0 text-[15.5px]">{analysis.businessRelevance}</p>
              </div>
            </section>

            <section id="options" className="scroll-mt-28">
              <h2>What you could do</h2>
              <ol className="!pl-0 list-none space-y-4">
                {analysis.options.map((o, i) => (
                  <li key={i} className="grid grid-cols-[1.5rem_1fr] gap-x-2">
                    <span className="font-sans text-[13px] font-semibold text-ink-4 tnum pt-[3px]">{i + 1}</span>
                    <span>
                      <span className="block">{o.action}</span>
                      <span className="block mt-1 font-sans text-[13.5px] text-ink-3">The cost of this: {o.tradeoff}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            <section id="meeting" className="scroll-mt-28">
              <h2>If it comes up in a meeting</h2>
              <dl className="m-0 space-y-4">
                {[
                  ["What you can say", analysis.meeting.observation],
                  ["A question to ask", analysis.meeting.question],
                  ["The other view", analysis.meeting.counterpoint],
                  ["What to watch", analysis.meeting.indicator],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-sans text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-3">{k}</dt>
                    <dd className="m-0 mt-1">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6">
                <ButtonLink href={briefHref} variant="primary">Open the meeting brief <IconArrow /></ButtonLink>
              </div>
            </section>

            <section className="mt-10 rounded-xl navy-gloss text-white px-6 py-5" aria-label="The principle">
              <p className="!mb-1 font-sans text-[17px] font-semibold text-white">
                <span className="text-navy-200 font-medium">The principle: </span>
                {analysis.principle.title}
              </p>
              <p className="!mb-0 text-[15.5px] text-navy-100">{analysis.principle.text}</p>
              {analysis.principle.lessonSlug ? (
                <Link href={`/learn/${analysis.principle.lessonSlug}`} className="mt-3 inline-flex items-center gap-1 font-sans text-[13.5px] font-semibold text-white underline underline-offset-4 decoration-coral hover:decoration-white">
                  Related lesson <IconArrow />
                </Link>
              ) : null}
            </section>
          </div>

          {ask ? (
            <div className="mt-8">
              <AskSignal
                storyId={story.id}
                suggestions={[
                  "Explain this like I'm new to the industry",
                  "What would change your reading of this?",
                  "What should I ask a supplier about this?",
                ]}
              />
            </div>
          ) : null}

          <div className="mt-10">
            <SourcePanel story={story} analysis={analysis} />
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-6">
            <div>
              <h2 className="m-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">How to read this</h2>
              <div className="mt-3"><KindLegend /></div>
            </div>
            <div className="pt-5 border-t border-hairline">
              <h2 className="m-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">Who wrote this</h2>
              <p className="mt-2 mb-0 text-[13.5px] text-ink-2 leading-[1.5]">
                {analysis.generatedBy === "ai"
                  ? "SIGNAL's rule-based engine wrote the first draft. An AI model then sharpened it under the same labelling rules."
                  : "SIGNAL's rule-based engine. It matches the story's topics and regions to a library of business mechanisms you can read in full."}
              </p>
              <p className="mt-2 mb-0 text-[13.5px] text-ink-2 leading-[1.5]">
                <KindTag kind="fact" /> lines quote the source. Everything else is SIGNAL&rsquo;s reading.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}

export function StorySkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 pt-6 md:pt-8 pb-10" aria-busy="true">
      <div className="skeleton h-3 w-32" />
      <div className="mt-6 skeleton h-3 w-44" />
      <div className="mt-4 skeleton h-9 w-[70%]" />
      <div className="mt-2 skeleton h-9 w-[45%]" />
      <div className="mt-10 skeleton h-4 w-[60ch] max-w-full" />
      <div className="mt-3 skeleton h-4 w-[55ch] max-w-full" />
      <span className="sr-only">Loading story</span>
    </div>
  );
}
