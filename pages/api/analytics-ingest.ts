import type { NextApiRequest, NextApiResponse } from "next";
import { put, head } from "@vercel/blob";

interface AnalyticsEvent {
  ts: string;
  date: string;
  type: string;
  path: string;
  referrer: string;
  userAgent: string;
  geo: {
    country: string | null;
    region: string | null;
    city: string | null;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") return res.status(405).end();

  const now = new Date();
  const analyticsFileKey = "analytics/events.json";

  const newEvent: AnalyticsEvent = {
    ts: now.toISOString(),
    date: now.toISOString().slice(0, 10), // YYYY-MM-DD format
    type: (req.body as any)?.type ?? "pageview",
    path: (req.body as any)?.path ?? "",
    referrer: req.headers.referer ?? "",
    userAgent: req.headers["user-agent"] ?? "",
    geo: {
      country:
        (req.headers["x-vercel-ip-country"] as string | undefined) ?? null,
      region:
        (req.headers["x-vercel-ip-country-region"] as string | undefined) ??
        null,
      city: (req.headers["x-vercel-ip-city"] as string | undefined) ?? null,
    },
  };

  try {
    // Try to get existing analytics data
    let existingEvents: AnalyticsEvent[] = [];

    try {
      const existingBlob = await head(analyticsFileKey, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      if (existingBlob.url) {
        const response = await fetch(existingBlob.url);
        const data = await response.text();
        if (data.trim()) {
          existingEvents = JSON.parse(data);
        }
      }
    } catch (error) {
      // File doesn't exist yet, start with empty array
      console.log("Analytics file doesn't exist yet, creating new one");
    }

    // Add the new event to the array
    existingEvents.push(newEvent);

    // Keep only the last 10,000 events to prevent the file from growing too large
    if (existingEvents.length > 10000) {
      existingEvents = existingEvents.slice(-10000);
    }

    // Save the updated array back to blob storage
    await put(analyticsFileKey, JSON.stringify(existingEvents, null, 2), {
      access: "public",
      contentType: "application/json",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Analytics ingestion error:", error);
    return res
      .status(500)
      .json({ ok: false, error: "Failed to store analytics" });
  }
}
