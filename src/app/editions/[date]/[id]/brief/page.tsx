import type { Metadata } from "next";
import { Suspense } from "react";
import { analyzeStory } from "@/lib/analysis/engine";
import { asOfThatDay } from "@/lib/editions/build";
import { editionLabel, editionLongLabel, isValidEditionDate } from "@/lib/editions/dates";
import { loadEdition } from "@/lib/editions/editions";
import { EditionState } from "@/components/editions/EditionStates";
import { Empty } from "@/components/Empty";
import { BriefArticle, BriefSkeleton, relatedStories } from "@/views/Brief";

export const metadata: Metadata = { title: "Meeting brief from a past day" };

export default function EditionBriefPage({ params }: { params: Promise<{ date: string; id: string }> }) {
  return (
    <Suspense fallback={<BriefSkeleton />}>
      <View params={params} />
    </Suspense>
  );
}

async function View({ params }: { params: Promise<{ date: string; id: string }> }) {
  const { date, id } = await params;
  const result = await loadEdition(date);
  if (result.state !== "ok") {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 py-10">
        <EditionState state={result.state} date={isValidEditionDate(date) ? date : undefined} />
      </div>
    );
  }
  const { edition } = result;
  const story = edition.digest.stories.find((s) => s.id === id);
  if (!story) {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 py-10">
        <Empty title="That story is not in this day" action={{ href: `/editions/${date}`, label: `Back to ${editionLabel(date)}` }}>
          The link may be from a different day.
        </Empty>
      </div>
    );
  }
  return (
    <BriefArticle
      story={story}
      analysis={asOfThatDay(edition.analyses[story.id] ?? analyzeStory(story, edition.digest))}
      related={relatedStories(edition.digest.stories, story)}
      fixtures={edition.digest.fixtures}
      storyHref={`/editions/${date}/${story.id}`}
      crumbs={[
        { href: "/editions", label: "Past days" },
        { href: `/editions/${date}`, label: editionLabel(date) },
        { href: `/editions/${date}/${story.id}`, label: "Story" },
      ]}
      printDate={editionLongLabel(date)}
      ask={false}
    />
  );
}
