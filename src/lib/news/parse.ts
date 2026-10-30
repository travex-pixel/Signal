import Parser from "rss-parser";
import { z } from "zod";
import type { RawItem } from "./types";

/**
 * Safe RSS/Atom/RDF parsing with runtime validation.
 *
 * rss-parser normalises RSS 2.0, RSS 1.0 (RDF) and Atom into one shape.
 * Every item is then validated with Zod before SIGNAL trusts it, and HTML
 * in summaries is stripped so no markup from a publisher reaches the page.
 */

type Custom = {
  sourceRaw?: ({ _?: string; $?: { url?: string } } | string)[];
  "content:encoded"?: string;
  "dc:date"?: string;
};

const parser = new Parser<Record<string, unknown>, Custom>({
  timeout: 10_000,
  customFields: {
    item: [
      ["source", "sourceRaw", { keepArray: true }],
      ["content:encoded", "content:encoded"],
      ["dc:date", "dc:date"],
    ],
  },
});

const itemSchema = z.object({
  title: z.string().trim().min(4).max(400),
  // Only web links: a feed must not be able to put a javascript: or data: link in front of the reader.
  link: z.string().trim().url().refine((u) => /^https?:\/\//i.test(u)),
  isoDate: z.string().optional(),
  pubDate: z.string().optional(),
  "dc:date": z.string().optional(),
  contentSnippet: z.string().optional(),
  content: z.string().optional(),
  "content:encoded": z.string().optional(),
  summary: z.string().optional(),
  guid: z.string().optional(),
  sourceRaw: z
    .array(
      z.union([
        z.object({ _: z.string().optional(), $: z.object({ url: z.string().optional() }).optional() }),
        z.string(),
      ]),
    )
    .optional(),
});

export function stripHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function toIso(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const t = Date.parse(value);
  if (Number.isNaN(t)) return undefined;
  return new Date(t).toISOString();
}

/** Google News titles end with " - Publisher"; remove that suffix when the publisher is known. */
function cleanTitle(title: string, publisher?: string): string {
  let t = title.replace(/\s+/g, " ").trim();
  if (publisher) {
    const suffix = ` - ${publisher}`;
    if (t.toLowerCase().endsWith(suffix.toLowerCase())) t = t.slice(0, -suffix.length).trim();
  }
  return t;
}

export interface ParsedFeed {
  title?: string;
  items: RawItem[];
  /** Number of items the feed carried that failed validation. */
  rejected: number;
}

export async function parseFeed(xml: string): Promise<ParsedFeed> {
  const feed = await parser.parseString(xml);
  const items: RawItem[] = [];
  let rejected = 0;
  for (const entry of feed.items ?? []) {
    const result = itemSchema.safeParse(entry);
    if (!result.success) {
      rejected += 1;
      continue;
    }
    const d = result.data;
    const source = d.sourceRaw?.[0];
    const publisher =
      typeof source === "string" ? source.trim() : source?._ ? source._.trim() : undefined;
    const publisherUrl = typeof source === "object" ? source?.$?.url : undefined;
    const rawSummary = d.contentSnippet ?? d.summary ?? d["content:encoded"] ?? d.content ?? "";
    let summary = stripHtml(rawSummary);
    if (summary.length > 600) summary = `${summary.slice(0, 597).trimEnd()}…`;
    const title = cleanTitle(d.title, publisher);
    // Discovery feeds often repeat the headline (plus publisher) as the description; that is not a summary.
    const normalised = (v: string) => v.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
    // What is left after the headline is only noise when it is short or is just the publisher's name,
    // however long that name is ("Australian Government Department of Foreign Affairs and Trade").
    const s = normalised(summary);
    const t = normalised(title);
    if (s.startsWith(t)) {
      const rest = s.slice(t.length).trim();
      if (rest.length < 40 || (publisher && rest === normalised(publisher))) summary = "";
    }
    items.push({
      title,
      link: d.link,
      publishedAt: toIso(d.isoDate ?? d.pubDate ?? d["dc:date"]),
      summary: summary || undefined,
      publisher,
      publisherUrl,
      guid: d.guid,
    });
  }
  return { title: feed.title, items, rejected };
}
