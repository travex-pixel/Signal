import { cacheLife, cacheTag } from "next/cache";
import { dedupeStories } from "./dedupe";
import { fetchSource } from "./fetch";
import { fixtureDir, fixtureFetch, registerFixtureSources } from "./fixtures";
import { rankStories, scoreStory, type Preferences } from "./rank";
import { ACTIVE_SOURCES } from "./sources";
import type { Digest, Story } from "./types";
import { classify } from "./classify";

export const DIGEST_TAG = "signal-digest";

/**
 * Builds the digest from every active source. Sources are fetched in
 * parallel; a failing source degrades gracefully and is reported in
 * `sources`. The result is cached and revalidated on a short schedule, or
 * on demand through /api/refresh.
 */
export async function buildDigest(now = new Date()): Promise<Digest> {
  const dir = fixtureDir();
  let fetchImpl: typeof fetch | undefined;
  if (dir) {
    registerFixtureSources(ACTIVE_SOURCES);
    fetchImpl = fixtureFetch(dir);
  }
  const results = await Promise.all(ACTIVE_SOURCES.map((s) => fetchSource(s, { now, fetchImpl })));
  const all = results.flatMap((r) => r.stories);
  // Merging same-event reports adds corroboration, so merged stories are scored again.
  const deduped = dedupeStories(all).map((s) => (s.alsoReportedBy?.length ? rescore(s, now) : s));
  const stories = rankStories(deduped).slice(0, 160);
  return {
    stories,
    sources: results.map((r) => r.status),
    generatedAt: now.toISOString(),
    fixtures: Boolean(dir),
  };
}

export async function getDigest(): Promise<Digest> {
  "use cache: remote";
  // Visitors never wait on feeds: the cached digest is served and refreshed in the
  // background once it is 15 minutes old; only a week-old entry is rebuilt inline.
  // Remote, not in-memory: on Vercel each function instance has its own memory,
  // so an in-memory entry is usually missing on a fresh instance and the story
  // and brief pages would refetch every feed. The remote cache is shared.
  cacheLife({ stale: 900, revalidate: 900, expire: 7 * 86400 });
  cacheTag(DIGEST_TAG);
  const digest = await buildDigest();
  // If every feed failed (a network blip), throwing keeps the previous good
  // digest in place instead of caching an empty one. The build keeps the
  // empty digest so a deploy never fails on a feed outage.
  if (digest.sources.length > 0 && digest.sources.every((s) => !s.ok) && process.env.NEXT_PHASE !== "phase-production-build") {
    throw new Error("No source answered; keeping the previous digest.");
  }
  return digest;
}

function rescore(s: Story, now: Date, prefs?: Preferences): Story {
  const classification = s.scores
    ? { topicScores: s.scores.topics, regionScores: s.scores.regions }
    : classify(`${s.title} ${s.summary ?? ""}`, [s.regions[0]]);
  const { relevance: _ignored, ...rest } = s;
  void _ignored;
  return { ...rest, relevance: scoreStory(rest, classification, now, prefs) } as Story;
}

/** Re-ranks a cached digest for the reader's preferences without refetching. */
export function applyPreferences(digest: Digest, prefs: Preferences): Digest {
  const customised =
    Object.keys(prefs.regionEmphasis).length > 0 || Object.keys(prefs.topicEmphasis).length > 0;
  if (!customised) return digest;
  const now = new Date(digest.generatedAt);
  const stories = digest.stories.map((s) => rescore(s, now, prefs)).filter((s) => s.relevance.score > -100);
  return { ...digest, stories: rankStories(stories) };
}

export function findStory(digest: Digest, id: string): Story | undefined {
  return digest.stories.find((s) => s.id === id);
}
