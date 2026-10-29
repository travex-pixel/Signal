import Link from "next/link";
import { formatDateTime } from "@/lib/format";
import type { SourceStatus } from "@/lib/news/types";
import { IconAlert, IconCheck } from "./shell/icons";

/** The quiet source-and-refresh line that closes the overview. */
export function Freshness({ sources, generatedAt, storyCount, fixtures = false }: { sources: SourceStatus[]; generatedAt: string; storyCount: number; fixtures?: boolean }) {
  const ok = sources.filter((s) => s.ok).length;
  const degraded = sources.length - ok;
  const allDown = ok === 0;
  return (
    <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-ink-3 tnum">
      <span className={`inline-flex items-center gap-1 ${allDown ? "text-danger" : degraded ? "text-warn" : "text-ok"}`}>
        {allDown || degraded ? <IconAlert /> : <IconCheck />}
        {allDown
          ? "No sources reachable"
          : `${ok} of ${sources.length} sources`}
      </span>
      <span aria-hidden="true">·</span>
      <span>{storyCount} stories</span>
      <span aria-hidden="true">·</span>
      <span>Refreshed {formatDateTime(generatedAt)}</span>
      <span aria-hidden="true">·</span>
      <Link href="/sources" className="underline underline-offset-2 decoration-hairline-strong hover:decoration-current hover:text-ink">
        Source status
      </Link>
      {fixtures ? (
        <span className="inline-flex items-center rounded-sm bg-warn-100 text-warn px-1.5 py-[1px] text-[10.5px] font-semibold uppercase tracking-[0.06em]">
          Development fixtures
        </span>
      ) : null}
    </p>
  );
}
