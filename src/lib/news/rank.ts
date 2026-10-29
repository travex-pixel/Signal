import { findTerms, MATERIALITY_TERMS, NOISE_TERMS } from "./classify";
import { SUPPLIER_REGIONS } from "./regions";
import type { RegionId, RelevanceScore, Story, TopicId } from "./types";

/**
 * Relevance ranking.
 *
 * Score = topic relevance + regional fit + evidence quality + materiality
 *         + recency − noise.
 *
 * Every component is recorded as a plain-language reason so the reader
 * can see why a story ranked where it did. Weights are deliberately
 * modest and additive; nothing here is a prediction, only a priority.
 */

export interface Preferences {
  /** Emphasis per region, 0 (hide) to 2 (double). Default 1. */
  regionEmphasis: Partial<Record<RegionId, number>>;
  /** Emphasis per topic, 0 (hide) to 2 (double). Default 1. */
  topicEmphasis: Partial<Record<TopicId, number>>;
}

export const DEFAULT_PREFERENCES: Preferences = {
  regionEmphasis: {},
  topicEmphasis: {},
};

const TOPIC_BASE: Record<TopicId, number> = {
  polymers: 6,
  trade: 5,
  freight: 5,
  energy: 4,
  currency: 4,
  manufacturing: 4,
  regulation: 3.5,
  demand: 3,
  geopolitics: 2.5,
  technology: 1.5,
};

export function scoreStory(
  story: Omit<Story, "relevance">,
  classification: { topicScores: Partial<Record<TopicId, number>>; regionScores: Partial<Record<RegionId, number>> },
  now: Date,
  prefs: Preferences = DEFAULT_PREFERENCES,
): RelevanceScore {
  const reasons: string[] = [];
  let score = 0;
  const text = `${story.title} ${story.summary ?? ""}`;

  // Topic relevance: base weight per matched topic, scaled by how strongly it matched.
  for (const topic of story.topics) {
    const strength = Math.min(classification.topicScores[topic] ?? 0, 8) / 8; // 0..1
    const emphasis = prefs.topicEmphasis[topic] ?? 1;
    const add = TOPIC_BASE[topic] * (0.5 + 0.5 * strength) * emphasis;
    if (add > 0) {
      score += add;
      reasons.push(`${topic} relevance (+${add.toFixed(1)})`);
    }
  }
  if (story.topics.length === 0) {
    score -= 3;
    reasons.push("no commercial topic matched (−3)");
  }

  // Regional fit: supplier regions matter most; Australia is the home lens.
  const supplierHits = story.regions.filter((r) => SUPPLIER_REGIONS.includes(r));
  if (supplierHits.length > 0) {
    const emphasis = Math.max(...supplierHits.map((r) => prefs.regionEmphasis[r] ?? 1));
    const add = 4 * emphasis;
    score += add;
    reasons.push(`supplier region: ${supplierHits.join(", ")} (+${add.toFixed(1)})`);
  }
  if (story.regions.includes("australia")) {
    const add = 3 * (prefs.regionEmphasis.australia ?? 1);
    score += add;
    reasons.push(`Australian context (+${add.toFixed(1)})`);
  }
  if (story.regions.length === 1 && story.regions[0] === "global") {
    const emphasis = prefs.regionEmphasis.global ?? 1;
    const add = 1 * emphasis;
    score += add;
    reasons.push(`global context (+${add.toFixed(1)})`);
  }
  // Hidden region or topic: a 0 emphasis removes the story from ranking.
  if (story.regions.every((r) => (prefs.regionEmphasis[r] ?? 1) === 0)) {
    return { score: -100, reasons: ["region hidden by preferences"] };
  }
  if (story.topics.length > 0 && story.topics.every((t) => (prefs.topicEmphasis[t] ?? 1) === 0)) {
    return { score: -100, reasons: ["topic hidden by preferences"] };
  }

  // Evidence quality.
  const evidence = { 1: 0, 2: 1.5, 3: 3 }[story.evidenceWeight];
  if (evidence) {
    score += evidence;
    reasons.push(`${story.evidenceWeight === 3 ? "primary" : "reputable"} source (+${evidence})`);
  }

  // Materiality.
  const material = findTerms(text, MATERIALITY_TERMS);
  if (material.length > 0) {
    const add = Math.min(material.reduce((s, h) => s + h.weight, 0), 5);
    score += add;
    reasons.push(`materiality: ${material.slice(0, 3).map((m) => m.term).join(", ")} (+${add})`);
  }

  // Recency: full weight for the first 12 hours, fading over three days.
  let recencyHours: number | undefined;
  if (story.publishedAt) {
    recencyHours = Math.max(0, (now.getTime() - Date.parse(story.publishedAt)) / 36e5);
    const recency = recencyHours <= 12 ? 4 : recencyHours <= 24 ? 3 : recencyHours <= 48 ? 2 : recencyHours <= 72 ? 1 : 0;
    score += recency;
    reasons.push(`recency ${Math.round(recencyHours)}h (+${recency})`);
  } else {
    reasons.push("no publication time (+0)");
  }

  // Noise.
  const noise = findTerms(text, NOISE_TERMS);
  if (noise.length > 0) {
    const sub = Math.min(noise.reduce((s, h) => s + h.weight, 0), 8);
    score -= sub;
    reasons.push(`off-topic signal: ${noise.map((n) => n.term).join(", ")} (−${sub})`);
  }

  return { score: Math.round(score * 10) / 10, reasons, recencyHours };
}

export function rankStories(stories: Story[]): Story[] {
  return [...stories].sort((a, b) => {
    if (b.relevance.score !== a.relevance.score) return b.relevance.score - a.relevance.score;
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tb - ta;
  });
}

/**
 * Selects the lead and supporting stories for Today's Signal with regional
 * balance: no region appears twice while another region has a candidate
 * within `tolerance` points of the next-best score.
 */
export function selectForToday(
  ranked: Story[],
  options: { supporting?: number; minScore?: number; tolerance?: number } = {},
): { lead?: Story; supporting: Story[] } {
  const supportingCount = options.supporting ?? 3;
  const minScore = options.minScore ?? 8;
  const tolerance = options.tolerance ?? 4;

  const candidates = ranked.filter((s) => s.relevance.score >= minScore);
  const lead = candidates[0];
  if (!lead) return { supporting: [] };

  const chosen: Story[] = [lead];
  const usedRegions = new Set<RegionId>(lead.regions.slice(0, 1));
  const usedPublishersTitles = new Set<string>([lead.title.toLowerCase()]);
  const pool = candidates.slice(1);

  while (chosen.length < supportingCount + 1 && pool.length > 0) {
    const best = pool[0];
    let pickIndex = 0;
    if (usedRegions.has(best.regions[0])) {
      const alt = pool.findIndex(
        (s, i) =>
          i > 0 &&
          !usedRegions.has(s.regions[0]) &&
          best.relevance.score - s.relevance.score <= tolerance,
      );
      if (alt > 0) pickIndex = alt;
    }
    const [pick] = pool.splice(pickIndex, 1);
    if (usedPublishersTitles.has(pick.title.toLowerCase())) continue;
    usedPublishersTitles.add(pick.title.toLowerCase());
    usedRegions.add(pick.regions[0]);
    chosen.push(pick);
  }

  return { lead, supporting: chosen.slice(1) };
}
