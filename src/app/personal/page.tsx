import type { Metadata } from "next";
import { Suspense } from "react";
import { getPersonalDigest } from "@/lib/data";
import { TodaySkeleton, TodayView } from "@/views/Today";

/** Today's Signal re-ranked for a reader with saved preferences. Reached only by proxy rewrite. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function PersonalTodayPage() {
  return (
    <Suspense fallback={<TodaySkeleton />}>
      <Today />
    </Suspense>
  );
}

async function Today() {
  const { digest } = await getPersonalDigest();
  return <TodayView digest={digest} />;
}
