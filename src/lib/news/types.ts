export type RegionId =
  | "sea"
  | "china"
  | "usa"
  | "middle-east"
  | "australia"
  | "global";

export type TopicId =
  | "trade"
  | "geopolitics"
  | "manufacturing"
  | "freight"
  | "energy"
  | "polymers"
  | "currency"
  | "demand"
  | "regulation"
  | "technology";

export type SourceType =
  | "central-bank"
  | "statistics"
  | "government"
  | "wire-discovery"
  | "broadcaster"
  | "publisher";

export interface SourceDefinition {
  /** Stable identifier, used in cache keys and story ids. */
  id: string;
  /** Publisher name shown to the reader. For discovery feeds, the per-item publisher overrides this. */
  publisher: string;
  /** Feed URL (RSS, RDF or Atom). */
  url: string;
  type: SourceType;
  /** Regions this source primarily speaks to. Items are still classified individually. */
  regions: RegionId[];
  /** Topics this source primarily covers. */
  topics: TopicId[];
  active: boolean;
  /** How often this source is worth refetching; the cache is revalidated at the shortest active interval. */
  refreshMinutes: number;
  /** Attribution and usage notes shown on the Sources page. */
  attribution: string;
  /** True when the feed is a discovery mechanism (e.g. Google News) rather than the publisher's own feed. */
  discovery?: boolean;
  /** For a discovery feed scoped to one publisher: items must match this on publisher name or host. */
  publisherMatch?: RegExp;
  /** Ignore items older than this many hours. */
  maxAgeHours: number;
  /** Primary sources carry more evidentiary weight. */
  evidenceWeight: 1 | 2 | 3;
  /** Human-readable note on verification status. Never claims a feed is live unless it was fetched. */
  notes?: string;
}

export interface RawItem {
  title: string;
  link: string;
  publishedAt?: string;
  summary?: string;
  publisher?: string;
  publisherUrl?: string;
  guid?: string;
}

export interface Story {
  id: string;
  title: string;
  /** The URL the reader should open: the original article where it could be recovered. */
  url: string;
  canonicalUrl: string;
  /** Present when the item came via a discovery feed and the original URL could not be unwrapped. */
  discoveryUrl?: string;
  publisher: string;
  sourceId: string;
  sourceType: SourceType;
  discovery: boolean;
  evidenceWeight: 1 | 2 | 3;
  publishedAt?: string;
  retrievedAt: string;
  summary?: string;
  regions: RegionId[];
  countries: string[];
  topics: TopicId[];
  relevance: RelevanceScore;
  /** Other outlets that reported the same event, merged into this story by deduplication. */
  alsoReportedBy?: { publisher: string; url: string; title: string }[];
  /** Lexicon match strengths kept so preference re-ranking is cheap. */
  scores?: { regions: Partial<Record<RegionId, number>>; topics: Partial<Record<TopicId, number>> };
}

export interface RelevanceScore {
  score: number;
  /** Plain-language reasons the ranking engine gave this score, for transparency. */
  reasons: string[];
  recencyHours?: number;
}

export interface SourceStatus {
  id: string;
  publisher: string;
  url: string;
  type: SourceType;
  ok: boolean;
  itemCount: number;
  keptCount: number;
  error?: string;
  fetchedAt: string;
  durationMs: number;
  /** HTTP status when known. */
  status?: number;
}

export interface Digest {
  stories: Story[];
  sources: SourceStatus[];
  generatedAt: string;
  /** True when the digest was built from local development fixtures rather than live feeds. */
  fixtures?: boolean;
}
