import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { getAnalysis } from "@/lib/analysis/ai";
import { getPersonalDigest } from "@/lib/data";
import { formatDate, formatDateTime } from "@/lib/format";
import { findStory } from "@/lib/news/pipeline";
import { Empty } from "@/components/Empty";
import { RegionBeads } from "@/components/RegionBead";
import { Wordmark } from "@/components/shell/Wordmark";
import { PrintButton } from "@/components/PrintButton";
import { SyntheticBadge } from "@/components/SyntheticBadge";
import { IconArrow, IconExternal } from "@/components/shell/icons";

export const metadata: Metadata = { title: "Meeting brief" };

export default function BriefPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-[760px] px-4 md:px-8 py-10"><div className="skeleton h-8 w-2/3" /><div className="mt-4 skeleton h-4 w-full" /><div className="mt-2 skeleton h-4 w-5/6" /></div>}>
      <Brief params={params} />
    </Suspense>
  );
}

async function Brief({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connection();
  const { digest } = await getPersonalDigest();
  const story = findStory(digest, id);
  if (!story) {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 py-10">
        <Empty title="This story is no longer in the digest" action={{ href: "/brief", label: "Choose another story" }}>
          Stories roll off as feeds refresh.
        </Empty>
      </div>
    );
  }
  const a = await getAnalysis(story, digest.stories);
  const related = digest.stories
    .filter((s) => s.id !== story.id && s.topics.some((t) => story.topics.includes(t)) && s.regions.some((r) => story.regions.includes(r)))
    .slice(0, 3);

  return (
    <article className="mx-auto w-full max-w-[760px] px-4 md:px-8 pt-6 md:pt-8 pb-12 print:max-w-none print:px-0 print:pt-0">
      <div className="flex items-center justify-between gap-4 print:hidden">
        <nav aria-label="Breadcrumb" className="text-[12.5px] text-ink-3">
          <Link href="/brief" className="hover:text-ink">Briefs</Link>
          <span aria-hidden="true" className="mx-1.5">/</span>
          <Link href={`/stories/${story.id}`} className="hover:text-ink">Story</Link>
        </nav>
        <PrintButton />
      </div>

      <header className="mt-5 pb-5 border-b border-hairline">
        <div className="hidden print:flex items-center justify-between gap-6 mb-4 pr-2">
          <Wordmark tone="dark" />
          <span className="text-[12px] text-ink-3">Meeting brief · {formatDate(new Date().toISOString())}</span>
        </div>
        <h1 className="m-0 text-[24px] md:text-[30px] leading-[1.15] font-semibold tracking-[-0.01em] text-ink text-balance">{story.title}</h1>
        <p className="mt-3 mb-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-3">
          <span className="font-semibold text-ink-2">Meeting brief</span>
          <span aria-hidden="true">·</span>
          <RegionBeads regions={a.regionsImplicated} max={3} size="sm" />
          <span aria-hidden="true">·</span>
          <span>{story.publisher}{story.publishedAt ? `, ${formatDateTime(story.publishedAt, { year: "numeric" })}` : ""}</span>
          <span aria-hidden="true">·</span>
          <span className="capitalize">{a.confidence.level} confidence</span>
          <SyntheticBadge show={digest.fixtures} />
        </p>
      </header>

      <div className="prose-signal mt-6 max-w-none">
        <section>
          <h2>The issue in plain English</h2>
          <p>{a.event[0].text}</p>
          {a.event[1] ? <p>{a.event[1].text}</p> : null}
        </section>

        <section>
          <h2>Strongest available evidence</h2>
          <ul>
            {a.evidence.establishes.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
          <p className="font-sans text-[14px] text-ink-3">Not established: {a.evidence.doesNotEstablish[0]}</p>
        </section>

        <section>
          <h2>Why it matters commercially</h2>
          <p>{a.mechanisms[0].chain}</p>
          <p>{a.implication[0].text}</p>
        </section>

        <section>
          <h2>Regional implications</h2>
          <p>{a.implication[1].text}</p>
        </section>

        <section>
          <h2>Risks and opportunities</h2>
          <ul>
            {a.secondOrder.filter((c) => c.kind === "hypothesis").map((c, i) => <li key={i}>{c.text}</li>)}
          </ul>
        </section>

        <section>
          <h2>Questions worth asking</h2>
          <ol>
            <li>{a.meeting.question}</li>
            {a.options.slice(0, 2).map((o, i) => (
              <li key={i}>Should we {lowerFirst(o.action).replace(/\.$/, "")}? (Trade-off: {lowerFirst(o.tradeoff)})</li>
            ))}
          </ol>
        </section>

        <section>
          <h2>A credible counterargument</h2>
          <p>{a.meeting.counterpoint}</p>
        </section>

        <section>
          <h2>What to monitor next</h2>
          <p>{a.meeting.indicator}</p>
        </section>

        <section>
          <h2>If asked for a view</h2>
          <p className="italic">{a.meeting.observation}</p>
          <p className="font-sans text-[13.5px] text-ink-3">
            Confidence is {a.confidence.level}: {a.confidence.reason}
          </p>
        </section>

        <section className="pt-6 border-t border-hairline">
          <h2>Source notes</h2>
          <ul className="font-sans text-[14px]">
            <li>
              {story.publisher}: <a href={story.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">{story.title} <IconExternal /></a>
              {story.publishedAt ? ` (${formatDateTime(story.publishedAt, { year: "numeric" })})` : ""}
            </li>
            {related.map((r) => (
              <li key={r.id}>
                {r.publisher}: <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">{r.title} <IconExternal /></a>
                {r.publishedAt ? ` (${formatDateTime(r.publishedAt, { year: "numeric" })})` : ""}
              </li>
            ))}
          </ul>
          <p className="font-sans text-[13px] text-ink-3">
            The evidence section quotes the source; everything else is SIGNAL&rsquo;s interpretation. Nothing here asserts a connection to a specific supplier, contract or shipment.
          </p>
        </section>
      </div>

      <p className="mt-8 print:hidden">
        <Link href={`/stories/${story.id}`} className="inline-flex items-center gap-1 text-[13.5px] font-semibold text-blue-text hover:text-navy">
          Read the full reasoning <IconArrow />
        </Link>
      </p>
    </article>
  );
}

function lowerFirst(s: string) {
  return /^[A-Z][a-z]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s;
}
