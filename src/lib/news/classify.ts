import type { RegionId, TopicId } from "./types";

/**
 * Keyword lexicons for region and topic classification.
 *
 * Deliberately transparent: a story is tagged with a region or topic only
 * when a listed term appears in its headline or summary. This is simpler
 * than a model and, more importantly, explainable: the Source & evidence
 * panel can say exactly why a story was filed where it was.
 */

interface Term {
  /** Lower-case term; matched on word boundaries, case-insensitive unless `exact`. */
  term: string;
  weight: number;
  /** Country or named place the term identifies, for per-country display. */
  country?: string;
  /** Match case-sensitively (for abbreviations such as "US" that collide with ordinary words). */
  exact?: boolean;
}

const t = (term: string, weight = 1, country?: string): Term => ({ term, weight, country });
const exact = (term: string, weight = 1, country?: string): Term => ({ term, weight, country, exact: true });

export const REGION_TERMS: Record<RegionId, Term[]> = {
  sea: [
    t("southeast asia", 2),
    t("south-east asia", 2),
    t("asean", 2),
    t("vietnam", 2, "Vietnam"),
    t("vietnamese", 1, "Vietnam"),
    t("hanoi", 1, "Vietnam"),
    t("ho chi minh", 1, "Vietnam"),
    t("thailand", 2, "Thailand"),
    t("thai", 1, "Thailand"),
    t("bangkok", 1, "Thailand"),
    t("indonesia", 2, "Indonesia"),
    t("indonesian", 1, "Indonesia"),
    t("jakarta", 1, "Indonesia"),
    t("malaysia", 2, "Malaysia"),
    t("malaysian", 1, "Malaysia"),
    t("kuala lumpur", 1, "Malaysia"),
    t("singapore", 2, "Singapore"),
    t("philippines", 2, "Philippines"),
    t("philippine", 1, "Philippines"),
    t("manila", 1, "Philippines"),
    t("cambodia", 1, "Cambodia"),
    t("laos", 1, "Laos"),
    t("myanmar", 1, "Myanmar"),
    t("brunei", 1, "Brunei"),
    t("strait of malacca", 2),
  ],
  china: [
    t("china", 2, "China"),
    t("chinese", 1, "China"),
    t("beijing", 1, "China"),
    t("shanghai", 1, "China"),
    t("shenzhen", 1, "China"),
    t("guangdong", 1, "China"),
    t("yuan", 1, "China"),
    t("renminbi", 1, "China"),
    t("pboc", 1, "China"),
    t("xi jinping", 1, "China"),
    t("hong kong", 1, "Hong Kong"),
    t("taiwan", 1, "Taiwan"),
    t("sinopec", 1, "China"),
    t("petrochina", 1, "China"),
  ],
  usa: [
    t("united states", 2, "United States"),
    t("u.s.", 2, "United States"),
    exact("US", 2, "United States"),
    exact("USA", 2, "United States"),
    t("us tariffs", 2, "United States"),
    t("us tariff", 2, "United States"),
    t("us trade", 2, "United States"),
    t("american", 1, "United States"),
    t("washington", 1, "United States"),
    t("white house", 2, "United States"),
    t("federal reserve", 2, "United States"),
    t("the fed", 2, "United States"),
    t("fed chair", 2, "United States"),
    t("trump", 1, "United States"),
    t("congress", 1, "United States"),
    t("section 301", 2, "United States"),
    t("section 232", 2, "United States"),
    t("us dollar", 1, "United States"),
    t("wall street", 1, "United States"),
    t("texas", 1, "United States"),
    t("gulf coast", 1, "United States"),
    t("ustr", 2, "United States"),
    t("commerce department", 2, "United States"),
  ],
  "middle-east": [
    t("middle east", 2),
    t("gulf", 1),
    t("saudi", 2, "Saudi Arabia"),
    t("saudi arabia", 2, "Saudi Arabia"),
    t("aramco", 1, "Saudi Arabia"),
    t("uae", 2, "United Arab Emirates"),
    t("emirates", 1, "United Arab Emirates"),
    t("dubai", 1, "United Arab Emirates"),
    t("abu dhabi", 1, "United Arab Emirates"),
    t("qatar", 2, "Qatar"),
    t("iran", 2, "Iran"),
    t("iranian", 1, "Iran"),
    t("tehran", 1, "Iran"),
    t("iraq", 1, "Iraq"),
    t("israel", 1, "Israel"),
    t("israeli", 1, "Israel"),
    t("gaza", 1),
    t("lebanon", 1, "Lebanon"),
    t("houthi", 2, "Yemen"),
    t("houthis", 2, "Yemen"),
    t("yemen", 1, "Yemen"),
    t("red sea", 2),
    t("strait of hormuz", 3),
    t("hormuz", 3),
    t("suez", 2, "Egypt"),
    t("egypt", 1, "Egypt"),
    t("kuwait", 1, "Kuwait"),
    t("oman", 1, "Oman"),
    t("bahrain", 1, "Bahrain"),
    t("opec", 1),
    t("opec+", 1),
    t("sabic", 1, "Saudi Arabia"),
  ],
  australia: [
    t("australia", 2, "Australia"),
    t("australian", 2, "Australia"),
    t("rba", 2, "Australia"),
    t("reserve bank of australia", 3, "Australia"),
    t("reserve bank", 1, "Australia"),
    t("canberra", 1, "Australia"),
    t("sydney", 1, "Australia"),
    t("melbourne", 1, "Australia"),
    exact("AUD", 1, "Australia"),
    t("aussie dollar", 2, "Australia"),
    t("australian dollar", 2, "Australia"),
    exact("ABS", 1, "Australia"),
    t("dfat", 2, "Australia"),
    t("new zealand", 1, "New Zealand"),
  ],
  global: [],
};

