import { formatDateTime } from "@/lib/format";
import type { Analysis } from "@/lib/analysis/types";
import { getSource } from "@/lib/news/sources";
import type { Story } from "@/lib/news/types";
import { IconChevron, IconExternal } from "./shell/icons";

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
          {displayUrl(story.url)}
          <IconExternal />
        </a>
      ),
    },
    ...(story.discoveryUrl
      ? [{ k: "Discovered via", v: <span>Google News RSS (original URL recovered from the discovery link)</span> }]
      : story.url.includes("news.google.com")
        ? [{ k: "Note", v: <span>The original article URL could not be recovered from Google News. The link above goes through Google&rsquo;s redirector to the publisher.</span> }]
        : []),
    { k: "Published", v: story.publishedAt ? `${formatDateTime(story.publishedAt, { year: "numeric" })} (Sydney)` : "Not stated in the feed" },
    { k: "Retrieved", v: `${formatDateTime(story.retrievedAt, { year: "numeric" })} (Sydney)` },
    { k: "Source type", v: SOURCE_TYPE_LABEL[story.sourceType] },
    ...(source ? [{ k: "Feed", v: <span className="text-ink-2">{source.attribution}</span> }] : []),
    { k: "Interpretation", v: analysis.evidence.interpretationNote },
    {
      k: "Why SIGNAL picked it",
      v: (
        <span className="text-ink-2">
          {story.relevance.reasons.map((r) => r.replace(/\s*\([^)]*\)\s*$/, "")).join("; ")}.
        </span>
      ),
    },
    {
      k: "Filed under",
      v: (
        <span className="text-ink-2">
          Regions: {story.regions.join(", ")}{story.countries.length ? ` (${story.countries.join(", ")})` : ""}. Topics: {story.topics.join(", ") || "none matched"}. Tags come from a plain keyword list, not a model.
        </span>
      ),
    },
  ];
  return (
    <details id="sources" className="group scroll-mt-28 border-y border-hairline font-sans" open={open}>
      <summary className="cursor-pointer list-none min-h-12 py-3 flex items-center justify-between gap-4 text-[13.5px] font-semibold text-ink-2 hover:text-ink [&::-webkit-details-marker]:hidden">
        <span>Source details: publisher, link, dates and why SIGNAL picked it</span>
        <IconChevron aria-hidden="true" className="flex-none text-ink-4 rotate-90 transition-transform duration-150 group-open:-rotate-90" width={18} height={18} />
      </summary>
      <dl className="m-0 pb-6 grid grid-cols-1 sm:grid-cols-[minmax(110px,160px)_1fr] gap-x-6 gap-y-1 sm:gap-y-3 text-[14px] leading-[1.5]">
        {rows.map((r) => (
          <div key={r.k} className="contents">
            <dt className="text-ink-3 font-medium text-[12.5px] sm:text-[14px] mt-2 sm:mt-0">{r.k}</dt>
            <dd className="m-0 text-ink min-w-0">{r.v}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

/** A readable form of a link: Google News redirect addresses are long and meaningless to a reader. */
function displayUrl(url: string): string {
  const bare = url.replace(/^https?:\/\//, "");
  if (bare.startsWith("news.google.com")) return "news.google.com (redirects to the article)";
  return bare.length > 72 ? `${bare.slice(0, 70)}…` : bare;
}
