import type { Metadata } from "next";
import { Suspense } from "react";
import { aiEnabled, getAnalysis } from "@/lib/analysis/ai";
import { findStory, getDigest } from "@/lib/news/pipeline";
import { REGION_BY_ID } from "@/lib/news/regions";
import { Empty } from "@/components/Empty";
import { StoryArticle, StorySkeleton } from "@/views/Story";

export const metadata: Metadata = { title: "Story" };

export default function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<StorySkeleton />}>
      <StoryView params={params} />
    </Suspense>
  );
}

async function StoryView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const digest = await getDigest();
  const story = findStory(digest, id);
  if (!story) {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 py-10">
        <Empty title="This story is no longer in the digest" action={{ href: "/editions", label: "Look in past days" }}>
          Stories roll off as feeds refresh. If it led a day, that day is kept under Past days. The original article may still be available from its publisher.
        </Empty>
      </div>
    );
  }
  const analysis = await getAnalysis(story, digest);
  const region = story.regions[0];
  return (
    <StoryArticle
      story={story}
      analysis={analysis}
      now={new Date(digest.generatedAt)}
      fixtures={digest.fixtures}
      selfHref={`/stories/${story.id}`}
      briefHref={`/brief/${story.id}`}
      crumbs={[
        { href: "/", label: "Today" },
        { href: `/regions/${region}`, label: REGION_BY_ID[region].name },
      ]}
      ask={aiEnabled()}
    />
  );
}
