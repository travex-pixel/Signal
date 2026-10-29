import { formatDateTime } from "@/lib/format";
import type { Analysis } from "@/lib/analysis/types";
import { getSource } from "@/lib/news/sources";
import type { Story } from "@/lib/news/types";
import { IconExternal } from "./shell/icons";

const SOURCE_TYPE_LABEL: Record<Story["sourceType"], string> = {
  "central-bank": "Central bank (primary)",
  statistics: "Statistics agency (primary)",
  government: "Government (primary)",
  "wire-discovery": "News discovered via Google News RSS",
  broadcaster: "Broadcaster",
  publisher: "Publisher",
};

/**
 * Source & evidence, set as a datasheet: property on the left, value on the
 * right. Rendered as a native disclosure so it stays out of the way until
 * asked for, with no script.
 */
export function SourcePanel({ story, analysis, open = false }: { story: Story; analysis: Analysis; open?: boolean }) {
  const source = getSource(story.sourceId);
  const rows: { k: string; v: React.ReactNode }[] = [
    { k: "Publisher", v: story.publisher },
    { k: "Original headline", v: <q className="font-serif">{story.title}</q> },
    {
      k: "Original URL",
      v: (
        <a href={story.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-text underline underline-offset-2 decoration-navy-200 hover:decoration-current break-all">
          {story.url.replace(/^https?:\/\//, "")}
          <IconExternal />
        </a>
      ),
    },
    ...(story.discoveryUrl
      ? [{ k: "Discovered via", v: <span>Google News RSS (original URL recovered from the discovery link)</span> }]
      : story.url.includes("news.google.com")
        ? [{ k: "Note", v: <span>The original article URL could not be recovered from Google News; the link above goes through Google&rsquo;s redirector to the publisher.</span> }]
        : []),
    { k: "Published", v: story.publishedAt ? `${formatDateTime(story.publishedAt, { year: "numeric" })} (Sydney)` : "Not stated in the feed" },
    { k: "Retrieved", v: `${formatDateTime(story.retrievedAt, { year: "numeric" })} (Sydney)` },
    { k: "Source type", v: SOURCE_TYPE_LABEL[story.sourceType] },
    ...(source ? [{ k: "Feed", v: <span className="text-ink-2">{source.attribution}</span> }] : []),
    {
      k: "Establishes",
      v: (
        <ul className="list-disc pl-4 m-0 space-y-1">
          {analysis.evidence.establishes.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      ),
    },
    {
      k: "Does not establish",
      v: (
        <ul className="list-disc pl-4 m-0 space-y-1">
          {analysis.evidence.doesNotEstablish.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      ),
    },
    { k: "Interpretation", v: analysis.evidence.interpretationNote },
    { k: "Confidence", v: <span><strong className="font-semibold capitalize">{analysis.confidence.level}.</strong> {analysis.confidence.reason}</span> },
    {
      k: "Why it ranked here",
      v: (
        <span className="text-ink-2">
          Score {story.relevance.score}: {story.relevance.reasons.join("; ")}.
        </span>
      ),
    },
    {
      k: "Filed under",
      v: (
        <span className="text-ink-2">
          Regions {story.regions.join(", ")}{story.countries.length ? ` (${story.countries.join(", ")})` : ""}; topics {story.topics.join(", ") || "none matched"}. Tags come from a transparent keyword lexicon, not a model.
        </span>
      ),
    },
  ];
  return (
    <details id="evidence" className="group border-t border-hairline" open={open}>
      <summary className="cursor-pointer list-none py-4 flex items-center justify-between gap-4 text-[13px] font-semibold uppercase tracking-[0.05em] text-ink-2 hover:text-ink [&::-webkit-details-marker]:hidden">
        <span>Source &amp; evidence</span>
        <span aria-hidden="true" className="text-ink-4 transition-transform duration-150 group-open:rotate-180">▾</span>
      </summary>
      <dl className="m-0 pb-6 grid grid-cols-[minmax(110px,160px)_1fr] gap-x-6 gap-y-3 text-[14px] leading-[1.5]">
        {rows.map((r) => (
          <div key={r.k} className="contents">
            <dt className="text-ink-3 font-medium">{r.k}</dt>
            <dd className="m-0 text-ink min-w-0">{r.v}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
