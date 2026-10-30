import { revalidateTag } from "next/cache";
import { aiEnabled, enrichAnalysis, enrichKey } from "@/lib/analysis/ai";
import { selectEditionPicks } from "@/lib/editions/build";
import { isValidEditionDate, sydneyDate } from "@/lib/editions/dates";
import { EDITIONS_TAG, editionsEnabled, saveEdition } from "@/lib/editions/editions";
import { getDigest } from "@/lib/news/pipeline";
import { REGIONS } from "@/lib/news/regions";
import { authorizeRefresh, INTERNAL_HEADER, internalToken } from "@/lib/refresh-auth";

/**
 * Step 2 of the refresh (see /api/refresh). Runs as its own request so the
 * digest it reads is the freshly rebuilt, stored one that readers will see.
 */
export const maxDuration = 120;

const PAGES = ["/", "/brief", "/sources", ...REGIONS.map((r) => `/regions/${r.id}`)];

export async function GET(request: Request) {
  const denied = authorizeRefresh(request);
  if (denied) return denied;
  const started = Date.now();
  const url = new URL(request.url);
  const asked = url.searchParams.get("date") ?? "";
  const date = isValidEditionDate(asked) ? asked : sydneyDate(new Date());

  const digest = await getDigest();
  const sourcesOk = digest.sources.filter((s) => s.ok).length;

  // Rebuild the main pages now, from the digest just stored, so no reader waits.
  const pages = await Promise.all(
    PAGES.map((p) =>
      fetch(`${url.origin}${p}`, { headers: { [INTERNAL_HEADER]: internalToken() }, cache: "no-store" })
        .then((r) => r.status)
        .catch(() => 0),
    ),
  );

  const byId = new Map(digest.stories.map((s) => [s.id, s]));
  const { pickIds, leadId } = selectEditionPicks(digest);
  let enriched = 0;
  if (aiEnabled()) {
    await Promise.allSettled(
      pickIds.map(async (id) => {
        const story = byId.get(id);
        if (!story) return;
        if (await enrichAnalysis(enrichKey(story))) enriched += 1;
      }),
    );
  }

  // Never replace a saved day with a worse one: skip when the feeds largely failed or nothing led.
  let edition: { saved: string; picks: number } | { skipped: string } | { error: string } | "off" = "off";
  if (editionsEnabled()) {
    if (!leadId || sourcesOk < Math.ceil(digest.sources.length / 2)) {
      edition = { skipped: !leadId ? "no story led" : `only ${sourcesOk} of ${digest.sources.length} sources answered` };
    } else {
      try {
        const summary = await saveEdition(digest, date);
        if (summary) edition = { saved: summary.date, picks: summary.picks };
        revalidateTag(EDITIONS_TAG, { expire: 0 });
      } catch (err) {
        edition = { error: err instanceof Error ? err.message : String(err) };
      }
    }
  }

  return Response.json({
    ok: true,
    run: url.searchParams.get("run") ?? "manual",
    date,
    generatedAt: digest.generatedAt,
    stories: digest.stories.length,
    sourcesOk,
    pages: Object.fromEntries(PAGES.map((p, i) => [p, pages[i]])),
    enriched,
    edition,
    ms: Date.now() - started,
  });
}
