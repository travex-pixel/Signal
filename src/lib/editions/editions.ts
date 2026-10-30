import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { enrichedAnalysis } from "@/lib/analysis/ai";
import type { Analysis } from "@/lib/analysis/types";
import type { Digest } from "@/lib/news/types";
import { buildEdition, neighbours, parseEdition, parseIndex, selectEditionPicks, summarizeEdition, upsertIndex } from "./build";
import { isValidEditionDate } from "./dates";
import { editionStore } from "./store";
import type { Edition, EditionIndex, EditionSummary } from "./types";

export const EDITIONS_TAG = "signal-editions";
const INDEX_PATH = "editions/index.json";
const editionPath = (date: string) => `editions/${date}.json`;

export function editionsEnabled(): boolean {
  return editionStore() !== undefined;
}

/**
 * Saves the day: the digest as it stands, the picks and their reasoning.
 * Called by the refresh cron each morning and each evening, so a day's file
 * is first written at breakfast and then replaced by the evening copy.
 */
export async function saveEdition(digest: Digest, date: string, now = new Date()): Promise<EditionSummary | undefined> {
  const store = editionStore();
  if (!store) return undefined;
  if (!isValidEditionDate(date)) throw new Error(`Invalid edition date ${date}`);
  const picks = selectEditionPicks(digest);
  const byId = new Map(digest.stories.map((s) => [s.id, s]));
  const analyses: Record<string, Analysis> = {};
  await Promise.all(
    picks.pickIds.map(async (id) => {
      const story = byId.get(id);
      if (!story) return;
      analyses[id] = await enrichedAnalysis(story, digest);
    }),
  );
  const edition = buildEdition({ date, savedAt: now.toISOString(), digest, picks, analyses });
  await store.write(editionPath(date), JSON.stringify(edition));
  const summary = summarizeEdition(edition);
  // A missing index starts fresh; an index that exists but does not parse stops the
  // save rather than being overwritten with a one-day list.
  const raw = await store.read(INDEX_PATH);
  const current = parseIndex(raw);
  if (raw && !current) throw new Error("The saved index of days could not be read; it was left unchanged.");
  const index = upsertIndex(current, summary);
  await store.write(INDEX_PATH, JSON.stringify(index));
  return summary;
}

/** The list of saved days, newest first. Throws if storage cannot be read. */
export async function getEditionIndex(): Promise<EditionIndex> {
  "use cache: remote";
  cacheLife({ stale: 300, revalidate: 3600, expire: 30 * 86400 });
  cacheTag(EDITIONS_TAG);
  const store = editionStore();
  if (!store) return { version: 1, editions: [] };
  return parseIndex(await store.read(INDEX_PATH)) ?? { version: 1, editions: [] };
}

/** One saved day, or null when none was kept. Throws if storage cannot be read. */
export async function getEdition(date: string): Promise<Edition | null> {
  "use cache: remote";
  cacheLife({ stale: 3600, revalidate: 86400, expire: 365 * 86400 });
  cacheTag(EDITIONS_TAG, `edition-${date}`);
  const store = editionStore();
  if (!store || !isValidEditionDate(date)) return null;
  return parseEdition(await store.read(editionPath(date))) ?? null;
}

/**
 * Index read for the Past days page. At runtime an error propagates, so a
 * failed regeneration keeps the last good page instead of freezing an error
 * into it. Only during the build does it become an explicit state.
 */
export async function loadEditionIndex(): Promise<{ ok: true; index: EditionIndex } | { ok: false }> {
  try {
    return { ok: true, index: await getEditionIndex() };
  } catch (err) {
    if (process.env.NEXT_PHASE === "phase-production-build") return { ok: false };
    throw err;
  }
}

export type EditionLoad =
  | { state: "off" }
  | { state: "error" }
  | { state: "missing" }
  | { state: "ok"; edition: Edition; prev?: string; next?: string };

/** One day plus its neighbours, as an explicit state the pages can render. */
export async function loadEdition(date: string): Promise<EditionLoad> {
  if (!editionsEnabled()) return { state: "off" };
  if (!isValidEditionDate(date)) return { state: "missing" };
  try {
    // Only days in the index are fetched, so arbitrary dates cost nothing.
    const index = await getEditionIndex();
    if (!index.editions.some((e) => e.date === date)) return { state: "missing" };
    const edition = await getEdition(date);
    if (!edition) return { state: "missing" };
    return { state: "ok", edition, ...neighbours(index, date) };
  } catch {
    return { state: "error" };
  }
}
