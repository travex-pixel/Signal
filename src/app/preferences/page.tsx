import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { getPreferences } from "@/lib/data";
import { REGIONS, TOPICS } from "@/lib/news/regions";
import { EMPHASIS_OPTIONS } from "@/lib/preferences";
import { Button } from "@/components/Button";
import { IconCheck } from "@/components/shell/icons";
import { resetPreferences, savePreferences } from "./actions";

export const metadata: Metadata = { title: "Preferences" };

export default function PreferencesPage({ searchParams }: { searchParams: Promise<{ saved?: string; reset?: string }> }) {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 pt-6 md:pt-8 pb-10">
      <h1 className="m-0 text-[26px] md:text-[30px] leading-[1.15] font-semibold tracking-[-0.015em] text-ink">Preferences</h1>
      <p className="mt-3 mb-0 font-serif text-[17px] leading-[1.5] text-ink-2 max-w-[52ch] text-pretty">
        Tune how much weight each region and topic carries in the ranking.
      </p>
      <p className="mt-3 mb-0 text-[14.5px] leading-[1.5] text-ink-2 max-w-[62ch]">
        Defaults put the four supplier regions first, with Australia as the home-market lens and global context behind. Emphasis changes the order. It never invents stories. Settings are kept in a cookie in this browser.
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

async function SavedNotice({ searchParams }: { searchParams: Promise<{ saved?: string; reset?: string }> }) {
  const sp = await searchParams;
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
  return (
    <form action={savePreferences} className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16 max-w-[1100px]">
      <fieldset className="m-0 p-0 border-0 min-w-0">
        <legend className="text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">Regions</legend>
        <div className="mt-2 divide-y divide-hairline">
          {REGIONS.map((r) => (
            <EmphasisRow key={r.id} name={`region:${r.id}`} label={r.name} hint={r.supplier ? "Supplier region" : r.id === "australia" ? "Home market" : "Context"} value={prefs.regionEmphasis[r.id] ?? 1} hue={r.hue} />
          ))}
        </div>
      </fieldset>
      <fieldset className="m-0 p-0 border-0 min-w-0">
        <legend className="text-[12px] font-semibold uppercase tracking-[0.07em] text-ink-3">Topics</legend>
        <div className="mt-2 divide-y divide-hairline">
          {TOPICS.map((t) => (
            <EmphasisRow key={t.id} name={`topic:${t.id}`} label={t.name} hint={t.description} value={prefs.topicEmphasis[t.id] ?? 1} />
          ))}
        </div>
      </fieldset>
      <div className="lg:col-span-2 flex flex-wrap items-center gap-3 pt-2">
        <Button type="submit" variant="primary">Save preferences</Button>
        <Button type="submit" variant="ghost" formAction={resetPreferences}>Restore defaults</Button>
      </div>
    </form>
  );
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
      <div role="radiogroup" aria-label={`${label} emphasis`} className="inline-flex rounded-md border border-hairline-strong bg-surface p-0.5">
        {EMPHASIS_OPTIONS.map((o) => (
          <label key={o.value} className="relative cursor-pointer" title={o.hint}>
            <input type="radio" name={name} value={o.value} defaultChecked={o.value === value} className="peer sr-only" />
            <span className="block px-2.5 h-7 leading-7 rounded-[5px] text-[12.5px] font-semibold text-ink-3 peer-checked:bg-navy peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-blue peer-focus-visible:outline-offset-1 hover:text-ink transition-colors duration-150">
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
