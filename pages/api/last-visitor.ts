import type { NextApiRequest, NextApiResponse } from "next";
import { head, put } from "@vercel/blob";

type LastVisitor = {
  city: string | null;
  region: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  timestamp: string; // ISO string
};

declare global {
  // eslint-disable-next-line no-var
  var __LAST_VISITOR__: LastVisitor | undefined;
}

function getClientIp(req: NextApiRequest): string | null {
  const xForwardedFor = req.headers["x-forwarded-for"]; // may be a list
  const ip = Array.isArray(xForwardedFor)
    ? xForwardedFor[0]
    : xForwardedFor?.split(",")[0] || req.socket.remoteAddress || null;

  if (!ip) return null;

  // Strip IPv6 prefix such as ::ffff:
  const cleaned = ip.replace("::ffff:", "");

  // Ignore local/private addresses
  if (
    cleaned === "127.0.0.1" ||
    cleaned === "::1" ||
    cleaned.startsWith("10.") ||
    cleaned.startsWith("192.168.") ||
    cleaned.startsWith("172.16.") ||
    cleaned.startsWith("172.17.") ||
    cleaned.startsWith("172.18.") ||
    cleaned.startsWith("172.19.") ||
    cleaned.startsWith("172.20.") ||
    cleaned.startsWith("172.21.") ||
    cleaned.startsWith("172.22.") ||
    cleaned.startsWith("172.23.") ||
    cleaned.startsWith("172.24.") ||
    cleaned.startsWith("172.25.") ||
    cleaned.startsWith("172.26.") ||
    cleaned.startsWith("172.27.") ||
    cleaned.startsWith("172.28.") ||
    cleaned.startsWith("172.29.") ||
    cleaned.startsWith("172.30.") ||
    cleaned.startsWith("172.31.")
  ) {
    return null;
  }

  return cleaned;
}

function getGeoFromHeaders(req: NextApiRequest) {
  const country =
    (req.headers["x-vercel-ip-country"] as string | undefined) ?? null;
  const region =
    (req.headers["x-vercel-ip-country-region"] as string | undefined) ?? null;
  const city = (req.headers["x-vercel-ip-city"] as string | undefined) ?? null;

  const latHeader = req.headers["x-vercel-ip-latitude"] as string | undefined;
  const lonHeader = req.headers["x-vercel-ip-longitude"] as string | undefined;

  const latitude = latHeader != null ? Number(latHeader) : null;
  const longitude = lonHeader != null ? Number(lonHeader) : null;

  return { country, region, city, latitude, longitude } as const;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    try {
      const meta = await head("last-visitor.json", {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      if (!meta?.url) {
        // Fallback to in-memory cache if blob doesn't exist
        return res
          .status(200)
          .json({ lastVisitor: global.__LAST_VISITOR__ ?? null });
      }
      const data = await fetch(meta.url).then((r) => r.json());
      res.setHeader("Cache-Control", "no-store, max-age=0");
      return res.status(200).json({ lastVisitor: data });
    } catch {
      // Not found or token missing — fall back to in-memory cache
      res.setHeader("Cache-Control", "no-store, max-age=0");
      return res
        .status(200)
        .json({ lastVisitor: global.__LAST_VISITOR__ ?? null });
    }
  }

  if (req.method === "POST") {
    try {
      // Prefer Vercel geolocation headers (fast, reliable),
      // and only fall back to external lookup if missing.
      const headerGeo = getGeoFromHeaders(req);

      let city: string | null = headerGeo.city;
      let region: string | null = headerGeo.region;
      let country: string | null = headerGeo.country;
      let latitude: number | null = headerGeo.latitude;
      let longitude: number | null = headerGeo.longitude;

      if (!city || !country) {
        const ip = getClientIp(req);
        const url = ip
          ? `https://ipapi.co/${encodeURIComponent(ip)}/json/`
          : `https://ipapi.co/json/`;

        const response = await fetch(url, {
          headers: { "user-agent": req.headers["user-agent"] || "" },
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          city = city ?? data?.city ?? null;
          region = region ?? data?.region ?? data?.region_name ?? null;
          country = country ?? data?.country_name ?? data?.country ?? null;
          latitude =
            latitude ??
            (typeof data?.latitude === "number"
              ? data.latitude
              : typeof data?.lat === "number"
                ? data.lat
                : null);
          longitude =
            longitude ??
            (typeof data?.longitude === "number"
              ? data.longitude
              : typeof data?.lon === "number"
                ? data.lon
                : null);
        }
      }

      const record: LastVisitor = {
        city,
        region,
        country,
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      };

      // Try to persist to blob storage if token is present; ignore write errors
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        try {
          await put("last-visitor.json", JSON.stringify(record), {
            access: "public",
            contentType: "application/json",
            token: process.env.BLOB_READ_WRITE_TOKEN,
          });
        } catch {
          // ignore
        }
      }

      // Always keep an in-memory fallback for the current server instance
      global.__LAST_VISITOR__ = record;

      return res.status(200).json({ ok: true });
    } catch (error: any) {
      return res.status(500).json({ error: error?.message || "Unknown error" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end("Method Not Allowed");
}
