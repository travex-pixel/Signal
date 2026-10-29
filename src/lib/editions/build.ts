import { z } from "zod";
import { crossRegionalSignal } from "@/lib/analysis/engine";
import type { Analysis } from "@/lib/analysis/types";
import { selectForToday } from "@/lib/news/rank";
import type { Digest } from "@/lib/news/types";
import { isValidEditionDate } from "./dates";
import type { Edition, EditionIndex, EditionPicks, EditionSummary } from "./types";

/** How many top stories an edition keeps for context (cross-regional theme, related sources). */
export const EDITION_STORY_LIMIT = 40;

/**
 * The stories an edition keeps reasoning for: Today's lead and its three
 * supporting stories, then the meeting-brief picks, in that order and once each.
 * Uses the same selection as the live pages.
 */
export function selectEditionPicks(digest: Digest): EditionPicks {
  const today = selectForToday(digest.stories, { supporting: 3 });
  const briefs = selectForToday(digest.stories, { supporting: 7, minScore: 6 });
  const ordered = [today.lead, ...today.supporting, briefs.lead, ...briefs.supporting]
    .filter((s) => s !== undefined)
    .map((s) => s.id);
  return {
    leadId: today.lead?.id,
    supportingIds: today.supporting.map((s) => s.id),
    pickIds: Array.from(new Set(ordered)),
  };
}

export function buildEdition(input: {
  date: string;
  savedAt: string;
  digest: Digest;
  picks: EditionPicks;
  analyses: Record<string, Analysis>;
}): Edition {
  const { date, savedAt, digest, picks, analyses } = input;
  const keep = new Set(picks.pickIds);
  const stories = digest.stories.filter((s, i) => i < EDITION_STORY_LIMIT || keep.has(s.id));
  const signal = crossRegionalSignal(digest.stories);
  return {
    version: 1,
    date,
    savedAt,
    digest: { ...digest, stories },
    leadId: picks.leadId,
    supportingIds: picks.supportingIds,
    pickIds: picks.pickIds,
    analyses,
    signal: signal ? { regions: signal.regions, text: signal.text } : undefined,
  };
}

export function summarizeEdition(edition: Edition): EditionSummary {
  const lead = edition.leadId ? edition.digest.stories.find((s) => s.id === edition.leadId) : undefined;
  return {
    date: edition.date,
    savedAt: edition.savedAt,
    leadTitle: lead?.title,
    leadPublisher: lead?.publisher,
    leadRegion: lead?.regions[0],
    picks: edition.pickIds.length,
  };
}

/** Adds or replaces a day in the index, newest first. */
export function upsertIndex(index: EditionIndex | undefined, summary: EditionSummary): EditionIndex {
  const rest = (index?.editions ?? []).filter((e) => e.date !== summary.date);
  const editions = [summary, ...rest].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return { version: 1, editions };
}

/** The days either side of `date` in the index, for previous and next links. */
export function neighbours(index: EditionIndex | undefined, date: string): { prev?: string; next?: string } {
  const dates = (index?.editions ?? []).map((e) => e.date);
  const older = dates.filter((d) => d < date);
  const newer = dates.filter((d) => d > date);
  return { prev: older[0], next: newer[newer.length - 1] };
}

// Light validation: these files are written by SIGNAL itself, so the check
// guards against truncation and format drift rather than hostile input.
const dateSchema = z.string().refine(isValidEditionDate);

const summarySchema = z.object({
  date: dateSchema,
  savedAt: z.string(),
  leadTitle: z.string().optional(),
  leadPublisher: z.string().optional(),
  leadRegion: z.string().optional(),
  picks: z.number(),
});

const indexSchema = z.object({ version: z.literal(1), editions: z.array(summarySchema) });

const editionSchema = z.object({
  version: z.literal(1),
  date: dateSchema,
  savedAt: z.string(),
  digest: z.object({ stories: z.array(z.object({ id: z.string() }).passthrough()), sources: z.array(z.unknown()), generatedAt: z.string() }).passthrough(),
  leadId: z.string().optional(),
  supportingIds: z.array(z.string()),
  pickIds: z.array(z.string()),
  analyses: z.record(z.string(), z.unknown()),
  signal: z.object({ regions: z.array(z.string()), text: z.string() }).optional(),
});

export function parseIndex(raw: string | undefined): EditionIndex | undefined {
  if (!raw) return undefined;
  try {
    const parsed = indexSchema.safeParse(JSON.parse(raw));
    return parsed.success ? (parsed.data as EditionIndex) : undefined;
  } catch {
    return undefined;
  }
}

export function parseEdition(raw: string | undefined): Edition | undefined {
  if (!raw) return undefined;
  try {
    const parsed = editionSchema.safeParse(JSON.parse(raw));
    return parsed.success ? (parsed.data as unknown as Edition) : undefined;
  } catch {
    return undefined;
  }
}

/** Saved reasoning was written on the day, so "today's" means that day. Reword it for reading later. */
export function asOfThatDay<T extends { confidence: { reason: string } }>(analysis: T): T {
  return { ...analysis, confidence: { ...analysis.confidence, reason: analysis.confidence.reason.replace(/\btoday's\b/g, "that day's") } };
}
