import { describe, expect, it } from "vitest";
import { analyzeStory } from "@/lib/analysis/engine";
import type { Digest, Story } from "@/lib/news/types";
import { buildEdition, EDITION_STORY_LIMIT, neighbours, parseEdition, parseIndex, selectEditionPicks, summarizeEdition, upsertIndex } from "./build";
import { editionLabel, isValidEditionDate, sydneyDate } from "./dates";

const NOW = "2026-10-29T02:30:00.000Z";

let n = 0;
const mk = (over: Partial<Story>): Story => {
  n += 1;
  const id = (over.id ?? n.toString(16)).padStart(12, "0");
  return {
    id,
    title: `Story ${id}`,
    url: `https://example.com/${id}`,
    canonicalUrl: `https://example.com/${id}`,
    publisher: "Reuters",
    sourceId: "reuters",
    sourceType: "wire-discovery",
    discovery: true,
    evidenceWeight: 2,
    publishedAt: NOW,
    retrievedAt: NOW,
    regions: ["sea"],
    countries: [],
    topics: ["trade"],
    relevance: { score: 12, reasons: [] },
    ...over,
  } as Story;
};

function digestOf(stories: Story[]): Digest {
  return { stories, sources: [], generatedAt: NOW };
}

describe("edition dates", () => {
  it("uses the Sydney calendar day, across daylight saving", () => {
    expect(sydneyDate(new Date("2026-10-29T12:30:00Z"))).toBe("2026-10-29"); // 11:30 pm AEDT
    expect(sydneyDate(new Date("2026-10-29T13:30:00Z"))).toBe("2026-10-30"); // 12:30 am AEDT
    expect(sydneyDate(new Date("2026-06-29T13:59:00Z"))).toBe("2026-06-29"); // 11:59 pm AEST
  });

  it("accepts only real days", () => {
    expect(isValidEditionDate("2026-10-29")).toBe(true);
    expect(isValidEditionDate("2026-02-30")).toBe(false);
    expect(isValidEditionDate("../../etc")).toBe(false);
    expect(isValidEditionDate("2026-1-9")).toBe(false);
  });

  it("labels a day in plain words", () => {
    expect(editionLabel("2026-10-28")).toBe("Wednesday 28 October");
  });
});

describe("building an edition", () => {
  const stories = [
    mk({ regions: ["middle-east"], topics: ["freight"], relevance: { score: 20, reasons: [] } }),
    mk({ regions: ["china"], topics: ["polymers"], relevance: { score: 18, reasons: [] } }),
    mk({ regions: ["usa"], topics: ["trade"], relevance: { score: 16, reasons: [] } }),
    mk({ regions: ["australia"], topics: ["currency"], relevance: { score: 14, reasons: [] } }),
    ...Array.from({ length: 60 }, () => mk({ relevance: { score: 7, reasons: [] } })),
  ];
  const digest = digestOf(stories);
  const picks = selectEditionPicks(digest);

  it("keeps the lead, the three beside it and the brief picks, once each", () => {
    expect(picks.leadId).toBe(stories[0].id);
    expect(picks.supportingIds).toHaveLength(3);
    expect(picks.pickIds[0]).toBe(picks.leadId);
    expect(new Set(picks.pickIds).size).toBe(picks.pickIds.length);
    for (const id of picks.supportingIds) expect(picks.pickIds).toContain(id);
  });

  it("saves the reasoning it was given and trims the digest", () => {
    const analyses = Object.fromEntries(picks.pickIds.map((id) => [id, analyzeStory(stories.find((s) => s.id === id)!, digest)]));
    const edition = buildEdition({ date: "2026-10-29", savedAt: NOW, digest, picks, analyses });
    expect(edition.digest.stories.length).toBeLessThanOrEqual(EDITION_STORY_LIMIT + picks.pickIds.length);
    for (const id of picks.pickIds) {
      expect(edition.digest.stories.some((s) => s.id === id)).toBe(true);
      expect(edition.analyses[id].storyId).toBe(id);
    }
    const round = parseEdition(JSON.stringify(edition));
    expect(round?.leadId).toBe(edition.leadId);
    expect(summarizeEdition(edition)).toMatchObject({ date: "2026-10-29", leadTitle: stories[0].title, leadRegion: "middle-east" });
  });

  it("rejects files that are not editions", () => {
    expect(parseEdition("not json")).toBeUndefined();
    expect(parseEdition(JSON.stringify({ version: 1, date: "2026-13-01" }))).toBeUndefined();
    expect(parseIndex(undefined)).toBeUndefined();
  });
});

describe("the index of days", () => {
  const day = (date: string, savedAt = `${date}T12:00:00Z`) => ({ date, savedAt, picks: 4 });

  it("replaces a day saved twice and keeps newest first", () => {
    let index = upsertIndex(undefined, day("2026-10-27"));
    index = upsertIndex(index, day("2026-10-29", "2026-10-28T20:00:00Z"));
    index = upsertIndex(index, day("2026-10-28"));
    index = upsertIndex(index, day("2026-10-29", "2026-10-29T12:31:00Z"));
    expect(index.editions.map((e) => e.date)).toEqual(["2026-10-29", "2026-10-28", "2026-10-27"]);
    expect(index.editions[0].savedAt).toBe("2026-10-29T12:31:00Z");
    expect(parseIndex(JSON.stringify(index))?.editions).toHaveLength(3);
  });

  it("finds the days either side, skipping gaps", () => {
    const index = { version: 1 as const, editions: [day("2026-10-29"), day("2026-10-27"), day("2026-10-24")] };
    expect(neighbours(index, "2026-10-27")).toEqual({ prev: "2026-10-24", next: "2026-10-29" });
    expect(neighbours(index, "2026-10-29")).toEqual({ prev: "2026-10-27", next: undefined });
    expect(neighbours(index, "2026-10-24")).toEqual({ prev: undefined, next: "2026-10-27" });
  });
});
