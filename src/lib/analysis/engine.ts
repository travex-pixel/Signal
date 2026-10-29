import { REGION_BY_ID, SUPPLIER_REGIONS } from "@/lib/news/regions";
import type { Digest, RegionId, Story, TopicId } from "@/lib/news/types";
import { MECHANISMS, type Mechanism } from "./mechanisms";
import type { Analysis, Claim, Confidence } from "./types";

/**
 * The rule-based strategic reasoning engine.
 *
 * It never invents facts. The event is the story's headline and summary as
 * reported; everything else is explicitly an inference, a hypothesis or an
 * unknown, derived from the mechanism library. Optional AI enrichment (see
 * ai.ts) can replace the prose, but the same labelling rules apply.
 */

export function matchMechanisms(story: Pick<Story, "topics" | "regions"> & { text?: string }, limit = 3): Mechanism[] {
  const scored = MECHANISMS.map((m) => {
    const topicHits = m.topics.filter((t) => story.topics.includes(t)).length;
    if (topicHits === 0) return { m, score: -1 };
    const regionOk = !m.regions || m.regions.some((r) => story.regions.includes(r));
    if (!regionOk) return { m, score: -1 };
    // A trigger pattern narrows a broad topic to the mechanism it actually names.
    if (m.triggers && story.text !== undefined && !m.triggers.test(story.text)) return { m, score: -1 };
    // Topic match order matters: the story's first topic is its strongest.
    const primaryBonus = story.topics[0] && m.topics.includes(story.topics[0]) ? 2 : 0;
    // Region overlays earn a little for fit, but a mechanism the story actually names still leads.
    const regionBonus = m.regions ? 1 : 0;
    return { m, score: m.priority + topicHits + primaryBonus + regionBonus };
  })
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score);
  const picked: Mechanism[] = [];
  for (const { m } of scored) {
    if (picked.length >= limit) break;
    picked.push(m);
  }
  if (picked.length === 0) picked.push(MECHANISMS.find((m) => m.id === "geopolitical-uncertainty")!);
  return picked;
}

function formatWhen(iso?: string): string {
  if (!iso) return "at an unstated time";
  const d = new Date(iso);
  return d.toLocaleString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Australia/Sydney",
    timeZoneName: "short",
  });
}

