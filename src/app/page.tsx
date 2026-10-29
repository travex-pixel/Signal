import { Suspense } from "react";
import { getDigest } from "@/lib/news/pipeline";
import { TodaySkeleton, TodayView } from "@/views/Today";

/**
 * Today's Signal, prerendered and served from the edge. The digest is a
 * cached value with its own lifetime, so this route needs no request-time
 * work: it revalidates in the background and is purged by the daily refresh.
 * Readers with saved preferences are routed to /personal by the proxy.
 */
export default function TodayPage() {
  return (
    <Suspense fallback={<TodaySkeleton />}>
      <Today />
    </Suspense>
  );
}

async function Today() {
  const digest = await getDigest();
  return <TodayView digest={digest} />;
}
