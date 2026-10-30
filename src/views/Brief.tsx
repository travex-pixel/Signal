import Link from "next/link";
import type { ReactNode } from "react";
import type { Analysis } from "@/lib/analysis/types";
import { formatDateTime } from "@/lib/format";
import type { Story } from "@/lib/news/types";
import { AskSignal } from "@/components/AskSignal";
import { RegionBeads } from "@/components/RegionBead";
import { Wordmark } from "@/components/shell/Wordmark";
import { PrintButton } from "@/components/PrintButton";
import { CopyButton } from "@/components/CopyButton";
import { EvidenceLine } from "@/components/Evidence";
import { SyntheticBadge } from "@/components/SyntheticBadge";
import { IconArrow, IconExternal } from "@/components/shell/icons";

/** The one-page meeting brief. Pure: shared by the live brief and a saved past day. */
export function BriefArticle({
  story,
  analysis: a,
  related,
  fixtures,
  storyHref,
  crumbs,
  printDate,
  ask,
}: {
  story: Story;
  analysis: Analysis;
  related: Story[];
  fixtures?: boolean;
  storyHref: string;
  crumbs: { href: string; label: string }[];
  printDate: ReactNode;
  ask: boolean;
}) {
  return (
    <article className="mx-auto w-full max-w-[820px] px-4 md:px-8 pt-6 md:pt-8 pb-12 print:max-w-none print:px-0 print:pt-0">
      <div className="flex items-center justify-between gap-4 print:hidden">
        <nav aria-label="Breadcrumb" className="text-[12.5px] text-ink-3">
          {crumbs.map((c, i) => (
            <span key={c.href}>
              {i > 0 ? <span aria-hidden="true" className="mx-1.5">/</span> : null}
              <Link href={c.href} className="hover:text-ink">{c.label}</Link>
            </span>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <CopyButton text={briefText(story, a)} label="Copy brief" />
          <PrintButton />
        </div>
      </div>

      <div className="mt-5 paper px-5 py-6 md:px-8 md:py-8 print:shadow-none print:border-0 print:p-0 print:rounded-none">
      <header className="pb-5 border-b border-hairline">
        <div className="hidden print:flex items-center justify-between gap-6 mb-4 pr-2">
          <Wordmark tone="dark" />
          <span className="text-[12px] text-ink-3">Meeting brief · {printDate}</span>
        </div>
        <h1 className="m-0 text-[24px] md:text-[30px] leading-[1.15] font-semibold tracking-[-0.01em] text-ink text-balance">{story.title}</h1>
        <p className="mt-3 mb-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-3">
          <span className="font-semibold text-ink-2">Meeting brief</span>
          <RegionBeads regions={a.regionsImplicated} max={3} size="sm" />
          <span className="whitespace-nowrap">{story.publisher}{story.publishedAt ? `, ${formatDateTime(story.publishedAt, { year: "numeric" })}` : ""}</span>
          <SyntheticBadge show={fixtures} />
        </p>
        <EvidenceLine story={story} confidence={a.confidence} className="mt-2" />
      </header>

      <div className="prose-signal mt-6 max-w-none">
        <section>
          <h2>In one sentence</h2>
          <p className="!text-[19px] !leading-[1.45] text-ink">{a.meeting.observation}</p>
        </section>

        <section>
          <h2>What happened</h2>
          <p>{a.event[0]?.text}</p>
          {a.event.slice(1).map((c, i) => <p key={i}>{c.text}</p>)}
        </section>

        <section>
          <h2>Why it matters for us</h2>
          <p>{a.implication[0]?.text}</p>
          {a.implication[1] ? <p className="text-ink-2">{a.implication[1].text}</p> : null}
        </section>

        <section>
          <h2>A question to ask</h2>
          <p>{a.meeting.question}</p>
        </section>

        <section>
          <h2>Ideas you could raise</h2>
          <ol className="!pl-0 list-none space-y-3">
            {a.options.slice(0, 3).map((o, i) => (
              <li key={i} className="grid grid-cols-[1.5rem_1fr] gap-x-2">
                <span className="font-sans text-[13px] font-semibold text-ink-4 tnum pt-[4px]">{i + 1}</span>
                <span>
                  <span className="block">{o.action}</span>
                  <span className="block mt-1 font-sans text-[14px] text-ink-3">The cost: {lowerFirst(o.tradeoff)}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2>The other view</h2>
          <p>{a.meeting.counterpoint}</p>
        </section>

        <section>
          <h2>What to watch</h2>
          <p>{a.meeting.indicator}</p>
        </section>

        <section>
          <h2>How sure we are</h2>
          <p className="font-sans !text-[15px] text-ink-2">
            <strong className="font-semibold text-ink">{LEVEL_WORD[a.confidence.level]}.</strong> {a.confidence.reason}
          </p>
          <p className="font-sans !text-[15px] text-ink-2">
            The source does not show {lowerFirst(a.evidence.doesNotEstablish[0] ?? "").replace(/\.$/, "")}.
          </p>
        </section>

        <section className="pt-6 border-t border-hairline">
          <h2>Sources</h2>
          <ul className="font-sans text-[14px]">
            <li>
              {story.publisher}: <a href={story.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">{story.title} <IconExternal className="flex-none" /></a>
              {story.publishedAt ? ` (${formatDateTime(story.publishedAt, { year: "numeric" })})` : ""}
            </li>
            {(story.alsoReportedBy ?? []).filter((r) => r.url).map((r) => (
              <li key={r.url}>
                {r.publisher}: <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">{r.title} <IconExternal className="flex-none" /></a>
              </li>
            ))}
          </ul>
          {related.length > 0 ? (
            <>
              <h3 className="!mt-5 !mb-2 font-sans text-[13px] font-semibold text-ink-3">Related reading</h3>
              <ul className="font-sans text-[14px]">
                {related.map((r) => (
                  <li key={r.id}>
                    {r.publisher}: <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">{r.title} <IconExternal className="flex-none" /></a>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          <p className="font-sans text-[13px] text-ink-3">
            &ldquo;What happened&rdquo; quotes the source. Everything else is SIGNAL&rsquo;s reading. Nothing here asserts a connection to a specific supplier, contract or shipment.
          </p>
        </section>
      </div>

      </div>

      {ask ? (
        <div className="mt-8 print:hidden">
          <AskSignal storyId={story.id} suggestions={["Give me a one-sentence version for a meeting", "What is the strongest objection to this?"]} />
        </div>
      ) : null}

      <p className="mt-8 print:hidden">
        <Link href={storyHref} className="inline-flex items-center gap-1 text-[13.5px] font-semibold text-blue-text hover:text-navy">
          Read the full reasoning <IconArrow />
        </Link>
      </p>
    </article>
  );
}

export function relatedStories(stories: Story[], story: Story): Story[] {
  return stories
    .filter((s) => s.id !== story.id && s.topics.some((t) => story.topics.includes(t)) && s.regions.some((r) => story.regions.includes(r)))
    .slice(0, 3);
}

const LEVEL_WORD = { high: "High confidence", medium: "Medium confidence", low: "Low confidence" } as const;

/** The brief as plain text, for the clipboard. */
function briefText(story: Story, a: Analysis): string {
  const lines = [
    `MEETING BRIEF: ${story.title}`,
    `${story.publisher}${story.publishedAt ? `, ${formatDateTime(story.publishedAt, { year: "numeric" })}` : ""}`,
    "",
    "In one sentence",
    a.meeting.observation,
    "",
    "Why it matters for us",
    a.implication[0]?.text ?? "",
    "",
    "A question to ask",
    a.meeting.question,
    "",
    "Ideas you could raise",
    ...a.options.slice(0, 3).map((o, i) => `${i + 1}. ${o.action} (The cost: ${lowerFirst(o.tradeoff)})`),
    "",
    "The other view",
    a.meeting.counterpoint,
    "",
    "What to watch",
    a.meeting.indicator,
    "",
    `${LEVEL_WORD[a.confidence.level]}. Source: ${story.url}`,
  ];
  return lines.join("\n");
}

function lowerFirst(s: string) {
  return /^[A-Z][a-z]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s;
}

export function BriefSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[820px] px-4 md:px-8 py-10" aria-busy="true">
      <div className="skeleton h-8 w-2/3" />
      <div className="mt-4 skeleton h-4 w-full" />
      <div className="mt-2 skeleton h-4 w-5/6" />
      <span className="sr-only">Loading brief</span>
    </div>
  );
}
