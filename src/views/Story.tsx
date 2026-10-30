import Link from "next/link";
import type { Analysis } from "@/lib/analysis/types";
import type { Story } from "@/lib/news/types";
import { AskSignal } from "@/components/AskSignal";
import { LiveChain } from "@/components/LiveChain";
import { HashScroll } from "@/components/HashScroll";
import { EvidenceLine, OtherReports } from "@/components/Evidence";
import { ClaimList, KindLegend } from "@/components/Claims";
import { SourcePanel } from "@/components/SourcePanel";
import { StoryMeta } from "@/components/StoryMeta";
import { ButtonLink } from "@/components/Button";
import { SyntheticBadge } from "@/components/SyntheticBadge";
import { IconArrow, IconChevron, IconExternal } from "@/components/shell/icons";

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
  absoluteTimes = false,
}: {
  story: Story;
  analysis: Analysis;
  now: Date;
  fixtures?: boolean;
  selfHref: string;
  briefHref: string;
  crumbs: { href: string; label: string }[];
  ask: boolean;
  /** Show publication dates instead of "3h ago", for saved past days. */
  absoluteTimes?: boolean;
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
          <HashScroll />
          <StoryMeta story={story} now={now} absolute={absoluteTimes} />
          <h1 className="mt-3 mb-0 text-[26px] md:text-[34px] leading-[1.12] font-semibold tracking-[-0.015em] text-ink text-balance">{story.title}</h1>
          <EvidenceLine story={story} confidence={analysis.confidence} className="mt-3" />
          <p className="mt-3 mb-0 flex flex-wrap items-center gap-x-5 text-[13.5px]">
            <a href={story.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 min-h-11 font-semibold text-blue-text hover:text-navy transition-colors duration-150">
              Read at {story.publisher} <IconExternal />
            </a>
            <Link href={briefHref} className="inline-flex items-center gap-1 min-h-11 font-semibold text-blue-text hover:text-navy transition-colors duration-150">
              Meeting brief <IconArrow />
            </Link>
          </p>

          <details className="lg:hidden group mt-1 rounded-lg bg-surface-2 border border-hairline">
            <summary className="cursor-pointer list-none min-h-11 px-4 flex items-center justify-between gap-3 text-[13.5px] font-semibold text-ink-2 [&::-webkit-details-marker]:hidden">
              How to read the labels
              <IconChevron aria-hidden="true" className="flex-none text-ink-4 rotate-90 transition-transform duration-150 group-open:-rotate-90" width={18} height={18} />
            </summary>
            <div className="px-4 pb-4">
              <KindLegend />
              <p className="mt-3 mb-0 text-[13px] leading-[1.5] text-ink-2">{whoWrote(analysis)}</p>
            </div>
          </details>

          <div className="mt-6 sticky top-0 z-10 -mx-5 px-5 md:-mx-8 md:px-8 py-3 bg-surface/95 backdrop-blur border-b border-hairline">
            <LiveChain href={selfHref} region={region} />
          </div>

          <div className="prose-signal mt-8">
            <section id="event" className="scroll-mt-28">
              <h2>What happened</h2>
              <ClaimList claims={analysis.event} />
            </section>

            <section id="evidence" className="scroll-mt-28">
              <h2>How sure we are</h2>
              <div className="font-sans grid gap-5 sm:grid-cols-2 sm:gap-8">
                <div>
                  <h3 className="m-0 text-[13.5px] font-semibold text-ok">What the source shows</h3>
                  <ul className="mt-2 mb-0 pl-4 list-disc space-y-1.5 text-[15px] leading-[1.5] text-ink-2 marker:text-ok">
                    {analysis.evidence.establishes.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="m-0 text-[13.5px] font-semibold text-warn">What it does not show</h3>
                  <ul className="mt-2 mb-0 pl-4 list-disc space-y-1.5 text-[15px] leading-[1.5] text-ink-2 marker:text-warn">
                    {analysis.evidence.doesNotEstablish.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              </div>
              {story.alsoReportedBy?.length ? (
                <div className="mt-6 font-sans">
                  <h3 className="m-0 text-[13.5px] font-semibold text-ink">Other reports of the same event</h3>
                  <OtherReports story={story} />
                </div>
              ) : null}
              <p className="mt-5 mb-0 font-sans text-[14px] leading-[1.55] text-ink-3">{analysis.confidence.reason}</p>
              <div className="mt-5">
                <SourcePanel story={story} analysis={analysis} />
              </div>
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
                <ButtonLink href={briefHref}>Open the meeting brief <IconArrow /></ButtonLink>
              </div>
            </section>

            <section className="mt-10 rounded-xl navy-gloss text-white px-6 py-5" aria-label="The principle">
              <p className="!mb-1 font-sans text-[17px] font-semibold text-white">
                <span className="text-navy-200 font-medium">The principle: </span>
                {analysis.principle.title}
              </p>
              <p className="!mb-0 text-[15.5px] text-navy-100">{analysis.principle.text}</p>
              {analysis.principle.lessonSlug ? (
                <Link href={`/learn/${analysis.principle.lessonSlug}`} className="mt-2 inline-flex items-center gap-1 min-h-11 font-sans text-[13.5px] font-semibold text-white underline underline-offset-4 decoration-coral hover:decoration-white">
                  Five-minute lesson <IconArrow />
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

        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-6">
            <div>
              <h2 className="m-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">How to read this</h2>
              <div className="mt-3"><KindLegend /></div>
            </div>
            <div className="pt-5 border-t border-hairline">
              <h2 className="m-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">Who wrote this</h2>
              <p className="mt-2 mb-0 text-[13.5px] text-ink-2 leading-[1.5]">{whoWrote(analysis)}</p>
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

function whoWrote(analysis: Analysis): string {
  return analysis.generatedBy === "ai"
    ? "Written by SIGNAL's rule-based engine, then sharpened by an AI model under the same labelling rules. Fact lines quote the source. Everything else is SIGNAL's reading."
    : "Written by SIGNAL's rule-based engine, which matches the story to a library of business mechanisms. Fact lines quote the source. Everything else is SIGNAL's reading.";
}
