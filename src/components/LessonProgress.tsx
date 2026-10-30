"use client";

import { useEffect, useSyncExternalStore } from "react";
import { IconCheck } from "./shell/icons";

/**
 * Which lessons the reader has read, kept in this browser. A lesson counts
 * as read after fifteen seconds on its page: long enough to mean it, short
 * enough that a quick reader is not missed.
 */
const KEY = "signal-lessons-read";
const EVENT = "signal-lessons-read";

function readSet(): string {
  try {
    return window.localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

function useReadSlugs(): string[] {
  const raw = useSyncExternalStore(subscribe, readSet, () => "[]");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function MarkLessonRead({ slug }: { slug: string }) {
  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        const current = new Set<string>(JSON.parse(readSet()));
        if (current.has(slug)) return;
        current.add(slug);
        window.localStorage.setItem(KEY, JSON.stringify([...current]));
        window.dispatchEvent(new Event(EVENT));
      } catch {
        // Storage unavailable: progress simply is not kept.
      }
    }, 15_000);
    return () => window.clearTimeout(t);
  }, [slug]);
  return null;
}

export function ReadMark({ slug }: { slug: string }) {
  const read = useReadSlugs().includes(slug);
  if (!read) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-ok-100 px-2 py-[1px] text-[11.5px] font-semibold text-ok">
      <IconCheck width={13} height={13} /> Read
    </span>
  );
}

export function ReadCount({ slugs }: { slugs: string[] }) {
  const read = useReadSlugs().filter((s) => slugs.includes(s)).length;
  if (read === 0) return null;
  return (
    <span className="font-medium normal-case tracking-normal text-ok">
      {" "}
      · {read} of {slugs.length} read
    </span>
  );
}
