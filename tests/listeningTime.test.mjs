import assert from "node:assert/strict";
import { test } from "node:test";
import { formatLastPlayed } from "../lib/listeningTime.ts";

const now = Date.parse("2026-10-30T12:00:00.000Z");
const ago = (seconds) => new Date(now - seconds * 1000).toISOString();

test("last-played labels use readable singular and plural time periods", () => {
  for (const [seconds, label] of [
    [0, "just now"],
    [59, "just now"],
    [60, "1 minute ago"],
    [300, "5 minutes ago"],
    [3600, "1 hour ago"],
    [7200, "2 hours ago"],
    [86400, "1 day ago"],
    [172800, "2 days ago"],
    [2592000, "1 month ago"],
    [31536000, "1 year ago"],
  ])
    assert.equal(formatLastPlayed(ago(seconds), now), label);
});

test("missing or invalid timestamps do not invent a last-played time", () => {
  assert.equal(formatLastPlayed(null, now), null);
  assert.equal(formatLastPlayed("invalid", now), null);
  assert.equal(formatLastPlayed(ago(-10), now), "just now");
});
