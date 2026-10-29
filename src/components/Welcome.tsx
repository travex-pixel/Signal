"use client";

import { useSyncExternalStore } from "react";
import { IconClose } from "./shell/icons";

const KEY = "signal-welcome-v1";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function firstVisit(): boolean {
  try {
    return !window.localStorage.getItem(KEY);
  } catch {
    // Private mode or blocked storage. Showing nothing is the safe default.
    return false;
  }
}

/**
 * A one-time welcome for a first visit. Three short sentences on what SIGNAL
 * is and how to read it, dismissed with one tap and remembered in this
 * browser. The server snapshot is "not shown", so the static shell never
 * flashes it at a returning reader.
 */
export function Welcome() {
  const show = useSyncExternalStore(subscribe, firstVisit, () => false);

  if (!show) return null;

  function dismiss() {
    try {
      window.localStorage.setItem(KEY, new Date().toISOString());
    } catch {
      // Ignore. The strip simply returns next visit.
    }
    listeners.forEach((l) => l());
  }

  return (
    <aside
      aria-label="Welcome to SIGNAL"
      className="rise mb-5 rounded-xl navy-gloss text-white px-5 py-4 md:px-6 md:py-5 flex items-start gap-4"
    >
      <div className="min-w-0 flex-1">
        <p className="m-0 font-sans text-[15px] md:text-[16px] font-semibold leading-[1.35]">
          Welcome. SIGNAL reads the business news for you every day.
        </p>
        <p className="mt-1.5 mb-0 font-sans text-[14px] leading-[1.5] text-navy-100">
          It picks one story that matters for an Australian importer and explains it in plain words. Start with
          the story below. Then follow the six steps, from what happened to what you could say in a meeting.
          Five minutes is enough.
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="flex-none -mr-1 -mt-1 inline-flex h-9 w-9 items-center justify-center rounded-md text-navy-200 hover:text-white hover:bg-white/10 transition-colors duration-150 focus-visible:outline-white"
        aria-label="Close welcome"
      >
        <IconClose />
      </button>
    </aside>
  );
}
