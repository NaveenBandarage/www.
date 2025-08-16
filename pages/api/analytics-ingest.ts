import type { NextApiRequest, NextApiResponse } from "next";
import { put } from "@vercel/blob";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") return res.status(405).end();

  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const key = `analytics/${day}/${now.getTime()}-${Math.random().toString(36).slice(2)}.json`;

  const event = {
    ts: now.toISOString(),
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

  await put(key, JSON.stringify(event), {
    access: "public",
    contentType: "application/json",
  });

  return res.status(200).json({ ok: true });
}
