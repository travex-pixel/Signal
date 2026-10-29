import { z } from "zod";
import { DEFAULT_PREFERENCES, type Preferences } from "@/lib/news/rank";
import type { RegionId, TopicId } from "@/lib/news/types";

/**
 * Reader preferences live in a single cookie, so no database is needed and
 * the reader can tune emphasis without touching code. Values are validated
 * on the way in; anything malformed falls back to defaults.
 */

export const PREFS_COOKIE = "signal-prefs";

const emphasis = z.union([z.literal(0), z.literal(0.5), z.literal(1), z.literal(1.5), z.literal(2)]);

export const REGION_IDS = ["sea", "china", "usa", "middle-east", "australia", "global"] as const satisfies readonly RegionId[];
export const TOPIC_IDS = [
  "trade",
  "geopolitics",
  "manufacturing",
  "freight",
  "energy",
  "polymers",
  "currency",
  "demand",
  "regulation",
  "technology",
] as const satisfies readonly TopicId[];

export const preferencesSchema = z.object({
  regionEmphasis: z.partialRecord(z.enum(REGION_IDS), emphasis).default({}),
  topicEmphasis: z.partialRecord(z.enum(TOPIC_IDS), emphasis).default({}),
});

export type EmphasisValue = z.infer<typeof emphasis>;

export function parsePreferences(raw: string | undefined): Preferences {
  if (!raw) return DEFAULT_PREFERENCES;
  try {
    const parsed = preferencesSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function serializePreferences(prefs: Preferences): string {
  return JSON.stringify(preferencesSchema.parse(prefs));
}

export const EMPHASIS_OPTIONS: { value: EmphasisValue; label: string; hint: string }[] = [
  { value: 0, label: "Hide", hint: "Exclude from the digest" },
  { value: 0.5, label: "Less", hint: "Half weight" },
  { value: 1, label: "Normal", hint: "Default weight" },
  { value: 1.5, label: "More", hint: "One and a half times" },
  { value: 2, label: "Most", hint: "Double weight" },
];
