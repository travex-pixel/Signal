import { publisherBonus } from "./rank";
import type { Story } from "./types";

/**
 * Deduplication by canonical URL, near-identical headline, and same event.
 *
 * Headline matching uses a normalised token signature so that
 * "Oil jumps 3% as Hormuz tensions rise" and "Oil jumps 3% as Hormuz
 * tensions rise - Reuters" collapse to one story. Reports of the same event
 * by different outlets ("China refiners tap African, Brazilian oil as freight
 * rates fall" and "China's refiners turn to Africa and Brazil crude as
 * freight rates ease") also collapse, within three days of each other: the
 * stronger report is kept and the others are recorded in `alsoReportedBy`,
 * which is real corroboration the reader can see.
 *
 * Thresholds were calibrated on a live digest: same-event pairs scored 0.35
 * to 0.60 with five or more shared words; different events that share a
 * theme (two oil-price stories, two profit results) stayed at or under 0.33.
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

/** Number of signature words two headlines share. */
export function sharedWords(a: string, b: string): number {
  const sa = new Set(a.split(" ").filter(Boolean));
  return b.split(" ").filter((w) => w && sa.has(w)).length;
}

const SAME_EVENT_WINDOW_MS = 72 * 3600 * 1000;

/** True when two headlines describe the same event, judged by overlap and timing. */
export function sameEvent(a: { sig: string; story: Story }, b: { sig: string; story: Story }): boolean {
  const sim = signatureSimilarity(a.sig, b.sig);
  const shared = sharedWords(a.sig, b.sig);
  if (!((sim >= 0.4 && shared >= 4) || (sim >= 0.34 && shared >= 5))) return false;
  const ta = a.story.publishedAt ? Date.parse(a.story.publishedAt) : NaN;
  const tb = b.story.publishedAt ? Date.parse(b.story.publishedAt) : NaN;
  return Number.isNaN(ta) || Number.isNaN(tb) || Math.abs(ta - tb) <= SAME_EVENT_WINDOW_MS;
}

function merge(winner: Story, loser: Story): Story {
  const seen = new Set([winner.publisher.toLowerCase()]);
  const reports = [...(winner.alsoReportedBy ?? []), { publisher: loser.publisher, url: loser.url, title: loser.title }, ...(loser.alsoReportedBy ?? [])];
  const alsoReportedBy = reports.filter((r) => {
    const key = r.publisher.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  // Recognised outlets first, so "also reported by" leads with the names that carry weight.
  alsoReportedBy.sort((x, y) => publisherBonus(y.publisher) - publisherBonus(x.publisher));
  return alsoReportedBy.length > 0 ? { ...winner, alsoReportedBy } : winner;
}

function prefer(a: Story, b: Story): Story {
  if (a.evidenceWeight !== b.evidenceWeight) return a.evidenceWeight > b.evidenceWeight ? a : b;
  if (Boolean(a.summary) !== Boolean(b.summary)) return a.summary ? a : b;
  const pa = publisherBonus(a.publisher);
  const pb = publisherBonus(b.publisher);
  if (pa !== pb) return pa > pb ? a : b;
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
    const entry = { story, sig: headlineSignature(story.title) };
    // A headline with no meaningful words cannot be matched; keep it as its own story.
    if (!entry.sig) {
      kept.push(entry);
      continue;
    }
    const dupIndex = kept.findIndex(
      (k) => k.sig === entry.sig || signatureSimilarity(k.sig, entry.sig) >= threshold || sameEvent(k, entry),
    );
    if (dupIndex === -1) {
      kept.push(entry);
    } else {
      const current = kept[dupIndex].story;
      const winner = prefer(current, story);
      const merged = merge(winner, winner === current ? story : current);
      kept[dupIndex] = { story: merged, sig: headlineSignature(merged.title) };
    }
  }
  return kept.map((k) => k.story);
}
