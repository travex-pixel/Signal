/**
 * URL hygiene: canonicalisation, tracking-parameter removal and
 * best-effort recovery of original article URLs from Google News links.
 */

const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "fbclid",
  "gclid",
  "mc_cid",
  "mc_eid",
  "ref",
  "cmpid",
  "ocid",
  "at_medium",
  "at_campaign",
  "taid",
]);

export function canonicalizeUrl(input: string): string {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return input.trim();
  }
  url.protocol = url.protocol === "http:" ? "https:" : url.protocol;
  url.hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  url.hash = "";
  for (const key of Array.from(url.searchParams.keys())) {
    if (TRACKING_PARAMS.has(key.toLowerCase())) url.searchParams.delete(key);
  }
  // Drop trailing slash on paths other than root and collapse duplicate slashes.
  url.pathname = url.pathname.replace(/\/{2,}/g, "/");
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
  }
  const search = url.searchParams.toString();
  return `${url.protocol}//${url.hostname}${url.pathname}${search ? `?${search}` : ""}`;
}

export function isGoogleNewsUrl(input: string): boolean {
  try {
    const u = new URL(input);
    return u.hostname === "news.google.com";
  } catch {
    return false;
  }
}

/**
 * Google News RSS links encode the article in a base64 identifier. Older
 * identifiers carry the original URL in plain bytes; newer ones do not and
 * require a round trip to Google that SIGNAL does not make. Returns the
 * original URL when it can be recovered, otherwise undefined.
 */
export function unwrapGoogleNewsUrl(input: string): string | undefined {
  let u: URL;
  try {
    u = new URL(input);
  } catch {
    return undefined;
  }
  if (u.hostname !== "news.google.com") return undefined;
  // Legacy redirector form: https://news.google.com/articles/...?url=https://...
  const direct = u.searchParams.get("url");
  if (direct && /^https?:\/\//.test(direct)) return direct;

  const match = u.pathname.match(/\/(?:rss\/)?articles\/([^/?#]+)/);
  if (!match) return undefined;
  const id = match[1];
  let bytes: Buffer;
  try {
    bytes = Buffer.from(id.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  } catch {
    return undefined;
  }
  const text = bytes.toString("latin1");
  const found = text.match(/https?:\/\/[\x21-\x7e]+/);
  if (!found) return undefined;
  // Strip protobuf trailing bytes that happen to be printable.
  let candidate = found[0].replace(/[\x00-\x1f\x7f]+$/g, "");
  // The legacy form often ends with a 0xd2 0x01 marker followed by the AMP URL; keep the first URL only.
  const nextHttp = candidate.indexOf("http", 8);
  if (nextHttp > 0) candidate = candidate.slice(0, nextHttp);
  candidate = candidate.replace(/[^\w\-./:?=&%#~+@]+$/g, "");
  try {
    const parsed = new URL(candidate);
    if (parsed.hostname === "news.google.com") return undefined;
    return parsed.toString();
  } catch {
    return undefined;
  }
}

export function hostnameOf(input: string): string | undefined {
  try {
    return new URL(input).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}
