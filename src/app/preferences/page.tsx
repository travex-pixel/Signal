import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { getPreferences } from "@/lib/data";
import { REGIONS, TOPICS } from "@/lib/news/regions";
import { Button } from "@/components/Button";
import Link from "next/link";
import { IconAlert, IconArrow, IconCheck, IconChevron } from "@/components/shell/icons";
import { resetPreferences, savePreferences } from "./actions";

export const metadata: Metadata = { title: "Preferences" };

export default function PreferencesPage({ searchParams }: { searchParams: Promise<{ saved?: string; reset?: string; error?: string }> }) {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 pt-6 md:pt-8 pb-10">
      <h1 className="m-0 text-[26px] md:text-[30px] leading-[1.15] font-semibold tracking-[-0.015em] text-ink">Preferences</h1>
      <p className="mt-3 mb-0 font-serif text-[17px] leading-[1.5] text-ink-2 max-w-[52ch] text-pretty">
        Choose which regions SIGNAL should put first. It changes the order of stories, never what is true.
      </p>
      <p className="mt-2 mb-0 text-[14px] leading-[1.5] text-ink-3 max-w-[62ch]">
        Settings stay in this browser. <Link href="/sources" className="inline-flex items-center gap-1 font-semibold text-blue-text hover:text-navy">See where the news comes from <IconArrow /></Link>
      </p>
      <Suspense fallback={null}>
        <SavedNotice searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={<div className="mt-8 skeleton h-5 w-64" />}>
        <PreferencesForm />
      </Suspense>
    </div>
  );
}

async function SavedNotice({ searchParams }: { searchParams: Promise<{ saved?: string; reset?: string; error?: string }> }) {
  const sp = await searchParams;
  if (sp.error) {
    return (
      <p role="alert" className="mt-4 mb-0 inline-flex items-center gap-1.5 rounded-md bg-danger-100 text-danger px-3 py-1.5 text-[13px] font-semibold">
        <IconAlert /> Those settings could not be saved. Please try again.
      </p>
    );
  }
  if (!sp.saved && !sp.reset) return null;
  return (
    <p role="status" className="mt-4 mb-0 inline-flex items-center gap-1.5 rounded-md bg-ok-100 text-ok px-3 py-1.5 text-[13px] font-semibold">
      <IconCheck /> {sp.saved ? "Preferences saved" : "Defaults restored"}
    </p>
  );
}

async function PreferencesForm() {
  await connection();
  const prefs = await getPreferences();
  const topicsChanged = Object.keys(prefs.topicEmphasis).length > 0;
  return (
    <form action={savePreferences} className="mt-6 max-w-[760px]">
      <div className="paper px-5 py-5 md:px-8 md:py-7">
        <fieldset className="m-0 p-0 border-0 min-w-0">
          <legend className="text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">Regions</legend>
          <div className="mt-2 divide-y divide-hairline">
            {REGIONS.map((r) => (
              <EmphasisRow key={r.id} name={`region:${r.id}`} label={r.name} hint={r.supplier ? "Supplier region" : r.id === "australia" ? "Home market" : "Background"} value={prefs.regionEmphasis[r.id] ?? 1} hue={r.hue} />
            ))}
          </div>
        </fieldset>

        <details className="group mt-6 border-t border-hairline" open={topicsChanged}>
          <summary className="cursor-pointer list-none min-h-12 pt-3 flex items-center justify-between gap-3 text-[14px] font-semibold text-ink-2 hover:text-ink [&::-webkit-details-marker]:hidden">
            Fine-tune topics (optional)
            <IconChevron aria-hidden="true" className="flex-none text-ink-4 rotate-90 transition-transform duration-150 group-open:-rotate-90" width={18} height={18} />
          </summary>
          <fieldset className="m-0 p-0 border-0 min-w-0">
            <legend className="sr-only">Topics</legend>
            <div className="mt-1 divide-y divide-hairline">
              {TOPICS.map((t) => (
                <EmphasisRow key={t.id} name={`topic:${t.id}`} label={t.name} hint={t.description} value={prefs.topicEmphasis[t.id] ?? 1} />
              ))}
            </div>
          </fieldset>
        </details>
      </div>

      {/* Stays in reach on a phone while the reader scrolls the list. */}
      <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-4 z-10 mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-surface/95 backdrop-blur px-3 py-3 shadow-2 border border-hairline">
        <Button type="submit" variant="primary">Save</Button>
        <Button type="submit" variant="ghost" formAction={resetPreferences}>Restore defaults</Button>
      </div>
    </form>
  );
}

const CHOICES = [
  { value: 0.5, label: "Less" },
  { value: 1, label: "Normal" },
  { value: 1.5, label: "More" },
] as const;

/** Older settings could hold Hide (0) or Most (2); they show as the nearest of the three choices. */
function bucket(v: number): number {
  return v < 1 ? 0.5 : v > 1 ? 1.5 : 1;
}

function EmphasisRow({ name, label, hint, value, hue }: { name: string; label: string; hint: string; value: number; hue?: string }) {
  return (
    <div className="py-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <span className="flex items-center gap-2 text-[14.5px] font-medium text-ink">
          {hue ? <span aria-hidden="true" className="w-2 h-2 rounded-full" style={{ background: `var(--region-${hue})` }} /> : null}
          {label}
        </span>
        <span className="block text-[12.5px] text-ink-3 leading-[1.4]">{hint}</span>
      </div>
      <div role="radiogroup" aria-label={`${label}: how much weight`} className="grid grid-cols-3 rounded-lg border border-hairline-strong bg-surface p-0.5 w-full sm:w-auto">
        {CHOICES.map((o) => (
          <label key={o.value} className="relative cursor-pointer">
            <input type="radio" name={name} value={o.value} defaultChecked={o.value === bucket(value)} className="peer sr-only" />
            <span className="flex items-center justify-center px-3.5 h-10 sm:h-8 rounded-md text-[13.5px] sm:text-[13px] font-semibold text-ink-3 peer-checked:bg-navy peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-blue peer-focus-visible:outline-offset-1 hover:text-ink transition-colors duration-150">
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
