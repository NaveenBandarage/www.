import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "node:crypto";
import { readdir } from "node:fs/promises";
import path from "node:path";
import {
  emptyEngagement,
  engagementKey,
  engagementSummary,
  readerKey,
  updateEngagement,
  type BlogEngagementStore,
  type EngagementAction,
} from "../../../lib/blogEngagement";
import { getEngagementStore } from "../../../lib/blogEngagementStore";
import { isReactionId } from "../../../lib/blogReactions";
import { checkRateLimit, getClientAddress } from "../../../lib/rateLimit";

export const config = { api: { bodyParser: { sizeLimit: "1kb" } } };
const COOKIE = "blog_reader_v1";
const UUID =
  /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
let publishedSlugs: Promise<Set<string>> | undefined;

async function isPublished(slug: string) {
  publishedSlugs ??= readdir(path.join(process.cwd(), "posts"))
    .then(
      (files) =>
        new Set(
          files
            .filter((file) => file.endsWith(".mdx"))
            .map((file) => file.slice(0, -4)),
        ),
    )
    .catch((error) => {
      publishedSlugs = undefined;
      throw error;
    });
  return (await publishedSlugs).has(slug);
}

function sameOrigin(req: NextApiRequest) {
  if (req.headers["sec-fetch-site"] === "cross-site") return false;
  if (!req.headers.origin) return true;
  try {
    return new URL(req.headers.origin).host === req.headers.host;
  } catch {
    return false;
  }
}

interface HandlerDependencies {
  getStore: () => BlogEngagementStore;
  isPublished: (slug: string) => Promise<boolean>;
}

export function createEngagementHandler(dependencies: HandlerDependencies) {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Response includes this reader's selections and must never be shared by a CDN.
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Vary", "Cookie");
    if (req.method !== "GET" && req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      return res.status(405).json({ error: "Method not allowed" });
    }
    if (!sameOrigin(req))
      return res.status(403).json({ error: "Invalid origin" });

    const limit = checkRateLimit(
      `blog-engagement:${getClientAddress(req)}`,
      90,
      60_000,
    );
    if (!limit.allowed) {
      res.setHeader("Retry-After", limit.retryAfter);
      return res
        .status(429)
        .json({ error: "Too many requests. Try again shortly." });
    }
    const slug = req.query.slug;
    if (typeof slug !== "string" || slug.length > 180) {
      return res.status(400).json({ error: "Invalid post" });
    }
    let action: EngagementAction | undefined;
    if (req.method === "POST") {
      if (!req.headers["content-type"]?.startsWith("application/json")) {
        return res.status(415).json({ error: "Expected JSON" });
      }
      const body = req.body;
      if (body?.type === "view") action = { type: "view" };
      else if (
        body?.type === "reaction" &&
        isReactionId(body.reaction) &&
        typeof body.active === "boolean"
      ) {
        action = {
          type: "reaction",
          reaction: body.reaction,
          active: body.active,
        };
      } else return res.status(400).json({ error: "Invalid reaction" });
    }

    try {
      if (!(await dependencies.isPublished(slug))) {
        return res.status(404).json({ error: "Post not found" });
      }
      const store = dependencies.getStore();
      const cookie = req.cookies[COOKIE];
      if (action && (!cookie || !UUID.test(cookie))) {
        return res
          .status(400)
          .json({ error: "Enable cookies to react and count your view." });
      }
      const reader = cookie && UUID.test(cookie) ? cookie : randomUUID();
      if (reader !== cookie) {
        res.setHeader(
          "Set-Cookie",
          `${COOKIE}=${reader}; Path=/api/blog-engagement; Max-Age=31536000; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
        );
      }
      const id = readerKey(slug, reader);
      const summary = action
        ? await updateEngagement(store, slug, id, action)
        : engagementSummary(
            (await store.read(engagementKey(slug)))?.document ??
              emptyEngagement(),
            id,
          );
      return res.status(200).json(summary);
    } catch {
      return res
        .status(503)
        .json({
          error: "Reactions are unavailable right now. Please try again.",
        });
    }
  };
}

export default createEngagementHandler({
  getStore: getEngagementStore,
  isPublished,
});
