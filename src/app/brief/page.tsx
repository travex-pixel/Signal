import type { Metadata } from "next";
import { Suspense } from "react";
import { getDigest } from "@/lib/news/pipeline";
import { BriefIndexView } from "@/views/BriefIndex";

export const metadata: Metadata = { title: "Meeting briefs" };

export default function BriefIndexPage() {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 py-8"><div className="skeleton h-4 w-40" /></div>}>
      <BriefIndex />
    </Suspense>
  );
}

async function BriefIndex() {
  const digest = await getDigest();
  return <BriefIndexView digest={digest} />;
}
