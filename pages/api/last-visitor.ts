import type { NextApiRequest, NextApiResponse } from "next";
import { head, put } from "@vercel/blob";
import { isIP } from "net";
import { checkRateLimit, getClientAddress } from "../../lib/rateLimit";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1kb",
    },
  },
};

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

  if (!isIP(cleaned)) return null;

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
  const country = normalizeHeader(req.headers["x-vercel-ip-country"]);
  const region = normalizeHeader(req.headers["x-vercel-ip-country-region"]);
  // Decode URL-encoded city names from Vercel headers
  const cityHeader = req.headers["x-vercel-ip-city"] as string | undefined;
  const city = cityHeader ? safeDecodeURIComponent(cityHeader) : null;

  const latHeader = req.headers["x-vercel-ip-latitude"] as string | undefined;
  const lonHeader = req.headers["x-vercel-ip-longitude"] as string | undefined;

  const latitude = parseCoordinate(latHeader, -90, 90);
  const longitude = parseCoordinate(lonHeader, -180, 180);

  return { country, region, city, latitude, longitude } as const;
}

function normalizeHeader(value: string | string[] | undefined) {
  const header = Array.isArray(value) ? value[0] : value;
  return header?.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 128) || null;
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value)
      .replace(/[\u0000-\u001f\u007f]/g, "")
      .slice(0, 128);
  } catch {
    return null;
  }
}

function parseCoordinate(value: string | undefined, min: number, max: number) {
  if (value == null) return null;
  const coordinate = Number(value);
  return Number.isFinite(coordinate) && coordinate >= min && coordinate <= max
    ? coordinate
    : null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    const rateLimit = checkRateLimit(
      `last-visitor:get:${getClientAddress(req)}`,
      120,
      60_000,
    );
    if (!rateLimit.allowed) {
      res.setHeader("Retry-After", rateLimit.retryAfter);
      return res.status(429).json({ error: "Too many requests" });
    }

    try {
      const meta = await head("last-visitor.json", {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      if (!meta?.url) {
        // Fallback to in-memory cache if blob doesn't exist
        res.setHeader(
          "Cache-Control",
          "no-store, no-cache, must-revalidate, max-age=0",
        );
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        return res
          .status(200)
          .json({ lastVisitor: global.__LAST_VISITOR__ ?? null });
      }
      const data = await fetch(meta.url).then((r) => r.json());
      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, max-age=0",
      );
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      return res.status(200).json({ lastVisitor: data });
    } catch {
      // Not found or token missing — fall back to in-memory cache
      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, max-age=0",
      );
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      return res
        .status(200)
        .json({ lastVisitor: global.__LAST_VISITOR__ ?? null });
    }
  }

  if (req.method === "POST") {
    const rateLimit = checkRateLimit(
      `last-visitor:post:${getClientAddress(req)}`,
      10,
      60_000,
    );
    if (!rateLimit.allowed) {
      res.setHeader("Retry-After", rateLimit.retryAfter);
      return res.status(429).json({ error: "Too many requests" });
    }

    try {
      // First, get the current last visitor before we update it
      let previousVisitor: LastVisitor | null = null;

      if (process.env.BLOB_READ_WRITE_TOKEN) {
        try {
          const meta = await head("last-visitor.json", {
            token: process.env.BLOB_READ_WRITE_TOKEN,
          });
          if (meta?.url) {
            previousVisitor = await fetch(meta.url).then((r) => r.json());
          } else {
            previousVisitor = global.__LAST_VISITOR__ ?? null;
          }
        } catch (error) {
          console.error("Error reading from blob storage:", error);
          previousVisitor = global.__LAST_VISITOR__ ?? null;
        }
      } else {
        previousVisitor = global.__LAST_VISITOR__ ?? null;
      }

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
          signal: AbortSignal.timeout(5_000),
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

      // Check if we're getting the same visitor data (could indicate caching issues)
      if (
        previousVisitor &&
        previousVisitor.city === record.city &&
        previousVisitor.region === record.region &&
        previousVisitor.country === record.country &&
        previousVisitor.latitude === record.latitude &&
        previousVisitor.longitude === record.longitude
      ) {
        console.warn(
          "New visitor matches previous visitor exactly - possible caching issue",
        );
      }

      // Try to persist to blob storage if token is present
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        try {
          await put("last-visitor.json", JSON.stringify(record), {
            access: "public",
            contentType: "application/json",
            token: process.env.BLOB_READ_WRITE_TOKEN,
            allowOverwrite: true,
          });
        } catch (error) {
          console.error("Failed to write to blob storage:", error);
          // Continue execution - we still have in-memory fallback
        }
      } else {
        console.warn("BLOB_READ_WRITE_TOKEN not found, skipping blob storage");
      }

      // Always keep an in-memory fallback for the current server instance
      global.__LAST_VISITOR__ = record;

      // Return the previous visitor data so the client can use it immediately
      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, max-age=0",
      );
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      return res.status(200).json({ ok: true, previousVisitor });
    } catch (error) {
      console.error("Failed to update last visitor:", error);
      return res.status(500).json({ error: "Unable to update visitor data" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end("Method Not Allowed");
}
