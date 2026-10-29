import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { editionLabel, isValidEditionDate } from "@/lib/editions/dates";
import { loadEdition } from "@/lib/editions/editions";
import type { Edition } from "@/lib/editions/types";
import type { Story } from "@/lib/news/types";
import { EditionState } from "@/components/editions/EditionStates";
import { RegionBeads } from "@/components/RegionBead";
import { TodaySkeleton, TodayView } from "@/views/Today";

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }): Promise<Metadata> {
  const { date } = await params;
  return { title: isValidEditionDate(date) ? editionLabel(date) : "Past days" };
}

export default function EditionPage({ params }: { params: Promise<{ date: string }> }) {
  return (
    <Suspense fallback={<TodaySkeleton />}>
      <Day params={params} />
    </Suspense>
  );
}

async function Day({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const result = await loadEdition(date);
  if (result.state !== "ok") {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 py-10">
        <EditionState state={result.state} date={isValidEditionDate(date) ? date : undefined} />
      </div>
    );
  }
  const { edition, prev, next } = result;
  return (
    <>
      <TodayView digest={edition.digest} edition={{ edition, prev, next }} />
      <MoreFromDay edition={edition} />
    </>
  );
}

/** The day's other meeting-brief picks, beyond the lead and the three beside it. */
function MoreFromDay({ edition }: { edition: Edition }) {
  const shown = new Set([edition.leadId, ...edition.supportingIds]);
  const byId = new Map(edition.digest.stories.map((s) => [s.id, s]));
  const more = edition.pickIds
    .filter((id) => !shown.has(id))
    .map((id) => byId.get(id))
    .filter((s): s is Story => s !== undefined);
  if (more.length === 0) return null;
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 pb-10">
      <section className="paper px-5 py-5 md:px-8 md:py-6" aria-labelledby="more">
        <h2 id="more" className="m-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">More from this day</h2>
        <ol className="mt-2 m-0 p-0 list-none grid gap-x-10 md:grid-cols-2">
          {more.map((s) => (
            <li key={s.id} className="border-t border-hairline py-3.5">
              <Link href={`/editions/${edition.date}/${s.id}`} className="group block">
                <span className="block text-[15px] leading-[1.35] font-medium text-ink group-hover:text-navy-700 transition-colors duration-150 text-pretty">{s.title}</span>
                <span className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[12px] text-ink-3">
                  <RegionBeads regions={s.regions} max={1} size="sm" />
                  <span aria-hidden="true">·</span>
                  <span>{s.publisher}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
