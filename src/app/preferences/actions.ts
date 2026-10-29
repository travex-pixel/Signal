"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { preferencesSchema, PREFS_COOKIE, REGION_IDS, serializePreferences, TOPIC_IDS } from "@/lib/preferences";

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function savePreferences(formData: FormData) {
  const regionEmphasis: Record<string, number> = {};
  const topicEmphasis: Record<string, number> = {};
  for (const id of REGION_IDS) {
    const v = Number(formData.get(`region:${id}`));
    if (!Number.isNaN(v) && v !== 1) regionEmphasis[id] = v;
  }
  for (const id of TOPIC_IDS) {
    const v = Number(formData.get(`topic:${id}`));
    if (!Number.isNaN(v) && v !== 1) topicEmphasis[id] = v;
  }
  const parsed = preferencesSchema.safeParse({ regionEmphasis, topicEmphasis });
  const store = await cookies();
  if (parsed.success) {
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
