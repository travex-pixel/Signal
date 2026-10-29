import { describe, expect, it } from "vitest";
import type { Story } from "@/lib/news/types";
import { analyzeStory, assessConfidence, crossRegionalSignal, matchMechanisms } from "./engine";
import { MECHANISMS } from "./mechanisms";

const NOW = "2026-10-29T02:30:00.000Z";

const mk = (over: Partial<Story>): Story => ({
  id: "abc123",
  title: "Houthis say they will resume attacks on Red Sea shipping",
  url: "https://bbc.co.uk/news/x",
  canonicalUrl: "https://bbc.co.uk/news/x",
  publisher: "BBC News",
  sourceId: "bbc-world",
  sourceType: "broadcaster",
  discovery: false,
  evidenceWeight: 2,
  publishedAt: NOW,
  retrievedAt: NOW,
  summary: "Container lines are weighing a return to the Cape route as war-risk insurance premiums rise again.",
  regions: ["middle-east"],
  countries: ["Yemen"],
  topics: ["freight", "geopolitics"],
  relevance: { score: 20, reasons: [], recencyHours: 1 },
  ...over,
});

describe("mechanism library", () => {
  it("has unique ids and complete entries", () => {
    const ids = MECHANISMS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const m of MECHANISMS) {
      expect(m.options.length).toBeGreaterThan(0);
      expect(m.question.endsWith("?")).toBe(true);
      expect(m.principle.title.length).toBeGreaterThan(5);
    }
  });

  it("prefers region-specific mechanisms when the region matches", () => {
    const [lead] = matchMechanisms({ topics: ["freight", "geopolitics"], regions: ["middle-east"] });
    expect(lead.id).toBe("route-risk");
    const [sea] = matchMechanisms({ topics: ["freight"], regions: ["sea"] });
    expect(sea.id).toBe("freight-lead-time");
    const none = matchMechanisms({ topics: [], regions: ["global"] });
    expect(none[0].id).toBe("geopolitical-uncertainty");
    // A trade story without tariff language does not get the tariff mechanism.
    const deficit = matchMechanisms({ topics: ["trade", "demand"], regions: ["usa"], text: "US goods trade deficit widens as demand pushes imports to a record" });
    expect(deficit[0].id).toBe("trade-flows");
    expect(deficit.some((m) => m.id === "tariff-landed-cost")).toBe(false);
    const tariff = matchMechanisms({ topics: ["trade"], regions: ["usa"], text: "US to impose 25% tariff on polyethylene imports" });
    expect(tariff[0].id).toBe("tariff-landed-cost");
  });
});

describe("analyzeStory", () => {
  it("labels the event as fact and everything else as interpretation", () => {
    const a = analyzeStory(mk({}));
    expect(a.event[0].kind).toBe("fact");
    expect(a.event[0].text).toContain("BBC News reported");
    expect(a.implication.every((c) => c.kind !== "fact")).toBe(true);
    expect(a.secondOrder.some((c) => c.kind === "hypothesis")).toBe(true);
    expect(a.secondOrder.some((c) => c.kind === "unknown")).toBe(true);
    expect(a.mechanisms[0].id).toBe("route-risk");
    expect(a.meeting.question.endsWith("?")).toBe(true);
    expect(a.businessRelevance).toContain("Primaplas");
    expect(a.businessRelevance).toContain("Middle East");
    expect(a.evidence.doesNotEstablish[0]).toMatch(/supplier/);
  });

  it("does not use the company name outside the business relevance note", () => {
    const a = analyzeStory(mk({}));
    const text = JSON.stringify({ ...a, businessRelevance: "" });
    expect(text).not.toContain("Primaplas");
  });

  it("confidence rises with primary sources and corroboration", () => {
    const low = assessConfidence(mk({ evidenceWeight: 1, summary: undefined, discovery: true, url: "https://news.google.com/x" }), 0);
    const high = assessConfidence(mk({ evidenceWeight: 3 }), 2);
    expect(low.level).toBe("low");
    expect(high.level).toBe("high");
    expect(high.reason).toContain("primary source");
  });
});

describe("crossRegionalSignal", () => {
  it("connects a topic that spans two supplier regions and declines when it does not", () => {
    const stories = [
      mk({ id: "1", regions: ["middle-east"], topics: ["freight"] }),
      mk({ id: "2", title: "Port congestion builds at Singapore", regions: ["sea"], topics: ["freight"] }),
      mk({ id: "3", title: "RBA holds cash rate", regions: ["australia"], topics: ["currency"] }),
    ];
    const signal = crossRegionalSignal(stories);
    expect(signal?.topic).toBe("freight");
    expect(signal?.regions.sort()).toEqual(["middle-east", "sea"]);
    expect(signal?.text).toContain("hypothesis");
    expect(crossRegionalSignal([stories[2]])).toBeUndefined();
  });
});
