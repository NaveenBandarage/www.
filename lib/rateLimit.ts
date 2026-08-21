import type { NextApiRequest } from "next";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitEntry>();

function getForwardedAddress(value: string | string[] | undefined) {
  const first = Array.isArray(value) ? value[0] : value?.split(",")[0];
  return first?.trim() || null;
}

export function getClientAddress(req: NextApiRequest) {
  return (
    getForwardedAddress(req.headers["x-forwarded-for"]) ??
    getForwardedAddress(req.headers["x-real-ip"]) ??
    req.socket.remoteAddress ??
    "unknown"
  );
}

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();

  if (buckets.size > 5000) {
    for (const [bucketKey, entry] of buckets) {
      if (entry.resetAt <= now) buckets.delete(bucketKey);
    }
  }

  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: Math.ceil(windowMs / 1000) };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return {
    allowed: true,
    retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}
