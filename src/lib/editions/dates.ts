/**
 * Edition dates are calendar days in Sydney, written YYYY-MM-DD. They are the
 * blob path, the URL segment and the sort key, so they are validated strictly.
 */

const TZ = "Australia/Sydney";

export const EDITION_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** The Sydney calendar day of an instant, as YYYY-MM-DD. */
export function sydneyDate(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

/** Midday in Sydney on that day: an instant that formats to the same day in any season. */
export function editionNoon(date: string): Date {
  return new Date(`${date}T12:00:00+10:00`);
}

/** True for a real calendar day written YYYY-MM-DD. Rejects 2026-02-30 and anything else. */
export function isValidEditionDate(date: string): boolean {
  if (!EDITION_DATE.test(date)) return false;
  const d = editionNoon(date);
  return !Number.isNaN(d.getTime()) && sydneyDate(d) === date;
}

/** "Wednesday 28 October". */
export function editionLabel(date: string): string {
  return editionNoon(date).toLocaleDateString("en-AU", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" });
}

/** "Wednesday 28 October 2026". */
export function editionLongLabel(date: string): string {
  return editionNoon(date).toLocaleDateString("en-AU", { timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

/** "Wed 28 Oct", for compact previous and next links. */
export function editionShortLabel(date: string): string {
  return editionNoon(date).toLocaleDateString("en-AU", { timeZone: TZ, weekday: "short", day: "numeric", month: "short" });
}

/** "11:31 pm", the Sydney time an edition was saved. */
export function savedTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-AU", { timeZone: TZ, hour: "numeric", minute: "2-digit" });
}
