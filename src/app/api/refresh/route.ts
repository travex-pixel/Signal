import { revalidateTag } from "next/cache";
import { DIGEST_TAG } from "@/lib/news/pipeline";

/**
 * On-demand refresh, called by the Vercel cron in vercel.json (and usable
 * manually). Protected by CRON_SECRET when one is configured; Vercel sends
 * it as a bearer token automatically.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });
  }
  revalidateTag(DIGEST_TAG, "max");
  return Response.json({ ok: true, revalidated: DIGEST_TAG, at: new Date().toISOString() });
}
