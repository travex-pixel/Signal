import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { editionNoon, savedTime } from "@/lib/editions/dates";
import { editionsEnabled, loadEditionIndex } from "@/lib/editions/editions";
import type { EditionSummary } from "@/lib/editions/types";
import { REGION_BY_ID } from "@/lib/news/regions";
import { EditionState } from "@/components/editions/EditionStates";
import { TodayMark } from "@/components/editions/TodayMark";
import { Plate } from "@/components/Plate";
import { RegionBeads } from "@/components/RegionBead";
import { IconArrow } from "@/components/shell/icons";

export const metadata: Metadata = { title: "Past days" };

export default function EditionsPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 pt-6 md:pt-8 pb-10">
      <div className="flex items-start justify-between gap-8">
        <div className="max-w-[56ch]">
          <h1 className="m-0 text-[26px] md:text-[30px] leading-[1.15] font-semibold tracking-[-0.015em] text-ink">Past days</h1>
          <p className="mt-3 mb-0 font-serif text-[17px] leading-[1.5] text-ink-2 text-pretty">
            SIGNAL keeps a copy of every day, first in the morning and again in the evening. Open a day to read its stories and reasoning exactly as they were.
          </p>
        </div>
        <Plate name="chain" width={200} className="hidden md:block flex-none -mt-6" />
      </div>
      <Suspense fallback={<div className="mt-7 paper h-64" aria-busy="true" />}>
        <DayList />
      </Suspense>
    </div>
  );
}

const TZ = "Australia/Sydney";
const monthKey = (date: string) => date.slice(0, 7);
const monthLabel = (date: string) => editionNoon(date).toLocaleDateString("en-AU", { timeZone: TZ, month: "long", year: "numeric" });

async function DayList() {
  if (!editionsEnabled()) return <div className="mt-7"><EditionState state="off" /></div>;
  const result = await loadEditionIndex();
  if (!result.ok) return <div className="mt-7"><EditionState state="error" /></div>;
  const days = result.index.editions;
  if (days.length === 0) return <div className="mt-7"><EditionState state="empty" /></div>;

  const months: { key: string; label: string; days: EditionSummary[] }[] = [];
  for (const d of days) {
    const key = monthKey(d.date);
    const last = months[months.length - 1];
    if (last && last.key === key) last.days.push(d);
    else months.push({ key, label: monthLabel(d.date), days: [d] });
  }

  return (
    <div className="mt-7 paper px-5 py-5 md:px-8 md:py-7">
      {months.map((m, mi) => (
        <section key={m.key} aria-labelledby={`m-${m.key}`} className={mi > 0 ? "mt-8" : ""}>
          <h2 id={`m-${m.key}`} className="m-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">{m.label}</h2>
          <ol className="mt-2 m-0 p-0 list-none divide-y divide-hairline border-t border-hairline">
            {m.days.map((d) => (
              <li key={d.date}>
                <DayRow day={d} />
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

function DayRow({ day }: { day: EditionSummary }) {
  const noon = editionNoon(day.date);
  const weekday = noon.toLocaleDateString("en-AU", { timeZone: TZ, weekday: "short" });
  const dayNum = noon.toLocaleDateString("en-AU", { timeZone: TZ, day: "numeric" });
  const month = noon.toLocaleDateString("en-AU", { timeZone: TZ, month: "short" });
  const region = day.leadRegion && day.leadRegion in REGION_BY_ID ? day.leadRegion : undefined;
  return (
    <Link href={`/editions/${day.date}`} className="group grid grid-cols-[3.5rem_1fr_auto] items-start gap-x-4 py-4">
      <span className="flex flex-col items-center rounded-lg bg-surface-2 border border-hairline py-1.5 tnum" aria-hidden="true">
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3">{weekday}</span>
        <span className="text-[22px] leading-none font-semibold text-ink mt-0.5">{dayNum}</span>
        <span className="text-[11px] font-medium text-ink-3 mt-0.5">{month}</span>
      </span>
      <span className="min-w-0">
        <span className="sr-only">{noon.toLocaleDateString("en-AU", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" })}: </span>
        <TodayMark date={day.date} />
        <span className="block mt-0.5 text-[16px] leading-[1.35] font-medium text-ink group-hover:text-navy-700 transition-colors duration-150 text-pretty">
          {day.leadTitle ?? "No story led this day"}
        </span>
        <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-ink-3">
          {region ? <RegionBeads regions={[region]} max={1} size="sm" /> : null}
          {day.leadPublisher ? (
            <span className="whitespace-nowrap">
              {region ? <span aria-hidden="true">· </span> : null}
              {day.leadPublisher}
            </span>
          ) : null}
          <span className="whitespace-nowrap">
            <span aria-hidden="true">· </span>Kept at {savedTime(day.savedAt)}
          </span>
        </span>
      </span>
      <span className="pt-1 text-ink-4 group-hover:text-navy transition-colors duration-150" aria-hidden="true">
        <IconArrow />
      </span>
    </Link>
  );
}
