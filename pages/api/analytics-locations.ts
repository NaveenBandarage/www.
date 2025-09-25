import type { NextApiRequest, NextApiResponse } from "next";
import { head } from "@vercel/blob";

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

interface LocationData {
  country: string;
  region: string;
  city: string;
  count: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const analyticsFileKey = "analytics/events.json";

    // Try to get existing analytics data
    let events: AnalyticsEvent[] = [];

    try {
      const existingBlob = await head(analyticsFileKey, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      if (existingBlob.url) {
        const response = await fetch(existingBlob.url);
        const data = await response.text();
        if (data.trim()) {
          events = JSON.parse(data);
        }
      }
    } catch (error) {
      console.log("Analytics file doesn't exist yet");
      return res.status(200).json({ locations: [] });
    }

    // Process location data
    const locationMap = new Map<string, LocationData>();

    events.forEach((event) => {
      const { geo } = event;
      if (geo.country && geo.region && geo.city) {
        const key = `${geo.country}-${geo.region}-${geo.city}`;
        const existing = locationMap.get(key);

        if (existing) {
          existing.count += 1;
        } else {
          locationMap.set(key, {
            country: geo.country,
            region: geo.region,
            city: geo.city,
            count: 1,
          });
        }
      }
    });

    const locations = Array.from(locationMap.values()).sort(
      (a, b) => b.count - a.count,
    ); // Sort by count descending

    // Set cache headers for 5 minutes
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600",
    );

    return res.status(200).json({
      locations,
      totalEvents: events.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Analytics locations error:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch analytics locations" });
  }
}
