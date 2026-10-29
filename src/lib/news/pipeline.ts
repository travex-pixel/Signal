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
  const deduped = dedupeStories(all);
  const stories = rankStories(deduped).slice(0, 160);
  return {
    stories,
    sources: results.map((r) => r.status),
    generatedAt: now.toISOString(),
    fixtures: Boolean(dir),
  };
}

export async function getDigest(): Promise<Digest> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 900, expire: 3600 });
  cacheTag(DIGEST_TAG);
  return buildDigest();
}

/** Re-ranks a cached digest for the reader's preferences without refetching. */
export function applyPreferences(digest: Digest, prefs: Preferences): Digest {
  const now = new Date(digest.generatedAt);
  const stories = digest.stories
    .map((s) => {
      const classification = classify(`${s.title} ${s.summary ?? ""}`, [s.regions[0]]);
      const { relevance: _ignored, ...rest } = s;
      void _ignored;
      return { ...rest, relevance: scoreStory(rest, classification, now, prefs) } as Story;
    })
    .filter((s) => s.relevance.score > -100);
  return { ...digest, stories: rankStories(stories) };
}

export function findStory(digest: Digest, id: string): Story | undefined {
  return digest.stories.find((s) => s.id === id);
}
