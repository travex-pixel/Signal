import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { classify } from "./classify";
import { dedupeStories, headlineSignature, signatureSimilarity } from "./dedupe";
import { fetchSource, itemsToStories } from "./fetch";
import { parseFeed, stripHtml } from "./parse";
import { rankStories, scoreStory, selectForToday } from "./rank";
import { getSource, SOURCES } from "./sources";
import type { SourceDefinition, Story } from "./types";
import { canonicalizeUrl, unwrapGoogleNewsUrl } from "./urls";

const fixture = (name: string) => readFileSync(path.join(__dirname, "__fixtures__", name), "utf8");
const NOW = new Date("2026-10-29T02:30:00Z");

const bbc = getSource("bbc-world") as SourceDefinition;
const reuters = getSource("reuters-business-discovery") as SourceDefinition;

describe("source registry", () => {
  it("has unique ids and encoded discovery URLs", () => {
    const ids = SOURCES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of SOURCES) {
      expect(() => new URL(s.url)).not.toThrow();
      if (s.discovery) expect(s.url).toContain("ceid=AU%3Aen");
      expect(s.url).not.toMatch(/\s/);
    }
  });
});

describe("parseFeed", () => {
  it("parses RSS 2.0 and rejects malformed items", async () => {
    const feed = await parseFeed(fixture("bbc-world.xml"));
    expect(feed.items).toHaveLength(3);
    expect(feed.rejected).toBe(1);
    expect(feed.items[0].title).toBe("Houthis say they will resume attacks on Red Sea shipping");
    expect(feed.items[0].publishedAt).toBe("2026-10-29T01:30:00.000Z");
  });

  it("parses Google News items, preserving the publisher and stripping the title suffix", async () => {
    const feed = await parseFeed(fixture("google-news.xml"));
    expect(feed.items[0].publisher).toBe("Reuters");
    expect(feed.items[0].publisherUrl).toBe("https://www.reuters.com");
    expect(feed.items[0].title).toBe("China's factory activity contracts for a sixth month as export orders fall");
    // The description only repeated the headline, so no summary is kept.
    expect(feed.items[0].summary).toBeUndefined();
  });

  it("parses Atom and RDF", async () => {
    const atom = await parseFeed(fixture("atom.xml"));
    expect(atom.items[0].link).toBe("https://www.rba.gov.au/media-releases/2026/mr-26-20.html");
    expect(atom.items[0].publishedAt).toBe("2026-10-27T18:30:00.000Z");
    const rdf = await parseFeed(fixture("rdf.xml"));
    expect(rdf.items[0].title).toBe("International Trade in Goods, September 2026");
    expect(rdf.items[0].publishedAt).toBe("2026-10-28T00:30:00.000Z");
  });

  it("strips html safely", () => {
    expect(stripHtml('<p>Hello <b>world</b> &amp; <script>alert(1)</script></p>')).toBe("Hello world &");
  });
});

describe("urls", () => {
  it("canonicalises tracking params, www and trailing slashes", () => {
    expect(canonicalizeUrl("http://www.bbc.co.uk/news/a/?utm_source=x&id=2#frag")).toBe(
      "https://bbc.co.uk/news/a?id=2",
    );
    expect(canonicalizeUrl("https://example.com/")).toBe("https://example.com/");
  });

  it("unwraps legacy Google News ids and gives up on the new format", () => {
    expect(
      unwrapGoogleNewsUrl(
        "https://news.google.com/rss/articles/CBMiXGh0dHBzOi8vd3d3LnJldXRlcnMuY29tL2J1c2luZXNzL2NoaW5hLWZhY3RvcnktYWN0aXZpdHktY29udHJhY3RzLXNpeHRoLW1vbnRoLTIwMjYtMTAtMjkv0gEA?oc=5",
      ),
    ).toBe("https://www.reuters.com/business/china-factory-activity-contracts-sixth-month-2026-10-29/");
    expect(unwrapGoogleNewsUrl("https://news.google.com/rss/articles/AU_yqLNEWFORMAT?oc=5")).toBeUndefined();
    expect(unwrapGoogleNewsUrl("https://example.com/x")).toBeUndefined();
  });
});

describe("classify", () => {
  it("tags regions, countries and topics from the lexicon", () => {
    const c = classify("Vietnam factory output rises as US tariff exemptions are extended");
    expect(c.regions).toContain("sea");
    expect(c.regions).toContain("usa");
    expect(c.countries).toContain("Vietnam");
    expect(c.topics).toContain("trade");
    expect(c.topics).toContain("manufacturing");
  });

  it("falls back to the source region and treats a bare 'Gulf' as ambiguous", () => {
    expect(classify("Resin prices steady this week", ["global"]).regions).toEqual(["global"]);
    expect(classify("Gulf Coast refinery restarts").regions).not.toContain("middle-east");
    expect(classify("Strait of Hormuz tanker traffic slows").regions).toContain("middle-east");
  });
});

