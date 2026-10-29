import type { Story } from "./types";

/**
 * Deduplication by canonical URL and by near-identical headline.
 *
 * Headline matching uses a normalised token signature so that
 * "Oil jumps 3% as Hormuz tensions rise" and "Oil jumps 3% as Hormuz
 * tensions rise - Reuters" collapse to one story. When duplicates meet,
 * the item with the stronger evidence weight, then the earlier
 * publication time, is kept.
 */

const STOP = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "as", "at", "by",
  "with", "from", "is", "are", "was", "were", "be", "it", "its", "this", "that",
  "after", "amid", "over", "into", "up", "down", "says", "say", "said", "new",
]);

export function headlineSignature(title: string): string {
  const tokens = title
    // Drop a trailing " - Publisher" / " | Publisher" segment.
    .replace(/\s[-–—|]\s[^-–—|]{2,40}$/u, "")
    .toLowerCase()
    .replace(/[’'"“”‘]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
    .map((w) => (w.length > 6 ? w.slice(0, 6) : w));
  return Array.from(new Set(tokens)).sort().join(" ");
}

/** Jaccard similarity of two signatures' token sets. */
export function signatureSimilarity(a: string, b: string): number {
  const sa = new Set(a.split(" ").filter(Boolean));
  const sb = new Set(b.split(" ").filter(Boolean));
  if (sa.size === 0 || sb.size === 0) return 0;
  let inter = 0;
  for (const tok of sa) if (sb.has(tok)) inter += 1;
  return inter / (sa.size + sb.size - inter);
}

function prefer(a: Story, b: Story): Story {
  if (a.evidenceWeight !== b.evidenceWeight) return a.evidenceWeight > b.evidenceWeight ? a : b;
  if (a.discovery !== b.discovery) return a.discovery ? b : a;
  const ta = a.publishedAt ? Date.parse(a.publishedAt) : Infinity;
  const tb = b.publishedAt ? Date.parse(b.publishedAt) : Infinity;
  return ta <= tb ? a : b;
}

export function dedupeStories(stories: Story[], threshold = 0.72): Story[] {
  const byUrl = new Map<string, Story>();
  for (const s of stories) {
    const key = s.canonicalUrl.toLowerCase();
    const existing = byUrl.get(key);
    byUrl.set(key, existing ? prefer(existing, s) : s);
  }

  const kept: { story: Story; sig: string }[] = [];
  for (const story of byUrl.values()) {
    const sig = headlineSignature(story.title);
    const dupIndex = kept.findIndex((k) => k.sig === sig || signatureSimilarity(k.sig, sig) >= threshold);
    if (dupIndex === -1) {
      kept.push({ story, sig });
    } else {
      const winner = prefer(kept[dupIndex].story, story);
      kept[dupIndex] = { story: winner, sig: headlineSignature(winner.title) };
    }
  }
  return kept.map((k) => k.story);
}
