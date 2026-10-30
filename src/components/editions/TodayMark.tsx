"use client";

import { useSyncExternalStore } from "react";
import { sydneyDate } from "@/lib/editions/dates";

const subscribe = () => () => {};

/**
 * True in the browser when `date` is today in Sydney. The Past days page is
 * prebuilt, so "is this today?" is answered by the reader's clock, not the
 * build's. The server snapshot is false, so there is no hydration mismatch.
 */
export function useIsToday(date: string): boolean {
  return useSyncExternalStore(subscribe, () => sydneyDate(new Date()) === date, () => false);
}

/** "Today, so far" beside a day in the list; nothing for other days. */
export function TodayMark({ date }: { date: string }) {
  const today = useIsToday(date);
  if (!today) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-coral-100 px-2 py-[1px] text-[11.5px] font-semibold text-coral-text">
      Today, so far
    </span>
  );
}

/** The kind of day in a saved day's header: today's copy so far, or a past day. */
export function DayKind({ date }: { date: string }) {
  return useIsToday(date) ? <>Today, as kept so far</> : <>A past day</>;
}
