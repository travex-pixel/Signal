import Link from "next/link";
import { aiEnabled } from "@/lib/analysis/ai";
import { analyzeStory } from "@/lib/analysis/engine";
import { AskSignal } from "@/components/AskSignal";
import { crossRegionalSignal } from "@/lib/analysis/engine";
import { formatTime, todayLabel, truncateSentences } from "@/lib/format";
import { selectForToday } from "@/lib/news/rank";
import { editionLabel, savedTime } from "@/lib/editions/dates";
import type { Edition } from "@/lib/editions/types";
import { REGION_BY_ID } from "@/lib/news/regions";
import type { Digest, RegionId, Story } from "@/lib/news/types";
import { Chain } from "@/components/Chain";
import { TodayDate } from "@/components/Clock";
import { Empty } from "@/components/Empty";
import { Plate, type PlateName } from "@/components/Plate";
import { RegionBeads } from "@/components/RegionBead";
import { StoryMeta } from "@/components/StoryMeta";
import { Welcome } from "@/components/Welcome";
import { ButtonLink } from "@/components/Button";
import { IconArrow, IconChevron } from "@/components/shell/icons";
import { EvidenceLine } from "@/components/Evidence";
import { DayKind } from "@/components/editions/TodayMark";

/**
 * Today's Signal. Pure: it renders from a digest, so the static route and the
 * personalised route share it. "Now" is the digest's own timestamp; relative
 * times and the date are corrected in the browser by the Clock components.
 */
export interface EditionContext {
  edition: Edition;
  prev?: string;
  next?: string;
}

/**
 * Today's Signal, or a saved past day when `edition` is given. A past day
 * shows the stories and reasoning that were saved, never recomputed ones,
 * links stay inside that day, and nothing reads today's clock.
 */