describe("itemsToStories + scoring", () => {
  it("builds stories with ids, canonical urls and ranking reasons", async () => {
    const feed = await parseFeed(fixture("bbc-world.xml"));
    const stories = itemsToStories(feed.items, bbc, NOW);
    expect(stories).toHaveLength(3);
    const red = stories.find((s) => s.title.startsWith("Houthis"))!;
    expect(red.id).toMatch(/^[0-9a-f]{12}$/);
    expect(red.canonicalUrl).toBe("https://bbc.co.uk/news/articles/c1example01");
    expect(red.regions).toContain("middle-east");
    expect(red.topics).toContain("freight");
    expect(red.relevance.reasons.some((r) => r.startsWith("supplier region"))).toBe(true);
    const football = stories.find((s) => s.title.startsWith("Football"))!;
    expect(football.relevance.score).toBeLessThan(red.relevance.score);
  });

  it("drops stale items and keeps the discovery url when it cannot unwrap", async () => {
    const feed = await parseFeed(fixture("google-news.xml"));
    const stories = itemsToStories(feed.items, reuters, NOW);
    const china = stories.find((s) => s.title.startsWith("China"))!;
    expect(china.url).toBe("https://www.reuters.com/business/china-factory-activity-contracts-sixth-month-2026-10-29/");
    expect(china.discoveryUrl).toContain("news.google.com");
    const oil = stories.find((s) => s.title.startsWith("Oil") && s.publisher === "Reuters")!;
    expect(oil.url).toContain("news.google.com");
    expect(oil.discoveryUrl).toBeUndefined();
    // The Bloomberg item is excluded from a Reuters-only discovery feed.
    expect(stories.some((s) => s.publisher === "Bloomberg")).toBe(false);

    const old = itemsToStories(
      [{ title: "Very old polymer story about resin prices", link: "https://x.test/a", publishedAt: "2026-01-01T00:00:00Z" }],
      reuters,
      NOW,
    );
    expect(old).toHaveLength(0);
  });

  it("applies preferences: hidden regions drop out, emphasis raises scores", () => {
    const base: Omit<Story, "relevance"> = {
      id: "x",
      title: "China export controls on polymer feedstock",
      url: "https://x.test",
      canonicalUrl: "https://x.test",
      publisher: "Test",
      sourceId: "t",
      sourceType: "publisher",
      discovery: false,
      evidenceWeight: 2,
      publishedAt: NOW.toISOString(),
      retrievedAt: NOW.toISOString(),
      regions: ["china"],
      countries: ["China"],
      topics: ["trade", "polymers"],
    };
    const c = classify(base.title);
    const neutral = scoreStory(base, c, NOW);
    const boosted = scoreStory(base, c, NOW, { regionEmphasis: { china: 2 }, topicEmphasis: {} });
    const hidden = scoreStory(base, c, NOW, { regionEmphasis: { china: 0 }, topicEmphasis: {} });
    expect(boosted.score).toBeGreaterThan(neutral.score);
    expect(hidden.score).toBe(-100);
  });
});

describe("publisher and noise weighting", () => {
  it("credits recognised publishers on discovery feeds and demotes off-topic sanctions stories", () => {
    const base: Omit<Story, "relevance"> = {
      id: "p",
      title: "US imposes sanctions on a defense ministry over a conflict",
      url: "https://x.test/p",
      canonicalUrl: "https://x.test/p",
      publisher: "Unknown Blog",
      sourceId: "discovery-usa",
      sourceType: "wire-discovery",
      discovery: true,
      evidenceWeight: 1,
      publishedAt: NOW.toISOString(),
      retrievedAt: NOW.toISOString(),
      regions: ["usa"],
      countries: ["United States"],
      topics: ["trade"],
    };
    const c = classify(base.title);
    const unknown = scoreStory(base, c, NOW);
    const reuters = scoreStory({ ...base, publisher: "Reuters" }, c, NOW);
    expect(reuters.score - unknown.score).toBeCloseTo(1.5, 5);
    expect(unknown.reasons.some((r) => r.startsWith("off-topic"))).toBe(true);
    const tariff: Omit<Story, "relevance"> = { ...base, title: "US imposes 25% tariff on polyethylene imports", topics: ["trade", "polymers"] };
    expect(scoreStory(tariff, classify(tariff.title), NOW).score).toBeGreaterThan(unknown.score + 5);
  });
});

