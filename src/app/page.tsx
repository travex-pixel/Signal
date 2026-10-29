import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { aiEnabled } from "@/lib/analysis/ai";
import { analyzeStory } from "@/lib/analysis/engine";
import { AskSignal } from "@/components/AskSignal";
import { crossRegionalSignal } from "@/lib/analysis/engine";
import { getPersonalDigest } from "@/lib/data";
import { todayLabel, truncateSentences } from "@/lib/format";
import { selectForToday } from "@/lib/news/rank";
import { REGION_BY_ID } from "@/lib/news/regions";
import { Chain } from "@/components/Chain";
import { Empty } from "@/components/Empty";
import { Freshness } from "@/components/Freshness";
import { Plate, type PlateName } from "@/components/Plate";
import { RegionBeads } from "@/components/RegionBead";
import { StoryMeta } from "@/components/StoryMeta";
import { ButtonLink } from "@/components/Button";
import { IconArrow } from "@/components/shell/icons";

export default function TodayPage() {
  return (
    <Suspense fallback={<TodaySkeleton />}>
      <Today />
    </Suspense>
  );
}

async function Today() {
  await connection();
  const { digest } = await getPersonalDigest();
  const now = new Date();
  const { lead, supporting } = selectForToday(digest.stories, { supporting: 3 });
  const signal = crossRegionalSignal(digest.stories);
  const analysis = lead ? analyzeStory(lead, digest) : undefined;
  const okSources = digest.sources.filter((s) => s.ok).length;

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 pt-6 md:pt-7 pb-6 flex-1 flex flex-col">
      <h1 className="sr-only">Today&rsquo;s Signal, {todayLabel(now)}</h1>

      {!lead || !analysis ? (
        <div className="mt-8">
          <Empty
            title={okSources === 0 ? "No sources could be reached" : "Nothing met the quality threshold today"}
            action={{ href: "/sources", label: "See source status" }}
          >
            {okSources === 0
              ? "Every configured feed failed on the last refresh. SIGNAL does not show stand-in stories; it will try again on the next refresh."
              : "The feeds returned stories, but none scored high enough on relevance, evidence and recency to lead the day. Try the regional views or widen your preferences."}
          </Empty>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16 flex-1">
          {/* Lead */}
          <article className="min-w-0 rise">
            <div className="flex items-start gap-8">
              <div className="min-w-0 flex-1">
                <StoryMeta story={lead} now={now} />
                <h2 className="mt-3 mb-0 text-[26px] md:text-[32px] leading-[1.12] font-semibold tracking-[-0.015em] text-ink text-balance max-w-[24ch]">
                  <Link href={`/stories/${lead.id}`} className="hover:text-navy-700 transition-colors duration-150">
                    {lead.title}
                  </Link>
                </h2>
                {lead.summary ? (
                  <p className="mt-4 mb-0 font-serif text-[17px] leading-[1.55] text-ink-2 max-w-[62ch]">{truncateSentences(lead.summary, 3)}</p>
                ) : null}
              </div>
              <Plate name={`region-${lead.regions[0]}` as PlateName} width={220} priority className="hidden lg:block flex-none -mt-6 -mr-4" />
            </div>

            <section className="mt-6 max-w-[62ch]" aria-labelledby="why">
              <h3 id="why" className="m-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">
                Why it matters
              </h3>
              <p className="mt-2 mb-0 font-serif text-[16.5px] leading-[1.55] text-ink">
                {truncateSentences(analysis.implication[0].text, 2)}
              </p>
              <p className="mt-2 mb-0 font-serif text-[15.5px] leading-[1.55] text-ink-2">
                {truncateSentences(analysis.implication[1].text, 2)}
              </p>
            </section>

            <div className="mt-6 max-w-[62ch]">
              <Chain href={`/stories/${lead.id}`} region={lead.regions[0]} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:items-center">
              <ButtonLink href={`/stories/${lead.id}`} variant="primary">
                Read the reasoning <IconArrow />
              </ButtonLink>
              <ButtonLink href={`/brief/${lead.id}`}>Meeting brief</ButtonLink>
              <Link
                href={`/stories/${lead.id}#evidence`}
                className="col-span-2 sm:col-auto inline-flex items-center h-9 sm:px-2 text-[13.5px] font-semibold text-blue-text hover:text-navy transition-colors duration-150"
              >
                Source &amp; evidence
              </Link>
            </div>

            <aside className="mt-8 pt-5 border-t border-hairline max-w-[62ch]" aria-labelledby="principle">
              <h3 id="principle" className="m-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">
                The principle behind it
              </h3>
              <p className="mt-2 mb-0 font-serif text-[15.5px] leading-[1.55] text-ink-2">
                <strong className="font-semibold text-ink">{analysis.principle.title}.</strong> {analysis.principle.text}
                {analysis.principle.lessonSlug ? (
                  <>
                    {" "}
                    <Link href={`/learn/${analysis.principle.lessonSlug}`} className="font-sans text-[13px] font-semibold text-blue-text hover:text-navy whitespace-nowrap">
                      Lesson <IconArrow className="inline -mt-0.5" />
                    </Link>
                  </>
                ) : null}
              </p>
            </aside>
          </article>

          {/* Supporting column */}
          <aside className="min-w-0 lg:border-l lg:border-hairline lg:pl-10 flex flex-col">
            {supporting.length > 0 ? (
              <section aria-labelledby="also">
                <h3 id="also" className="m-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">
                  Also today
                </h3>
                <ol className="mt-3 m-0 p-0 list-none divide-y divide-hairline">
                  {supporting.map((s, i) => (
                    <li key={s.id} className="py-3 first:pt-0">
                      <Link href={`/stories/${s.id}`} className="group grid grid-cols-[1.25rem_1fr] gap-x-2">
                        <span className="text-[13px] font-semibold text-ink-4 tnum pt-[2px]">{i + 1}</span>
                        <span>
                          <span className="block text-[15px] leading-[1.35] font-medium text-ink group-hover:text-navy-700 transition-colors duration-150 text-pretty">
                            {s.title}
                          </span>
                          <span className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[12px] text-ink-3">
                            <RegionBeads regions={s.regions} max={1} size="sm" />
                            <span aria-hidden="true">·</span>
                            <span>{s.publisher}</span>
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            <section className="mt-4 pt-4 border-t border-hairline" aria-labelledby="across">
              <h3 id="across" className="m-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">
                Across regions
              </h3>
              {signal ? (
                <>
                  <div className="mt-2.5">
                    <RegionBeads regions={signal.regions} max={4} size="sm" />
                  </div>
                  <p className="mt-2 mb-0 text-[14px] leading-[1.5] text-ink-2">
                    {truncateSentences(signal.text, 1)}{" "}
                    <Link href={`/regions/${signal.regions[0]}`} className="font-medium text-blue-text underline underline-offset-2 decoration-navy-200 hover:decoration-current">
                      {REGION_BY_ID[signal.regions[0]].short} view
                    </Link>
                  </p>
                </>
              ) : (
                <p className="mt-2 mb-0 text-[14px] leading-[1.5] text-ink-3">
                  No theme runs across more than one supplier region today. That is worth knowing too.
                </p>
              )}
            </section>

            <section className="mt-4 pt-4 border-t border-hairline" aria-labelledby="question">
              <h3 id="question" className="m-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">
                One question for today
              </h3>
              <p className="mt-2 mb-0 font-serif text-[16px] leading-[1.45] text-ink text-pretty">{analysis.meeting.question}</p>
              <Link href={`/brief/${lead.id}`} className="mt-2.5 inline-flex items-center gap-1 text-[13px] font-semibold text-blue-text hover:text-navy transition-colors duration-150">
                Open the meeting brief <IconArrow />
              </Link>
            </section>


          </aside>

          <div className="lg:col-span-2 mt-auto pt-3 border-t border-hairline">
            <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
              {aiEnabled() ? (
                <div className="w-full lg:w-auto lg:flex-1 lg:max-w-[62ch]">
                  <AskSignal inline placeholder="Ask SIGNAL about today's stories…" />
                </div>
              ) : null}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <p className="m-0 text-[12px] text-ink-3">{todayLabel(now)}</p>
                <Freshness sources={digest.sources} generatedAt={digest.generatedAt} storyCount={digest.stories.length} fixtures={digest.fixtures} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TodaySkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 pt-6 md:pt-8 pb-8" aria-busy="true" aria-live="polite">
      <div className="skeleton h-3.5 w-48" />
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
        <div>
          <div className="skeleton h-3 w-40" />
          <div className="mt-4 skeleton h-8 w-[85%]" />
          <div className="mt-2 skeleton h-8 w-[60%]" />
          <div className="mt-5 skeleton h-4 w-[90%]" />
          <div className="mt-2 skeleton h-4 w-[80%]" />
          <div className="mt-8 skeleton h-3 w-24" />
          <div className="mt-3 skeleton h-4 w-[88%]" />
          <div className="mt-2 skeleton h-4 w-[70%]" />
          <div className="mt-8 skeleton h-3 w-[62ch] max-w-full" />
        </div>
        <div className="space-y-4">
          <div className="skeleton h-3 w-20" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-[90%]" />
          <div className="skeleton h-4 w-[80%]" />
        </div>
      </div>
      <span className="sr-only">Loading today&rsquo;s signal</span>
    </div>
  );
}
