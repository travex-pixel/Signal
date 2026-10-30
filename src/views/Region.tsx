import Link from "next/link";
import { analyzeStory, lcName, matchMechanisms } from "@/lib/analysis/engine";
import { REGION_BY_ID, REGIONS, SUPPLIER_REGIONS, TOPIC_BY_ID } from "@/lib/news/regions";
import type { Digest, RegionId, Story, TopicId } from "@/lib/news/types";
import { Empty } from "@/components/Empty";
import { Plate, type PlateName } from "@/components/Plate";
import { RegionBeads } from "@/components/RegionBead";
import { StoryMeta } from "@/components/StoryMeta";
import { SyntheticBadge } from "@/components/SyntheticBadge";
import { IconArrow } from "@/components/shell/icons";

export const VALID_REGIONS = new Set<string>(REGIONS.map((r) => r.id));

/** Shorter names where two would not fit a phone column. */
const PHONE_NAME: Partial<Record<RegionId, string>> = { sea: "SE Asia", global: "Global" };

export function RegionTabs({ current }: { current: RegionId }) {
  return (
    <nav aria-label="Regions">
      {/* Phones: all six regions visible as a 3 by 2 grid. Wider screens: one ruled row of tabs. */}
      <ul className="m-0 p-0 list-none grid grid-cols-3 gap-1.5 sm:flex sm:gap-1 sm:border-b sm:border-hairline">
        {REGIONS.map((r) => {
          const active = r.id === current;
          return (
            <li key={r.id} className="min-w-0">
              <Link
                href={`/regions/${r.id}`}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center justify-center sm:justify-start gap-1.5 min-h-11 px-2 sm:px-3 rounded-lg sm:rounded-none text-[13px] sm:text-[13.5px] font-semibold whitespace-nowrap transition-[color,background-color,box-shadow] duration-150 ${
                  active ? "bg-surface shadow-1 text-ink sm:bg-transparent sm:shadow-none" : "text-ink-3 hover:text-ink"
                }`}
              >
                <span aria-hidden="true" className="flex-none w-2 h-2 rounded-full" style={{ background: `var(--region-${r.hue})` }} />
                <span className="truncate sm:hidden">{PHONE_NAME[r.id] ?? r.name}</span>
                <span className="hidden sm:inline">{r.name}</span>
                {active ? (
                  <span aria-hidden="true" className="hidden sm:block absolute left-3 right-3 -bottom-px h-[2px] rounded-full" style={{ background: `var(--region-${r.hue})` }} />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** A regional view, pure: rendered from a digest for one region. */
export function RegionView({ digest, id }: { digest: Digest; id: RegionId }) {
  const now = new Date(digest.generatedAt);
  const meta = REGION_BY_ID[id];
  const stories = digest.stories.filter((s) => (id === "global" ? s.regions.length === 1 && s.regions[0] === "global" : s.regions.includes(id)));
  const strong = stories.filter((s) => s.relevance.score >= 6).slice(0, 6);
  const topics = topicCounts(strong);
  const lead = strong[0];
  const leadAnalysis = lead ? analyzeStory(lead, digest) : undefined;
  const mechanisms = lead ? matchMechanisms({ topics: topics.slice(0, 2).map((t) => t.id), regions: [id] }, 2) : [];

  // Cross-regional links: stories that touch this region and another supplier region.
  const crossLinks = strong.filter((s) => s.regions.some((r) => r !== id && SUPPLIER_REGIONS.includes(r))).slice(0, 3);

  return (
    <div className="mt-6 paper px-5 py-5 md:px-8 md:py-7 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
      <div className="min-w-0">
        <header className="flex items-start gap-6">
          <div className="min-w-0">
            <h1 className="m-0 text-[26px] md:text-[30px] leading-[1.15] font-semibold tracking-[-0.015em] text-ink">{meta.name}</h1>
            <p className="mt-2 mb-0 text-[14.5px] leading-[1.5] text-ink-2 max-w-[60ch]">{meta.description}</p>
            <SyntheticBadge show={digest.fixtures} />
          </div>
          <Plate name={`region-${id}` as PlateName} width={140} className="hidden sm:block flex-none -mt-6" />
        </header>

        {strong.length === 0 ? (
          <div className="mt-6">
            <Empty title={`Nothing of sufficient relevance for ${meta.short} right now`} action={{ href: "/sources", label: "See source status" }}>
              {stories.length > 0
                ? `${stories.length} ${stories.length === 1 ? "story mentions" : "stories mention"} this region, but none scored high enough on relevance, evidence and recency to show here. That is an honest quiet day, not a missing feed.`
                : "No current story in the digest is tagged with this region. Feeds refresh every fifteen minutes."}
            </Empty>
          </div>
        ) : (
          <>
            <section className="mt-7" aria-labelledby="dev">
              <h2 id="dev" className="m-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">Important developments</h2>
              <ol className="mt-2 m-0 p-0 list-none divide-y divide-hairline">
                {strong.map((s, i) => (
                  <li key={s.id} className="py-3.5">
                    <Link href={`/stories/${s.id}`} className="group grid grid-cols-[1.5rem_1fr] gap-x-2">
                      <span className="text-[13px] font-semibold text-ink-4 tnum pt-[2px]">{i + 1}</span>
                      <span className="min-w-0">
                        <span className={`block leading-[1.35] font-medium text-ink group-hover:text-navy-700 transition-colors duration-150 text-pretty ${i === 0 ? "text-[19px]" : "text-[15.5px]"}`}>{s.title}</span>
                        {i === 0 && s.summary ? <span className="block mt-1.5 font-serif text-[15px] leading-[1.5] text-ink-2">{s.summary}</span> : null}
                        <StoryMeta story={s} now={now} className="mt-1.5" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>

            {leadAnalysis ? (
              <section className="mt-8" aria-labelledby="impl">
                <h2 id="impl" className="m-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">Possible implications</h2>
                <p className="mt-2 mb-0 font-serif text-[16px] leading-[1.55] text-ink max-w-[62ch]">{leadAnalysis.implication[0].text}</p>
                <p className="mt-3 mb-0 text-[13.5px] text-ink-3 max-w-[62ch]">
                  Read from the leading story through <em>{lcName(leadAnalysis.mechanisms[0].name)}</em>. This is our reading, not a fact. Real exposure depends on suppliers, lanes and grades.
                </p>
                <h2 className="mt-6 mb-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">Key unknowns</h2>
                <ul className="mt-2 mb-0 pl-4 space-y-1.5 text-[14.5px] leading-[1.5] text-ink-2 max-w-[62ch]">
                  {leadAnalysis.evidence.doesNotEstablish.map((u, i) => <li key={i}>{u}</li>)}
                </ul>
              </section>
            ) : null}
          </>
        )}
      </div>

      <aside className="min-w-0 lg:border-l lg:border-hairline lg:pl-10 space-y-7">
        <section aria-labelledby="signals">
          <h2 id="signals" className="m-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">Economic and policy signals</h2>
          {topics.length === 0 ? (
            <p className="mt-2 mb-0 text-[14px] text-ink-3">No topic has enough coverage to call a signal.</p>
          ) : (
            <ul className="mt-2 m-0 p-0 list-none space-y-1.5">
              {topics.slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-baseline justify-between gap-3 text-[14px]">
                  <span className="text-ink">{TOPIC_BY_ID[t.id].name}</span>
                  <span className="text-[12.5px] text-ink-3">{t.count} {t.count === 1 ? "story" : "stories"}</span>
                </li>
              ))}
            </ul>
          )}
          {mechanisms.length > 0 ? (
            <p className="mt-3 mb-0 text-[13.5px] leading-[1.5] text-ink-2">
              How it works here: {mechanisms.map((m) => lcName(m.name)).join(", and ")}.
            </p>
          ) : null}
        </section>

        <section className="pt-6 border-t border-hairline" aria-labelledby="cross">
          <h2 id="cross" className="m-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">Connected regions</h2>
          {crossLinks.length === 0 ? (
            <p className="mt-2 mb-0 text-[14px] text-ink-3">No story in this region currently links to another supplier region through a defensible mechanism.</p>
          ) : (
            <ul className="mt-2 m-0 p-0 list-none space-y-3">
              {crossLinks.map((s) => (
                <li key={s.id}>
                  <Link href={`/stories/${s.id}`} className="group block">
                    <span className="block text-[14px] leading-[1.4] font-medium text-ink group-hover:text-navy-700 text-pretty">{s.title}</span>
                    <span className="mt-1 block"><RegionBeads regions={s.regions} max={3} size="sm" /></span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="pt-6 border-t border-hairline" aria-labelledby="srcs">
          <h2 id="srcs" className="m-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">Sources in this view</h2>
          <ul className="mt-2 m-0 p-0 list-none space-y-1 text-[13.5px] text-ink-2">
            {Array.from(new Set(strong.map((s) => s.publisher))).slice(0, 6).map((p) => <li key={p}>{p}</li>)}
          </ul>
          <Link href="/sources" className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-blue-text hover:text-navy">Source status <IconArrow /></Link>
        </section>
      </aside>
    </div>
  );
}

function topicCounts(stories: Story[]): { id: TopicId; count: number }[] {
  const counts = new Map<TopicId, number>();
  for (const s of stories) for (const t of s.topics) counts.set(t, (counts.get(t) ?? 0) + 1);
  return Array.from(counts, ([id, count]) => ({ id, count })).sort((a, b) => b.count - a.count);
}
