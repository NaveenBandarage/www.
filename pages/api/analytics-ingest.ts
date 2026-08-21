import type { NextApiRequest, NextApiResponse } from "next";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import { checkRateLimit, getClientAddress } from "../../lib/rateLimit";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "2kb",
    },
  },
};

function boundedString(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, maxLength)
    : "";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") return res.status(405).end();

  const address = getClientAddress(req);
  const rateLimit = checkRateLimit(`analytics:${address}`, 120, 60_000);
  if (!rateLimit.allowed) {
    res.setHeader("Retry-After", rateLimit.retryAfter);
    return res.status(429).json({ error: "Too many requests" });
  }

  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ error: "Invalid event" });
  }

  const type = boundedString((req.body as any).type, 64);
  const path = boundedString((req.body as any).path, 2048);

  if (!type || !/^[a-z0-9:_-]+$/i.test(type) || !path.startsWith("/")) {
    return res.status(400).json({ error: "Invalid event" });
  }

  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const key = `analytics/${day}/${now.getTime()}-${randomUUID()}.json`;

  const event = {
    ts: now.toISOString(),
    type,
    path,
    referrer: boundedString(req.headers.referer, 2048),
    userAgent: boundedString(req.headers["user-agent"], 512),
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
    await put(key, JSON.stringify(event), {
      access: "public",
      contentType: "application/json",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
  } catch {
    return res.status(503).json({ error: "Analytics temporarily unavailable" });
  }

  return res.status(200).json({ ok: true });
}
