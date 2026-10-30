import type { NextApiRequest, NextApiResponse } from "next";
import { getListeningTrack, musicConfigured } from "../../lib/music";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=30, stale-while-revalidate=30",
  );
  return res
    .status(200)
    .json({ configured: musicConfigured(), track: await getListeningTrack() });
}
