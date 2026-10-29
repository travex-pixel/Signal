import type { Metadata } from "next";
import Link from "next/link";
import { LESSONS } from "@/lib/learn/lessons";
import { SIMULATORS } from "@/lib/learn/simulators";
import { Plate } from "@/components/Plate";
import { IconArrow } from "@/components/shell/icons";

export const metadata: Metadata = { title: "Learn" };

export default function LearnPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 pt-6 md:pt-8 pb-10">
      <div className="flex items-start justify-between gap-8">
        <div className="max-w-[56ch]">
          <h1 className="m-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-3">Financial fluency</h1>
          <p className="mt-3 mb-0 text-[22px] md:text-[26px] leading-[1.2] font-semibold tracking-[-0.01em] text-ink text-balance">
            Eight short lessons and seven working simulators, each built around one commercial mechanism.
          </p>
          <p className="mt-3 mb-0 text-[14.5px] leading-[1.5] text-ink-2">
            Every story&rsquo;s reasoning ends in a principle; these are the principles in full, with the arithmetic you can test yourself. All figures are illustrative.
          </p>
        </div>
        <Plate name="pellets-cyan" width={200} className="hidden md:block flex-none -mt-8" />
      </div>

      <section className="mt-8" aria-labelledby="lessons">
        <h2 id="lessons" className="m-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">Lessons</h2>
        <ol className="mt-2 m-0 p-0 list-none grid md:grid-cols-2 gap-x-10">
          {LESSONS.map((l, i) => (
            <li key={l.slug} className="border-t border-hairline">
              <Link href={`/learn/${l.slug}`} className="group flex items-start gap-4 py-4">
                <span className="text-[13px] font-semibold text-ink-4 tnum pt-[3px] w-5">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-medium text-ink group-hover:text-navy-700 transition-colors duration-150">{l.title}</span>
                  <span className="block mt-1 text-[13.5px] leading-[1.45] text-ink-2 text-pretty">{l.oneLiner}</span>
                  <span className="block mt-1.5 text-[12px] text-ink-3 tnum">{l.minutes} min read · knowledge check</span>
                </span>
                <Plate name={l.plate} width={72} className="flex-none -my-1 opacity-90 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10" aria-labelledby="sims">
        <h2 id="sims" className="m-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">Commercial simulators</h2>
        <ul className="mt-2 m-0 p-0 list-none grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
          {SIMULATORS.map((s) => (
            <li key={s.slug} className="border-t border-hairline">
              <Link href={`/simulators/${s.slug}`} className="group block py-4">
                <span className="block text-[15.5px] font-medium text-ink group-hover:text-navy-700 transition-colors duration-150">{s.title}</span>
                <span className="block mt-1 text-[13.5px] leading-[1.45] text-ink-2 text-pretty">{s.question}</span>
                <span className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-blue-text">Run the scenario <IconArrow /></span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
