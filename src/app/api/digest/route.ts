import { connection } from "next/server";
import { getDigest } from "@/lib/news/pipeline";

/** The current digest as JSON: stories, source status and timestamps. */
export async function GET() {
  await connection();
  const digest = await getDigest();
  return Response.json(digest, {
    headers: { "cache-control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
