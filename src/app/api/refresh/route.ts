import { revalidateTag } from "next/cache";
import { after } from "next/server";
import { sydneyDate } from "@/lib/editions/dates";
import { DIGEST_TAG } from "@/lib/news/pipeline";
import { authorizeRefresh, INTERNAL_HEADER, internalToken } from "@/lib/refresh-auth";

/**
 * The refresh, called by the two Vercel crons in vercel.json (morning and
 * evening, Sydney time). It runs in two steps.
 *
 * Step 1 (this route) expires the shared digest and every page built from it
 * (Today, the regions, the brief index, Sources), records the Sydney date,
 * and returns. Expiry only takes effect when this request ends, so the work
 * that needs fresh data cannot happen in this same request.
 *
 * Step 2 (/api/refresh/save, called after this response) is a new request,
 * so it sees the expiry: it rebuilds the digest once and stores it, saves
 * the day under Past days from exactly that digest, enriches the day's picks
 * when AI is on, and requests the main pages so they are rebuilt before the
 * first reader arrives.
 */
export const maxDuration = 120;

/** Gives step 1's expiry time to land before step 2 reads the cache. */
const SETTLE_MS = 1500;

export async function GET(request: Request) {
  const denied = authorizeRefresh(request);
  if (denied) return denied;
  const url = new URL(request.url);
  const run = url.searchParams.get("run") ?? "manual";
  // The day is fixed now: an evening run that finishes after midnight still files under its own day.
  const date = sydneyDate(new Date());
  revalidateTag(DIGEST_TAG, { expire: 0 });

  after(async () => {
    await new Promise((r) => setTimeout(r, SETTLE_MS));
    await fetch(`${url.origin}/api/refresh/save?date=${date}&run=${encodeURIComponent(run)}`, {
      headers: { [INTERNAL_HEADER]: internalToken() },
      cache: "no-store",
    }).catch(() => undefined);
  });

  return Response.json({ ok: true, run, date, expired: DIGEST_TAG, next: "/api/refresh/save" });
}
