import { readFile } from "node:fs/promises";
import path from "node:path";
import type { SourceDefinition } from "./types";

/**
 * Development fixture mode.
 *
 * When SIGNAL_FIXTURE_DIR is set, feeds are read from `<dir>/<source id>.xml`
 * instead of the network. This exists so the interface can be developed and
 * tested without outbound access; the bundled fixtures are synthetic and are
 * labelled as such in the interface. It is never enabled by default.
 */
export function fixtureDir(): string | undefined {
  const dir = process.env.SIGNAL_FIXTURE_DIR;
  return dir ? path.resolve(process.cwd(), dir) : undefined;
}

export function fixtureFetch(dir: string): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const source = SOURCE_LOOKUP.get(url);
    if (!source) return new Response("no fixture", { status: 404 });
    try {
      const xml = await readFile(path.join(dir, `${source.id}.xml`), "utf8");
      return new Response(xml, { status: 200, headers: { "content-type": "application/xml" } });
    } catch {
      return new Response("no fixture", { status: 404 });
    }
  }) as typeof fetch;
}

const SOURCE_LOOKUP = new Map<string, SourceDefinition>();
export function registerFixtureSources(sources: SourceDefinition[]) {
  for (const s of sources) SOURCE_LOOKUP.set(s.url, s);
}
