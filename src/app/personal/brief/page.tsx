import type { Metadata } from "next";
import { Suspense } from "react";
import { getPersonalDigest } from "@/lib/data";
import { BriefIndexView } from "@/views/BriefIndex";

/** The brief index re-ranked for a reader with saved preferences. Reached only by proxy rewrite. */
export const metadata: Metadata = { title: "Meeting briefs", robots: { index: false, follow: false } };

export default function PersonalBriefIndexPage() {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 py-8"><div className="skeleton h-4 w-40" /></div>}>
      <BriefIndex />
    </Suspense>
  );
}

async function BriefIndex() {
  const { digest } = await getPersonalDigest();
  return <BriefIndexView digest={digest} />;
}
