import type { NextApiRequest, NextApiResponse } from "next";
import { put, head } from "@vercel/blob";

export type TikTokStats = {
  followers: number;
  likes: number;
  videos: number;
  updatedAt: string;
};

const BLOB_KEY = "tiktok-stats.json";
const TIKTOK_USERNAME = "hokageoftheeastvillage";

async function scrapeStats(): Promise<Omit<TikTokStats, "updatedAt"> | null> {
  try {
    const res = await fetch(`https://www.tiktok.com/@${TIKTOK_USERNAME}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });
    if (!res.ok) return null;

    const html = await res.text();

    const followerMatch = html.match(/"followerCount":(\d+)/);
    const likesMatch = html.match(/"heartCount":(\d+)/);
    const videosMatch = html.match(/"videoCount":(\d+)/);

    if (!followerMatch || !likesMatch || !videosMatch) return null;

    return {
      followers: parseInt(followerMatch[1], 10),
      likes: parseInt(likesMatch[1], 10),
      videos: parseInt(videosMatch[1], 10),
    };
  } catch {
    return null;
  }
}

async function readBlob(): Promise<TikTokStats | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const meta = await head(BLOB_KEY, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    if (!meta?.url) return null;
    return await fetch(meta.url).then((r) => r.json());
  } catch {
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const isCron =
    !!process.env.CRON_SECRET &&
    req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`;

  if (req.method === "GET" && isCron) {
    // Vercel Cron path: scrape fresh data and update blob
    const fresh = await scrapeStats();
    if (fresh && process.env.BLOB_READ_WRITE_TOKEN) {
      const record: TikTokStats = {
        ...fresh,
        updatedAt: new Date().toISOString(),
      };
      await put(BLOB_KEY, JSON.stringify(record), {
        access: "public",
        contentType: "application/json",
        token: process.env.BLOB_READ_WRITE_TOKEN,
        allowOverwrite: true,
      });
      return res.status(200).json(record);
    }
    return res.status(500).json({ error: "Scrape failed or blob token missing" });
  }

  if (req.method === "GET") {
    const stored = await readBlob();
    if (stored) {
      res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
      return res.status(200).json(stored);
    }
    return res.status(404).json({ error: "No stats available" });
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end("Method Not Allowed");
}
