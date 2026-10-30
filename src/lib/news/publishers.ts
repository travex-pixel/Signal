/**
 * Publisher names as Google News reports them are uneven: raw web addresses,
 * lower case, a site title with a strapline. This tidies them for display
 * and flags sources that are not journalism (press-release wires) or that
 * arrive only as a bare web address.
 */

const ALIASES: Record<string, string> = {
  "ing think": "ING Think",
  "bloomberg.com": "Bloomberg",
  "smh.com.au": "The Sydney Morning Herald",
  "dw.com": "DW",
  "marketscreener.com": "MarketScreener",
  "dataportuaria": "Data Portuaria",
  "crude oil prices today | oilprice.com": "OilPrice.com",
  "federal reserve economic data | fred | st. louis fed": "St. Louis Fed (FRED)",
  "the mighty 790 kfgo": "KFGO",
  "australian government department of foreign affairs and trade": "DFAT",
};

/** Press-release distribution services: useful to find things, not evidence that they happened. */
const PRESS_RELEASE = /\b(ein presswire|ein news|openpr|pr newswire|prnewswire|globe ?newswire|business wire|accesswire|newsfile)\b/i;

export function cleanPublisher(raw: string): string {
  let name = raw.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  const host = /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(name);
  if (host) name = name.replace(/^www\./i, "").replace(/^news\./i, "");
  const alias = ALIASES[name.toLowerCase()];
  if (alias) return alias;
  return name;
}

/** A publisher shown only as a web address, such as "thecradle.co": unknown standing. */
export function isBareDomain(name: string): boolean {
  return /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(name) && name === name.toLowerCase();
}

export function isPressRelease(name: string): boolean {
  return PRESS_RELEASE.test(name);
}
