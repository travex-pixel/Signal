import "server-only";
import { get, put } from "@vercel/blob";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Where editions live. On Vercel, a Blob store: connecting one to the
 * project adds BLOB_READ_WRITE_TOKEN. For local development and tests,
 * SIGNAL_EDITIONS_DIR points at a folder instead. With neither, past days
 * are switched off and the interface says so.
 */
export interface EditionStore {
  kind: "blob" | "files";
  read(pathname: string): Promise<string | undefined>;
  write(pathname: string, body: string): Promise<void>;
}

const SAFE_PATH = /^editions\/[a-z0-9-]+\.json$/;

function assertSafe(pathname: string) {
  if (!SAFE_PATH.test(pathname)) throw new Error(`Refusing edition path ${pathname}`);
}

type Access = "private" | "public";

// Private is preferred: only this app can read the files. If the store was
// created as public, the first write fails on access and the store switches.
let blobAccess: Access = process.env.SIGNAL_BLOB_ACCESS === "public" ? "public" : "private";
const other = (a: Access): Access => (a === "private" ? "public" : "private");
const isAccessError = (e: unknown) => /access|private|public/i.test(e instanceof Error ? e.message : String(e));

function blobStore(): EditionStore {
  return {
    kind: "blob",
    async read(pathname) {
      assertSafe(pathname);
      const res = await get(pathname, { access: blobAccess, useCache: false });
      if (res && res.statusCode === 200 && res.stream) return new Response(res.stream).text();
      if (res) return undefined;
      // Not found under the configured access. A store has one access level, so
      // only probe the other one once, quietly, in case the store was created that way.
      try {
        const alt = other(blobAccess);
        const retry = await get(pathname, { access: alt, useCache: false });
        if (retry && retry.statusCode === 200 && retry.stream) {
          blobAccess = alt;
          return new Response(retry.stream).text();
        }
      } catch {
        // The other host refused: the configured access was right and the file is missing.
      }
      return undefined;
    },
    async write(pathname, body) {
      assertSafe(pathname);
      const options = (access: Access) =>
        ({ access, addRandomSuffix: false, allowOverwrite: true, contentType: "application/json", cacheControlMaxAge: 60 }) as const;
      try {
        await put(pathname, body, options(blobAccess));
      } catch (err) {
        if (!isAccessError(err)) throw err;
        const alt = other(blobAccess);
        await put(pathname, body, options(alt));
        blobAccess = alt;
      }
    },
  };
}

function fileStore(dir: string): EditionStore {
  const full = (pathname: string) => {
    assertSafe(pathname);
    return path.join(/*turbopackIgnore: true*/ dir, pathname);
  };
  return {
    kind: "files",
    async read(pathname) {
      try {
        return await readFile(/*turbopackIgnore: true*/ full(pathname), "utf8");
      } catch {
        return undefined;
      }
    },
    async write(pathname, body) {
      const file = full(pathname);
      await mkdir(/*turbopackIgnore: true*/ path.dirname(file), { recursive: true });
      await writeFile(/*turbopackIgnore: true*/ file, body, "utf8");
    },
  };
}

export function editionStore(): EditionStore | undefined {
  if (process.env.BLOB_READ_WRITE_TOKEN) return blobStore();
  if (process.env.SIGNAL_EDITIONS_DIR) return fileStore(process.env.SIGNAL_EDITIONS_DIR);
  return undefined;
}
