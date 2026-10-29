import Link from "next/link";
import type { Digest } from "@/lib/news/types";
import { todayLabel } from "@/lib/format";
import { selectForToday } from "@/lib/news/rank";
import { TodayDate } from "@/components/Clock";
import { Empty } from "@/components/Empty";
import { Plate } from "@/components/Plate";
import { StoryMeta } from "@/components/StoryMeta";
import { IconArrow } from "@/components/shell/icons";

/** The brief index, pure: today's picks from a digest. */
export function BriefIndexView({ digest }: { digest: Digest }) {
  const now = new Date(digest.generatedAt);
  const { lead, supporting } = selectForToday(digest.stories, { supporting: 7, minScore: 6 });
  const picks = lead ? [lead, ...supporting] : [];

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 pt-6 md:pt-8 pb-10">
      <div className="flex items-start justify-between gap-8">
        <div className="max-w-[56ch]">
          <h1 className="m-0 text-[26px] md:text-[30px] leading-[1.15] font-semibold tracking-[-0.015em] text-ink">Meeting briefs</h1>
          <p className="mt-3 mb-0 font-serif text-[17px] leading-[1.5] text-ink-2 text-pretty">
            Pick a development. Get the issue, the evidence, the questions and a counterargument on one page, short by default and printable. Deeper reasoning stays one link away in the story view.
          </p>
        </div>
        <Plate name="chain" width={220} className="hidden md:block flex-none -mt-6" />
      </div>

      {picks.length === 0 ? (
        <div className="mt-8">
          <Empty title="No stories to brief yet" action={{ href: "/sources", label: "See source status" }}>
            Nothing in the current digest met the quality threshold.
          </Empty>
        </div>
      ) : (
        <div className="mt-7 paper px-5 py-5 md:px-8 md:py-6">
          <h2 className="m-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">
            Today&rsquo;s picks <span className="text-ink-4 font-medium normal-case tracking-normal">· <TodayDate fallback={todayLabel(now)} /></span>
          </h2>
        <ol className="mt-2 m-0 p-0 list-none grid gap-x-10 md:grid-cols-2">
          {picks.map((s, i) => (
            <li key={s.id} className="border-t border-hairline py-4">
              <Link href={`/brief/${s.id}`} className="group grid grid-cols-[1.5rem_1fr] gap-x-2">
                <span className="text-[13px] font-semibold text-ink-4 tnum pt-[3px]">{i + 1}</span>
                <span className="min-w-0">
                  <span className="block text-[16px] leading-[1.35] font-medium text-ink group-hover:text-navy-700 transition-colors duration-150 text-pretty">{s.title}</span>
                  <StoryMeta story={s} now={now} className="mt-1.5" />
                  <span className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-blue-text">
                    Open brief <IconArrow />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
        </div>
      )}
    </div>
  );
}
