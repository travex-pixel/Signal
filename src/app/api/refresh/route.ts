import { revalidateTag } from "next/cache";
import { aiEnabled, enrichAnalysis } from "@/lib/analysis/ai";
import { analyzeStory } from "@/lib/analysis/engine";
import { DIGEST_TAG, getDigest } from "@/lib/news/pipeline";
import { selectForToday } from "@/lib/news/rank";

/**
 * On-demand refresh, called by the Vercel cron in vercel.json (and usable
 * manually). Protected by CRON_SECRET when one is configured; Vercel sends
 * it as a bearer token automatically.
 *
 * After expiring the cached digest it acts as the day's first visitor: it
 * rebuilds the digest and, when AI enrichment is on, the analysis of the
 * lead and supporting stories, so the first real reader gets a warm cache
 * rather than waiting on the feeds.
 */
export const maxDuration = 120;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });
  }
  const started = Date.now();
  revalidateTag(DIGEST_TAG, "max");

  const digest = await getDigest();
  const { lead, supporting } = selectForToday(digest.stories, { supporting: 3 });
  let warmed = 0;
  if (aiEnabled()) {
    const stories = [lead, ...supporting].filter((s) => s !== undefined);
    await Promise.allSettled(
      stories.map(async (story) => {
        await enrichAnalysis(story, analyzeStory(story, digest));
        warmed += 1;
      }),
    );
  }

  return Response.json({
    ok: true,
    revalidated: DIGEST_TAG,
    at: new Date().toISOString(),
    stories: digest.stories.length,
    sourcesOk: digest.sources.filter((s) => s.ok).length,
    analysesWarmed: warmed,
    ms: Date.now() - started,
  });
}