describe("dedupe", () => {
  it("collapses near-identical headlines and prefers stronger evidence", async () => {
    const feed = await parseFeed(fixture("google-news.xml"));
    const variousReuters: SourceDefinition = { ...reuters, publisher: "Various (discovery)", publisherMatch: undefined, evidenceWeight: 1 };
    const stories = itemsToStories(feed.items, variousReuters, NOW);
    expect(stories).toHaveLength(3);
    const deduped = dedupeStories(stories);
    expect(deduped).toHaveLength(2);
    expect(headlineSignature("Oil jumps 3% as Hormuz tensions rise - Reuters")).toBe(
      headlineSignature("Oil Jumps 3% As Hormuz Tensions Rise"),
    );
    expect(signatureSimilarity("a b c d", "a b c e")).toBeCloseTo(0.6, 1);
  });
});

describe("selectForToday", () => {
  const mk = (id: string, region: Story["regions"][number], score: number): Story => ({
    id,
    title: `Story ${id}`,
    url: `https://x.test/${id}`,
    canonicalUrl: `https://x.test/${id}`,
    publisher: "Test",
    sourceId: "t",
    sourceType: "publisher",
    discovery: false,
    evidenceWeight: 2,
    retrievedAt: NOW.toISOString(),
    regions: [region],
    countries: [],
    topics: ["trade"],
    relevance: { score, reasons: [] },
  });

  it("balances regions when scores are close and respects the quality threshold", () => {
    const ranked = rankStories([
      mk("a", "china", 20),
      mk("b", "china", 19),
      mk("c", "sea", 17),
      mk("d", "usa", 16),
      mk("e", "china", 15),
      mk("f", "middle-east", 2),
    ]);
    const { lead, supporting } = selectForToday(ranked, { supporting: 3 });
    expect(lead?.id).toBe("a");
    expect(supporting.map((s) => s.id)).toEqual(["c", "d", "b"]);
    expect(supporting.some((s) => s.id === "f")).toBe(false);
    expect(selectForToday([mk("z", "sea", 3)]).lead).toBeUndefined();
  });
});

describe("fetchSource", () => {
  it("reports HTTP failures and timeouts as degraded instead of throwing", async () => {
    const failing = await fetchSource(bbc, {
      now: NOW,
      fetchImpl: (async () => new Response("nope", { status: 503 })) as typeof fetch,
    });
    expect(failing.status.ok).toBe(false);
    expect(failing.status.error).toBe("HTTP 503");

    const slow = await fetchSource(bbc, {
      now: NOW,
      timeoutMs: 20,
      fetchImpl: ((_: string, init?: RequestInit) =>
        new Promise<Response>((_, reject) => {
          init?.signal?.addEventListener("abort", () => {
            const e = new Error("aborted");
            e.name = "TimeoutError";
            reject(e);
          });
        })) as typeof fetch,
    });
    expect(slow.status.ok).toBe(false);
    expect(slow.status.error).toBe("timed out");
  });

  it("returns parsed stories on success", async () => {
    const ok = await fetchSource(bbc, {
      now: NOW,
      fetchImpl: (async () =>
        new Response(fixture("bbc-world.xml"), { status: 200, headers: { "content-type": "application/rss+xml" } })) as typeof fetch,
    });
    expect(ok.status.ok).toBe(true);
    expect(ok.status.itemCount).toBe(4);
    expect(ok.status.keptCount).toBe(3);
    expect(ok.stories[0].retrievedAt).toBe(NOW.toISOString());
  });
});

describe("headline echoes", () => {
  it("drops a description that is only the headline and a long publisher name", async () => {
    const { parseFeed } = await import("./parse");
    const xml = `<?xml version="1.0"?><rss version="2.0"><channel><title>t</title>
      <item><title>Regional Trade for Development - AANZFTA Stocktaking - Australian Government Department of Foreign Affairs and Trade</title>
      <link>https://news.google.com/rss/articles/x</link><pubDate>Thu, 29 Oct 2026 01:00:00 GMT</pubDate>
      <description>&lt;a href="x"&gt;Regional Trade for Development - AANZFTA Stocktaking&lt;/a&gt;&amp;nbsp;&amp;nbsp;&lt;font&gt;Australian Government Department of Foreign Affairs and Trade&lt;/font&gt;</description>
      <source url="https://www.dfat.gov.au">Australian Government Department of Foreign Affairs and Trade</source></item>
      </channel></rss>`;
    const { items } = await parseFeed(xml);
    expect(items[0].title).toBe("Regional Trade for Development - AANZFTA Stocktaking");
    expect(items[0].summary).toBeUndefined();
  });
});
