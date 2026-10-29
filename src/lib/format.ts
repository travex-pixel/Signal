const TZ = "Australia/Sydney";

export function formatDateTime(iso: string, opts: Intl.DateTimeFormatOptions = {}): string {
  return new Date(iso).toLocaleString("en-AU", {
    timeZone: TZ,
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    ...opts,
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-AU", { timeZone: TZ, hour: "numeric", minute: "2-digit" });
}

/** Short relative time, e.g. "2h ago", "yesterday", "3d ago". */
export function relativeTime(iso: string, now: Date = new Date()): string {
  const diffMs = now.getTime() - Date.parse(iso);
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 14) return `${days}d ago`;
  return formatDateTime(iso, { hour: undefined, minute: undefined });
}

export function todayLabel(now: Date = new Date()): string {
  return now.toLocaleDateString("en-AU", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" });
}

export function timeOfDayGreeting(now: Date = new Date()): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-AU", { timeZone: TZ, hour: "numeric", hour12: false }).format(now),
  );
  if (hour < 12) return "This morning";
  if (hour < 17) return "This afternoon";
  return "This evening";
}

export function truncateSentences(text: string, max = 2): string {
  const parts = text.match(/[^.!?]+[.!?]+(\s|$)/g);
  if (!parts) return text;
  return parts.slice(0, max).join("").trim();
}
