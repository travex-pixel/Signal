import type { Metadata } from "next";
import { Suspense } from "react";
import { aiEnabled, getAnalysis } from "@/lib/analysis/ai";
import { formatDate } from "@/lib/format";
import { findStory, getDigest } from "@/lib/news/pipeline";
import { TodayDate } from "@/components/Clock";
import { Empty } from "@/components/Empty";
import { BriefArticle, BriefSkeleton, relatedStories } from "@/views/Brief";

export const metadata: Metadata = { title: "Meeting brief" };

export default function BriefPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<BriefSkeleton />}>
      <Brief params={params} />
    </Suspense>
  );
}

async function Brief({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const digest = await getDigest();
  const story = findStory(digest, id);
  if (!story) {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 py-10">
        <Empty title="This story is no longer in the digest" action={{ href: "/editions", label: "Look in past days" }}>
          Stories roll off as feeds refresh. If it was picked on a day, that day is kept under Past days.
        </Empty>
      </div>
    );
  }
  const analysis = await getAnalysis(story, digest);
  return (
    <BriefArticle
      story={story}
      analysis={analysis}
      related={relatedStories(digest.stories, story)}
      fixtures={digest.fixtures}
      storyHref={`/stories/${story.id}`}
      crumbs={[
        { href: "/brief", label: "Briefs" },
        { href: `/stories/${story.id}`, label: "Story" },
      ]}
      printDate={<TodayDate long fallback={formatDate(digest.generatedAt)} />}
      ask={aiEnabled()}
    />
  );
}
