"use client";

import { useSyncExternalStore } from "react";
import { formatDate, relativeTime, todayLabel } from "@/lib/format";

/**
 * Time that stays right on a static page. The server renders a fallback
 * computed from the digest's own timestamp, so the page can be prerendered
 * and served from the edge. In the browser the text is recomputed from the
 * real clock once hydrated. useSyncExternalStore gives React a server
 * snapshot, so there is no hydration mismatch and no effect-driven state.
 */

const subscribe = () => () => {};

export function Ago({ iso, fallback }: { iso: string; fallback: string }) {
  const text = useSyncExternalStore(subscribe, () => relativeTime(iso), () => fallback);
  return <>{text}</>;
}

export function TodayDate({ fallback, long = false }: { fallback: string; long?: boolean }) {
  const text = useSyncExternalStore(
    subscribe,
    () => (long ? formatDate(new Date().toISOString()) : todayLabel(new Date())),
    () => fallback,
  );
  return <>{text}</>;
}
