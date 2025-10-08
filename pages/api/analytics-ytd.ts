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

interface YTDStats {
  totalViews: number;
  uniqueCountries: number;
  uniqueCities: number;
  topPages: { path: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
  viewsByMonth: { month: string; count: number }[];
  deviceBreakdown: { mobile: number; desktop: number; tablet: number };
  lastUpdated: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<YTDStats | { error: string }>,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const analyticsFileKey = "analytics/events.json";

    // Try to get existing analytics data
    const existingBlob = await head(analyticsFileKey, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (!existingBlob.url) {
      return res.status(200).json({
        totalViews: 0,
        uniqueCountries: 0,
        uniqueCities: 0,
        topPages: [],
        topReferrers: [],
        viewsByMonth: [],
        deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0 },
        lastUpdated: new Date().toISOString(),
      });
    }

    const response = await fetch(existingBlob.url);
    const data = await response.text();

    if (!data.trim()) {
      return res.status(200).json({
        totalViews: 0,
        uniqueCountries: 0,
        uniqueCities: 0,
        topPages: [],
        topReferrers: [],
        viewsByMonth: [],
        deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0 },
        lastUpdated: new Date().toISOString(),
      });
    }

    const events: AnalyticsEvent[] = JSON.parse(data);

    // Get current year
    const currentYear = new Date().getFullYear();

    // Filter events for current year
    const ytdEvents = events.filter((event) => {
      const eventYear = new Date(event.ts).getFullYear();
      return eventYear === currentYear;
    });

    // Calculate stats
    const totalViews = ytdEvents.length;

    // Unique countries
    const countries = new Set(
      ytdEvents
        .map((e) => e.geo.country)
        .filter((c): c is string => c !== null && c !== ""),
    );
    const uniqueCountries = countries.size;

    // Unique cities
    const cities = new Set(
      ytdEvents
        .map((e) => e.geo.city)
        .filter((c): c is string => c !== null && c !== ""),
    );
    const uniqueCities = cities.size;

    // Top pages
    const pageCounts = ytdEvents.reduce(
      (acc, event) => {
        if (event.path) {
          acc[event.path] = (acc[event.path] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    const topPages = Object.entries(pageCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top referrers (filter out empty and same-site)
    const referrerCounts = ytdEvents.reduce(
      (acc, event) => {
        if (
          event.referrer &&
          !event.referrer.includes("naveenbandarage.com") &&
          !event.referrer.includes("localhost")
        ) {
          try {
            const url = new URL(event.referrer);
            const domain = url.hostname.replace("www.", "");
            acc[domain] = (acc[domain] || 0) + 1;
          } catch {
            // Invalid URL, skip
          }
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    const topReferrers = Object.entries(referrerCounts)
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Views by month
    const monthCounts = ytdEvents.reduce(
      (acc, event) => {
        const date = new Date(event.ts);
        const month = date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const viewsByMonth = Object.entries(monthCounts)
      .map(([month, count]) => ({ month, count }))
      .sort(
        (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime(),
      );

    // Device breakdown (simple heuristic based on user agent)
    const deviceBreakdown = ytdEvents.reduce(
      (acc, event) => {
        const ua = event.userAgent.toLowerCase();
        if (
          ua.includes("mobile") ||
          ua.includes("android") ||
          ua.includes("iphone")
        ) {
          acc.mobile++;
        } else if (ua.includes("tablet") || ua.includes("ipad")) {
          acc.tablet++;
        } else {
          acc.desktop++;
        }
        return acc;
      },
      { mobile: 0, desktop: 0, tablet: 0 },
    );

    return res.status(200).json({
      totalViews,
      uniqueCountries,
      uniqueCities,
      topPages,
      topReferrers,
      viewsByMonth,
      deviceBreakdown,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("YTD analytics error:", error);
    return res.status(500).json({ error: "Failed to fetch YTD analytics" });
  }
}

