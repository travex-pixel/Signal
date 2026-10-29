import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LESSON_BY_SLUG, LESSONS } from "@/lib/learn/lessons";
import { SIMULATOR_BY_SLUG } from "@/lib/learn/simulators";
import { KnowledgeCheck } from "@/components/KnowledgeCheck";
import { Plate } from "@/components/Plate";
import { ButtonLink } from "@/components/Button";
import { IconArrow } from "@/components/shell/icons";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: LESSON_BY_SLUG[slug]?.title ?? "Lesson" };
}

export default function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 pt-8"><div className="skeleton h-8 w-80" /></div>}>
      <Lesson params={params} />
    </Suspense>
  );
}

async function Lesson({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = LESSON_BY_SLUG[slug];
  if (!lesson) notFound();
  const index = LESSONS.findIndex((l) => l.slug === slug);
  const prev = LESSONS[index - 1];
  const next = LESSONS[index + 1];
  const sim = lesson.simulator ? SIMULATOR_BY_SLUG[lesson.simulator] : undefined;

  return (
    <article className="mx-auto w-full max-w-[1280px] px-4 md:px-8 pt-6 md:pt-8 pb-12">
      <nav aria-label="Breadcrumb" className="text-[12.5px] text-ink-3">
        <Link href="/learn" className="hover:text-ink">Learn</Link>
        <span aria-hidden="true" className="mx-1.5">/</span>
        <span>Lesson {index + 1} of {LESSONS.length}</span>
      </nav>

      <div className="mt-5 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-16">
        <div className="min-w-0 max-w-[calc(68ch+4rem)] paper px-5 py-6 md:px-8 md:py-8">
          <header className="flex items-start gap-6">
            <div className="min-w-0">
              <h1 className="m-0 text-[28px] md:text-[34px] leading-[1.12] font-semibold tracking-[-0.015em] text-ink text-balance">{lesson.title}</h1>
              <p className="mt-3 mb-0 font-serif text-[17px] leading-[1.5] text-ink-2">{lesson.oneLiner}</p>
            </div>
            <Plate name={lesson.plate} width={120} className="hidden sm:block flex-none -mt-4" />
          </header>

          <div className="prose-signal mt-8">
            <section>
              <h2>The concept</h2>
              {lesson.concept.map((p, i) => <p key={i}>{p}</p>)}
            </section>
            <section>
              <h2>Why it matters here</h2>
              {lesson.whyItMatters.map((p, i) => <p key={i}>{p}</p>)}
            </section>
            <section>
              <h2>{lesson.example.title}</h2>
              <ul>
                {lesson.example.lines.map((l, i) => <li key={i} className="tnum">{l}</li>)}
              </ul>
              <p className="font-sans text-[15px] font-semibold text-ink">{lesson.example.takeaway}</p>
              <p className="font-sans text-[12.5px] text-ink-3">Figures are invented for teaching. They are not company data.</p>
            </section>
          </div>

          <div className="mt-8">
            <KnowledgeCheck check={lesson.check} />
          </div>

          {sim ? (
            <div className="mt-8 rounded-xl navy-gloss text-white px-6 py-5 flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0 max-w-[48ch]">
                <p className="m-0 text-[16px] font-semibold">Try {sim.title.toLowerCase()} with your own numbers</p>
                <p className="mt-1 mb-0 text-[13.5px] text-navy-100">{sim.question}</p>
              </div>
              <ButtonLink href={`/simulators/${sim.slug}`} variant="secondary">Open the simulator <IconArrow /></ButtonLink>
            </div>
          ) : null}

          <nav className="mt-10 pt-5 border-t border-hairline flex items-center justify-between gap-4 text-[13.5px] font-semibold" aria-label="Lesson navigation">
            {prev ? <Link href={`/learn/${prev.slug}`} className="text-blue-text hover:text-navy">← {prev.title}</Link> : <span />}
            {next ? <Link href={`/learn/${next.slug}`} className="text-blue-text hover:text-navy text-right">{next.title} →</Link> : <Link href="/learn" className="text-blue-text hover:text-navy">All lessons →</Link>}
          </nav>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-6">
            <h2 className="m-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">Related lessons</h2>
            <ul className="mt-2 m-0 p-0 list-none space-y-2">
              {lesson.related.map((r) => {
                const rel = LESSON_BY_SLUG[r];
                return rel ? (
                  <li key={r}>
                    <Link href={`/learn/${r}`} className="text-[14px] font-medium text-ink hover:text-navy-700">{rel.title}</Link>
                  </li>
                ) : null;
              })}
            </ul>
            <h2 className="mt-6 mb-0 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">All lessons</h2>
            <ol className="mt-2 m-0 p-0 list-none space-y-1.5">
              {LESSONS.map((l, i) => (
                <li key={l.slug} className="flex gap-2 text-[13.5px]">
                  <span className="text-ink-4 tnum w-4">{i + 1}</span>
                  {l.slug === slug ? <span className="font-semibold text-ink">{l.title}</span> : <Link href={`/learn/${l.slug}`} className="text-ink-2 hover:text-ink">{l.title}</Link>}
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </article>
  );
}
