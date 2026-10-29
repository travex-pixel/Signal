import type { Analysis } from "@/lib/analysis/types";
import type { Digest, RegionId } from "@/lib/news/types";

/**
 * A saved day. Everything a past-day page shows is in here, including the
 * reasoning for each picked story, so the page reads the same however the
 * live digest or the reasoning engine change afterwards.
 */
export interface Edition {
  version: 1;
  /** Sydney calendar day, YYYY-MM-DD. */
  date: string;
  savedAt: string;
  /** The day's digest, trimmed to the top stories plus every pick. */
  digest: Digest;
  leadId?: string;
  /** The three supporting stories shown beside the lead. */
  supportingIds: string[];
  /** Every story with saved reasoning: the lead, the supporting three and the day's meeting-brief picks. */
  pickIds: string[];
  analyses: Record<string, Analysis>;
  /** The cross-regional theme as it read that day. */
  signal?: { regions: RegionId[]; text: string };
}

export interface EditionSummary {
  date: string;
  savedAt: string;
  leadTitle?: string;
  leadPublisher?: string;
  leadRegion?: RegionId;
  picks: number;
}

export interface EditionIndex {
  version: 1;
  editions: EditionSummary[];
}

export interface EditionPicks {
  leadId?: string;
  supportingIds: string[];
  pickIds: string[];
}
