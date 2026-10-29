import { describe, expect, it } from "vitest";
import { fetchSource } from "./fetch";
import { ACTIVE_SOURCES } from "./sources";

/**
 * Live source verification. Skipped unless SIGNAL_LIVE=1, because it needs
 * outbound network access and real feeds change. Run it before deploying:
 *
 *   SIGNAL_LIVE=1 npm test -- live
 *
 * It reports each source as live or degraded and only fails when nothing
 * at all could be fetched.
 */
const live = process.env.SIGNAL_LIVE === "1";

describe.skipIf(!live)("live sources", () => {
  it(
    "fetches every active source and reports status",
    async () => {
      const results = await Promise.all(ACTIVE_SOURCES.map((s) => fetchSource(s, { timeoutMs: 15_000 })));
      for (const r of results) {
        const s = r.status;
        console.log(
          `${s.ok ? "LIVE    " : "DEGRADED"} ${s.id.padEnd(28)} ${s.status ?? "-"} ${s.keptCount}/${s.itemCount} ${s.durationMs}ms ${s.error ?? ""}`,
        );
        if (s.ok && r.stories[0]) {
          const first = r.stories[0];
          console.log(`         e.g. “${first.title}” — ${first.publisher} — ${first.url}`);
        }
      }
      expect(results.some((r) => r.status.ok)).toBe(true);
    },
    60_000,
  );
});
