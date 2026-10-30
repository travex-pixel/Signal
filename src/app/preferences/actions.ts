"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { preferencesSchema, PREFS_COOKIE, REGION_IDS, serializePreferences, TOPIC_IDS } from "@/lib/preferences";

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function savePreferences(formData: FormData) {
  const regionEmphasis: Record<string, number> = {};
  const topicEmphasis: Record<string, number> = {};
  // A field that is missing means "leave at normal", never "hide".
  const read = (name: string) => {
    const raw = formData.get(name);
    return raw === null || raw === "" ? 1 : Number(raw);
  };
  for (const id of REGION_IDS) {
    const v = read(`region:${id}`);
    if (!Number.isNaN(v) && v !== 1) regionEmphasis[id] = v;
  }
  for (const id of TOPIC_IDS) {
    const v = read(`topic:${id}`);
    if (!Number.isNaN(v) && v !== 1) topicEmphasis[id] = v;
  }
  const parsed = preferencesSchema.safeParse({ regionEmphasis, topicEmphasis });
  if (!parsed.success) redirect("/preferences?error=1");
  const store = await cookies();
  if (Object.keys(regionEmphasis).length === 0 && Object.keys(topicEmphasis).length === 0) {
    // All normal: no cookie, so this reader keeps the fast, prebuilt pages.
    store.delete(PREFS_COOKIE);
  } else {
    store.set(PREFS_COOKIE, serializePreferences(parsed.data), {
      path: "/",
      maxAge: ONE_YEAR,
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
  }
  redirect("/preferences?saved=1");
}

export async function resetPreferences() {
  const store = await cookies();
  store.delete(PREFS_COOKIE);
  redirect("/preferences?reset=1");
}
