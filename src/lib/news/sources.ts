import type { SourceDefinition } from "./types";

/**
 * Central source registry.
 *
 * Every feed SIGNAL reads is declared here. Feeds are fetched server-side
 * with timeouts and validated at runtime; a feed that fails is reported as
 * degraded on the Sources page rather than breaking the app.
 *
 * Google News RSS entries are discovery mechanisms: they are used to find
 * articles from a named publisher, and SIGNAL preserves the real publisher
 * and (where it can be recovered) the original article URL. They are not the
 * publisher's own feed.
 *
 * Verification status is recorded in `notes`. A source is only described as
 * verified when it has actually been fetched successfully.
 */

const GN = (query: string) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&ceid=AU%3Aen&hl=en-AU&gl=AU`;

export const SOURCES: SourceDefinition[] = [
  // ---------------------------------------------------------------
  // Australian primary sources
  // ---------------------------------------------------------------
  {
    id: "rba-media-releases",
    publisher: "Reserve Bank of Australia",
    url: "https://www.rba.gov.au/rss/rss-cb-media-releases.xml",
    type: "central-bank",
    regions: ["australia"],
    topics: ["currency", "demand"],
    active: true,
    refreshMinutes: 60,
    maxAgeHours: 24 * 14,
    evidenceWeight: 3,
    attribution:
      "Reserve Bank of Australia media releases. Official feed listed in the RBA RSS directory (rba.gov.au/updates/rss-feeds.html).",
    notes: "Feed URL taken from the RBA RSS directory. Listed as degraded until a fetch succeeds.",
  },
  {
    id: "rba-speeches",
    publisher: "Reserve Bank of Australia",
    url: "https://www.rba.gov.au/rss/rss-cb-speeches.xml",
    type: "central-bank",
    regions: ["australia"],
    topics: ["currency", "demand"],
    active: true,
    refreshMinutes: 180,
    maxAgeHours: 24 * 21,
    evidenceWeight: 3,
    attribution: "Reserve Bank of Australia speeches. Official RBA RSS feed.",
  },
  {
    id: "rba-smp",
    publisher: "Reserve Bank of Australia",
    url: "https://www.rba.gov.au/rss/rss-cb-smp.xml",
    type: "central-bank",
    regions: ["australia"],
    topics: ["currency", "demand"],
    active: true,
    refreshMinutes: 360,
    maxAgeHours: 24 * 120,
    evidenceWeight: 3,
    attribution: "Reserve Bank of Australia Statement on Monetary Policy. Official RBA RSS feed.",
  },
  {
    id: "abs-releases",
    publisher: "Australian Bureau of Statistics",
    url: GN("site:abs.gov.au when:30d"),
    type: "statistics",
    discovery: true,
    publisherMatch: /abs\.gov\.au|bureau of statistics/i,
    regions: ["australia"],
    topics: ["trade", "demand", "currency"],
    active: true,
    refreshMinutes: 180,
    maxAgeHours: 24 * 30,
    evidenceWeight: 3,
    attribution:
      "Australian Bureau of Statistics releases and media releases, discovered through Google News RSS scoped to abs.gov.au. The publisher is the ABS itself; data is Commonwealth of Australia, CC BY 4.0. The International Trade in Goods release is at abs.gov.au/statistics/economy/international-trade/international-trade-goods/latest-release.",
    notes: "The ABS no longer publishes an RSS feed (its statistics index and the legacy AUSSTATS feed both return 404), so this entry discovers ABS pages through Google News and keeps the ABS as publisher.",
  },
  {
    id: "dfat-news",
    publisher: "Department of Foreign Affairs and Trade",
    url: GN("site:dfat.gov.au when:30d"),
    type: "government",
    discovery: true,
    publisherMatch: /dfat\.gov\.au|foreign affairs and trade/i,
    regions: ["australia", "global"],
    topics: ["trade", "geopolitics"],
    active: true,
    refreshMinutes: 180,
    maxAgeHours: 24 * 30,
    evidenceWeight: 3,
    attribution:
      "Australian Department of Foreign Affairs and Trade statements and news, discovered through Google News RSS scoped to dfat.gov.au; the publisher is DFAT itself. Trade statistics context: dfat.gov.au/trade/trade-and-investment-data-information-and-publications/trade-foreign-investment-statistics.",
    notes: "DFAT's statistics page is a web page, not a feed, and no departmental RSS feed could be verified; discovery keeps DFAT's own pages as the source.",
  },
  {
    id: "trade-minister",
    publisher: "Minister for Trade",
    url: "https://www.trademinister.gov.au/rss.xml",
    type: "government",
    regions: ["australia", "global"],
    topics: ["trade", "geopolitics"],
    active: true,
    refreshMinutes: 180,
    maxAgeHours: 24 * 21,
    evidenceWeight: 3,
    attribution: "Media releases and speeches of the Australian Minister for Trade (trademinister.gov.au official RSS feed).",
    notes: "Feed URL from the govau media-release-sources directory. Listed as degraded until a fetch succeeds.",
  },

  // ---------------------------------------------------------------
  // Wire and broadcaster discovery
  // ---------------------------------------------------------------
  {
    id: "reuters-business-discovery",
    publisher: "Reuters",
    url: GN("when:24h site:reuters.com/business"),
    type: "wire-discovery",
    discovery: true,
    publisherMatch: /reuters/i,
    regions: ["global"],
    topics: ["trade", "demand", "currency", "energy"],
    active: true,
    refreshMinutes: 30,
    maxAgeHours: 48,
    evidenceWeight: 2,
    attribution:
      "Reuters business coverage discovered through Google News RSS. Google News is the discovery mechanism, not Reuters' own feed; headlines link to the original article where the URL can be recovered.",
  },
  {
    id: "reuters-world-discovery",
    publisher: "Reuters",
    url: GN("when:24h site:reuters.com/world"),
    type: "wire-discovery",
    discovery: true,
    publisherMatch: /reuters/i,
    regions: ["global"],
    topics: ["geopolitics", "trade"],
    active: true,
    refreshMinutes: 30,
    maxAgeHours: 48,
    evidenceWeight: 2,
    attribution: "Reuters world coverage discovered through Google News RSS.",
  },
  {
    id: "bbc-world",
    publisher: "BBC News",
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
    type: "broadcaster",
    regions: ["global"],
    topics: ["geopolitics", "trade"],
    active: true,
    refreshMinutes: 30,
    maxAgeHours: 48,
    evidenceWeight: 2,
    attribution: "BBC News World RSS feed. Headlines and short descriptions only, linking to bbc.co.uk.",
  },
  {
    id: "bbc-business",
    publisher: "BBC News",
    url: "https://feeds.bbci.co.uk/news/business/rss.xml",
    type: "broadcaster",
    regions: ["global"],
    topics: ["demand", "trade", "currency"],
    active: true,
    refreshMinutes: 30,
    maxAgeHours: 48,
    evidenceWeight: 2,
    attribution: "BBC News Business RSS feed.",
  },

  // ---------------------------------------------------------------
  // Regional discovery feeds (Google News RSS, properly encoded)
  // ---------------------------------------------------------------
  {
    id: "discovery-sea",
    publisher: "Various (discovery)",
    url: GN(
      '(Vietnam OR Thailand OR Indonesia OR Malaysia OR Singapore OR Philippines) (manufacturing OR exports OR factory OR "supply chain" OR port OR tariff OR petrochemical) when:3d',
    ),
    type: "wire-discovery",
    discovery: true,
    regions: ["sea"],
    topics: ["manufacturing", "trade", "freight", "energy"],
    active: true,
    refreshMinutes: 60,
    maxAgeHours: 72,
    evidenceWeight: 1,
    attribution: "Southeast Asia manufacturing, trade and logistics discovered through Google News RSS. Publisher preserved per item.",
  },
  {
    id: "discovery-china",
    publisher: "Various (discovery)",
    url: GN(
      'China (manufacturing OR "industrial policy" OR tariffs OR "export controls" OR yuan OR exports OR PMI OR "supply chain" OR petrochemical) when:3d',
    ),
    type: "wire-discovery",
    discovery: true,
    regions: ["china"],
    topics: ["manufacturing", "trade", "currency", "polymers"],
    active: true,
    refreshMinutes: 60,
    maxAgeHours: 72,
    evidenceWeight: 1,
    attribution: "China manufacturing, trade policy and economy discovered through Google News RSS. Publisher preserved per item.",
  },
  {
    id: "discovery-usa",
    publisher: "Various (discovery)",
    url: GN(
      '("United States" OR US OR Trump OR "Federal Reserve") (tariffs OR "trade policy" OR sanctions OR manufacturing OR inflation OR "interest rates" OR petrochemical OR polyethylene) when:3d',
    ),
    type: "wire-discovery",
    discovery: true,
    regions: ["usa"],
    topics: ["trade", "currency", "manufacturing", "energy"],
    active: true,
    refreshMinutes: 60,
    maxAgeHours: 72,
    evidenceWeight: 1,
    attribution: "US trade policy, Federal Reserve, manufacturing and energy discovered through Google News RSS. Publisher preserved per item.",
  },
  {
    id: "discovery-middle-east",
    publisher: "Various (discovery)",
    url: GN(
      '("Middle East" OR "Red Sea" OR "Strait of Hormuz" OR "Suez Canal" OR Gulf OR "Saudi Arabia" OR UAE OR Iran OR Qatar) (shipping OR oil OR gas OR sanctions OR freight OR petrochemical OR tanker OR insurance) when:3d',
    ),
    type: "wire-discovery",
    discovery: true,
    regions: ["middle-east"],
    topics: ["geopolitics", "freight", "energy"],
    active: true,
    refreshMinutes: 60,
    maxAgeHours: 72,
    evidenceWeight: 1,
    attribution: "Middle East shipping, energy and sanctions discovered through Google News RSS. Publisher preserved per item.",
  },
  {
    id: "discovery-polymers",
    publisher: "Various (discovery)",
    url: GN(
      '(polyethylene OR polypropylene OR "polymer prices" OR "resin prices" OR petrochemical OR "packaging film" OR "plastic packaging" OR naphtha OR cracker) when:7d',
    ),
    type: "wire-discovery",
    discovery: true,
    regions: ["global"],
    topics: ["polymers", "energy", "regulation"],
    active: true,
    refreshMinutes: 120,
    maxAgeHours: 24 * 7,
    evidenceWeight: 1,
    attribution: "Plastics, polymers and petrochemicals discovered through Google News RSS. Publisher preserved per item.",
  },
  {
    id: "discovery-shipping",
    publisher: "Various (discovery)",
    url: GN(
      '("container shipping" OR "freight rates" OR "port congestion" OR "supply chain disruption" OR "container rates" OR Maersk OR "shipping lines") when:3d',
    ),
    type: "wire-discovery",
    discovery: true,
    regions: ["global"],
    topics: ["freight"],
    active: true,
    refreshMinutes: 60,
    maxAgeHours: 72,
    evidenceWeight: 1,
    attribution: "Global shipping and supply-chain disruption discovered through Google News RSS. Publisher preserved per item.",
  },
  {
    id: "discovery-australia",
    publisher: "Various (discovery)",
    url: GN(
      '(Australia OR "Australian dollar" OR RBA OR "Reserve Bank") (trade OR imports OR tariffs OR inflation OR "interest rates" OR manufacturing OR packaging OR recycling) when:3d',
    ),
    type: "wire-discovery",
    discovery: true,
    regions: ["australia"],
    topics: ["currency", "trade", "demand", "regulation"],
    active: true,
    refreshMinutes: 60,
    maxAgeHours: 72,
    evidenceWeight: 1,
    attribution: "Australian economic and commercial context discovered through Google News RSS. Publisher preserved per item.",
  },
];

export const ACTIVE_SOURCES = SOURCES.filter((s) => s.active);

export function getSource(id: string): SourceDefinition | undefined {
  return SOURCES.find((s) => s.id === id);
}
