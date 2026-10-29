import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { getDigest } from "@/lib/news/pipeline";
import { SOURCES } from "@/lib/news/sources";
import { formatDateTime } from "@/lib/format";
import { REGION_BY_ID } from "@/lib/news/regions";
import type { SourceStatus } from "@/lib/news/types";
import { IconAlert, IconCheck } from "@/components/shell/icons";
import { SyntheticBadge } from "@/components/SyntheticBadge";

export const metadata: Metadata = { title: "Sources" };

export default function SourcesPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 pt-6 md:pt-8 pb-10">
      <h1 className="m-0 text-[26px] md:text-[30px] leading-[1.15] font-semibold tracking-[-0.015em] text-ink">Sources</h1>
      <p className="mt-3 mb-0 font-serif text-[17px] leading-[1.5] text-ink-2 max-w-[62ch] text-pretty">
        Every feed SIGNAL reads, what it is for, and whether it answered on the last refresh.
      </p>
      <p className="mt-3 mb-0 text-[14.5px] leading-[1.5] text-ink-2 max-w-[62ch]">
        Feeds are fetched server-side with timeouts, validated, deduplicated and cached. A source is described as live only when it has actually been fetched. Google News entries are discovery mechanisms, not the publisher&rsquo;s own feed. SIGNAL keeps the real publisher and, where it can, the original article link.
      </p>
      <Suspense fallback={<div className="mt-8 skeleton h-5 w-64" />}>
        <SourceTable />
      </Suspense>
    </div>
  );
}

async function SourceTable() {
  await connection();
  const digest = await getDigest();
  const statusById = new Map(digest.sources.map((s) => [s.id, s]));
  const ok = digest.sources.filter((s) => s.ok).length;

  return (
    <>
      <p className="mt-6 mb-0 flex flex-wrap items-center gap-x-2 text-[13px] text-ink-2">
        <span className={`inline-flex items-center gap-1 font-semibold ${ok === 0 ? "text-danger" : ok < digest.sources.length ? "text-warn" : "text-ok"}`}>
          {ok === digest.sources.length ? <IconCheck /> : <IconAlert />} {ok} of {digest.sources.length} sources answered
        </span>
        <span aria-hidden="true">·</span>
        <span>Last refresh {formatDateTime(digest.generatedAt, { year: "numeric" })} (Sydney)</span>
        <span aria-hidden="true">·</span>
        <span>{digest.stories.length} stories after deduplication</span>
        <SyntheticBadge show={digest.fixtures} />
      </p>

      {/* Narrow screens: one stacked entry per source, status first. */}
      <ul className="md:hidden mt-5 m-0 p-0 list-none divide-y divide-hairline">
        {SOURCES.map((s) => {
          const st = statusById.get(s.id);
          return (
            <li key={s.id} className="py-3.5 text-[13.5px]">
              <div className="flex items-start justify-between gap-3">
                <span className="font-medium text-ink">{s.publisher}{s.discovery ? " (via Google News)" : ""}</span>
                <span className="flex-none">{statusCell(s.active, st)}</span>
              </div>
              <p className="mt-1 mb-0 text-[12.5px] text-ink-3 leading-[1.45]">{s.attribution}</p>
              <p className="mt-1.5 mb-0 flex flex-wrap gap-x-3 gap-y-0.5 text-[12px] text-ink-2">
                <span>{TYPE_LABEL[s.type]}</span>
                <span>{s.regions.map((r) => REGION_BY_ID[r].short).join(", ")}</span>
                <span>every {s.refreshMinutes} min</span>
                <span>{st ? `${st.keptCount} of ${st.itemCount} items kept` : "not fetched"}</span>
              </p>
            </li>
          );
        })}
      </ul>

      <div className="hidden md:block mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-[13.5px]">
          <thead>
            <tr className="text-left text-[11.5px] uppercase tracking-[0.06em] text-ink-3">
              <th scope="col" className="font-semibold py-2 pr-4 border-b border-hairline-strong">Source</th>
              <th scope="col" className="font-semibold py-2 pr-4 border-b border-hairline-strong">Type</th>
              <th scope="col" className="font-semibold py-2 pr-4 border-b border-hairline-strong">Regions</th>
              <th scope="col" className="font-semibold py-2 pr-4 border-b border-hairline-strong">Refresh</th>
              <th scope="col" className="font-semibold py-2 pr-4 border-b border-hairline-strong text-right">Items</th>
              <th scope="col" className="font-semibold py-2 border-b border-hairline-strong">Status</th>
            </tr>
          </thead>
          <tbody>
            {SOURCES.map((s) => {
              const st = statusById.get(s.id);
              return (
                <tr key={s.id} className="align-top border-b border-hairline">
                  <td className="py-3 pr-4">
                    <span className="block font-medium text-ink">{s.publisher}{s.discovery ? " (via Google News)" : ""}</span>
                    <span className="block mt-0.5 text-[12.5px] text-ink-3 leading-[1.45] max-w-[46ch]">{s.attribution}</span>
                    {s.notes ? <span className="block mt-0.5 text-[12px] text-ink-4 leading-[1.45] max-w-[46ch]">{s.notes}</span> : null}
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="block mt-1 text-[12px] text-blue-text break-all underline underline-offset-2 decoration-navy-200 hover:decoration-current">{s.url.length > 90 ? `${s.url.slice(0, 90)}…` : s.url}</a>
                  </td>
                  <td className="py-3 pr-4 text-ink-2 whitespace-nowrap">{TYPE_LABEL[s.type]}</td>
                  <td className="py-3 pr-4 text-ink-2">{s.regions.map((r) => REGION_BY_ID[r].short).join(", ")}</td>
                  <td className="py-3 pr-4 text-ink-2 whitespace-nowrap">every {s.refreshMinutes} min</td>
                  <td className="py-3 pr-4 text-right tabular text-ink-2 whitespace-nowrap">{st ? `${st.keptCount} / ${st.itemCount}` : "none yet"}</td>
                  <td className="py-3 whitespace-nowrap">{statusCell(s.active, st)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-6 mb-0 text-[13px] leading-[1.5] text-ink-3 max-w-[62ch]">
        Items shows stories kept after age and validation filters over items the feed carried. A degraded source is retried on the next refresh. The rest of the digest is unaffected.
      </p>
    </>
  );
}

function statusCell(active: boolean, st: SourceStatus | undefined) {
  if (!active) return <span className="text-ink-4">inactive</span>;
  if (!st) return <span className="text-ink-4">not fetched</span>;
  if (st.ok) {
    return (
      <span className="inline-flex items-center gap-1 font-semibold text-ok whitespace-nowrap">
        <IconCheck /> live <span className="font-normal text-ink-3">{st.durationMs} ms</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-start gap-1 font-semibold text-danger">
      <IconAlert /> <span>degraded <span className="block font-normal text-ink-3 whitespace-normal">{st.error}</span></span>
    </span>
  );
}

const TYPE_LABEL = {
  "central-bank": "Central bank",
  statistics: "Statistics agency",
  government: "Government",
  "wire-discovery": "Discovery (Google News RSS)",
  broadcaster: "Broadcaster",
  publisher: "Publisher",
} as const;
