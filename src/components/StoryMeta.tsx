import { relativeTime } from "@/lib/format";
import type { Story } from "@/lib/news/types";
import { Ago } from "./Clock";
import { RegionBeads } from "./RegionBead";

/** Publisher, time and region beads: the datasheet line under every headline. */
export function StoryMeta({ story, now, showRegions = true, className = "" }: { story: Story; now?: Date; showRegions?: boolean; className?: string }) {
  return (
    <p className={`m-0 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px] text-ink-3 ${className}`}>
      {showRegions ? <RegionBeads regions={story.regions} /> : null}
      {showRegions ? <span aria-hidden="true" className="text-hairline-strong">|</span> : null}
      <span className="font-medium text-ink-2">{story.publisher}</span>
      {story.publishedAt ? (
        <>
          <span aria-hidden="true">·</span>
          <time dateTime={story.publishedAt} className="tnum">
            <Ago iso={story.publishedAt} fallback={relativeTime(story.publishedAt, now)} />
          </time>
        </>
      ) : null}
    </p>
  );
}
