import { NextResponse, type NextRequest } from "next/server";

/**
 * Readers without saved preferences get the prerendered pages straight from
 * the edge. A reader who has saved preferences carries the signal-prefs
 * cookie, and the three ranked views are rewritten to their /personal
 * variants, which read the cookie and re-rank. The URL in the address bar
 * does not change.
 */
const PREFS_COOKIE = "signal-prefs";

export function proxy(request: NextRequest) {
  if (!request.cookies.has(PREFS_COOKIE)) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = url.pathname === "/" ? "/personal" : `/personal${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/", "/regions/:region", "/brief"],
};