export const TOPIC_TERMS: Record<TopicId, Term[]> = {
  trade: [
    t("tariff", 3),
    t("tariffs", 3),
    t("trade war", 3),
    t("trade deal", 2),
    t("trade agreement", 2),
    t("trade talks", 2),
    t("sanction", 1),
    t("sanctions", 1),
    t("sanctions on", 1),
    t("export control", 3),
    t("export controls", 3),
    t("export ban", 3),
    t("import ban", 3),
    t("anti-dumping", 3),
    t("dumping", 1),
    t("countervailing", 2),
    t("wto", 2),
    t("free trade", 2),
    t("exports", 1),
    t("imports", 1),
    t("trade deficit", 2),
    t("trade surplus", 2),
    t("customs", 1),
    t("quota", 1),
    t("embargo", 2),
    t("duties", 1),
  ],
  geopolitics: [
    t("war", 1),
    t("conflict", 1),
    t("ceasefire", 2),
    t("missile", 1),
    t("strike", 1),
    t("attack", 1),
    t("military", 1),
    t("election", 1),
    t("summit", 1),
    t("blockade", 2),
    t("coup", 2),
    t("protest", 1),
    t("tensions", 1),
    t("security", 1),
    t("navy", 1),
  ],
  manufacturing: [
    t("manufacturing", 3),
    t("factory", 2),
    t("factories", 2),
    exact("PMI", 3),
    t("industrial production", 3),
    t("industrial output", 3),
    t("industrial policy", 3),
    t("production", 1),
    t("plant", 1),
    t("capacity", 1),
    t("supplier", 2),
    t("suppliers", 2),
    t("supply chain", 2),
    t("supply chains", 2),
    t("automaker", 1),
    t("output", 1),
    t("overcapacity", 3),
  ],
  freight: [
    t("shipping", 3),
    t("freight", 3),
    t("container", 2),
    t("containers", 2),
    t("port", 2),
    t("ports", 2),
    t("vessel", 1),
    t("tanker", 1),
    t("tankers", 1),
    t("logistics", 2),
    t("maersk", 2),
    t("suez canal", 3),
    t("red sea", 2),
    t("panama canal", 3),
    t("shipping rates", 3),
    t("freight rates", 3),
    t("cargo", 2),
    t("insurance", 1),
    t("war risk", 2),
    t("congestion", 2),
    t("drewry", 2),
    t("lead times", 2),
  ],
  energy: [
    t("oil", 2),
    t("crude", 2),
    t("brent", 2),
    t("wti", 2),
    t("opec", 2),
    t("gas", 1),
    t("lng", 2),
    t("natural gas", 2),
    t("naphtha", 3),
    t("ethane", 3),
    t("energy prices", 3),
    t("electricity", 1),
    t("power prices", 2),
    t("refinery", 2),
    t("commodities", 1),
    t("commodity", 1),
  ],
  polymers: [
    t("polyethylene", 4),
    t("polypropylene", 4),
    t("pvc", 3),
    t("polymer", 4),
    t("polymers", 4),
    t("resin", 3),
    t("resins", 3),
    t("plastic", 2),
    t("plastics", 3),
    t("petrochemical", 4),
    t("petrochemicals", 4),
    t("cracker", 3),
    t("ethylene", 3),
    t("propylene", 3),
    t("packaging", 2),
    t("packaging film", 4),
    t("hdpe", 4),
    t("ldpe", 4),
    t("lldpe", 4),
    exact("PET", 1),
    t("recycled content", 3),
    t("sabic", 2),
    t("lyondellbasell", 3),
    t("dow", 1),
    t("exxonmobil", 1),
    t("borouge", 3),
  ],
  currency: [
    t("inflation", 3),
    t("interest rate", 3),
    t("interest rates", 3),
    t("rate cut", 3),
    t("rate hike", 3),
    t("rate rise", 3),
    t("cash rate", 3),
    t("central bank", 2),
    t("monetary policy", 3),
    t("exchange rate", 3),
    t("currency", 2),
    t("dollar", 1),
    t("yuan", 2),
    t("australian dollar", 3),
    t("gdp", 2),
    t("recession", 2),
    t("economic growth", 2),
    t("cpi", 2),
    t("bond yields", 1),
    t("treasury", 1),
    t("rba", 2),
    t("federal reserve", 2),
    exact("Fed", 1),
    t("ecb", 1),
    t("bank of japan", 1),
  ],
  demand: [
    t("demand", 2),
    t("consumer", 1),
    t("retail", 1),
    t("retail sales", 2),
    t("spending", 1),
    t("prices", 1),
    t("price", 1),
    t("margin", 2),
    t("margins", 2),
    t("inventory", 3),
    t("inventories", 3),
    t("stockpile", 2),
    t("working capital", 3),
    t("orders", 1),
    t("sales", 1),
    t("slowdown", 2),
    t("housing", 1),
    t("construction", 1),
    t("profit warning", 2),
    t("earnings", 1),
  ],
  regulation: [
    t("regulation", 2),
    t("regulator", 1),
    t("regulations", 2),
    t("legislation", 2),
    t("ban", 1),
    t("mandate", 2),
    t("compliance", 2),
    t("recycling", 2),
    t("recycled", 2),
    t("plastic ban", 4),
    t("single-use", 3),
    t("packaging rules", 4),
    t("epr", 2),
    t("extended producer responsibility", 4),
    t("carbon border", 3),
    t("cbam", 3),
    t("emissions", 1),
    t("sustainability", 2),
    t("plastics treaty", 4),
    t("circular economy", 3),
  ],
  technology: [
    t("automation", 2),
    t("artificial intelligence", 1),
    exact("AI", 1),
    t("robotics", 2),
    t("semiconductor", 1),
    t("chips", 1),
    t("data centre", 1),
    t("data center", 1),
    t("technology", 1),
    t("digital", 1),
  ],
};

