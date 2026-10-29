import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { aiEnabled, getAnalysis } from "@/lib/analysis/ai";
import { AskSignal } from "@/components/AskSignal";
import { getPersonalDigest } from "@/lib/data";
import { findStory } from "@/lib/news/pipeline";
import { REGION_BY_ID } from "@/lib/news/regions";
import { Chain } from "@/components/Chain";
import { ClaimList, KindLegend, KindTag } from "@/components/Claims";
import { Empty } from "@/components/Empty";
import { SourcePanel } from "@/components/SourcePanel";
import { StoryMeta } from "@/components/StoryMeta";
import { ButtonLink } from "@/components/Button";
import { SyntheticBadge } from "@/components/SyntheticBadge";
import { IconArrow, IconExternal } from "@/components/shell/icons";

export const metadata: Metadata = { title: "Story" };

export default function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<StorySkeleton />}>
      <StoryView params={params} />
    </Suspense>
  );
}

async function StoryView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connection();
  const { digest } = await getPersonalDigest();
  const story = findStory(digest, id);
  if (!story) {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 py-10">
        <Empty title="This story is no longer in the digest" action={{ href: "/", label: "Back to Today's Signal" }}>
          Stories roll off as feeds refresh. The original article may still be available from its publisher.
        </Empty>
      </div>
    );
  }
  const analysis = await getAnalysis(story, digest.stories);
  const now = new Date();
  const region = story.regions[0];
  const regionMeta = REGION_BY_ID[region];

  return (
    <article className="mx-auto w-full max-w-[1280px] px-4 md:px-8 pt-6 md:pt-8 pb-10">
      <nav aria-label="Breadcrumb" className="flex items-center gap-3 text-[12.5px] text-ink-3">
        <span>
          <Link href="/" className="hover:text-ink">Today</Link>
          <span aria-hidden="true" className="mx-1.5">/</span>
          <Link href={`/regions/${region}`} className="hover:text-ink">{regionMeta.name}</Link>
        </span>
        <SyntheticBadge show={digest.fixtures} />
      </nav>

      <div className="mt-5 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
        <div className="min-w-0 max-w-[68ch]">
          <StoryMeta story={story} now={now} />
          <h1 className="mt-3 mb-0 text-[26px] md:text-[34px] leading-[1.12] font-semibold tracking-[-0.015em] text-ink text-balance">{story.title}</h1>
          <p className="mt-4 mb-0 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13.5px]">
            <a href={story.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-blue-text hover:text-navy transition-colors duration-150">
              Read at {story.publisher} <IconExternal />
            </a>
            <Link href={`/brief/${story.id}`} className="inline-flex items-center gap-1 font-semibold text-blue-text hover:text-navy transition-colors duration-150">
              Meeting brief <IconArrow />
            </Link>
          </p>

          <div className="mt-7 sticky top-0 z-10 -mx-4 px-4 py-3 md:mx-0 md:px-0 bg-ground border-b border-hairline">
            <Chain href={`/stories/${story.id}`} region={region} compact />
          </div>

          <div className="prose-signal mt-8">
            <section id="event" className="scroll-mt-28">
              <h2>Event</h2>
              <ClaimList claims={analysis.event} />
            </section>

            <section id="evidence" className="scroll-mt-28">
              <h2>Evidence</h2>
              <p className="!mb-3 text-[15px] text-ink-2 font-sans">What the source establishes, what it does not, and how confident SIGNAL is.</p>
              <ul className="font-sans text-[15px] space-y-2">
                {analysis.evidence.establishes.map((e, i) => (
                  <li key={`e${i}`}><span className="font-semibold text-ok">Establishes.</span> {e}</li>
                ))}
                {analysis.evidence.doesNotEstablish.map((e, i) => (
                  <li key={`d${i}`}><span className="font-semibold text-warn">Does not establish.</span> {e}</li>
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
              <h2>Business mechanism</h2>
              {analysis.mechanisms.map((m, i) => (
                <div key={m.id} className={i > 0 ? "mt-5 pt-5 border-t border-hairline" : ""}>
                  <p className="!mb-1 font-sans text-[14px] font-semibold text-ink">{m.name}</p>
                  <p>{m.chain}</p>
                </div>
              ))}
            </section>

            <section id="implication" className="scroll-mt-28">
              <h2>Commercial implication</h2>
              <ClaimList claims={analysis.implication} />
              <h2 className="!mt-7">Second-order effects</h2>
              <ClaimList claims={analysis.secondOrder} />
              <div className="mt-7 rounded-md bg-surface border border-hairline px-5 py-4">
                <p className="!mb-1 font-sans text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-3">Business relevance</p>
                <p className="!mb-0 text-[15.5px]">{analysis.businessRelevance}</p>
              </div>
            </section>

            <section id="options" className="scroll-mt-28">
              <h2>Strategic options</h2>
              <ol className="!pl-0 list-none space-y-4">
                {analysis.options.map((o, i) => (
                  <li key={i} className="grid grid-cols-[1.5rem_1fr] gap-x-2">
                    <span className="font-sans text-[13px] font-semibold text-ink-4 tnum pt-[3px]">{i + 1}</span>
                    <span>
                      <span className="block">{o.action}</span>
                      <span className="block mt-1 font-sans text-[13.5px] text-ink-3">Trade-off: {o.tradeoff}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            <section id="meeting" className="scroll-mt-28">
              <h2>Meeting contribution</h2>
              <dl className="m-0 space-y-4">
                {[
                  ["Observation", analysis.meeting.observation],
                  ["Question", analysis.meeting.question],
                  ["Counterpoint", analysis.meeting.counterpoint],
                  ["Indicator to monitor", analysis.meeting.indicator],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-sans text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-3">{k}</dt>
                    <dd className="m-0 mt-1">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6">
                <ButtonLink href={`/brief/${story.id}`} variant="primary">Open the meeting brief <IconArrow /></ButtonLink>
              </div>
            </section>

            <section className="mt-10 rounded-lg bg-navy text-white px-6 py-5" aria-label="The principle">
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

          {aiEnabled() ? (
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
              <h2 className="m-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">Generated by</h2>
              <p className="mt-2 mb-0 text-[13.5px] text-ink-2 leading-[1.5]">
                {analysis.generatedBy === "ai"
                  ? "The rule-based reasoning engine, refined by an AI model under the same labelling rules."
                  : "SIGNAL's rule-based reasoning engine: a transparent library of business mechanisms matched to the story's topics and regions."}
              </p>
              <p className="mt-2 mb-0 text-[13.5px] text-ink-2 leading-[1.5]">
                <KindTag kind="fact" /> statements quote the source. Everything else is interpretation.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}

function StorySkeleton() {
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
