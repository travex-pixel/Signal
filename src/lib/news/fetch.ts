import { createHash } from "node:crypto";
import { cleanPublisher } from "./publishers";
import { classify } from "./classify";
import { parseFeed } from "./parse";
import { scoreStory, type Preferences } from "./rank";
import type { SourceDefinition, SourceStatus, Story } from "./types";
import { canonicalizeUrl, hostnameOf, isGoogleNewsUrl, unwrapGoogleNewsUrl } from "./urls";

const DEFAULT_TIMEOUT_MS = 6_000;

function userAgent(): string {
  return (
    process.env.SIGNAL_USER_AGENT ||
    "SIGNAL/0.1 (executive intelligence reader; RSS; +https://github.com/travex-pixel/Signal)"
  );
}

export function storyId(canonicalUrl: string): string {
  return createHash("sha1").update(canonicalUrl.toLowerCase()).digest("hex").slice(0, 12);
}

export interface FetchResult {
  status: SourceStatus;
  stories: Story[];
}

/** Fetches one feed with a hard timeout. Never throws; failures are reported in `status`. */
export async function fetchSource(
  source: SourceDefinition,
  options: { now?: Date; timeoutMs?: number; fetchImpl?: typeof fetch; prefs?: Preferences } = {},
): Promise<FetchResult> {
  const now = options.now ?? new Date();
  const fetchImpl = options.fetchImpl ?? fetch;
  const started = Date.now();
  const base: Omit<SourceStatus, "ok" | "itemCount" | "keptCount"> = {
    id: source.id,
    publisher: source.publisher,
    url: source.url,
    type: source.type,
    fetchedAt: now.toISOString(),
    durationMs: 0,
  };

  let xml: string;
  let httpStatus: number | undefined;
  try {
    const res = await fetchImpl(source.url, {
      signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
      headers: {
        "user-agent": userAgent(),
        accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.5",
      },
      // The digest is cached at the pipeline level; fetches themselves are always fresh.
      cache: "no-store",
    });
    httpStatus = res.status;
    if (!res.ok) {
      return {
        status: { ...base, ok: false, itemCount: 0, keptCount: 0, status: res.status, error: `HTTP ${res.status}`, durationMs: Date.now() - started },
        stories: [],
      };
    }
    xml = await res.text();
  } catch (err) {
    const message = err instanceof Error ? (err.name === "TimeoutError" ? "timed out" : err.message) : String(err);
    return {
      status: { ...base, ok: false, itemCount: 0, keptCount: 0, error: message, durationMs: Date.now() - started },
      stories: [],
    };
  }

  try {
    const parsed = await parseFeed(xml);
    const stories = itemsToStories(parsed.items, source, now, options.prefs);
    return {
      status: {
        ...base,
        ok: true,
        status: httpStatus,
        itemCount: parsed.items.length + parsed.rejected,
        keptCount: stories.length,
        durationMs: Date.now() - started,
      },
      stories,
    };
  } catch (err) {
    return {
      status: {
        ...base,
        ok: false,
        status: httpStatus,
        itemCount: 0,
        keptCount: 0,
        error: `parse failed: ${err instanceof Error ? err.message : String(err)}`,
        durationMs: Date.now() - started,
      },
      stories: [],
    };
  }
}

export function itemsToStories(
  items: { title: string; link: string; publishedAt?: string; summary?: string; publisher?: string; publisherUrl?: string }[],
  source: SourceDefinition,
  now: Date,
  prefs?: Preferences,
): Story[] {
  const retrievedAt = now.toISOString();
  const maxAgeMs = source.maxAgeHours * 36e5;
  const stories: Story[] = [];

  for (const item of items) {
    if (item.publishedAt && now.getTime() - Date.parse(item.publishedAt) > maxAgeMs) continue;
    // Items dated in the future by more than an hour are clock errors; keep but do not trust the time.
    const publishedAt =
      item.publishedAt && Date.parse(item.publishedAt) - now.getTime() > 36e5 ? undefined : item.publishedAt;

    let url = item.link;
    let discoveryUrl: string | undefined;
    if (isGoogleNewsUrl(url)) {
      const unwrapped = unwrapGoogleNewsUrl(url);
      discoveryUrl = url;
      url = unwrapped ?? url;
    }
    const canonicalUrl = canonicalizeUrl(url);
    const publisher = cleanPublisher(
      item.publisher?.trim() || (source.discovery ? hostnameOf(url) ?? source.publisher : source.publisher),
    );

    // Discovery feeds scoped to one publisher only count items from that publisher.
    if (source.publisherMatch) {
      const host = hostnameOf(item.publisherUrl ?? url) ?? "";
      if (!source.publisherMatch.test(host) && !source.publisherMatch.test(publisher)) continue;
    }

    const text = `${item.title} ${item.summary ?? ""}`;
    const classification = classify(text, source.regions);
    const partial: Omit<Story, "relevance"> = {
      id: storyId(canonicalUrl),
      title: item.title,
      url,
      canonicalUrl,
      discoveryUrl: discoveryUrl && discoveryUrl !== url ? discoveryUrl : undefined,
      publisher,
      sourceId: source.id,
      sourceType: source.type,
      discovery: Boolean(source.discovery),
      evidenceWeight: source.evidenceWeight,
      publishedAt,
      retrievedAt,
      summary: item.summary,
      regions: classification.regions,
      countries: classification.countries,
      topics: classification.topics,
      scores: { regions: classification.regionScores, topics: classification.topicScores },
    };
    stories.push({ ...partial, relevance: scoreStory(partial, classification, now, prefs) });
  }
  return stories;
}
