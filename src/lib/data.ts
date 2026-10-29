import "server-only";
import { cookies } from "next/headers";
import { applyPreferences, getDigest } from "@/lib/news/pipeline";
import { parsePreferences, PREFS_COOKIE } from "@/lib/preferences";
import type { Preferences } from "@/lib/news/rank";
import type { Digest } from "@/lib/news/types";

/** Reads the reader's preferences from the cookie (runtime API; call inside Suspense). */
export async function getPreferences(): Promise<Preferences> {
  const store = await cookies();
  return parsePreferences(store.get(PREFS_COOKIE)?.value);
}

/** The cached digest, re-ranked for this reader. */
export async function getPersonalDigest(): Promise<{ digest: Digest; prefs: Preferences }> {
  const [digest, prefs] = await Promise.all([getDigest(), getPreferences()]);
  return { digest: applyPreferences(digest, prefs), prefs };
}
