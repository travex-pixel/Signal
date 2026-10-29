import { revalidateTag } from "next/cache";
import { aiEnabled, enrichAnalysis } from "@/lib/analysis/ai";
import { analyzeStory } from "@/lib/analysis/engine";
import { selectEditionPicks } from "@/lib/editions/build";
import { EDITIONS_TAG, editionsEnabled, saveEdition } from "@/lib/editions/editions";
import { buildDigest, getDigest } from "@/lib/news/pipeline";

/**
 * The daily refresh, called by the two Vercel crons in vercel.json (morning
 * and evening, Sydney time) and usable manually. Protected by CRON_SECRET when
 * one is configured; Vercel sends it as a bearer token automatically.
 *
 * 1. Reads the shared digest. If it is older than its 15-minute window this
 *    starts a background rebuild, so the next reader gets fresh news without
 *    waiting. The digest tag is deliberately not expired: expiring it would
 *    make the next reader wait for a rebuild.
 * 2. Uses that digest if it is fresh, or builds one directly, for the day's
 *    copy, and enriches the day's picks when AI enrichment is on.
 * 3. When storage is connected, keeps a copy of the day under Past days.
 *    The morning run writes the day's first copy and the evening run
 *    replaces it, so a past day reads as it stood at the end of the day.
 */
export const maxDuration = 120;

const FRESH_MS = 20 * 60 * 1000;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });
  }
  const started = Date.now();
  const run = new URL(request.url).searchParams.get("run") ?? "manual";
  const cached = await getDigest();
  const fresh = Date.now() - Date.parse(cached.generatedAt) < FRESH_MS;
  const digest = fresh ? cached : await buildDigest();

  const byId = new Map(digest.stories.map((s) => [s.id, s]));
  const { pickIds } = selectEditionPicks(digest);
  let warmed = 0;
  if (aiEnabled()) {
    await Promise.allSettled(
      pickIds.map(async (id) => {
        const story = byId.get(id);
        if (!story) return;
        await enrichAnalysis(story, analyzeStory(story, digest));
        warmed += 1;
      }),
    );
  }

  let edition: { saved: string; picks: number } | { error: string } | "off" = "off";
  if (editionsEnabled()) {
    try {
      const summary = await saveEdition(digest);
      if (summary) edition = { saved: summary.date, picks: summary.picks };
      revalidateTag(EDITIONS_TAG, { expire: 0 });
    } catch (err) {
      edition = { error: err instanceof Error ? err.message : String(err) };
    }
  }

  return Response.json({
    ok: true,
    run,
    at: new Date().toISOString(),
    digest: fresh ? "shared cache" : "built for this run",
    generatedAt: digest.generatedAt,
    stories: digest.stories.length,
    sourcesOk: digest.sources.filter((s) => s.ok).length,
    analysesWarmed: warmed,
    edition,
    ms: Date.now() - started,
  });
}
