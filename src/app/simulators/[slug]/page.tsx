import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LESSON_BY_SLUG } from "@/lib/learn/lessons";
import { SIMULATOR_BY_SLUG, SIMULATORS } from "@/lib/learn/simulators";
import { Plate } from "@/components/Plate";
import { Simulator } from "@/components/Simulator";
import { IconArrow } from "@/components/shell/icons";

export function generateStaticParams() {
  return SIMULATORS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: SIMULATOR_BY_SLUG[slug]?.title ?? "Simulator" };
}

export default function SimulatorPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 pt-8"><div className="skeleton h-8 w-80" /></div>}>
      <SimulatorView params={params} />
    </Suspense>
  );
}

async function SimulatorView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const def = SIMULATOR_BY_SLUG[slug];
  if (!def) notFound();
  const lesson = LESSON_BY_SLUG[def.lesson];
  const others = SIMULATORS.filter((s) => s.slug !== slug);

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 pt-6 md:pt-8 pb-12">
      <nav aria-label="Breadcrumb" className="text-[12.5px] text-ink-3">
        <Link href="/learn" className="hover:text-ink">Learn</Link>
        <span aria-hidden="true" className="mx-1.5">/</span>
        <span>Simulator</span>
      </nav>
      <header className="mt-5 flex items-start gap-6">
        <div className="min-w-0 max-w-[60ch]">
          <h1 className="m-0 text-[26px] md:text-[32px] leading-[1.12] font-semibold tracking-[-0.015em] text-ink text-balance">{def.title}</h1>
          <p className="mt-3 mb-0 font-serif text-[17px] leading-[1.5] text-ink-2">{def.question}</p>
          {lesson ? (
            <Link href={`/learn/${lesson.slug}`} className="mt-3 inline-flex items-center gap-1 text-[13.5px] font-semibold text-blue-text hover:text-navy">
              Read the lesson: {lesson.title} <IconArrow />
            </Link>
          ) : null}
        </div>
        <Plate name={def.plate} width={120} className="hidden sm:block flex-none -mt-4" />
      </header>

      <div className="mt-8">
        <Simulator slug={def.slug} />
      </div>

      <nav className="mt-12 pt-5 border-t border-hairline" aria-label="Other simulators">
        <h2 className="m-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">Other scenarios</h2>
        <ul className="mt-2 m-0 p-0 list-none flex flex-wrap gap-x-6 gap-y-1.5">
          {others.map((s) => (
            <li key={s.slug}>
              <Link href={`/simulators/${s.slug}`} className="text-[13.5px] font-medium text-ink-2 hover:text-ink">{s.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
