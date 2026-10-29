import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getDigest } from "@/lib/news/pipeline";
import { REGION_BY_ID, REGIONS } from "@/lib/news/regions";
import type { RegionId } from "@/lib/news/types";
import { RegionTabs, RegionView, VALID_REGIONS } from "@/views/Region";

export function generateStaticParams() {
  return REGIONS.map((r) => ({ region: r.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }): Promise<Metadata> {
  const { region } = await params;
  const meta = REGION_BY_ID[region as RegionId];
  return { title: meta ? meta.name : "Regions" };
}

export default function RegionPage({ params }: { params: Promise<{ region: string }> }) {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 pt-6 md:pt-8 pb-10">
      <Suspense fallback={<div className="skeleton h-10 w-full" />}>
        <Tabs params={params} />
      </Suspense>
      <Suspense fallback={<div className="mt-8 skeleton h-5 w-64" />}>
        <View params={params} />
      </Suspense>
    </div>
  );
}

async function Tabs({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params;
  if (!VALID_REGIONS.has(region)) notFound();
  return <RegionTabs current={region as RegionId} />;
}

async function View({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params;
  if (!VALID_REGIONS.has(region)) notFound();
  const digest = await getDigest();
  return <RegionView digest={digest} id={region as RegionId} />;
}
