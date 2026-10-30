import { formatDateTime, relativeTime } from "@/lib/format";
import type { Story } from "@/lib/news/types";
import { Ago } from "./Clock";
import { RegionBeads } from "./RegionBead";

/** Publisher, time and region beads: the datasheet line under every headline. */
/**
 * `absolute` shows the publication date and time instead of "3h ago": a saved
 * past day is read later, when "3h ago" would be wrong.
 */
export function StoryMeta({
  story,
  now,
  showRegions = true,
  absolute = false,
  className = "",
}: {
  story: Story;
  now?: Date;
  showRegions?: boolean;
  absolute?: boolean;
  className?: string;
}) {
  return (
    <p className={`m-0 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px] text-ink-3 ${className}`}>
      {showRegions ? <RegionBeads regions={story.regions} /> : null}
      {showRegions ? <span aria-hidden="true" className="text-hairline-strong">|</span> : null}
      <span className="font-medium text-ink-2">{story.publisher}</span>
      {story.publishedAt ? (
        <>
          <span aria-hidden="true">·</span>
          <time dateTime={story.publishedAt} className="tnum">
            {absolute ? formatDateTime(story.publishedAt) : <Ago iso={story.publishedAt} fallback={relativeTime(story.publishedAt, now)} />}
          </time>
        </>
      ) : null}
    </p>
  );
}
