import type { RegionId, TopicId } from "./types";

export interface RegionMeta {
  id: RegionId;
  name: string;
  short: string;
  /** Primaplas-derived hue for marks and data series; CSS variable name suffix. */
  hue: "sea" | "china" | "usa" | "middle-east" | "australia" | "global";
  /** Whether this is one of the four confirmed supplier regions. */
  supplier: boolean;
  description: string;
}

export const REGIONS: RegionMeta[] = [
  {
    id: "sea",
    name: "Southeast Asia",
    short: "SEA",
    hue: "sea",
    supplier: true,
    description:
      "Thailand, Vietnam, Indonesia, Malaysia, Singapore, the Philippines and neighbours: manufacturing, ports and regional supply chains.",
  },
  {
    id: "china",
    name: "China",
    short: "China",
    hue: "china",
    supplier: true,
    description:
      "Industrial policy, export controls, domestic demand, the yuan, commodities and supplier conditions.",
  },
  {
    id: "usa",
    name: "United States",
    short: "USA",
    hue: "usa",
    supplier: true,
    description:
      "Trade policy and tariffs, the Federal Reserve, the dollar, energy and petrochemical feedstocks.",
  },
  {
    id: "middle-east",
    name: "Middle East",
    short: "Middle East",
    hue: "middle-east",
    supplier: true,
    description:
      "Geopolitics and maritime security, Gulf shipping, oil and gas, sanctions and petrochemical capacity.",
  },
  {
    id: "australia",
    name: "Australia",
    short: "Australia",
    hue: "australia",
    supplier: false,
    description:
      "The home-market lens: the Reserve Bank, the Australian dollar, trade statistics, demand and regulation.",
  },
  {
    id: "global",
    name: "Global context",
    short: "Global",
    hue: "global",
    supplier: false,
    description:
      "Cross-regional developments: polymers and petrochemicals, global shipping, currencies, commodities and regulation.",
  },
];

export const REGION_BY_ID: Record<RegionId, RegionMeta> = Object.fromEntries(
  REGIONS.map((r) => [r.id, r]),
) as Record<RegionId, RegionMeta>;

export const SUPPLIER_REGIONS: RegionId[] = ["sea", "china", "usa", "middle-east"];

export const TOPICS: { id: TopicId; name: string; description: string }[] = [
  { id: "trade", name: "Trade & tariffs", description: "Tariffs, sanctions, export controls, trade agreements and disputes." },
  { id: "geopolitics", name: "Geopolitics", description: "Conflict, elections, alliances and security developments that move trade and shipping." },
  { id: "manufacturing", name: "Manufacturing", description: "Factory activity, industrial policy, capacity and supplier conditions." },
  { id: "freight", name: "Freight & logistics", description: "Shipping, ports, container rates, insurance and disruption." },
  { id: "energy", name: "Energy & commodities", description: "Oil, gas, naphtha, electricity and the raw material cost base." },
  { id: "polymers", name: "Plastics & petrochemicals", description: "Resin, polymer and packaging-film markets, crackers and feedstock." },
  { id: "currency", name: "Currency & rates", description: "Exchange rates, inflation, interest rates and growth." },
  { id: "demand", name: "Demand & pricing", description: "Consumer and industrial demand, pricing, margins, inventory and working capital." },
  { id: "regulation", name: "Regulation & sustainability", description: "Packaging rules, recycled-content mandates, trade restrictions and compliance." },
  { id: "technology", name: "Technology & structural change", description: "Automation, AI and structural shifts in how goods are made and moved." },
];

export const TOPIC_BY_ID: Record<TopicId, { id: TopicId; name: string; description: string }> =
  Object.fromEntries(TOPICS.map((t) => [t.id, t])) as Record<
    TopicId,
    { id: TopicId; name: string; description: string }
  >;
