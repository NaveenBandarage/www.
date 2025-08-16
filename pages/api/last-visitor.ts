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
        return res.status(200).json({ lastVisitor: null });
      }
      const data = await fetch(meta.url).then((r) => r.json());
      return res.status(200).json({ lastVisitor: data });
    } catch {
      // Not found or token missing
      return res.status(200).json({ lastVisitor: null });
    }
  }

  if (req.method === "POST") {
    try {
      const ip = getClientIp(req);
      const url = ip
        ? `https://ipapi.co/${encodeURIComponent(ip)}/json/`
        : `https://ipapi.co/json/`;

      const response = await fetch(url, {
        headers: { "user-agent": req.headers["user-agent"] || "" },
      });

      if (!response.ok) {
        throw new Error(`GeoIP lookup failed with ${response.status}`);
      }

      const data = (await response.json()) as any;
      const city: string | null = data?.city ?? null;
      const region: string | null = data?.region ?? data?.region_name ?? null;
      const country: string | null =
        data?.country_name ?? data?.country ?? null;
      const latitude: number | null =
        typeof data?.latitude === "number"
          ? data.latitude
          : typeof data?.lat === "number"
            ? data.lat
            : null;
      const longitude: number | null =
        typeof data?.longitude === "number"
          ? data.longitude
          : typeof data?.lon === "number"
            ? data.lon
            : null;

      const record: LastVisitor = {
        city,
        region,
        country,
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      };

      await put("last-visitor.json", JSON.stringify(record), {
        access: "public",
        contentType: "application/json",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      return res.status(200).json({ ok: true });
    } catch (error: any) {
      return res.status(500).json({ error: error?.message || "Unknown error" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end("Method Not Allowed");
}
