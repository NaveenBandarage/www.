import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { BlobPreconditionFailedError, get, put } from "@vercel/blob";
import {
  EngagementConflictError,
  type BlogEngagementDocument,
  type BlogEngagementStore,
} from "./blogEngagement";

function privateBlobStore(token: string): BlogEngagementStore {
  const pathname = (key: string) => `blog-engagement/v1/${key}.json`;
  const read: BlogEngagementStore["read"] = async (key) => {
    // Public Blob reads cannot bypass the CDN. This MUST be a private store.
    const result = await get(pathname(key), {
      access: "private",
      token,
      useCache: false,
    });
    if (!result) return null;
    if (result.statusCode !== 200) throw new Error("Cannot read engagement");
    const document = (await new Response(
      result.stream,
    ).json()) as BlogEngagementDocument;
    if (document.version !== 1) throw new Error("Unknown engagement version");
    return { document, etag: result.blob.etag };
  };

  return {
    read,
    async write(key, document, etag) {
      try {
        await put(pathname(key), JSON.stringify(document), {
          access: "private",
          token,
          contentType: "application/json",
          addRandomSuffix: false,
          allowOverwrite: etag !== null,
          ...(etag ? { ifMatch: etag } : {}),
        });
      } catch (error) {
        if (error instanceof BlobPreconditionFailedError) {
          throw new EngagementConflictError("Concurrent update");
        }
        // Create-only writes can race too. A winner must exist before retrying.
        if (etag === null && (await read(key))) {
          throw new EngagementConflictError("Concurrent creation");
        }
        throw error;
      }
    },
  };
}

/** Durable local preview, never used on Vercel or in production. */
export function localEngagementStore(
  directory = path.join(process.cwd(), ".cache", "blog-engagement"),
): BlogEngagementStore {
  const filename = (key: string) => path.join(directory, `${key}.json`);
  const read: BlogEngagementStore["read"] = async (key) => {
    try {
      const body = await readFile(filename(key), "utf8");
      return {
        document: JSON.parse(body) as BlogEngagementDocument,
        etag: createHash("sha256").update(body).digest("hex"),
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw error;
    }
  };
  return {
    read,
    async write(key, document, etag) {
      await mkdir(directory, { recursive: true });
      const lock = `${filename(key)}.lock`;
      try {
        await mkdir(lock);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "EEXIST") {
          throw new EngagementConflictError("Concurrent local update");
        }
        throw error;
      }
      const temporary = path.join(lock, randomUUID());
      try {
        if (((await read(key))?.etag ?? null) !== etag) {
          throw new EngagementConflictError("Stale local version");
        }
        await writeFile(temporary, JSON.stringify(document));
        await rename(temporary, filename(key));
      } finally {
        await rm(lock, { recursive: true, force: true });
      }
    },
  };
}

export function getEngagementStore(): BlogEngagementStore {
  const token = process.env.BLOG_ENGAGEMENT_BLOB_READ_WRITE_TOKEN;
  if (token) return privateBlobStore(token);
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    return localEngagementStore();
  }
  // Never pretend a serverless instance's disk or memory is shared storage.
  throw new Error("BLOG_ENGAGEMENT_BLOB_READ_WRITE_TOKEN is not configured");
}