export function TodayView({ digest, edition }: { digest: Digest; edition?: EditionContext }) {
  const now = new Date(digest.generatedAt);
  const saved = edition?.edition;
  const byId = new Map(digest.stories.map((s) => [s.id, s]));
  const live = saved ? undefined : selectForToday(digest.stories, { supporting: 3 });
  const lead = saved ? (saved.leadId ? byId.get(saved.leadId) : undefined) : live?.lead;
  const supporting = saved
    ? saved.supportingIds.map((id) => byId.get(id)).filter((s): s is Story => s !== undefined)
    : (live?.supporting ?? []);
  const signal: { regions: RegionId[]; text: string } | undefined = saved ? saved.signal : crossRegionalSignal(digest.stories);
  const analysis = lead ? (saved?.analyses[lead.id] ?? analyzeStory(lead, digest)) : undefined;
  const okSources = digest.sources.filter((s) => s.ok).length;
  const storyHref = (id: string) => (saved ? `/editions/${saved.date}/${id}` : `/stories/${id}`);
  const briefHref = (id: string) => (saved ? `/editions/${saved.date}/${id}/brief` : `/brief/${id}`);

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 pt-5 md:pt-6 pb-6 flex-1 flex flex-col">
      {saved ? (
        <EditionBar edition={edition!} />
      ) : (
        <>
          <Welcome />
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
            <h1 className="m-0 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3">
              <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-coral" />
              Today&rsquo;s Signal
              <span className="font-medium normal-case tracking-normal text-ink-2">
                <span aria-hidden="true">· </span>
                <TodayDate fallback={todayLabel(now)} />
              </span>
            </h1>
            <p className="m-0 text-[12.5px] text-ink-3 tnum">Updated {formatTime(digest.generatedAt)}</p>
          </div>
        </>
      )}

      {!lead || !analysis ? (
        <div className="mt-8">
          <Empty
            title={saved ? "No story led this day" : okSources === 0 ? "No sources could be reached" : "Nothing met the quality threshold today"}
            action={saved ? { href: "/editions", label: "Other days" } : { href: "/sources", label: "See source status" }}
          >
            {saved
              ? "The feeds answered that day, but no story scored high enough to lead it."
              : okSources === 0
              ? "Every configured feed failed on the last refresh. SIGNAL does not show stand-in stories. It will try again on the next refresh."
              : "The feeds returned stories, but none scored high enough on relevance, evidence and recency to lead the day. Try the regional views or widen your preferences."}
          </Empty>
        </div>
      ) : (
        <div className="paper px-5 py-5 md:px-8 md:py-7 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14 flex-1">
          {/* Lead */}
          <article className="min-w-0 rise">
            <div className="flex items-start gap-8">
              <div className="min-w-0 flex-1">
                <StoryMeta story={lead} now={now} absolute={Boolean(saved)} />
                <h2 className="mt-3 mb-0 text-[26px] md:text-[32px] leading-[1.12] font-semibold tracking-[-0.015em] text-ink text-balance max-w-[24ch]">
                  <Link href={storyHref(lead.id)} className="hover:text-navy-700 transition-colors duration-150">
                    {lead.title}
                  </Link>
                </h2>
                <EvidenceLine story={lead} confidence={analysis.confidence} className="mt-3" />
                {lead.summary ? (
                  <p className="mt-4 mb-0 font-serif text-[17px] leading-[1.55] text-ink-2 max-w-[62ch]">{truncateSentences(lead.summary, 3)}</p>
                ) : null}
              </div>
              <Plate name={`region-${lead.regions[0]}` as PlateName} width={220} priority className="hidden lg:block flex-none -mt-4 -mr-2" />
            </div>

            <section className="mt-6 max-w-[62ch]" aria-labelledby="why">
              <h3 id="why" className="m-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">
                Why it matters
              </h3>
              <p className="mt-2 mb-0 font-serif text-[17px] leading-[1.55] text-ink">
                {truncateSentences(analysis.implication[0]?.text ?? "", 2)}
              </p>
            </section>

            <section className="mt-5 max-w-[62ch]" aria-labelledby="say">
              <h3 id="say" className="m-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">
                In a meeting, you could say
              </h3>
              <p className="mt-2 mb-0 font-serif italic text-[16.5px] leading-[1.5] text-ink-2">&ldquo;{analysis.meeting.observation}&rdquo;</p>
            </section>

            <div className="mt-6 max-w-[62ch]">
              <Chain href={storyHref(lead.id)} region={lead.regions[0]} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:items-center">
              <ButtonLink href={storyHref(lead.id)} variant="primary">
                Read the reasoning <IconArrow />
              </ButtonLink>
              <ButtonLink href={briefHref(lead.id)}>Meeting brief</ButtonLink>
              <Link
                href={`${storyHref(lead.id)}#sources`}
                className="col-span-2 sm:col-auto inline-flex items-center justify-center sm:justify-start min-h-11 sm:min-h-9 sm:px-2 text-[13.5px] font-semibold text-blue-text hover:text-navy transition-colors duration-150"
              >
                Sources and evidence
              </Link>
            </div>

            {analysis.principle.lessonSlug ? (
              <p className="mt-6 mb-0 pt-4 border-t border-hairline max-w-[62ch] text-[13.5px] leading-[1.5] text-ink-3">
                <span className="font-semibold text-ink-2">The idea behind it: </span>
                {analysis.principle.title}.{" "}
                <Link href={`/learn/${analysis.principle.lessonSlug}`} className="inline-flex items-center gap-1 min-h-11 sm:min-h-0 font-semibold text-blue-text hover:text-navy whitespace-nowrap">
                  Five-minute lesson <IconArrow />
                </Link>
              </p>
            ) : null}
          </article>

          {/* Supporting column */}
          <aside className="min-w-0 lg:border-l lg:border-hairline lg:pl-10 flex flex-col">
            {supporting.length > 0 ? (
              <section aria-labelledby="also">
                <h3 id="also" className="m-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">
                  {saved ? "Also that day" : "Also today"}
                </h3>
                <ol className="mt-3 m-0 p-0 list-none divide-y divide-hairline">
                  {supporting.map((s, i) => (
                    <li key={s.id} className="py-3 first:pt-0">
                      <Link href={storyHref(s.id)} className="group grid grid-cols-[1.25rem_1fr] gap-x-2">
                        <span className="text-[13px] font-semibold text-ink-4 tnum pt-[2px]">{i + 1}</span>
                        <span>
                          <span className="block text-[15px] leading-[1.35] font-medium text-ink group-hover:text-navy-700 transition-colors duration-150 text-pretty">
                            {s.title}
                          </span>
                          <span className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[12.5px] text-ink-3">
                            <RegionBeads regions={s.regions} max={1} size="sm" />
                            <span className="whitespace-nowrap">
                              <span aria-hidden="true">· </span>
                              {s.publisher}
                              {s.alsoReportedBy?.length ? ` and ${s.alsoReportedBy.length} more` : ""}
                            </span>
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
                    {truncateSentences(saved ? signal.text.replace(/\btoday's\b/g, "that day's") : signal.text, 1)}
                    {saved ? null : (
                      <>
                        {" "}
                        <Link href={`/regions/${signal.regions[0]}`} className="font-medium text-blue-text underline underline-offset-2 decoration-navy-200 hover:decoration-current">
                          {REGION_BY_ID[signal.regions[0]].short} view
                        </Link>
                      </>
                    )}
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
                {saved ? "One question from that day" : "One question for today"}
              </h3>
              <p className="mt-2 mb-0 font-serif text-[16px] leading-[1.45] text-ink text-pretty">{analysis.meeting.question}</p>
              <Link href={briefHref(lead.id)} className="mt-1.5 inline-flex items-center gap-1 min-h-11 text-[13.5px] font-semibold text-blue-text hover:text-navy transition-colors duration-150">
                Open the meeting brief <IconArrow />
              </Link>
            </section>


          </aside>

          {!saved && aiEnabled() ? (
            <div className="lg:col-span-2 mt-auto pt-4 border-t border-hairline">
              <div className="lg:max-w-[62ch]">
                <AskSignal inline placeholder="Ask SIGNAL about today's stories…" />
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

/** The header of a saved day: which day, when it was kept, and the way to the days either side. */
function EditionBar({ edition: { edition, prev, next } }: { edition: EditionContext }) {
  const pill =
    "inline-flex items-center gap-1 h-10 px-3 rounded-full text-[12.5px] font-semibold text-blue-text bg-surface shadow-1 hover:text-navy hover:shadow-2 transition-[color,box-shadow] duration-150";
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div className="min-w-0">
        <h1 className="m-0 flex flex-wrap items-center gap-x-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3">
          <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-slate" />
          <DayKind date={edition.date} />
          <span className="font-medium normal-case tracking-normal text-ink-2">
            <span aria-hidden="true">· </span>
            {editionLabel(edition.date)}
          </span>
        </h1>
        <p className="mt-1 mb-0 text-[12.5px] text-ink-3">
          Kept at {savedTime(edition.savedAt)}. The stories and reasoning are exactly as they were then.
        </p>
      </div>
      <nav aria-label="Other days" className="flex items-center gap-2">
        {prev ? (
          <Link href={`/editions/${prev}`} className={pill} aria-label={`Earlier: ${editionLabel(prev)}`}>
            <IconChevron className="rotate-180" width={15} height={15} />
            Earlier
          </Link>
        ) : null}
        {next ? (
          <Link href={`/editions/${next}`} className={pill} aria-label={`Later: ${editionLabel(next)}`}>
            Later
            <IconChevron width={15} height={15} />
          </Link>
        ) : null}
        <Link
          href="/"
          className="btn-primary inline-flex items-center h-10 px-3.5 rounded-full text-[12.5px] font-semibold text-white transition-[background,box-shadow] duration-150"
        >
          Today
        </Link>
      </nav>
    </div>
  );
}

export function TodaySkeleton() {
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