/** Terms that mark a story as unlikely to carry commercial relevance for this reader. */
export const NOISE_TERMS: Term[] = [
  // Sanctions stories about defence, crime and politics far from trade in goods.
  t("defense ministry", 2),
  t("defence ministry", 2),
  t("defrauding", 2),
  t("fraud", 1),
  t("cartel", 1),
  t("human rights", 1),
  t("asylum", 2),
  t("migrants", 1),
  t("shooting", 2),
  t("hostage", 1),
  t("football", 3),
  t("soccer", 3),
  t("cricket", 3),
  t("tennis", 3),
  t("nfl", 3),
  t("nba", 3),
  t("celebrity", 3),
  t("royal family", 2),
  t("prince", 1),
  t("princess", 1),
  t("actor", 2),
  t("actress", 2),
  t("film review", 3),
  t("box office", 3),
  t("recipe", 3),
  t("horoscope", 3),
  t("murder", 2),
  t("stabbing", 2),
  t("wedding", 2),
  t("oscars", 3),
  t("grammys", 3),
  t("eurovision", 3),
  t("olympics", 1),
  t("world cup", 2),
];

/** Terms that signal materiality: the kind of development that changes decisions. */
export const MATERIALITY_TERMS: Term[] = [
  t("tariff", 2),
  t("tariffs", 2),
  t("sanctions", 1),
  t("ban", 1),
  t("export controls", 2),
  t("record", 1),
  t("surge", 1),
  t("plunge", 1),
  t("shutdown", 2),
  t("closure", 2),
  t("closed", 1),
  t("suspend", 2),
  t("suspends", 2),
  t("halts", 2),
  t("disruption", 2),
  t("shortage", 2),
  t("strike", 1),
  t("force majeure", 3),
  t("outage", 2),
  t("rate cut", 2),
  t("rate hike", 2),
  t("rate rise", 2),
  t("deal", 1),
  t("agreement", 1),
  t("investigation", 1),
  t("ruling", 1),
  t("emergency", 2),
  t("escalation", 2),
  t("escalates", 2),
  t("attack", 1),
  t("rerouting", 2),
  t("reroute", 2),
  t("warns", 1),
  t("warning", 1),
]