function regionList(regions: RegionId[]): string {
  const names = regions.map((r) => REGION_BY_ID[r]?.name ?? r);
  if (names.length <= 1) return names[0] ?? "no specific region";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export function assessConfidence(story: Story, related: number): Confidence {
  let points = 0;
  const reasons: string[] = [];
  if (story.evidenceWeight === 3) {
    points += 3;
    reasons.push("a primary source");
  } else if (story.evidenceWeight === 2) {
    points += 2;
    reasons.push("a reputable news organisation");
  } else {
    points += 1;
    reasons.push("a publisher found through a discovery feed");
  }
  if (story.discovery && story.url.includes("news.google.com")) {
    points -= 1;
    reasons.push("the original article URL could not be recovered");
  }
  if (related >= 2) {
    points += 2;
    reasons.push(`${related} other stories in today's digest touch the same topic and region`);
  } else if (related === 1) {
    points += 1;
    reasons.push("one other story corroborates the theme");
  } else {
    reasons.push("no corroborating story in today's digest");
  }
  if (story.relevance.recencyHours !== undefined && story.relevance.recencyHours > 48) {
    points -= 1;
    reasons.push("the report is more than two days old");
  }
  if (!story.summary) {
    points -= 1;
    reasons.push("only a headline is available");
  }
  const level: Confidence["level"] = points >= 5 ? "high" : points >= 3 ? "medium" : "low";
  return {
    level,
    reason: `The fact rests on ${reasons[0]}. ${reasons.slice(1).map((r) => r[0].toUpperCase() + r.slice(1)).join(". ")}. The commercial reading is SIGNAL's own, drawn from named mechanisms. It is not something the source states.`,
  };
}

export function countRelated(story: Story, digest?: Digest): number {
  if (!digest) return 0;
  return digest.stories.filter(
    (s) =>
      s.id !== story.id &&
      s.topics.some((t) => story.topics.includes(t)) &&
      s.regions.some((r) => story.regions.includes(r)),
  ).length;
}

export function analyzeStory(story: Story, digest?: Digest): Analysis {
  const mechanisms = matchMechanisms({ ...story, text: `${story.title} ${story.summary ?? ""}` });
  const lead = mechanisms[0];
  const supplierRegions = story.regions.filter((r) => SUPPLIER_REGIONS.includes(r));
  const regionsImplicated = story.regions;
  const related = countRelated(story, digest);

  const event: Claim[] = [
    {
      kind: "fact",
      text: `${story.publisher} reported: “${story.title}” (published ${formatWhen(story.publishedAt)}).`,
    },
  ];
  if (story.summary) event.push({ kind: "fact", text: story.summary });
  if (story.countries.length > 0) {
    event.push({ kind: "fact", text: `Places named in the report: ${story.countries.join(", ")}.` });
  }

  const establishes = [
    `That ${story.publisher} reported the development described in the headline${story.publishedAt ? " at the stated time" : ""}.`,
    story.summary
      ? "The specific detail in the summary above, as the publisher phrased it."
      : "Only what the headline states. No further detail was available in the feed.",
  ];
  const doesNotEstablish = [
    "Any effect on a particular supplier, contract, price or shipment. Those are SIGNAL's readings, below.",
    ...lead.unknowns,
  ];

  const implication: Claim[] = [
    { kind: "inference", text: lead.implication },
    {
      kind: "inference",
      text:
        supplierRegions.length > 0
          ? `The supplier region${supplierRegions.length > 1 ? "s" : ""} implicated: ${regionList(supplierRegions)}. Actual exposure depends on which suppliers, lanes and grades are involved, which this report does not establish.`
          : story.regions.includes("australia")
            ? "This is a home-market development: it reaches supplier relationships through the currency, financing cost and customer demand rather than through any one region."
            : "No supplier region is named directly. Any effect would arrive through global prices, freight or currency.",
    },
  ];
  if (mechanisms[1]) {
    implication.push({ kind: "inference", text: `A second mechanism may also apply (${lcName(mechanisms[1].name)}): ${mechanisms[1].implication}` });
  }

  const secondOrder: Claim[] = [
    ...lead.secondOrder.map((text) => ({ kind: "hypothesis" as const, text })),
    ...lead.unknowns.slice(0, 1).map((text) => ({ kind: "unknown" as const, text })),
  ];

  const confidence = assessConfidence(story, related);

  const businessRelevance = buildBusinessRelevance(story, lead, supplierRegions);

  return {
    storyId: story.id,
    generatedBy: "rules",
    event,
    evidence: {
      establishes,
      doesNotEstablish,
      interpretationNote:
        "The 'what happened' section quotes the source. Everything after it is SIGNAL's reading, labelled as our reading, possible, or not known.",
    },
    mechanisms: mechanisms.map((m) => ({ id: m.id, name: m.name, chain: m.chain, topic: m.topics[0] })),
    implication,
    secondOrder,
    options: lead.options.slice(0, 3),
    meeting: {
      observation: `${story.publisher} reported${story.publishedAt ? ` ${relativeDay(story.publishedAt)}` : ""}: “${story.title}”. The mechanism that matters for us is ${lcName(lead.name)}: ${firstSentence(lead.chain)}`,
      question: lead.question,
      counterpoint: lead.counterpoint,
      indicator: lead.indicator,
    },
    confidence,
    principle: lead.principle,
    businessRelevance,
    regionsImplicated,
  };
}

function buildBusinessRelevance(story: Story, lead: Mechanism, supplierRegions: RegionId[]): string {
  const regionPart =
    supplierRegions.length > 0
      ? `touches ${regionList(supplierRegions)}, ${supplierRegions.length > 1 ? "regions" : "a region"} Primaplas sources from`
      : story.regions.includes("australia")
        ? "concerns the Australian home market in which Primaplas sells"
        : "has no direct regional link to Primaplas's supplier base";
  return `This development ${regionPart}. For a distributor of polymer resins and packaging film, the relevant channel is ${lcName(lead.name)}. Whether it creates an actual exposure depends on grades, origins and contract terms that this report does not describe and SIGNAL does not have.`;
}

/** A mechanism name mid-sentence: lower-case unless it opens with a proper noun or acronym. */
export function lcName(name: string): string {
  return /^(US|Chinese|Southeast|Australian|Middle)\b/.test(name) ? name : name[0].toLowerCase() + name.slice(1);
}


function firstSentence(s: string): string {
  const m = s.match(/^[^.]+\./);
  return m ? m[0] : s;
}

function relativeDay(iso: string): string {
  const diff = Date.now() - Date.parse(iso);
  const hours = diff / 36e5;
  if (hours < 1) return "within the hour";
  if (hours < 24) return `${Math.round(hours)} hours ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

/**
 * The cross-regional signal: a theme that appears in more than one supplier
 * region among the top stories, with the mechanism that connects them. Returns
 * undefined when no defensible connection exists; the UI then says so.
 */
export function crossRegionalSignal(
  stories: Story[],
): { topic: TopicId; regions: RegionId[]; mechanism: Mechanism; stories: Story[]; text: string } | undefined {
  const top = stories.slice(0, 24);
  const byTopic = new Map<TopicId, { regions: Set<RegionId>; stories: Story[] }>();
  for (const s of top) {
    for (const t of s.topics.slice(0, 2)) {
      const entry = byTopic.get(t) ?? { regions: new Set<RegionId>(), stories: [] };
      for (const r of s.regions) if (SUPPLIER_REGIONS.includes(r)) entry.regions.add(r);
      entry.stories.push(s);
      byTopic.set(t, entry);
    }
  }
  let best: { topic: TopicId; regions: RegionId[]; stories: Story[] } | undefined;
  for (const [topic, entry] of byTopic) {
    if (entry.regions.size < 2) continue;
    if (!best || entry.regions.size > best.regions.length || (entry.regions.size === best.regions.length && entry.stories.length > best.stories.length)) {
      best = { topic, regions: Array.from(entry.regions), stories: entry.stories };
    }
  }
  if (!best) return undefined;
  const mechanism = matchMechanisms({ topics: [best.topic], regions: best.regions }, 1)[0];
  const text = `${best.stories.length} of today's stories share one mechanism, ${lcName(mechanism.name)}, across ${regionList(best.regions)}. ${firstSentence(mechanism.chain)} Whether these developments add up to one pressure or several unrelated ones is not established. The link between them is a possibility to test, not a fact.`;
  return { topic: best.topic, regions: best.regions, mechanism, stories: best.stories.slice(0, 4), text };
}
