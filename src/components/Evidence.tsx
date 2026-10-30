import type { Confidence } from "@/lib/analysis/types";
import type { Story } from "@/lib/news/types";
import { IconExternal } from "./shell/icons";

const LEVEL = {
  high: { label: "High confidence", dot: "bg-ok", text: "text-ok" },
  medium: { label: "Medium confidence", dot: "bg-navy", text: "text-navy" },
  low: { label: "Low confidence", dot: "bg-warn", text: "text-warn" },
} as const;

function names(list: string[]): string {
  if (list.length <= 2) return list.join(" and ");
  return `${list.slice(0, 2).join(", ")} and ${list.length - 2} more`;
}

/**
 * How much stands behind a story, on one datasheet line: the confidence
 * level, which other outlets reported the same event, and whether only a
 * headline was available. Shown under the headline wherever a story leads,
 * so the reader can tell a solid development from a lone report at a glance.
 */
export function EvidenceLine({ story, confidence, className = "" }: { story: Story; confidence: Confidence; className?: string }) {
  const level = LEVEL[confidence.level];
  const others = confidence.corroboratedBy ?? story.alsoReportedBy?.map((r) => r.publisher) ?? [];
  const headlineOnly = confidence.headlineOnly ?? !story.summary;
  const detail = `${others.length > 0 ? `Also reported by ${names(others)}` : "No other outlet has reported it yet"}.${headlineOnly ? " Only the headline is available." : ""}`;
  return (
    <p className={`m-0 flex flex-col gap-0.5 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2.5 text-[13px] leading-[1.45] text-ink-3 ${className}`}>
      <span className={`inline-flex items-center gap-1.5 font-semibold whitespace-nowrap ${level.text}`}>
        <span aria-hidden="true" className={`w-2 h-2 rounded-full ${level.dot}`} />
        {level.label}
      </span>
      <span>{detail}</span>
    </p>
  );
}

/** The other outlets' reports, as links: the corroboration itself, one tap away. */
export function OtherReports({ story }: { story: Story }) {
  const others = story.alsoReportedBy ?? [];
  if (others.length === 0) return null;
  return (
    <ul className="m-0 mt-3 p-0 list-none divide-y divide-hairline border-y border-hairline font-sans">
      {others.map((r) => (
        <li key={`${r.publisher}-${r.url}`}>
          {r.url ? (
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start justify-between gap-3 py-2.5 min-h-11 no-underline"
            >
              <span className="min-w-0">
                <span className="block text-[12.5px] font-semibold text-ink-3">{r.publisher}</span>
                <span className="block text-[14.5px] leading-[1.4] text-ink group-hover:text-navy-700 text-pretty">{r.title}</span>
              </span>
              <IconExternal className="flex-none mt-1 text-ink-4 group-hover:text-navy" />
            </a>
          ) : (
            <span className="block py-2.5 text-[13px] font-semibold text-ink-3">{r.publisher}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