const matcherCache = new Map<string, RegExp>();

function matcher(term: Term): RegExp {
  const key = `${term.exact ? "=" : "~"}${term.term}`;
  let re = matcherCache.get(key);
  if (!re) {
    const escaped = term.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Treat the term as a word: no letters or digits immediately on either side.
    re = new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, term.exact ? "u" : "iu");
    matcherCache.set(key, re);
  }
  return re;
}

export interface TermHit {
  term: string;
  weight: number;
  country?: string;
}

export function findTerms(text: string, terms: Term[]): TermHit[] {
  const hits: TermHit[] = [];
  for (const term of terms) {
    if (matcher(term).test(text)) hits.push(term);
  }
  return hits;
}

export interface Classification {
  regions: RegionId[];
  countries: string[];
  topics: TopicId[];
  regionScores: Partial<Record<RegionId, number>>;
  topicScores: Partial<Record<TopicId, number>>;
}

export function classify(text: string, fallbackRegions: RegionId[] = []): Classification {
  const regionScores: Partial<Record<RegionId, number>> = {};
  const countrySet = new Set<string>();
  for (const region of Object.keys(REGION_TERMS) as RegionId[]) {
    const hits = findTerms(text, REGION_TERMS[region]);
    if (hits.length === 0) continue;
    regionScores[region] = hits.reduce((sum, h) => sum + h.weight, 0);
    for (const h of hits) if (h.country) countrySet.add(h.country);
  }

  const topicScores: Partial<Record<TopicId, number>> = {};
  for (const topic of Object.keys(TOPIC_TERMS) as TopicId[]) {
    const hits = findTerms(text, TOPIC_TERMS[topic]);
    if (hits.length === 0) continue;
    topicScores[topic] = hits.reduce((sum, h) => sum + h.weight, 0);
  }

  let regions = (Object.entries(regionScores) as [RegionId, number][])
    .filter(([, score]) => score >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);

  // "Gulf" alone is ambiguous (Gulf Coast, Gulf of Mexico). Require a second Middle East signal.
  if (regions.includes("middle-east") && (regionScores["middle-east"] ?? 0) < 2) {
    regions = regions.filter((r) => r !== "middle-east");
  }

  if (regions.length === 0) regions = fallbackRegions.length ? [...fallbackRegions] : ["global"];

  const topics = (Object.entries(topicScores) as [TopicId, number][])
    .filter(([, score]) => score >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([id]) => id);

  return {
    regions,
    countries: Array.from(countrySet).sort(),
    topics,
    regionScores,
    topicScores,
  };
}
